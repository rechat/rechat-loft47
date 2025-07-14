import express from 'express'

import homeRoute from './app/controllers/home'
import manifestRoute from './app/controllers/manifest'
import { signIn } from './app/controllers/loft47/auth'
import { 
  retrieveBrokerages, 
  createBrokerage, 
  getBrokerage, 
  updateBrokerage, 
  deleteBrokerage 
} from './app/controllers/loft47/brokerages'
import { 
  listMappings, 
  showMapping, 
  addMapping, 
  showMappingByRechatDealId, 
  showMappingByLoft47DealId 
} from './app/controllers/loft47/deals_mapping'
import { 
  getBrokerageDeals, 
  getBrokerageDeal,
  createDeal,
  updateBrokerageDeal
} from './app/controllers/loft47/brokerage_deals'

const router = express.Router()

router.get('/', homeRoute)

/**
 * Please don't remove this route
 */
router.get('/manifest.json', manifestRoute)

router.post('/loft47/sign_in', signIn)

router.route('/loft47/brokerages')
  .get(retrieveBrokerages)
  .post(createBrokerage)

router.route('/loft47/brokerages/:id')
  .get(getBrokerage)
  .patch(updateBrokerage)
  .delete(deleteBrokerage)

router.route('/loft47/brokerages/:brokerage_id/deals')
  .get(getBrokerageDeals)
  .post(createDeal)

router.route('/loft47/brokerages/:brokerage_id/deals/:deal_id')
  .get(getBrokerageDeal)
  .patch(updateBrokerageDeal)

// Deal mappings routes
router.route('/loft47/deal_mappings')
  .get(listMappings)   // list all mappings
  .post(addMapping)    // create new mapping
  
// generic lookup by primary id (uuid)
router.get('/loft47/deal_mappings/:id', showMapping)

// lookup routes (define BEFORE generic :id to avoid shadowing)
router.get('/loft47/deal_mappings/loft47/:deal_id', showMappingByLoft47DealId) // by loft47_deal_id
router.get('/loft47/deal_mappings/rechat/:deal_id', showMappingByRechatDealId)     // by rechat_deal_id


export default router
