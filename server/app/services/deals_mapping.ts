import { query } from '../db'

export async function testDB() {
  const { rows } = await query('SELECT NOW()')
  return rows[0]
}

export async function getMappings() {
  const { rows } = await query('SELECT * FROM rechat_loft47_deals_mapping ORDER BY created_at DESC')
  return rows
}

export async function getMappingById(id: string) {
  const { rows } = await query('SELECT * FROM rechat_loft47_deals_mapping WHERE id = $1', [id])
  return rows[0]
}

export async function getMappingByLoft47DealId(id: string) {
  const { rows } = await query('SELECT * FROM rechat_loft47_deals_mapping WHERE loft47_deal_id = $1', [id])
  return rows[0]
}

export async function getMappingByRechatDealId(id: string) {
  const { rows } = await query('SELECT * FROM rechat_loft47_deals_mapping WHERE rechat_deal_id = $1', [id])
  return rows[0]
}

export async function createMapping(rechatDealId: string, loft47DealId: string) {
  const { rows } = await query(
    'INSERT INTO rechat_loft47_deals_mapping (rechat_deal_id, loft47_deal_id) VALUES ($1, $2) RETURNING *',
    [rechatDealId, loft47DealId]
  )
  return rows[0]
} 