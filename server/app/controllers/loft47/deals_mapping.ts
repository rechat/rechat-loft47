import { Request, Response } from 'express'
import { 
  getMappings, 
  getMappingById, 
  getMappingByLoft47DealId, 
  getMappingByRechatDealId,
  createMapping,
  testDB as testDBService,
} from '../../services/deals_mapping'

export async function listMappings(_: Request, res: Response) {
  try {
    const mappings = await getMappings()
    return res.json(mappings)
  } catch (err) {
    return res.status(500).json({ error: 'listMappings error: ' + err })
  }
}

export async function showMapping(req: Request, res: Response) {
  try {
    const { id } = req.params
    const mapping = await getMappingById(id)
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found by id' })
    }
    return res.json(mapping)
  } catch (err) {
    return res.status(500).json({ error: 'showMapping error: ' + err })
  }
}

export async function showMappingByLoft47DealId(req: Request, res: Response) {
  try {
    const { deal_id } = req.params
    const mapping = await getMappingByLoft47DealId(deal_id)
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found by loft47_deal_id' })
    }
    return res.json(mapping)
  } catch (err) {
    return res.status(500).json({ error: 'showMappingByLoft47DealId error: ' + err })
  }
}

export async function showMappingByRechatDealId(req: Request, res: Response) {
  const { deal_id } = req.params
  try {
    const mapping = await getMappingByRechatDealId(deal_id)
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found by rechat_deal_id' })
    }
    return res.json(mapping)
  } catch (err) {
    return res.status(500).json({ error: 'showMappingByRechatDealId error: ' + err })
  }
}

export async function addMapping(req: Request, res: Response) {
  try {
    const { rechat_deal_id, loft47_deal_id } = req.body || {}
    if (!rechat_deal_id || !loft47_deal_id) {
      return res.status(400).json({ error: 'rechat_deal_id and loft47_deal_id are required' })
    }
    const mapping = await createMapping(rechat_deal_id, loft47_deal_id)
    return res.status(201).json(mapping)
  } catch (err) {
    return res.status(500).json({ error: 'addMapping error: ' + err })
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