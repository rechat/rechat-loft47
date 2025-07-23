import Ui from '@libs/material-ui'
import React from '@libs/react'
import ReactUse from '@libs/react-use'
import DealContextList from './components/DealContextList'
import { AuthService } from './service/AuthService'
import { BrokeragesService } from './service/BrokeragesService'
import { BrokerageDealsService } from './service/BrokerageDealsService'
import { BrokerageDealsProfileAccessesService } from './service/BrokerageDealsProfileAccessesService'
import { DealsMappingService } from './service/DealsMappingService'
import { BrokerageProfilesService } from './service/BrokerageProfilesService'
import { usePersistentState } from './hooks/usePersistentState'
import { 
  dealSubTypes,
  dealTypes,
  leadSources,
  propertyType,
  saleStatus,
  DealContexts,
  toISOWithOffset,
  getMainAgent,
  getOtherAgent,
  decideOwningSide,
  getBuyers,
  getSellers,
  getBuyersEmails,
  getSellersEmails,
} from './core/utils'
import { AddressService } from './service/AddressService'
import { ConfigService } from './service/ConfigService'


// Minimal type for a Loft47 brokerage entry (extend as needed)
type Loft47Brokerage = {
  id: string
  [key: string]: unknown
}

export const App: React.FC<EntryProps> = ({
  models: { deal: RechatDeal, roles, user },
  api: {
    getDealContext,
    updateDealContext,
    deleteRole,
    updateRole,
    notifyOffice,
    updateTaskStatus,
    close
  },
  Components: {
    DatePicker: DayPicker,
    Wizard,
    RoleForm,
    RoleCard,
    ContactRoles,
    AgentsPicker
  },
  utils: { notify, isBackOffice },
  hooks
}) => {
  ReactUse.useDebounce(() => {}, 1000, [])

  const authDataRef = React.useRef<any>(null)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const loft47BrokeragesRef = React.useRef<Loft47Brokerage[]>([])
  // Message Snackbar
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const [isLoading, setIsLoading] = React.useState(false)
  const loft47PrimaryAgentRef = React.useRef<any>(null)
  const [loft47DealId, setLoft47DealId] = React.useState('')

  const [selectedDealType,      setSelectedDealType]      = usePersistentState('dealType',      '')
  const [selectedDealSubType,   setSelectedDealSubType]   = usePersistentState('dealSubType',   '')
  const [selectedLeadSource,    setSelectedLeadSource]    = usePersistentState('leadSource',    '')
  const [selectedPropertyType,  setSelectedPropertyType]  = usePersistentState('propertyType',  '')
  const [selectedSaleStatus,    setSelectedSaleStatus]    = usePersistentState('saleStatus',    '')

  const handleDealTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedDealType(event.target.value as string)
  }
  const handleDealSubTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedDealSubType(event.target.value as string)
  }
  const handleLeadSourceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedLeadSource(event.target.value as string)
  }
  const handlePropertyTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedPropertyType(event.target.value as string)
  }
  const handleSaleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedSaleStatus(event.target.value as string)
  }

  const signInOnce = async () => {
    setIsLoading(true)
    const env = await ConfigService.getPublicEnv()
    if (env.error) {
      setMessage('Loft47 credentials not provided by backend')
      showMessage()
      setIsLoading(false)
      return
    }

    const authData = await AuthService.signIn(env.LOFT47_EMAIL, env.LOFT47_PASSWORD)
    if (authData.error) {
      setMessage('Error signing in. Please try again later.')
      showMessage()
      authDataRef.current = null
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }
    authDataRef.current = authData
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const retrieveBrokerages = async () => {
    setIsLoading(true)
    const brokeragesData = await BrokeragesService.retrieveBrokerages()
    if (brokeragesData.error) {
      setMessage('Error retrieving brokerages: ' + brokeragesData.error)
      showMessage()
      setIsLoading(false)
      return
    }
    loft47BrokeragesRef.current = brokeragesData.data
    setIsLoading(false)
  }

  const setMainAgent = async () => {
    const mainAgent = getMainAgent(roles, RechatDeal)
    if (mainAgent) {
      const profilesData = await BrokerageProfilesService.getBrokerageProfiles(loft47BrokeragesRef.current[0].id ?? '', {
        'email': mainAgent.email
      })
      if (profilesData.error) {
        setMessage('Error getting main agent profiles: ' + profilesData.error)
        showMessage()
        return
      }

      if (profilesData.data.length > 0) {
        const profile = profilesData.data[0]
        loft47PrimaryAgentRef.current = profile
      } else {
        const newAgentResp = await BrokerageProfilesService.createBrokerageProfile(
          loft47BrokeragesRef.current[0].id ?? '',
          {
            data: {
              attributes: {
                email: mainAgent.email,
                name: mainAgent.legal_full_name,
                type: 'Agent'
              }
            }
          }
        )
        const newAgent = newAgentResp.data
        loft47PrimaryAgentRef.current = newAgent
      }
    } else {
      setMessage('No Main Agent in Rechat!')
      showMessage()
      return
    }
  }

  const createMapping = async (tempLoft47Deal: any) => {
    setIsLoading(true)
    if (loft47BrokeragesRef.current.length > 0) {
      const newLoft47Deal = await BrokerageDealsService.createDeal(loft47BrokeragesRef.current[0].id, tempLoft47Deal)

      if (newLoft47Deal.error) {
        setMessage('Create deal in Loft47 failed!')
        showMessage()
        setIsLoading(false)
      } else {
        setLoft47DealId(newLoft47Deal.data.id)

        const mapping = await DealsMappingService.createMapping(RechatDeal.id, newLoft47Deal.data.id)
        if (!mapping.error) {
          setMessage('Rechat Deal(' + RechatDeal?.id + ') was successfully created in Loft47!')
        } else {
          setMessage('Error creating mapping: ' + mapping.error)
        }
        showMessage()
        setIsLoading(false)

        await updateLoft47DealAddress(newLoft47Deal)
        await updateDealPeople(newLoft47Deal)
      }
    }
  }

  const updateMapping = async (_loft47DealId: string, tempLoft47Deal: any) => {
    setIsLoading(true)
    const updatedLoft47Deal = await BrokerageDealsService.updateDeal(loft47BrokeragesRef.current[0].id ?? '', _loft47DealId, tempLoft47Deal)
    if (updatedLoft47Deal.error) {
      setMessage('Error updating deal in Loft47: ' + updatedLoft47Deal.error)
      showMessage()
      setIsLoading(false)
      return
    }
    setLoft47DealId(updatedLoft47Deal.data.id)
    
    setMessage('Rechat Deal(' + RechatDeal?.id + ') was successfully updated in Loft47!')
    showMessage()
    setIsLoading(false)

    await updateLoft47DealAddress(updatedLoft47Deal)
    await updateDealPeople(updatedLoft47Deal)
  }

  const updateLoft47DealAddress = async (loft47Deal: any) => {
    const streetAddress = getDealContext('street_address')
    if (!streetAddress) {
      setMessage('No address set for this deal! Rechat Deal Title is set in Rechat.')
      showMessage()
    }

    const addressId = loft47Deal.data.relationships.address.data.id
    const tempAddress = {
      data: {
        attributes: {
          "addressLineOne": streetAddress?.text ?? RechatDeal.title,
          "city": getDealContext('city')?.text,
          "country": getDealContext('country')?.text,
          "postalCode": getDealContext('postal_code')?.text,
          "province": getDealContext('state')?.text,
        }
      }
    }
    const address = await AddressService.updateAddress(addressId, tempAddress)
    if (address.error) {
      setMessage('Error updating address in Loft47: ' + address.error)
      showMessage()
      return
    }
  }

  const checkIfAllContextsAreFilled = () => {
    if (!RechatDeal) {
      setMessage('Rechat Deal is empty')
      showMessage()
      return false
    }
    
    if (selectedDealSubType === '') {
      setMessage('Please select a deal sub type')
      showMessage()
      return false
    }

    if (selectedDealType === '') {
      setMessage('Please select a deal type')
      showMessage()
      return false
    }

    if (selectedLeadSource === '') {
      setMessage('Please select a lead source')
      showMessage()
      return false
    }

    if (selectedPropertyType === '') {
      setMessage('Please select a property type')
      showMessage()
      return
    }

    if (selectedSaleStatus === '') {
      setMessage('Please select a sale status')
      showMessage()
      return false
    }

    if (!loft47PrimaryAgentRef.current) {
      setMessage('Loft47 primary agent doesn\'t exist')
      showMessage()
      return false
    }
    return true
  }

  const updateDealPeople = async (loft47Deal: any) => {
    // Sync buyers
    await syncPeople(
      getBuyers(roles),
      getBuyersEmails,
      'buyer',
      'sell',
      loft47Deal
    )

    // Sync sellers
    await syncPeople(
      getSellers(roles),
      getSellersEmails,
      'seller',
      'list',
      loft47Deal
    )
  }

  /**
   * Generic helper to keep people/profiles and profile accesses in sync for a given role.
   */
  const syncPeople = async (
    people: any[],
    getEmailsFn: (people: any[]) => string,
    role: 'buyer' | 'seller',
    side: 'sell' | 'list',
    loft47Deal: any
  ) => {
    const emails = getEmailsFn(people)
    let profilesResp: any = { data: [] }

    if (people.length > 0) {
      profilesResp = await BrokerageProfilesService.getBrokerageProfiles(
        loft47BrokeragesRef.current[0].id ?? '',
        { email: emails, type: 'Profile' }
      )
      if (profilesResp.error) {
        setMessage(`Error getting ${role} profiles: ` + profilesResp.error)
        showMessage()
        return
      }
    }

    // Ensure we have an array even if API returns null/undefined
    const existingProfiles: any[] = profilesResp.data
    // Map email -> profile for quick lookup
    const emailToProfile = new Map<string, any>(
      existingProfiles.map((p: any) => [p.attributes.email, p])
    )
    // 1. Create missing profiles
    for (const person of people) {
      if (!person.email) continue
      if (!emailToProfile.has(person.email)) {
        const newProfileResp = await BrokerageProfilesService.createBrokerageProfile(
          loft47BrokeragesRef.current[0].id ?? '',
          {
            data: {
              attributes: {
                email: person.email,
                name: person.legal_full_name,
                type: 'Profile'
              }
            }
          }
        )
        if (newProfileResp?.data) {
          emailToProfile.set(person.email, newProfileResp.data)
        }
      }
    }

    // Get all profiles ids corresponding to the people(Buyers or Sellers)
    const profileIds = Array.from(emailToProfile.values()).map((p: any) => p.attributes.id)

    // 2. Retrieve existing accesses for this role(Buyers or Sellers)
    const accessesResp = await BrokerageDealsProfileAccessesService.retrieveBrokerageDealProfileAccesses(
      loft47BrokeragesRef.current[0].id ?? '',
      loft47Deal.data.id
    )

    const existingAccesses: any[] = accessesResp?.data.filter((a: any) => a.attributes.role === role) ?? []
    const existingAccessProfileIds = existingAccesses.map((a: any) => a.attributes.profileId)

    // a) Add missing accesses
    for (const profileId of profileIds) {
      if (!existingAccessProfileIds.includes(profileId)) {
        await BrokerageDealsProfileAccessesService.createBrokerageDealProfileAccess(
          loft47BrokeragesRef.current[0].id ?? '',
          loft47Deal.data.id,
          {
            data: {
              attributes: {
                profileId: String(profileId),
                role,
                side
              }
            }
          }
        )
      }
    }

    // b) Remove stale accesses that no longer correspond to the people
    for (const access of existingAccesses) {
      if (!profileIds.includes(access.attributes.profileId) || profileIds.length === 0) {
        await BrokerageDealsProfileAccessesService.deleteBrokerageDealProfileAccess(
          loft47BrokeragesRef.current[0].id ?? '',
          loft47Deal.data.id,
          access.id
        )
      }
    }
  }

  const syncWithLoft47 = async () => {
    await retrieveBrokerages()
    if (loft47BrokeragesRef.current.length === 0) {
      setMessage('No brokerages found. Please try again later.')
      showMessage()
      return
    }
    await setMainAgent()
    if (!checkIfAllContextsAreFilled()) {
      return
    }

    const block = getDealContext('block_number')
    const closedAt = toISOWithOffset(new Date((getDealContext('closing_date')?.date ?? 0) * 1000))
    const lot = getDealContext('lot_number')
    const mlsNumber = getDealContext('mls_number')
    const salesPrice = getDealContext('sales_price')
    const updatedAt = RechatDeal.updated_at
    const possessionAt = toISOWithOffset(new Date((getDealContext('possession_date')?.date ?? 0) * 1000))
    const mainAgent = getMainAgent(roles, RechatDeal)
    const otherAgent = getOtherAgent(roles, RechatDeal)
    const owningSide = decideOwningSide(RechatDeal)

    const tempLoft47Deal = {
      data: {
        attributes: {
          ownerId: Number(loft47PrimaryAgentRef.current.id),
          ...(block && { block }),
          adjustmentAt: toISOWithOffset(new Date((updatedAt ?? 0) * 1000)),
          ...(closedAt && { closedAt }),
          dealSubType: selectedDealSubType,
          dealType: selectedDealType,
          leadSource: selectedLeadSource,
          propertyType: selectedPropertyType,
          saleStatus: selectedSaleStatus,
          exclusive: !RechatDeal.listing,
          externalTransactionId: RechatDeal.id,
          ...(RechatDeal.brand.brand_type === 'Office' && { officeId: RechatDeal.brand.parent[0] }),
          ...(lot && { lot }),          
          ...(mlsNumber && { mlsNumber }),
          offer: RechatDeal.deal_type === 'Buying',
          ...(otherAgent && { outsideBrokerageName: otherAgent.company_title }),
          ...(owningSide && { owningSide }),
          ...(mainAgent && { ownerName: mainAgent.legal_full_name }),
          ...(possessionAt && { possessionAt }),
          ...(salesPrice && { sellPrice: salesPrice.text }),
          ...(closedAt && { soldAt: closedAt }),
          teamDeal: RechatDeal.brand.brand_type === 'Team',
        }
      }
    }

    setIsLoading(true)
    const mapping = await DealsMappingService.getMappingByRechatDealId(RechatDeal.id)
    console.log('syncWithLoft47 / mapping:', mapping)
    setIsLoading(false)
    if (!mapping.error) {
      setMessage('Rechat Deal(' + RechatDeal?.id + ') exists in Loft47. Updating deal in Loft47...')
      showMessage()
      await updateMapping(mapping.loft47_deal_id, tempLoft47Deal)
    } else {
      setMessage('Rechat Deal(' + RechatDeal?.id + ') does not exist in Loft47. Creating deal in Loft47...')
      showMessage()
      await createMapping(tempLoft47Deal)
    }
  }

  const openLoft47Deal = () => {
    window.open(`https://staging.loft47.com/brokerages/${loft47BrokeragesRef.current[0].id}/deals/${loft47DealId}`, '_blank')
  }

  const showMessage = () => {
    setOpen(true);
  };

  const closeMessage = (
    event: React.SyntheticEvent | Event,
    reason: typeof Ui.SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  React.useEffect(() => {
    if (!authDataRef.current) {
      signInOnce()
    }
  }, [])

  return (
    <Ui.Grid container spacing={2}>
      <Ui.CircularProgress style={{ display: 'absolute', position: 'absolute', top: '50%', left: '50%' }} hidden={!isLoading} />
      <Ui.Grid item xs={12} md={12} lg={12}>
        <DealContextList
          contexts={DealContexts}
          getDealContext={getDealContext}
        />
        
      </Ui.Grid>
      
      <Ui.Grid item xs={12}>
        <Ui.Grid container spacing={2}>
          {/* Deal Type */}
          <Ui.Grid item xs={12} sm={6}>
            <Ui.FormControl variant="standard" fullWidth>
              <Ui.InputLabel id="deal-type-select-label">Deal Type</Ui.InputLabel>
              <Ui.Select
                labelId="deal-type-select-label"
                id="deal-type-select"
                value={selectedDealType}
                onChange={handleDealTypeChange}
                label="Deal Type"
              >
                {dealTypes.map((dealType) => (
                  <Ui.MenuItem key={dealType.id} value={dealType.id}>{dealType.label}</Ui.MenuItem>
                ))}
              </Ui.Select>
            </Ui.FormControl>
          </Ui.Grid>

          {/* Deal Sub Type */}
          <Ui.Grid item xs={12} sm={6}>
            <Ui.FormControl variant="standard" fullWidth>
              <Ui.InputLabel id="deal-sub-type-select-label">Deal Sub Type</Ui.InputLabel>
              <Ui.Select
                labelId="deal-sub-type-select-label"
                id="deal-sub-type-select"
                value={selectedDealSubType}
                onChange={handleDealSubTypeChange}
                label="Deal Sub Type"
              >
                {dealSubTypes.map((dealSubType) => (
                  <Ui.MenuItem key={dealSubType.id} value={dealSubType.id}>{dealSubType.label}</Ui.MenuItem>
                ))}
              </Ui.Select>
            </Ui.FormControl>
          </Ui.Grid>
        </Ui.Grid>
      </Ui.Grid>
      
      <Ui.Grid item xs={12}>
        <Ui.Grid container spacing={2}>
          {/* Lead Source */}
          <Ui.Grid item xs={12} sm={4}>
            <Ui.FormControl variant="standard" fullWidth>
              <Ui.InputLabel id="lead-source-select-label">Lead Source</Ui.InputLabel>
              <Ui.Select
                labelId="lead-source-select-label"
                id="lead-source-select"
                value={selectedLeadSource}
                onChange={handleLeadSourceChange}
                label="Lead Source"
              >
                {leadSources.map((leadSource) => (
                  <Ui.MenuItem key={leadSource.id} value={leadSource.id}>{leadSource.label}</Ui.MenuItem>
                ))}
              </Ui.Select>
            </Ui.FormControl>
          </Ui.Grid>

          {/* Property Type */}
          <Ui.Grid item xs={12} sm={4}>
            <Ui.FormControl variant="standard" fullWidth>
              <Ui.InputLabel id="property-type-select-label">Property Type</Ui.InputLabel>
              <Ui.Select
                labelId="property-type-select-label"
                id="property-type-select"
                value={selectedPropertyType}
                onChange={handlePropertyTypeChange}
                label="Property Type"
              >
                {propertyType.map((propertyType) => (
                  <Ui.MenuItem key={propertyType.id} value={propertyType.id}>{propertyType.label}</Ui.MenuItem>
                ))}
              </Ui.Select>
            </Ui.FormControl>
          </Ui.Grid>

          {/* Sale Status */}
          <Ui.Grid item xs={12} sm={4}>
            <Ui.FormControl variant="standard" fullWidth>
              <Ui.InputLabel id="sale-status-select-label">Sale Status</Ui.InputLabel>
              <Ui.Select
                labelId="sale-status-select-label"
                id="sale-status-select"
                value={selectedSaleStatus}
                onChange={handleSaleStatusChange}
                label="Sale Status"
              >
                {saleStatus.map((saleStatus) => (
                  <Ui.MenuItem key={saleStatus.id} value={saleStatus.id}>{saleStatus.label}</Ui.MenuItem>
                ))}
              </Ui.Select>
            </Ui.FormControl>
          </Ui.Grid>
        </Ui.Grid>
      </Ui.Grid>

      <Ui.Grid item container xs={12} spacing={2} style={{ marginTop: '10px', marginBottom: '10px' }}>
        <Ui.Grid item>
          <Ui.Button 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !isAuthenticated}
            onClick={syncWithLoft47}
          >
            Sync with Loft47
          </Ui.Button>
        </Ui.Grid>
        <Ui.Grid item>
          <Ui.Button variant="contained" color="primary" onClick={close}>
            Close App
          </Ui.Button>
        </Ui.Grid>
        <Ui.Grid item>
          <Ui.Button variant="contained" color="primary" onClick={openLoft47Deal} disabled={!loft47DealId}>
            Open Loft47 Deal
          </Ui.Button>
        </Ui.Grid>
      </Ui.Grid>
      <Ui.Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={closeMessage}
        message={
          <span style={{ fontSize: '1.2rem', width: '100%' }}>{message}</span>
        }
        style={{ width: '300px', height: '60px' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Ui.Grid>
  )
}
