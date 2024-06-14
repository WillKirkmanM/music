"use server"

import GetPort from "../System/GetPort";
import getServerIpAddress from "../System/GetIpAddress";

export default async function IndexLibrary(currentDirectory: string) {
  await fetch(`http://${await getServerIpAddress()}:${await GetPort()}/server/library/index/${encodeURIComponent(currentDirectory)}`);
}