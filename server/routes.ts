import express from 'express'
import {
  signIn,
  getConfig,
  createGetHandler,
  createPostHandler,
  createPatchHandler,
  createDeleteHandler,
  getMapping,
  createMapping,
  home,
  manifest
} from './handlers'

const router = express.Router()

// Basic routes
router.get('/', home)
router.get('/manifest.json', manifest)
router.get('/config/env', getConfig)

// Auth
router.post('/loft47/sign_in', signIn)

// Loft47 API proxy routes - simple pass-through
router.get('/loft47/brokerages', createGetHandler('/brokerages'))
router.post('/loft47/brokerages', createPostHandler('/brokerages'))

router.get('/loft47/brokerages/:brokerage_id/profiles', createGetHandler('/brokerages/:brokerage_id/profiles'))
router.post('/loft47/brokerages/:brokerage_id/profiles', createPostHandler('/brokerages/:brokerage_id/profiles'))
router.patch('/loft47/brokerages/:brokerage_id/profiles/:profile_id', createPatchHandler('/brokerages/:brokerage_id/profiles/:profile_id'))

router.get('/loft47/brokerages/:brokerage_id/deals', createGetHandler('/brokerages/:brokerage_id/deals'))
router.post('/loft47/brokerages/:brokerage_id/deals', createPostHandler('/brokerages/:brokerage_id/deals'))
router.get('/loft47/brokerages/:brokerage_id/deals/:deal_id', createGetHandler('/brokerages/:brokerage_id/deals/:deal_id'))
router.patch('/loft47/brokerages/:brokerage_id/deals/:deal_id', createPatchHandler('/brokerages/:brokerage_id/deals/:deal_id'))

router.get('/loft47/brokerages/:brokerage_id/deals/:deal_id/accesses', createGetHandler('/brokerages/:brokerage_id/deals/:deal_id/accesses'))
router.post('/loft47/brokerages/:brokerage_id/deals/:deal_id/accesses', createPostHandler('/brokerages/:brokerage_id/deals/:deal_id/accesses'))
router.delete('/loft47/brokerages/:brokerage_id/deals/:deal_id/accesses/:profile_access_id', createDeleteHandler('/brokerages/:brokerage_id/deals/:deal_id/accesses/:profile_access_id'))

router.get('/loft47/brokerages/:brokerage_id/deal_access_roles', createGetHandler('/brokerages/:brokerage_id/deal_access_roles'))
router.post('/loft47/brokerages/:brokerage_id/deal_access_roles', createPostHandler('/brokerages/:brokerage_id/deal_access_roles'))

router.patch('/loft47/addresses/:address_id', createPatchHandler('/addresses/:address_id'))

// Deal mappings - custom logic
router.get('/loft47/deal_mappings/rechat/:deal_id', getMapping)
router.post('/loft47/deal_mappings', createMapping)

export default router