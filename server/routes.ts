import express from 'express'

import homeRoute from './app/controllers/home'
import manifestRoute from './app/controllers/manifest'
import { getPublicEnv } from './app/controllers/env'
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
  createBrokerageDeal,
  updateBrokerageDeal
} from './app/controllers/loft47/brokerage_deals'
import { 
  createBrokerageProfile, 
  getBrokerageProfile, 
  getBrokerageProfiles, 
  updateBrokerageProfile 
} from './app/controllers/loft47/brokerage_profiles'
import { 
  createBrokerageDealProfileAccess, 
  deleteBrokerageDealProfileAccess, 
  retrieveBrokerageDealProfileAccess, 
  retrieveBrokerageDealProfileAccesses, 
  updateBrokerageDealProfileAccess 
} from './app/controllers/loft47/brokerage_deals_profile_accesses'
import { retrieveAddress, updateAddress } from './app/controllers/loft47/addresses'
import { 
  createBrokerageDealAccessRole, 
  deleteBrokerageDealAccessRole, 
  retrieveBrokerageDealAccessRole, 
  retrieveBrokerageDealAccessRoles, 
  updateBrokerageDealAccessRole 
} from './app/controllers/loft47/brokerage_deal_access_roles'

const router = express.Router()

router.get('/', homeRoute)

/**
 * Please don't remove this route
 */
router.get('/manifest.json', manifestRoute)

// Public env variables for front-end runtime
router.get('/config/env', getPublicEnv)

router.post('/loft47/sign_in', signIn)

router.route('/loft47/brokerages')
  .get(retrieveBrokerages)
  .post(createBrokerage)

router.route('/loft47/brokerages/:id')
  .get(getBrokerage)
  .patch(updateBrokerage)
  .delete(deleteBrokerage)

router.route('/loft47/brokerages/:brokerage_id/profiles')
  .get(getBrokerageProfiles)
  .post(createBrokerageProfile)

router.route('/loft47/brokerages/:brokerage_id/profiles/:profile_id')
  .get(getBrokerageProfile)
  .patch(updateBrokerageProfile)

router.route('/loft47/brokerages/:brokerage_id/deals')
  .get(getBrokerageDeals)
  .post(createBrokerageDeal)

router.route('/loft47/brokerages/:brokerage_id/deals/:deal_id')
  .get(getBrokerageDeal)
  .patch(updateBrokerageDeal)

router.route('/loft47/brokerages/:brokerage_id/deal_access_roles')
  .get(retrieveBrokerageDealAccessRoles)
  .post(createBrokerageDealAccessRole)

router.route('/loft47/brokerages/:brokerage_id/deal_access_roles/:deal_access_role_id')
  .get(retrieveBrokerageDealAccessRole)
  .patch(updateBrokerageDealAccessRole)
  .delete(deleteBrokerageDealAccessRole)

router.route('/loft47/brokerages/:brokerage_id/deals/:deal_id/accesses')
  .get(retrieveBrokerageDealProfileAccesses)
  .post(createBrokerageDealProfileAccess)

router.route('/loft47/brokerages/:brokerage_id/deals/:deal_id/accesses/:profile_access_id')
  .get(retrieveBrokerageDealProfileAccess)
  .patch(updateBrokerageDealProfileAccess)
  .delete(deleteBrokerageDealProfileAccess)

router.route('/loft47/addresses/:address_id')
  .get(retrieveAddress)
  .patch(updateAddress)


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
