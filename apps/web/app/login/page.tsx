import { redirect } from "next/navigation";

export default function Login() {
  redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(process.env.NEXTAUTH_URL || "")}`)
}