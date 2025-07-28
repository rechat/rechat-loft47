# Rechat-Loft47 Integration

---

## 1. Quick Start

```bash
# clone and install
npm install        # or npm / yarn

# development server (nodemon + webpack dev-middleware)
npm run develop
```

The server starts on **http://localhost:8081**.  The React app is served by webpack dev-middleware from the same port.

---


## 2. Database Migrations & Seeding (Drizzle ORM)

The project now uses **[Drizzle ORM](https://orm.drizzle.team/)** with **`drizzle-kit`** for generating and running migrations.

All SQL migration files live under `server/db/drizzle/migrations` and are fully type-safe—no raw SQL or Knex wrappers required.

### 2.1 Generate & apply migrations

```bash
# This script creates a new migration from any schema changes and then applies it
npm run migrate        # alias for: npx drizzle-kit generate && npx drizzle-kit push
```

Alternatively run the commands by hand:

```bash
npx drizzle-kit generate   # scans your schema and generates an SQL migration
npx drizzle-kit push       # executes the generated migration on the database
```

### 2.2 Automatic migrations at runtime

`server/app/db.ts` invokes Drizzle’s migrator on startup, so pending migrations are executed when the server boots (useful for local development and CI environments):

```ts
import { migrate } from 'drizzle-orm/node-postgres/migrator';

// …after creating the `db` instance
await migrate(db, { migrationsFolder: 'server/db/drizzle/migrations' });
```

### 2.3 Seeding

```bash
npm run seed            # runs tsx server/db/seed.ts
```

The seed script resets tables and populates them via `drizzle-seed`, keeping type-safety end-to-end.

---
