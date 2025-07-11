import express from 'express'

import homeRoute from './app/controllers/home'
import manifestRoute from './app/controllers/manifest'
import { signIn } from './app/controllers/loft47/auth'
import { retrieveBrokerages } from './app/controllers/loft47/brokerages'

const router = express.Router()

router.get('/', homeRoute)

/**
 * Please don't remove this route
 */
router.get('/manifest.json', manifestRoute)

router.post('/loft47/sign_in', signIn)

router.route('/loft47/brokerages')
  .get(retrieveBrokerages)

export default router
