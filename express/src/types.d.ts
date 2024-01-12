import { Jwt } from "jsonwebtoken";

export type User = {
  userId: number;
  username: string;
  email: string;
};

export type Token = {
  userId: number;
} & Jwt;

export type Session = {
  user: User;
  token: string;
};