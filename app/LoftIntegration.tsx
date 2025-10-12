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
  const [isInitializing, setIsInitializing] = React.useState(true)
  const [status, setStatus] = React.useState<string | null>(null)
  const [statusType, setStatusType] = React.useState<'normal' | 'warning'>('normal')
  const [isExistingDeal, setIsExistingDeal] = React.useState(false)
  
  // Form state
  const [dealType, setDealType] = React.useState('')
  const [dealSubType, setDealSubType] = React.useState('')
  const [leadSource, setLeadSource] = React.useState('')
  const [propertyType, setPropertyType] = React.useState('')
  const [saleStatus, setSaleStatus] = React.useState('')
  const [selectedBrokerageId, setSelectedBrokerageId] = React.useState('')
  
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

  const isFormLocked = saleStatus === 'firm'
  
  const getStatusInfo = () => {
    if (!isExistingDeal) {
      return { text: 'Not Synced', color: '#bdbdbd', bgColor: '#f5f5f5', icon: '◯' }
    }
    
    switch (saleStatus) {
      case 'firm':
        return { text: 'Firm Sale', color: '#2e7d32', bgColor: '#e8f5e8', icon: '✓' }
      case 'active':
        return { text: 'Active', color: '#1976d2', bgColor: '#e3f2fd', icon: '●' }
      case 'pending':
        return { text: 'Pending', color: '#f57c00', bgColor: '#fff3e0', icon: '⏳' }
      case 'closed':
        return { text: 'Closed', color: '#2e7d32', bgColor: '#e8f5e8', icon: '✓' }
      default:
        return { text: 'Synced', color: '#4caf50', bgColor: '#e8f5e8', icon: '✓' }
    }
  }

  const statusInfo = getStatusInfo()

  // Check for existing deal on component mount
  React.useEffect(() => {
    initializeComponent()
  }, [deal.id])

  const initializeComponent = async () => {
    setIsInitializing(true)
    showStatus('Checking for existing sync...')

    try {
      // 1. Get config and sign in
      const config = await api.getConfig()
      if (config.error) {
        showStatus('Ready to sync - no existing data found')
        setIsInitializing(false)
        return
      }

      const auth = await api.signIn(config.LOFT47_EMAIL, config.LOFT47_PASSWORD)
      if (auth.error) {
        showStatus('Ready to sync - could not authenticate')
        setIsInitializing(false)
        return
      }

      setLoft47Url(config.LOFT47_URL || '')

      // 2. Get brokerages
      const brokData = await api.getBrokerages()
      if (brokData.error || !brokData.data?.length) {
        showStatus('Ready to sync - no brokerages found')
        setIsInitializing(false)
        return
      }

      setBrokerages(brokData.data)
      // Auto-select first brokerage if only one available
      if (brokData.data.length === 1) {
        setSelectedBrokerageId(brokData.data[0].id)
      }
      const brokerage = brokData.data[0]

      // 3. Check if deal has been synced before
      const mapping = await api.getMapping(deal.id)
      
      if (mapping.notFound || mapping.error) {
        showStatus('Ready to sync - new deal')
        setIsInitializing(false)
        return
      }

      // 4. Verify we have a valid Loft47 deal ID
      if (!mapping.loft47_deal_id) {
        showStatus('Deal mapping found but Loft47 ID is missing. Try re-syncing.', 'warning')
        setIsInitializing(false)
        return
      }

      // 5. Deal exists - fetch the existing deal data
      setIsExistingDeal(true)
      setLoft47DealId(mapping.loft47_deal_id)
      // Set the brokerage for existing deals
      setSelectedBrokerageId(brokerage.id)
      
      const existingDeal = await api.getDeal(brokerage.id, mapping.loft47_deal_id)
      
      if (existingDeal.error) {
        showStatus('Deal was synced before but could not fetch current data', 'warning')
        setIsInitializing(false)
        return
      }

      // 5. Populate form with existing data
      const dealData = existingDeal.data.attributes
      
      setDealType(dealData.dealType || '')
      setDealSubType(dealData.dealSubType || '')
      setLeadSource(dealData.leadSource || '')
      setPropertyType(dealData.propertyType || '')
      setSaleStatus(dealData.saleStatus || '')

    } catch (error) {
      console.error('Initialization error:', error)
      showStatus('Ready to sync - initialization failed', 'warning')
    } finally {
      setIsInitializing(false)
    }
  }

  const syncToDeal = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)

    try {
      // Use selected brokerage
      if (!selectedBrokerageId) {
        showStatus('Please select a brokerage', 'warning')
        return
      }

      const brokerage = brokerages.find(b => b.id === selectedBrokerageId)
      if (!brokerage) {
        showStatus('Selected brokerage not found', 'warning')
        return
      }

      // Setup primary agent
      const mainAgent = getMainAgent(roles, deal)
      if (!mainAgent) {
        showStatus('No main agent found', 'warning')
        return
      }

      let agent = primaryAgent
      if (!agent) {
        agent = await findOrCreateAgent(brokerage.id, mainAgent)
        if (!agent) {
          showStatus('Could not create agent', 'warning')
          return
        }
        setPrimaryAgent(agent)
      }

      // Create/update deal
      const dealPayload = buildDealPayload(agent)

      if (isExistingDeal) {
        showStatus('Updating existing deal...')
        await updateExistingDeal(selectedBrokerageId, loft47DealId, dealPayload)
      } else {
        showStatus('Creating new deal...')
        await createNewDeal(selectedBrokerageId, dealPayload)
        setIsExistingDeal(true)
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
    if (!selectedBrokerageId) { showStatus('Select brokerage', 'warning'); return false }
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
    const possessionDate = getDealContext('possession_date')?.date
    
    // Helper function to check if a date is valid (not null, 0, or empty)
    const isValidDate = (timestamp: any) => {
      return timestamp && timestamp > 0
    }
    
    const payload: any = {
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
          teamDeal: deal.brand.brand_type === 'Team'
        }
      }
    }
    
    // Only add dates if they are valid
    if (isValidDate(closingDate)) {
      const formattedClosingDate = formatDate(closingDate)
      if (formattedClosingDate) {
        payload.data.attributes.closedAt = formattedClosingDate
        payload.data.attributes.soldAt = formattedClosingDate
      }
    }
    
    if (isValidDate(possessionDate)) {
      const formattedPossessionDate = formatDate(possessionDate)
      if (formattedPossessionDate) {
        payload.data.attributes.possessionAt = formattedPossessionDate
      }
    }
    
    // Add other optional fields only if they have valid values
    const block = getDealContext('block_number')?.text
    const lot = getDealContext('lot_number')?.text
    const mlsNumber = getDealContext('mls_number')?.text
    
    if (block) payload.data.attributes.block = block
    if (lot) payload.data.attributes.lot = lot
    if (mlsNumber) payload.data.attributes.mlsNumber = mlsNumber
    
    return payload
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
    if (loft47Url && selectedBrokerageId && loft47DealId) {
      const baseUrl = loft47Url.endsWith('/') ? loft47Url.slice(0, -1) : loft47Url
      window.open(`${baseUrl}/brokerages/${selectedBrokerageId}/deals/${loft47DealId}`, '_blank')
    } else {
      showStatus('Deal not synced yet or brokerage not selected', 'warning')
    }
  }

  return (
    <div style={{ width: '100%', padding: 12, backgroundColor: '#fafafa', minHeight: 'auto' }}>
      {(isLoading || isInitializing) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Ui.Paper style={{ padding: 32, borderRadius: 12, textAlign: 'center' }}>
            <Ui.CircularProgress style={{ marginBottom: 16 }} size={48} />
            <Ui.Typography variant="h6">
              {isInitializing ? 'Loading deal data...' : 'Syncing with Loft47...'}
            </Ui.Typography>
          </Ui.Paper>
        </div>
      )}
      

      <Ui.Grid container spacing={2}>
        {/* Deal Status & Actions Bar */}
        <Ui.Grid item xs={12}>
          <Ui.Paper 
            elevation={2}
            style={{ 
              padding: 12, 
              borderRadius: 6,
              background: statusInfo.bgColor,
              border: `2px solid ${statusInfo.color}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: statusInfo.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  {statusInfo.icon}
                </div>
                <div>
                  <Ui.Typography variant="body1" style={{ fontWeight: 'bold', color: '#333', marginBottom: 1 }}>
                    {statusInfo.text}
                  </Ui.Typography>
                  {status && (
                    <Ui.Typography variant="body2" style={{ 
                      color: statusType === 'normal' ? '#1976d2' : '#f57c00',
                      fontWeight: 500
                    }}>
                      {status}
                    </Ui.Typography>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!isFormLocked && (
                  <Ui.Button 
                    variant="contained" 
                    color="primary" 
                    onClick={syncToDeal}
                    disabled={isLoading || isInitializing}
                    style={{ 
                      minWidth: 100,
                      borderRadius: 16,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      padding: '6px 16px'
                    }}
                  >
                    {isExistingDeal ? '🔄 Update' : '🚀 Create'}
                  </Ui.Button>
                )}
                <Ui.Button 
                  variant="outlined"
                  color="primary"
                  onClick={openDeal}
                  disabled={!loft47DealId}
                  style={{ 
                    minWidth: 80,
                    borderRadius: 16,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    padding: '6px 16px'
                  }}
                >
                  🔗 Open
                </Ui.Button>
              </div>
            </div>
          </Ui.Paper>
        </Ui.Grid>
        

        {/* Deal Information Card */}
        <Ui.Grid item xs={12} md={6}>
          <Ui.Paper elevation={1} style={{ padding: 12, borderRadius: 8, height: 'fit-content' }}>
            <Ui.Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: 8, color: '#1976d2' }}>
              📋 Deal Information
            </Ui.Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Address */}
              {getDealContext('full_address')?.text && (
                <div style={{ padding: 6, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
                  <Ui.Typography variant="caption" style={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Address
                  </Ui.Typography>
                  <Ui.Typography variant="body2" style={{ fontWeight: 500, marginTop: 1, fontSize: '0.8rem' }}>
                    {getDealContext('full_address')?.text}
                  </Ui.Typography>
                </div>
              )}
              
              {/* City - full width */}
              {getDealContext('city')?.text && (
                <div style={{ padding: 6, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
                  <Ui.Typography variant="caption" style={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    City
                  </Ui.Typography>
                  <Ui.Typography variant="body2" style={{ fontWeight: 500, marginTop: 1, fontSize: '0.8rem' }}>
                    {getDealContext('city')?.text}
                  </Ui.Typography>
                </div>
              )}
              
              {/* State and Postal Code - side by side */}
              {(getDealContext('state')?.text || getDealContext('postal_code')?.text) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {getDealContext('state')?.text && (
                    <div style={{ padding: 6, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
                      <Ui.Typography variant="caption" style={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        State
                      </Ui.Typography>
                      <Ui.Typography variant="body2" style={{ fontWeight: 500, marginTop: 1, fontSize: '0.8rem' }}>
                        {getDealContext('state')?.text}
                      </Ui.Typography>
                    </div>
                  )}
                  {getDealContext('postal_code')?.text && (
                    <div style={{ padding: 6, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
                      <Ui.Typography variant="caption" style={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Postal Code
                      </Ui.Typography>
                      <Ui.Typography variant="body2" style={{ fontWeight: 500, marginTop: 1, fontSize: '0.8rem' }}>
                        {getDealContext('postal_code')?.text}
                      </Ui.Typography>
                    </div>
                  )}
                </div>
              )}
              
              {/* Sales Price */}
              {getDealContext('sales_price')?.text && (
                <div style={{ padding: 6, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
                  <Ui.Typography variant="caption" style={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Sales Price
                  </Ui.Typography>
                  <Ui.Typography variant="body2" style={{ fontWeight: 500, marginTop: 1, fontSize: '0.8rem' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(getDealContext('sales_price')?.text))}
                  </Ui.Typography>
                </div>
              )}
              
              {/* Closing Date */}
              {getDealContext('closing_date')?.date && getDealContext('closing_date')?.date > 0 && (
                <div style={{ padding: 6, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
                  <Ui.Typography variant="caption" style={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Closing Date
                  </Ui.Typography>
                  <Ui.Typography variant="body2" style={{ fontWeight: 500, marginTop: 1, fontSize: '0.8rem' }}>
                    {new Date(getDealContext('closing_date')?.date * 1000).toLocaleDateString()}
                  </Ui.Typography>
                </div>
              )}
              
              {/* Possession Date */}
              {getDealContext('possession_date')?.date && getDealContext('possession_date')?.date > 0 && (
                <div style={{ padding: 6, backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e9ecef' }}>
                  <Ui.Typography variant="caption" style={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Possession Date
                  </Ui.Typography>
                  <Ui.Typography variant="body2" style={{ fontWeight: 500, marginTop: 1, fontSize: '0.8rem' }}>
                    {new Date(getDealContext('possession_date')?.date * 1000).toLocaleDateString()}
                  </Ui.Typography>
                </div>
              )}
            </div>
          </Ui.Paper>
        </Ui.Grid>

        {/* Form Fields Card */}
        <Ui.Grid item xs={12} md={6}>
          <Ui.Paper elevation={1} style={{ padding: 12, borderRadius: 8 }}>
            <Ui.Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: 8, color: '#1976d2' }}>
              ⚙️ Sync Configuration
            </Ui.Typography>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Brokerage Selection */}
              <Ui.FormControl fullWidth variant="outlined" size="small">
                <Ui.InputLabel>Brokerage</Ui.InputLabel>
                <Ui.Select 
                  value={selectedBrokerageId} 
                  onChange={(e) => setSelectedBrokerageId(e.target.value as string)}
                  disabled={isExistingDeal}
                  style={{ 
                    backgroundColor: isExistingDeal ? '#f5f5f5' : 'white',
                    opacity: isExistingDeal ? 0.7 : 1
                  }}
                >
                  {brokerages.map(brokerage => (
                    <Ui.MenuItem key={brokerage.id} value={brokerage.id}>
                      {brokerage.attributes?.name || `Brokerage ${brokerage.id}`}
                    </Ui.MenuItem>
                  ))}
                </Ui.Select>
              </Ui.FormControl>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Ui.FormControl fullWidth variant="outlined" size="small">
                  <Ui.InputLabel>Deal Type</Ui.InputLabel>
                  <Ui.Select 
                    value={dealType} 
                    onChange={(e) => setDealType(e.target.value as string)}
                    disabled={isFormLocked}
                    style={{ 
                      backgroundColor: isFormLocked ? '#f5f5f5' : 'white',
                      opacity: isFormLocked ? 0.7 : 1
                    }}
                  >
                    {dealTypes.map(opt => (
                      <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
                    ))}
                  </Ui.Select>
                </Ui.FormControl>

                <Ui.FormControl fullWidth variant="outlined" size="small">
                  <Ui.InputLabel>Property Type</Ui.InputLabel>
                  <Ui.Select 
                    value={propertyType} 
                    onChange={(e) => setPropertyType(e.target.value as string)}
                    disabled={isFormLocked}
                    style={{ 
                      backgroundColor: isFormLocked ? '#f5f5f5' : 'white',
                      opacity: isFormLocked ? 0.7 : 1
                    }}
                  >
                    {propertyTypes.map(opt => (
                      <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
                    ))}
                  </Ui.Select>
                </Ui.FormControl>
              </div>

              <Ui.FormControl fullWidth variant="outlined" size="small">
                <Ui.InputLabel>Deal Sub Type</Ui.InputLabel>
                <Ui.Select 
                  value={dealSubType} 
                  onChange={(e) => setDealSubType(e.target.value as string)}
                  disabled={isFormLocked}
                  style={{ 
                    backgroundColor: isFormLocked ? '#f5f5f5' : 'white',
                    opacity: isFormLocked ? 0.7 : 1
                  }}
                >
                  {dealSubTypes.map(opt => (
                    <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
                  ))}
                </Ui.Select>
              </Ui.FormControl>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Ui.FormControl fullWidth variant="outlined" size="small">
                  <Ui.InputLabel>Lead Source</Ui.InputLabel>
                  <Ui.Select 
                    value={leadSource} 
                    onChange={(e) => setLeadSource(e.target.value as string)}
                    disabled={isFormLocked}
                    style={{ 
                      backgroundColor: isFormLocked ? '#f5f5f5' : 'white',
                      opacity: isFormLocked ? 0.7 : 1
                    }}
                  >
                    {leadSources.map(opt => (
                      <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
                    ))}
                  </Ui.Select>
                </Ui.FormControl>

                <Ui.FormControl fullWidth variant="outlined" size="small">
                  <Ui.InputLabel>Sale Status</Ui.InputLabel>
                  <Ui.Select 
                    value={saleStatus} 
                    onChange={(e) => setSaleStatus(e.target.value as string)}
                    disabled={isFormLocked}
                    style={{ 
                      backgroundColor: isFormLocked ? '#f5f5f5' : 'white',
                      opacity: isFormLocked ? 0.7 : 1
                    }}
                  >
                    {saleStatuses.map(opt => (
                      <Ui.MenuItem key={opt.id} value={opt.id}>{opt.label}</Ui.MenuItem>
                    ))}
                  </Ui.Select>
                </Ui.FormControl>
              </div>
            </div>
          </Ui.Paper>
        </Ui.Grid>

      </Ui.Grid>
    </div>
  )
}