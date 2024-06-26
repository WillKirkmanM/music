import { exec, spawn } from 'child_process';
import { existsSync } from "fs"
import { join } from "path"

const [,, project, command, action] = process.argv;

const envVariables = project === 'music' ? 'cross-env NODE_ENV=development BACKEND_PORT=3001 PORT=3000' : '';

const runCommand = (command: string, envVariables?: NodeJS.ProcessEnv) => {
  const [cmd, ...args] = command.split(' ');
  const proc = spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ...envVariables } });

  proc.on('error', (error) => {
    console.error(`exec error: ${error}`);
  });
};

const nodeModulesExists = existsSync(join(process.cwd(), 'node_modules'));

switch (command) {
  case 'build':
    if (!nodeModulesExists) {
      runCommand('bun install');
    }
    runCommand(`bunx turbo build --log-order=stream --filter ${project} --force`);
    runCommand("cargo build --release")
    break;
  case 'run':
    if (!nodeModulesExists) {
      runCommand('bun install');
    }
    if (action === 'dev') {
      runCommand(`${envVariables && "bunx"} ${envVariables} bunx turbo dev --log-order=stream --filter ${project} --env-mode loose`);
      runCommand('cargo run');
    } else {
      runCommand(`bunx turbo start --log-order=stream --filter ${project} --env-mode loose`);
      runCommand('cargo run --release');
    }
    break;
  default:
    console.log('Invalid command');
    break;
}