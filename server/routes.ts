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
import { listDeals, showDeal, addDeal, testDB } from './app/controllers/loft47/deals'

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
    
router.route('/loft47/deals')
  .get(listDeals)
  .post(addDeal)

router.get('/loft47/deals/:id', showDeal)


export default router
