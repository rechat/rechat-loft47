import { desc, eq } from 'drizzle-orm'

import { db } from '../app/db'

import { rechatLoft47DealsMapping } from './schema'

export async function testDB() {
  const { rows } = await db.execute<{ now: Date }>('SELECT NOW()')

  return rows[0]
}

export async function getMappings() {
  try {
    return await db
      .select()
      .from(rechatLoft47DealsMapping)
      .orderBy(desc(rechatLoft47DealsMapping.createdAt))
  } catch (error) {
    console.error('Error getting mappings:', error)
    throw error
  }
}

export async function getMappingById(id: string) {
  try {
    const [row] = await db
      .select()
      .from(rechatLoft47DealsMapping)
      .where(eq(rechatLoft47DealsMapping.id, parseInt(id, 10)))

    return row
  } catch (error) {
    console.error('Error getting mapping by id:', error)
    throw error
  }
}

export async function getMappingByLoft47DealId(loft47Id: string) {
  try {
    const [row] = await db
      .select()
      .from(rechatLoft47DealsMapping)
      .where(eq(rechatLoft47DealsMapping.loft47DealId, loft47Id))

    return row
  } catch (error) {
    console.error('Error getting mapping by loft47 deal id:', error)
    throw error
  }
}

export async function getMappingByRechatDealId(rechatId: string) {
  try {
    const [row] = await db
      .select()
      .from(rechatLoft47DealsMapping)
      .where(eq(rechatLoft47DealsMapping.rechatDealId, rechatId))

    return row
  } catch (error) {
    console.error('Error getting mapping by rechat deal id:', error)
    throw error
  }
}

export async function createMapping(rechatId: string, loft47Id: string) {
  try {
    const [inserted] = await db
      .insert(rechatLoft47DealsMapping)
      .values({
        rechatDealId: rechatId,
        loft47DealId: loft47Id
      })
      .returning()

    return inserted
  } catch (error) {
    console.error('Error creating mapping:', error)
    throw error
  }
}
