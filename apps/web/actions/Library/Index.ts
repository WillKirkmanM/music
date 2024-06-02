"use server"

import getServerIpAddress from "../System/GetIpAddress";

export default async function IndexLibrary(currentDirectory: string) {
  await fetch(`http://${await getServerIpAddress()}:${process.env.BACKEND_PORT}/library/index/${encodeURIComponent(currentDirectory)}`);
}