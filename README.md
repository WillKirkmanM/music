# Music
The self-hosted solution to music streaming.


## Get Started

### For Production
To build the app for production, run:
```
docker-compose up -d
```
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

This will return a json object with the indexed data. Save this under `apps/web/public/music_with_cover_art.json`

This can be done using a curl command:
```
$ curl -X GET http://localhost:3001/library/index/<PATH_TO_LIBRARY> > apps/web/public/music_with_cover_art.json
```
You're done! That's all you need to start developing music.

## Frontend
Install Dependencies
```bash
bun install
```
Create the Database, this command generates the types in the Prisma client so you have IntelliSense in your IDE.
```
npx turbo run generate --scope music
```

If you make any changes to `prisma/schema.prisma`, run this command along with the `bun generate` command. This will make sure all changes are reflected in the database.
```
bun push
```

Although there is the ability to register via credentials. It is possible to seed the Database with a dummy user:
```bash
bun prisma db seed
```

The default credentials for the user is:
  | username | password |
  |----------|-----------------|
  | admin | password |

Start the Development Server (Turbopack)
```
turbo run dev
```

Run only frontend package
```
turbo run dev --filter music
```

You should be able to access the server at `http://localhost:3000`

