import express from 'express'

import {
  getAppConfig,
  createBrandCredentials,
  getBrandCredentialsByBrandId,
  getMapping,
  createMapping,
  home,
  getBrokerages,
  createBrokerage,
  getProfiles,
  createProfile,
  updateProfile,
  getDeals,
  createDeal,
  getDeal,
  updateDeal,
  getDealAccesses,
  createDealAccess,
  deleteDealAccess,
  getDealAccessRoles,
  createDealAccessRole,
  updateAddress
} from './handlers'

const router = express.Router()

// Basic routes
router.get('/', home)
// Get app configuration
router.post('/loft47/app_config', getAppConfig)
router.post('/loft47/brand_credentials', createBrandCredentials)
router.get('/loft47/brand_credentials/:brand_id', getBrandCredentialsByBrandId)

// Auth is now handled server-side in brand_credentials/lookup

// Loft47 API specific endpoints
router.get('/loft47/brokerages', getBrokerages)
router.post('/loft47/brokerages', createBrokerage)

router.get('/loft47/brokerages/:brokerage_id/profiles', getProfiles)
router.post('/loft47/brokerages/:brokerage_id/profiles', createProfile)
router.patch('/loft47/brokerages/:brokerage_id/profiles/:profile_id', updateProfile)

router.get('/loft47/brokerages/:brokerage_id/deals', getDeals)
router.post('/loft47/brokerages/:brokerage_id/deals', createDeal)
router.get('/loft47/brokerages/:brokerage_id/deals/:deal_id', getDeal)
router.patch('/loft47/brokerages/:brokerage_id/deals/:deal_id', updateDeal)

router.get('/loft47/brokerages/:brokerage_id/deals/:deal_id/accesses', getDealAccesses)
router.post('/loft47/brokerages/:brokerage_id/deals/:deal_id/accesses', createDealAccess)
router.delete('/loft47/brokerages/:brokerage_id/deals/:deal_id/accesses/:profile_access_id', deleteDealAccess)

router.get('/loft47/brokerages/:brokerage_id/deal_access_roles', getDealAccessRoles)
router.post('/loft47/brokerages/:brokerage_id/deal_access_roles', createDealAccessRole)

router.patch('/loft47/addresses/:address_id', updateAddress)

// Deal mappings - custom logic
router.get('/loft47/deal_mappings/rechat/:deal_id', getMapping)
router.post('/loft47/deal_mappings', createMapping)

export default router
