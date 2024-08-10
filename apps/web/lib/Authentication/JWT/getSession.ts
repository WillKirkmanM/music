import { getCookie } from "cookies-next";
import { JwtPayload, jwtDecode } from "jwt-decode";

export type ExtendedJWTPayload = JwtPayload & {
bitrate: number,
username: string
}


export default function getSession(): ExtendedJWTPayload | null {
  const jwt = getCookie("music_jwt");
  if (!jwt) return null

  const user: ExtendedJWTPayload = jwtDecode(jwt);
  return user
}