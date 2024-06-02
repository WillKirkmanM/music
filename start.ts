import { execSync } from 'child_process';

const [,, project, command, action] = process.argv;

const envVariables = project === 'music' ? 'cross-env NODE_ENV=development DEPLOYMENT_TYPE=containerless BACKEND_PORT=3001' : '';
// const envVariables = 'cross-env NODE_ENV=development DEPLOYMENT_TYPE=containerless BACKEND_PORT=3001';

switch (command) {
  case 'build':
    execSync('bun install', { stdio: 'inherit' });
    execSync(`bunx cross-env NODE_ENV=production DEPLOYMENT_TYPE=containerless BACKEND_PORT=3001 bun run build --filter ${project} --force`, { stdio: 'inherit' });
    break;
  case 'run':
    execSync('bun install', { stdio: 'inherit' });
    if (action === 'dev') {
      execSync(`${envVariables && "bunx"} ${envVariables} bun run dev --filter ${project}`, { stdio: 'inherit' });
    } else {
      execSync(`bunx cross-env NODE_ENV=production DEPLOYMENT_TYPE=containerless BACKEND_PORT=3001 bun run start --filter ${project}`, { stdio: 'inherit' });
    }
    break;
  default:
    console.log('Invalid command');
    break;
}