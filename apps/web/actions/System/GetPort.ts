"use server"

export default async function GetPort(): Promise<number> {
  return Number(process.env.PORT);
}