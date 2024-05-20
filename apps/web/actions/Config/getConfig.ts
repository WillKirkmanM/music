"use server"

import { promises as fs } from "fs"

export default async function getConfig(): Promise<string | null> {
  try {
    const env = process.env.NODE_ENV || 'development';
    const deploymentType = process.env.DEPLOYMENT_TYPE || 'docker';

    if (!["production", "development"].includes(env)) {
      throw new Error(`Invalid NODE_ENV: ${env}`);
    }

    if (!["docker", "containerless"].includes(deploymentType)) {
      throw new Error(`Invalid DEPLOYMENT_TYPE: ${deploymentType}`);
    }

    let configPath = "Config/music.json"

    if (deploymentType === "docker") {
      configPath = "/Config/music.json"
    }

    const fileContent = await fs.readFile(configPath, 'utf8');

    return fileContent;

  } catch (error) {
    return null;
  }
}