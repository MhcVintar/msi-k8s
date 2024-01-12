import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";
import { Session, User } from "./types.js";
import { CustomError } from "./classes.js";
import multer from "multer";
import * as Minio from "minio";
import cron from "node-cron";

// initialize server
const server = express();
const port = Number(process.env.PORT);
const upload = multer();
server.use(bodyParser.json());
server.use(cookieParser());

// initialize Minio client
var minioClient = new Minio.Client({
  endPoint: process.env.MINIO_URL,
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

// initialize db
const db = new PrismaClient();

// initialize nodemailer transporter
const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PWD,
  },
});

// routes
server.get("/readyz", (req: Request, res: Response) =>
  res.status(200).json({ status: "ok" }),
);

server.get("/livez", (req: Request, res: Response) =>
  res.status(200).json({ status: "ok" }),
);

server.post(
  "/auth/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get data from the request
      const email = req.body.email;
      const username = req.body.username;
      const password = req.body.password;
      // check if email is already in use
      const userByEmail = await db.user.findUnique({
        where: { email },
      });
      if (userByEmail) {
        return res.status(409).json({ error: "Email already in use" });
      }
      // check if username is already in use
      const userByUsername = await db.user.findUnique({
        where: { username },
      });
      if (userByUsername) {
        return res.status(409).json({ error: "Username already in use" });
      }
      // create jwt
      const hashedPassword = await hash(password, 10);
      const token = jwt.sign(
        { email, username, hashedPassword },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      // send confirmation email
      const url = `${process.env.NGINX_URL}/welcome?user=${username}&token=${token}`;
      await transporter.sendMail({
        to: email,
        subject: "Confirm Musify account",
        text: `Click here to confirm your new Musify account ${url}\nThis link is valid for 1 hour`,
      });
      return res
        .status(200)
        .json({ message: `Confirmation email sent to ${email}` });
    } catch (err) {
      next(err);
    }
  },
);

server.get(
  "/auth/confirm-account",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get the token
      const token = req.query.token as string;
      // check the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      // add the user to the database
      const user = (await db.user.create({
        data: {
          username: decoded.username,
          email: decoded.email,
          hashedPassword: decoded.hashedPassword,
        },
        select: { userId: true, username: true, email: true },
      })) satisfies User;
      // create session
      createSession(res, user);
      return res.status(201).json({ message: "Your account was confirmed" });
    } catch (err) {
      next(err);
    }
  },
);

server.post(
  "/auth/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get data from the request
      const emailOrUsername = req.body.emailOrUsername;
      const password = req.body.password;
      // check if the user exists
      const user = await db.user.findFirst({
        where: {
          OR: [{ username: emailOrUsername }, { email: emailOrUsername }],
        },
      });
      if (!user) {
        return res.status(404).json({ error: "User doesn't exist" });
      }
      // check if the password matches
      const match = await compare(password, user.hashedPassword);
      if (!match) {
        return res.status(401).json({ error: "Wrong password" });
      }
      createSession(res, user);
      return res.status(200).json({ message: "Login successful" });
    } catch (err) {
      next(err);
    }
  },
);

server.delete(
  "/auth/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      useServerSession(req);
      res.clearCookie("session");
      return res.status(204).json({ message: "User logged out successfully" });
    } catch (err) {
      next(err);
    }
  },
);

server.post(
  "/auth/request-password-reset",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get data from the request
      const email = req.body.email;
      // check if a user with given email exists
      const user = await db.user.findUnique({
        where: { email },
      });
      if (!user) {
        return res
          .status(400)
          .json({ error: `User with email ${email} doesn't exist` });
      }
      // sign a jwt for password reset
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: minutesToMs(15),
      });
      // send reset password email
      const url = `${process.env.NGINX_URL}?popup=new-password&token=${token}`;
      await transporter.sendMail({
        to: email,
        subject: "Musify password reset",
        text: `Click here to reset the password for your Musify account: ${url}. Link expires in 15 minutes.`,
      });
      return res
        .status(200)
        .json({ message: "Reset password email has been sent." });
    } catch (err) {
      next(err);
    }
  },
);

server.post(
  "/auth/reset-password",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get token and password
      const token = req.body.token;
      const password = req.body.password;
      // check the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        email: string;
      };
      // modify the user in the db
      const user = (await db.user.update({
        where: { email: decoded.email },
        data: {
          hashedPassword: await hash(password, 10),
        },
        select: { userId: true, username: true, email: true },
      })) satisfies User;
      // create session
      createSession(res, user);
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      next(err);
    }
  },
);

server.delete(
  "/auth/delete-account",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = useServerSession(req);
      // delete the user from the db
      await db.user.delete({
        where: { userId: session.user.userId },
      });
      res.clearCookie("session");
      return res.status(204).json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
);

server.get(
  "/auth/check-session",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //console.log("check-session called");
      useServerSession(req);
      return res.status(200).json({ message: "Current session is valid" });
    } catch (err) {
      next(err);
    }
  },
);

server.get(
  "/file/allFiles/:page/:perPage",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.params.page);
      const itemsPerPage = Number(req.params.perPage);
      const result = await db.$transaction([
        db.musicFile.findMany({
          skip: (page - 1) * itemsPerPage,
          take: itemsPerPage,
          orderBy: {
            createdAt: "desc",
          },
        }),
        db.musicFile.count(),
      ]);
      const [musicFiles, totalCount] = result;
      return res.status(200).json({
        message: "Files retrieved successfully",
        data: musicFiles,
        totalCount,
      });
    } catch (err) {
      next(err);
    }
  },
);

server.get(
  "/file/userFiles/:page/:perPage",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = useServerSession(req);
      const page = Number(req.params.page);
      const itemsPerPage = Number(req.params.perPage);
      const result = await db.$transaction([
        db.musicFile.findMany({
          where: { userId: session.user.userId },
          skip: (page - 1) * itemsPerPage,
          take: itemsPerPage,
          orderBy: {
            createdAt: "desc",
          },
        }),
        db.musicFile.count({
          where: { userId: session.user.userId },
        }),
      ]);
      const [data, totalCount] = result;
      return res.status(200).json({
        message: "Files retrieved successfully",
        data,
        totalCount,
      });
    } catch (err) {
      next(err);
    }
  },
);

server.post(
  "/file/upload",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = useServerSession(req);
      const file = req.file;
      /* USE USER_ID INSTEAD OF USERNAME */
      const userId = session.user.userId;
      const title = file.originalname;
      const path = userId + "/" + title;

      minioClient.putObject(
        "music-files",
        path,
        file.buffer,
        file.size,
        async function (err) {
          if (err) {
            return res.status(500).json({ error: "File upload failed" });
          }
          try {
            // create if not present in db, update if present
            await db.musicFile.upsert({
              where: { path: path },
              create: { path, title, userId: session.user.userId },
              update: { path, title, userId: session.user.userId },
            });
            return res
              .status(200)
              .json({ message: "File uploaded successfully" });
          } catch (err) {
            next(err);
          }
        },
      );
    } catch (err) {
      next(err);
    }
  },
);

server.get(
  "/file/download/:mfId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mfId = Number(req.params.mfId);
      // get file info from db
      const musicFile = await db.musicFile.findUnique({
        where: { mfId },
      });
      /* DOWNLOAD THE FILE FROM MINIO */
      minioClient.getObject(
        "music-files",
        musicFile.path,
        (err, fileStream) => {
          if (err) {
            return res.status(500).json({ error: "File download failed" });
          }
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${musicFile.title}"`,
          );
          fileStream.pipe(res);
        },
      );
    } catch (err) {
      next(err);
    }
  },
);

server.delete(
  "/file/delete/:mfId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mfId = Number(req.params.mfId);
      const session = useServerSession(req);
      // check if user is owner of the file
      const musicFile = await db.musicFile.findUnique({
        where: { mfId },
      });
      if (musicFile.userId != session.user.userId) {
        return res.status(401).json({ error: "User wasn't owner of the file" });
      }
      // delete the file from the db
      await db.musicFile.delete({
        where: { mfId },
      });
      // deleting file from minio is done by cron and postgres triggers
      return res.status(204).json({ message: "File deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
);

cron.schedule("* * * * *", async () => {
  try {
    // get a list of all deleted files
    const deleted = await db.deletedMusicFile.findMany();
    await db.deletedMusicFile.deleteMany();

    /* DELETE THE FILES FROM MINIO */
    for (const file of deleted) {
      const filePath = file.path;

      minioClient.removeObject(
        "music-files",
        filePath,
        async function (err: string) {
          if (err) {
            console.log(err);
            throw new Error(err);
          }
        },
      );
    }
  } catch (err) {}
});

function createSession(res: Response, user: User) {
  // sign the jwt
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  // create session
  const session: Session = { user, token };
  // remove the old cookie
  res.clearCookie("session");
  // add session to cookie jar
  // TODO: add secure when before deployment
  res.cookie("session", JSON.stringify(session), {
    maxAge: hoursToMs(24),
  });
}

function useServerSession(req: Request): Session {
  // get session
  const sessionString = req.cookies.session;
  if (!sessionString) {
    throw new CustomError("Session is not present", 404);
  }
  // parse cookie
  const session = JSON.parse(sessionString) satisfies Session;
  // validate session
  jwt.verify(session.token, process.env.JWT_SECRET);
  return session;
}

function hoursToMs(hours: number): number {
  return hours * 60 * 60 * 1000;
}

function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

// global error handler
server.use((err: any, req: Request, res: Response) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Unknown error occurred";
  return res.status(err.statusCode).json({ error: err.message });
});

// start the server
server.listen(port, () => {
  console.log(`Server is running on http://${process.env.EXPRESS_URL}:${port}`);
});
