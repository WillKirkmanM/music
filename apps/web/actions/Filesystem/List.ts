"use server"

import { promises as fs } from "fs";
import path from 'path';

export interface Directory {
  name: string;
  path: string;
}

export default async function List(directoryPath: string): Promise<Directory[]> {
  const dirents = await fs.readdir(directoryPath, { withFileTypes: true });
  const directories = dirents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({ name: dirent.name, path: path.join(directoryPath, dirent.name) }));
  return directories;
}