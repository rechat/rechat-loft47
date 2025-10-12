import Ui from '@libs/material-ui'
import React from '@libs/react'

import { api } from './api'
import { 
  dealTypes, 
  dealSubTypes, 
  leadSources, 
  propertyTypes, 
  saleStatuses,
  dealContexts,
  getMainAgent,
  formatDate,
  decideRoleType,
  isAgentRole,
  decideOwningSide
} from './utils'

interface Props {
  models: { deal: any, roles: any[], user: any }
  api: {
    getDealContext: (id: string) => any
    updateDealContext: any
    deleteRole: any
    updateRole: any
  }
}

export default function LoftIntegration({ models: { deal, roles }, api: { getDealContext } }: Props) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [status, setStatus] = React.useState<string | null>(null)
  const [statusType, setStatusType] = React.useState<'normal' | 'warning'>('normal')
  
  // Form state
  const [dealType, setDealType] = React.useState('')
  const [dealSubType, setDealSubType] = React.useState('')
  const [leadSource, setLeadSource] = React.useState('')
  const [propertyType, setPropertyType] = React.useState('')
  const [saleStatus, setSaleStatus] = React.useState('')
  
  // Internal state
  const [brokerages, setBrokerages] = React.useState<any[]>([])
  const [loft47Url, setLoft47Url] = React.useState('')
  const [loft47DealId, setLoft47DealId] = React.useState('')
  const [primaryAgent, setPrimaryAgent] = React.useState<any>(null)

  const showStatus = (message: string, type: 'normal' | 'warning' = 'normal') => {
    setStatus(message)
    setStatusType(type)
    setTimeout(() => setStatus(null), 3000)
  }

  const syncToDeal = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)

    try {
      // 1. Sign in
      showStatus('Signing in...')
      const config = await api.getConfig()
      if (config.error) {
        showStatus('Config not available', 'warning')
        return
      }

      const auth = await api.signIn(config.LOFT47_EMAIL, config.LOFT47_PASSWORD)
      if (auth.error) {
        showStatus('Sign in failed', 'warning')
        return
      }

      setLoft47Url(config.LOFT47_URL || '')

      // 2. Get brokerages
      const brokData = await api.getBrokerages()
      if (brokData.error || !brokData.data?.length) {
        showStatus('No brokerages found', 'warning')
        return
      }

      setBrokerages(brokData.data)
      const brokerage = brokData.data[0]

      // 3. Setup primary agent
      const mainAgent = getMainAgent(roles, deal)
      if (!mainAgent) {
        showStatus('No main agent found', 'warning')
        return
      }

      let agent = await findOrCreateAgent(brokerage.id, mainAgent)
      if (!agent) {
        showStatus('Could not create agent', 'warning')
        return
      }
      setPrimaryAgent(agent)

      // 4. Create/update deal
      const dealPayload = buildDealPayload(agent)
      const mapping = await api.getMapping(deal.id)

      if (mapping.notFound) {
        showStatus('Creating deal...')
        await createNewDeal(brokerage.id, dealPayload)
      } else {
        showStatus('Updating deal...')
        await updateExistingDeal(brokerage.id, mapping.loft47DealId, dealPayload)
      }

      showStatus('Sync completed!')
    } catch (error) {
      console.error('Sync error:', error)
      showStatus('Sync failed', 'warning')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    if (!dealType) { showStatus('Select deal type', 'warning'); return false }
    if (!dealSubType) { showStatus('Select deal sub type', 'warning'); return false }
    if (!leadSource) { showStatus('Select lead source', 'warning'); return false }
    if (!propertyType) { showStatus('Select property type', 'warning'); return false }
    if (!saleStatus) { showStatus('Select sale status', 'warning'); return false }
    return true
  }

  const findOrCreateAgent = async (brokerageId: string, agent: any) => {
    const profiles = await api.getProfiles(brokerageId, { email: agent.email })
    if (profiles.error) return null

    if (profiles.data.length > 0) {
      return profiles.data[0]
    }

    const newAgent = await api.createProfile(brokerageId, {
      data: {
        attributes: {
          email: agent.email,
          name: agent.legal_full_name,
          type: 'Agent'
        }
      }
    })

    return newAgent.error ? null : newAgent.data
  }

  const buildDealPayload = (agent: any) => {
    const closingDate = getDealContext('closing_date')?.date
    return {
      data: {
        attributes: {
          ownerId: Number(agent.id),
          dealSubType: dealSubType,
          dealType: dealType,
          leadSource: leadSource,
          propertyType: propertyType,
          saleStatus: saleStatus,
          exclusive: !deal.listing,
          externalTransactionId: deal.id,
          offer: deal.deal_type === 'Buying',
          owningSide: decideOwningSide(deal),
          ownerName: agent.attributes.name,
          sellPrice: getDealContext('sales_price')?.text,
          teamDeal: deal.brand.brand_type === 'Team',
          ...(closingDate && { 
            closedAt: formatDate(closingDate),
            soldAt: formatDate(closingDate)
          })
        }
      }
    }
  }

  const createNewDeal = async (brokerageId: string, dealPayload: any) => {
    const newDeal = await api.createDeal(brokerageId, dealPayload)
    if (newDeal.error) {
      showStatus('Deal creation failed', 'warning')
      return
    }

    setLoft47DealId(newDeal.data.id)
    await api.createMapping(deal.id, newDeal.data.id)
    await updateDealAddress(newDeal)
    await syncDealPeople(brokerageId, newDeal.data.id)
  }

  const updateExistingDeal = async (brokerageId: string, dealId: string, dealPayload: any) => {
    const updatedDeal = await api.updateDeal(brokerageId, dealId, dealPayload)
    if (updatedDeal.error) {
      showStatus('Deal update failed', 'warning')
      return
    }

    setLoft47DealId(updatedDeal.data.id)
    await updateDealAddress(updatedDeal)
    await syncDealPeople(brokerageId, updatedDeal.data.id)
  }

  const updateDealAddress = async (loft47Deal: any) => {
    const addressId = loft47Deal.data.relationships.address.data.id
    await api.updateAddress(addressId, {
      data: {
        attributes: {
          addressLineOne: getDealContext('full_address')?.text || deal.title,
          city: getDealContext('city')?.text,
          postalCode: getDealContext('postal_code')?.text,
          province: getDealContext('state')?.text
        }
      }
    })
  }

  const syncDealPeople = async (brokerageId: string, dealId: string) => {
    // Simple people sync - create profiles and accesses for all roles
    for (const role of roles) {
      if (!role.email) continue

      const profile = await findOrCreateProfile(brokerageId, role)
      if (profile) {
        await api.createDealAccess(brokerageId, dealId, {
          data: {
            attributes: {
              profileId: String(profile.attributes.id),
              role: decideRoleType(role),
              side: decideOwningSide(deal)
            }
          }
        })
      }
    }
  }

  const findOrCreateProfile = async (brokerageId: string, role: any) => {
    const profiles = await api.getProfiles(brokerageId, { email: role.email })
    if (profiles.error) return null

    if (profiles.data.length > 0) {
      return profiles.data[0]
    }

    const roleType = decideRoleType(role)
    const newProfile = await api.createProfile(brokerageId, {
      data: {
        attributes: {
          email: role.email,
          name: role.legal_full_name,
          type: roleType === 'agent' ? 'Agent' : 'Profile'
        }
      }
    })

    return newProfile.error ? null : newProfile.data
  }

  const openDeal = () => {
    if (loft47Url && brokerages.length && loft47DealId) {
      window.open(`${loft47Url}/brokerages/${brokerages[0].id}/deals/${loft47DealId}`, '_blank')
    } else {
      showStatus('Deal not synced yet', 'warning')
    }
  }

  return (
    <Ui.Grid container spacing={2}>
      {isLoading && (
        <Ui.CircularProgress
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%'
          }}
        />
      )}
      
      {status && (
        <Ui.Grid item xs={12}>
          <Ui.Paper 
            style={{ 
              padding: 8, 
              background: statusType === 'normal' ? '#e3f2fd' : '#ff9800' 
            }}
          >
            <Ui.Typography variant="body2">{status}</Ui.Typography>
          </Ui.Paper>
        </Ui.Grid>
      )}

      {/* Deal Context Display */}
      <Ui.Grid item xs={12}>
        <Ui.Typography variant="h6">Deal Information</Ui.Typography>
        {dealContexts.map(context => {
          const value = getDealContext(context.id)?.[context.type]
          return value ? (
            <Ui.Typography key={context.id} variant="body2">
              {context.label}: {context.id.includes('price') ? 
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)) : 
                value
              }
            </Ui.Typography>
          ) : null
        })}
      </Ui.Grid>

      {/* Form Fields */}
      <Ui.Grid item xs={12} md={6}>
        <Ui.FormControl fullWidth>
          <Ui.InputLabel>Deal Type</Ui.InputLabel>
          <Ui.Select value={dealType} onChange={(e) => setDealType(e.target.value as string)}>
            {dealTypes.map(opt => (
              <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>

      <Ui.Grid item xs={12} md={6}>
        <Ui.FormControl fullWidth>
          <Ui.InputLabel>Deal Sub Type</Ui.InputLabel>
          <Ui.Select value={dealSubType} onChange={(e) => setDealSubType(e.target.value as string)}>
            {dealSubTypes.map(opt => (
              <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>

      <Ui.Grid item xs={12} md={6}>
        <Ui.FormControl fullWidth>
          <Ui.InputLabel>Lead Source</Ui.InputLabel>
          <Ui.Select value={leadSource} onChange={(e) => setLeadSource(e.target.value as string)}>
            {leadSources.map(opt => (
              <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>

      <Ui.Grid item xs={12} md={6}>
        <Ui.FormControl fullWidth>
          <Ui.InputLabel>Property Type</Ui.InputLabel>
          <Ui.Select value={propertyType} onChange={(e) => setPropertyType(e.target.value as string)}>
            {propertyTypes.map(opt => (
              <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>

      <Ui.Grid item xs={12} md={6}>
        <Ui.FormControl fullWidth>
          <Ui.InputLabel>Sale Status</Ui.InputLabel>
          <Ui.Select value={saleStatus} onChange={(e) => setSaleStatus(e.target.value as string)}>
            {saleStatuses.map(opt => (
              <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>

      {/* Actions */}
      <Ui.Grid item xs={12}>
        <Ui.Button 
          variant="contained" 
          color="primary" 
          onClick={syncToDeal}
          disabled={isLoading}
          style={{ marginRight: 8 }}
        >
          Sync to Loft47
        </Ui.Button>
        <Ui.Button 
          variant="outlined"
          onClick={openDeal}
          disabled={!loft47DealId}
        >
          Open in Loft47
        </Ui.Button>
      </Ui.Grid>
    </Ui.Grid>
  )
}