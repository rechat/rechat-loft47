import type { Knex } from 'knex'
import dotenv from 'dotenv'

dotenv.config()

const baseConnection = {
  connectionString: process.env.DATABASE_URL,
  port: 5432,
  ssl: { rejectUnauthorized: false }
}

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: baseConnection,
    migrations: {
      directory: './loft47/migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './loft47/seeds',
      extension: 'ts'
    }
  },

  staging: {
    client: 'pg',
    connection: baseConnection,
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
    connection: baseConnection,
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}

export default config