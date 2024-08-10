import { exec, spawn } from 'child_process';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';
import { get } from 'https';

const [,, project, command, action] = process.argv;

const runCommand = (command: string) => {
  const [cmd, ...args] = command.split(' ');
  const proc = spawn(cmd, args, { stdio: 'inherit' });

  proc.on('error', (error) => {
    console.error(`exec error: ${error}`);
  });
};

const downloadFile = (url: string, dest: string, callback: () => void) => {
  const file = createWriteStream(dest);
  get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(callback);
    });
  }).on('error', (err) => {
    console.error(`Error downloading file: ${err.message}`);
  });
};

const ensureMeilisearch = (callback: (meilisearchBinary: string) => void) => {
  const meilisearchDir = join(process.cwd(), 'meilisearch');
  if (!existsSync(meilisearchDir)) {
    mkdirSync(meilisearchDir);
  }

  let meilisearchBinary = '';
  let url = '';
  switch (process.platform) {
    case 'win32':
      meilisearchBinary = join(meilisearchDir, 'meilisearch-windows-amd64.exe');
      url = 'https://github.com/meilisearch/meilisearch/releases/download/v1.9.0/meilisearch-windows-amd64.exe';
      break;
    case 'darwin':
      if (process.arch === 'arm64') {
        meilisearchBinary = join(meilisearchDir, 'meilisearch-macos-apple-silicon');
        url = 'https://github.com/meilisearch/meilisearch/releases/download/v1.9.0/meilisearch-macos-apple-silicon';
      } else {
        meilisearchBinary = join(meilisearchDir, 'meilisearch-macos-amd64');
        url = 'https://github.com/meilisearch/meilisearch/releases/download/v1.9.0/meilisearch-macos-amd64';
      }
      break;
    case 'linux':
      if (process.arch === 'arm64') {
        meilisearchBinary = join(meilisearchDir, 'meilisearch-linux-aarch64');
        url = 'https://github.com/meilisearch/meilisearch/releases/download/v1.9.0/meilisearch-linux-aarch64';
      } else {
        meilisearchBinary = join(meilisearchDir, 'meilisearch-linux-amd64');
        url = 'https://github.com/meilisearch/meilisearch/releases/download/v1.9.0/meilisearch-linux-amd64';
      }
      break;
    default:
      console.error('Unsupported platform');
      return;
  }

  if (existsSync(meilisearchBinary)) {
    callback(meilisearchBinary);
    return;
  }

  console.log(`Downloading Meilisearch from ${url}...`);
  downloadFile(url, meilisearchBinary, () => callback(meilisearchBinary));
};

const nodeModulesExists = existsSync(join(process.cwd(), 'node_modules'));

switch (command) {
  case 'build':
    if (!nodeModulesExists) {
      runCommand('bun install');
    }
    runCommand(`bunx turbo build --log-order=stream --filter ${project} --force`);
    runCommand("cargo build -p music-backend --release");
    break;
  case 'run':
    if (!nodeModulesExists) {
      runCommand('bun install');
    }
    ensureMeilisearch((meilisearchBinary) => {
      runCommand(meilisearchBinary);
      if (action === 'dev') {
        runCommand(`bunx turbo dev --log-order=stream --filter ${project}`);
        runCommand('cargo run -p music-backend');
      }
      else if (action === "electron") {
        runCommand(`bunx turbo electron --log-order=stream --filter ${project}`);
        runCommand('cargo run -p music-backend');
      } else {
        runCommand('cargo run -p music-backend --release');
      }
    });
    break;
  default:
    console.log('Invalid command');
    break;
}