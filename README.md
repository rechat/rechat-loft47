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


## 2. Database Migrations & Seeding (Knex + TypeScript)

We use **Knex** with a **TypeScript** config (`knexfile.ts`). All migration & seed files live under `./loft47/{migrations,seeds}` and use the `.ts` extension.

### 2.1 Running pending migrations

```bash
npm knex --knexfile knexfile.ts -r ts-node/register migrate:latest
```

### 2.2 Creating a new migration

```bash
npm knex --knexfile knexfile.ts -r ts-node/register migrate:make add_users_table
```

Knex will generate a timestamped file in `loft47/migrations/`. Edit the `up` and `down` functions with SQL/Knex schema calls.

### 2.3 Rolling back the last batch

```bash
npm knex --knexfile knexfile.ts -r ts-node/register migrate:rollback
```

### 2.4 Seeding data

```bash
# run all seed files
npm knex --knexfile knexfile.ts -r ts-node/register seed:run
```

Create seed files with:

```bash
npm knex --knexfile knexfile.ts -r ts-node/register seed:make seed_demo_data
```

Each seed file exports an async `seed(knex)` function.

---
