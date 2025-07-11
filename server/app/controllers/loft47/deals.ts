import { Request, Response } from 'express'
import { getDeals, getDealById, createDeal, testDB as testDBService } from '../../services/deals'

export async function listDeals(_: Request, res: Response) {
  try {
    const deals = await getDeals()
    return res.json(deals)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function showDeal(req: Request, res: Response) {
  try {
    const { id } = req.params
    const deal = await getDealById(id)
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' })
    }
    return res.json(deal)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function addDeal(req: Request, res: Response) {
  try {
    const { deal_id, loft47_id } = req.body || {}
    if (!deal_id || !loft47_id) {
      return res.status(400).json({ error: 'deal_id and loft47_id are required' })
    }
    const deal = await createDeal(deal_id, loft47_id)
    return res.status(201).json(deal)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function testDB(req: Request, res: Response) {
  try {
    const data = await testDBService()
    return res.json(data)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}