# Music
The self-hosted solution to music streaming.

## Get Started
### For Developers
[!NOTE]
We are using an SQLite database so there is no need to externally host a database. 

Install Dependencies
```bash
bun install
```
Create the Database, this command generates the types in the prisma client so you have intellisense in your IDE.
```
bun generate
```

If you make any changes to `prisma/schema.prisma`, run this command along with the `bun generate` command. This will make sure all changes are reflected in the database.
```
bun push
```

Seed the Database. This adds a test user to the database
```bash
bun prisma db seed
```

The default credentials for the user is:
  | email    | admin@admin.com |
  |----------|-----------------|
  | password | 123             |

Start the Development Server (Turbopack)
```
bun run dev
```

You should be able to access the server at `http://localhost:3000`
