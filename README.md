# Music
The self-hosted solution to music streaming.


## Get Started

### For Production
To build the app for production, run:
```
docker-compose up -d
```
> [!NOTE]
> It is necessary to edit the `docker-compose.yml` to map `MEDIA_PATH`, `CONFIG_PATH` and `MISSING_COVER_ART_PATH` to the correct paths on your system. This is where the music files, configuration files and missing cover art will be stored. 

That's it! This command will run all the containers listed in the `docker-compose.yml` and build them, running as in the background (daemon).

### For Developers
> [!NOTE]
> We are using an SQLite database so there is no need to externally host a database. 

## Prerequisites
This project needs access to the indexing data regarding your music library. To get that, we need to run the backend first:
```
$ cargo run
```

Then we need to index our library:

http://localhost:3001/library/index/<PATH_TO_LIBRARY>

This will return a JSON object with the indexed data. Save this under `apps/web/Config/music.json`

This can be done using a curl command:
```
$ curl -X GET http://localhost:3001/library/index/<PATH_TO_LIBRARY> > apps/web/Config/music.json
```
You're done! That's all you need to start developing music.

## Frontend
Install Dependencies
```bash
bun install
```
Create the Database, this command generates the types in the Prisma client so you have IntelliSense in your IDE.
```
bunx turbo run generate --scope music
```

If you make any changes to `prisma/schema.prisma`, run this command along with the `bun run generate` command. This will make sure all changes are reflected in the database.
```
bun run push
```

Although there is the ability to register via credentials. It is possible to seed the Database with a dummy user:
```bash
bun run prisma db seed
```

The default credentials for the user is:
  | username | password |
  |----------|-----------------|
  | admin | password |

### Start the Development Server (Turbopack)
```
bun run dev
```

Run only frontend package locally (containerless):
```
$ bunx cross-env NODE_ENV=development DEPLOYMENT_TYPE=containerless bun run dev --filter music
```

Run for production for docker:
```
$ bunx cross-env NODE_ENV=development DEPLOYMENT_TYPE=docker bun run dev --filter music
```

You should be able to access the server at [`http://localhost:3000`](http://localhost:3000).

### Start the Production Server
> [!NOTE]
> The `--force` flag is used to ignore TURBO caching. This is nessesary to because when setting environment variables with `cross-env`, TurboRepo does not pick up the changes.

Build the app for production locally (containerless):
```
$ bunx cross-env NODE_ENV=production DEPLOYMENT_TYPE=containerless bun run build --filter music --force
```

Build the app for production for docker:
```
$ bunx cross-env NODE_ENV=production DEPLOYMENT_TYPE=docker bun run build --filter music --force
```

Start the server locally:
```
$ bunx NODE_ENV=production DEVELOPMENT_TYPE=containerless bun run start --filter music
```
On Docker:
```
$ bunx NODE_ENV=production DEVELOPMENT_TYPE=docker bun run start --filter music
```

## Adding a package to a workspace
To add a package to a workspace, you can use the following command taken from [the handbook](https://turbo.build/repo/docs/handbook/package-installation):

For example, for the workspace `music` to add the package `sharp`:
```bash
yarn workspace music add sharp
```

### With Bun
The example above notably uses the yarn package manager, this is because bun does not have support for installing packages in a monorepo (to a specific workspace) https://bun.sh/guides/install/workspaces.

If you want to use bun to install a package, it is required to CD into the workspace and run the command from there:
```bash
cd apps/web
bun add sharp
```

## Backend
### Start the Development Server
```bash
cd apps/web/backend
cargo run 
```
### Start the Production Server
```bash
cd apps/web/backend
cargo run --release
```

