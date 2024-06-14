import { exec, spawn } from 'child_process';
import { existsSync } from "fs"
import { join } from "path"

const [,, project, command, action] = process.argv;

const envVariables = project === 'music' ? 'cross-env NODE_ENV=development DEPLOYMENT_TYPE=containerless BACKEND_PORT=3001 PORT=3000' : '';

// const runCommand = (command: string) => {
//   const [cmd, ...args] = command.split(' ');
//   const proc = spawn(cmd, args);

//   proc.stdout.on('data', (data) => {
//     console.log(`${project}: ${data}`);
//   });

//   proc.stderr.on('data', (data) => {
//     console.error(`${project} Error: ${data}`);
//   });

//   proc.on('error', (error) => {
//     console.error(`exec error: ${error}`);
//   });
// };

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
    runCommand(`bunx cross-env NODE_ENV=production DEPLOYMENT_TYPE=containerless BACKEND_PORT=3001 bun run build --filter ${project} --force`);
    break;
  case 'run':
    if (!nodeModulesExists) {
      runCommand('bun install');
    }
    if (action === 'dev') {
      runCommand(`${envVariables && "bunx"} ${envVariables} bun run dev --filter ${project} --env-mode loose`);
      runCommand('cargo run', { DEPLOYMENT_TYPE: "containerless" }); // Run Rust application in development mode
    } else {
      runCommand(`bunx cross-env NODE_ENV=production DEPLOYMENT_TYPE=containerless BACKEND_PORT=3001 bun run start --filter ${project}`);
      runCommand('cargo run --release', { DEPLOYMENT_TYPE: "containerless" }); // Run Rust application in release mode
    }
    break;
  default:
    console.log('Invalid command');
    break;
}