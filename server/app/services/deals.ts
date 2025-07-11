import { query } from '../db'

export async function testDB() {
  const { rows } = await query('SELECT NOW()')
  return rows[0]
}

export async function getDeals() {
  const { rows } = await query('SELECT * FROM deals ORDER BY created_at DESC')
  return rows
}

export async function getDealById(id: string) {
  const { rows } = await query('SELECT * FROM deals WHERE id = $1', [id])
  return rows[0]
}

export async function getDealByLoft47Id(loft47Id: string) {
  const { rows } = await query('SELECT * FROM deals WHERE loft47_id = $1', [loft47Id])
  return rows[0]
}

export async function getDealByDealId(dealId: string) {
  const { rows } = await query('SELECT * FROM deals WHERE deal_id = $1', [dealId])
  return rows[0]
}

export async function createDeal(dealId: string, loft47Id: string) {
  const { rows } = await query(
    'INSERT INTO deals (deal_id, loft47_id) VALUES ($1, $2) RETURNING *',
    [dealId, loft47Id]
  )
  return rows[0]
} 