import type { Knex } from 'knex'
import dotenv from 'dotenv'

dotenv.config()

// Shared connection details pulled from environment variables
const baseConnection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
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
    connection: {
      ...baseConnection,
      database: process.env.DB_NAME_STAGING || process.env.DB_NAME
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
    connection: {
      ...baseConnection,
      database: process.env.DB_NAME_PROD || process.env.DB_NAME
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}

export default config