import Cookies from "js-cookie";
import { Session } from "../types";

export default function useSession(): Session | null {
  const sessionString = Cookies.get("session");
  if (sessionString) {
    return JSON.parse(sessionString) satisfies Session;
  }
  return null;
}
