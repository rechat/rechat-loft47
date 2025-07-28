import 'dotenv/config'
import { db, pool } from '../app/db'
import { seed, reset } from 'drizzle-seed'
import { rechatLoft47DealsMapping } from './schema'

async function main() {
  await reset(db, { rechatLoft47DealsMapping })
  await seed(db, { rechatLoft47DealsMapping })
  await pool.end()
}

main().catch((err) => {
  console.error('Seed failed:', err)
})