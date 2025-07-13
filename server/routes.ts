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
  listDeals, 
  showDeal, 
  addDeal, 
  showDealByDealId, 
  showDealByLoft47Id 
} from './app/controllers/loft47/deals'
import { 
  getBrokerageDeals, 
  getBrokerageDeal
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

router.route('/loft47/brokerages/:brokerage_id/deals/:deal_id')
  .get(getBrokerageDeal)

// Deals routes
router.route('/loft47/deals')
  .get(listDeals)   // list all deals
  .post(addDeal)    // create new deal

// lookup routes (define BEFORE generic :id to avoid shadowing)
router.get('/loft47/deals/loft47/:id', showDealByLoft47Id) // by loft47_id
router.get('/loft47/deals/deal/:id', showDealByDealId)     // by deal_id

// generic lookup by primary id (uuid)
router.get('/loft47/deals/:id', showDeal)

export default router
