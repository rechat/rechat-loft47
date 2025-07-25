import Ui from '@libs/material-ui'
import React from '@libs/react'
import ReactUse from '@libs/react-use'
import DealContextList from './components/DealContextList'
import DealSelectors from './components/DealSelectors'
import ActionButtons from './components/ActionButtons'
import { AuthService } from './service/AuthService'
import { BrokeragesService } from './service/BrokeragesService'
import { BrokerageDealsService } from './service/BrokerageDealsService'
import { BrokerageDealsProfileAccessesService } from './service/BrokerageDealsProfileAccessesService'
import { DealsMappingService } from './service/DealsMappingService'
import { BrokerageProfilesService } from './service/BrokerageProfilesService'
import { usePersistentState } from './hooks/usePersistentState'
import { 
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
import PeopleSyncStatus from './components/PeopleSyncStatus'

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

  const loft47BrokeragesRef = React.useRef<Loft47Brokerage[]>([])
  // Message Snackbar
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const [isLoading, setIsLoading] = React.useState(false)
  const loft47PrimaryAgentRef = React.useRef<any>(null)
  const [loft47DealId, setLoft47DealId] = React.useState('')
  const [loft47Url, setLoft47Url] = React.useState('')
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null)

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
    const env = await ConfigService.getPublicEnv()
    if (env.error) {
      setMessage('Loft47 credentials not provided by backend')
      showMessage()
      return false
    }

    setLoft47Url(env.LOFT47_URL ?? '')
    const authData = await AuthService.signIn(env.LOFT47_EMAIL, env.LOFT47_PASSWORD)
    if (authData.error) {
      console.log('authData:', authData.error)
      setMessage('Sign in failed. Please try again later.')
      showMessage()
      return false
    }
    return true
  }

  const retrieveBrokerages = async () => {
    const brokeragesData = await BrokeragesService.retrieveBrokerages()
    if (brokeragesData.error) {
      console.log('brokeragesData:', brokeragesData.error)
      return
    }
    loft47BrokeragesRef.current = brokeragesData.data
  }

  const setMainAgent = async () => {
    const mainAgent = getMainAgent(roles, RechatDeal)
    if (mainAgent) {
      const profilesData = await BrokerageProfilesService.getBrokerageProfiles(loft47BrokeragesRef.current[0].id ?? '', {
        'email': mainAgent.email
      })
      if (profilesData.error) {
        console.log('profilesData:', profilesData.error)
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

  const createMapping = async (tempLoft47Deal: LoftDeal) => {
    if (loft47BrokeragesRef.current.length > 0) {
      const newLoft47Deal = await BrokerageDealsService.createDeal(loft47BrokeragesRef.current[0].id, tempLoft47Deal)

      if (newLoft47Deal.error) {
        if (newLoft47Deal.status === 422) {
          setMessage(newLoft47Deal.error.errors[0]?.detail ?? 'Error creating Rechat Deal in Loft47!')
          showMessage()
        }
        console.log('newLoft47Deal:', newLoft47Deal.error)
      } else {
        setLoft47DealId(newLoft47Deal.data.id)

        const mapping = await DealsMappingService.createMapping(RechatDeal.id, newLoft47Deal.data.id)
        if (!mapping.error) {
          setMessage('Rechat Deal was successfully created in Loft47!')
          showMessage()
          await updateLoft47DealAddress(newLoft47Deal)
          await updateDealPeople(newLoft47Deal)
        } else {
          console.log('mapping:', mapping.error)
        }
      }
    }
  }

  const updateMapping = async (_loft47DealId: string, tempLoft47Deal: LoftDeal) => {
    const updatedLoft47Deal = await BrokerageDealsService.updateDeal(loft47BrokeragesRef.current[0].id ?? '', _loft47DealId, tempLoft47Deal)
    if (updatedLoft47Deal.error) {
      if (updatedLoft47Deal.status === 422) {
        setMessage(updatedLoft47Deal.error.errors[0]?.detail ?? 'Error updating Rechat Deal in Loft47!')
        showMessage()
      }
      console.log('updatedLoft47Deal:', updatedLoft47Deal.error)
    } else {
      setLoft47DealId(updatedLoft47Deal.data.id)
      
      setMessage('Rechat Deal was successfully updated in Loft47!')
      showMessage()
  
      await updateLoft47DealAddress(updatedLoft47Deal)
      await updateDealPeople(updatedLoft47Deal)
    }
  }

  const updateLoft47DealAddress = async (loft47Deal: LoftDeal) => {
    const streetAddress = getDealContext('street_address')

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
      console.log('address:', address.error)
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
      return false
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

  const updateDealPeople = async (loft47Deal: LoftDeal) => {
    setSyncStatus('Syncing buyers...')
    await syncPeople(
      getBuyers(roles),
      getBuyersEmails,
      'buyer',
      'sell',
      loft47Deal
    )

    setSyncStatus('Syncing sellers...')
    await syncPeople(
      getSellers(roles),
      getSellersEmails,
      'seller',
      'list',
      loft47Deal
    )
    setSyncStatus('Sync completed')
  }

  /**
   * Generic helper to keep people/profiles and profile accesses in sync for a given role.
   */
  const syncPeople = async (
    people: any[],
    getEmailsFn: (people: any[]) => string,
    role: Role,
    side: Side,
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
        console.log('profilesResp:', profilesResp.error)
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
    setIsLoading(true)
    const isAuthenticated = await signInOnce()
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    await retrieveBrokerages()
    if (loft47BrokeragesRef.current.length === 0) {
      setMessage('No brokerages found. Please try again later.')
      showMessage()
      setIsLoading(false)
      return
    }
    await setMainAgent()
    if (!checkIfAllContextsAreFilled()) {
      setIsLoading(false)
      return
    }

    const block = getDealContext('block_number')?.text
    const closedAt = toISOWithOffset(new Date((getDealContext('closing_date')?.date ?? 0) * 1000))
    const lot = getDealContext('lot_number')?.text
    const mlsNumber = getDealContext('mls_number')?.text
    const salesPrice = getDealContext('sales_price')?.text
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
          dealSubType: selectedDealSubType as DealSubType,
          dealType: selectedDealType as DealType,
          leadSource: selectedLeadSource as LeadSource,
          propertyType: selectedPropertyType as PropertyType,
          saleStatus: selectedSaleStatus as SaleStatus,
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
          ...(salesPrice && { sellPrice: salesPrice }),
          ...(closedAt && { soldAt: closedAt }),
          teamDeal: RechatDeal.brand.brand_type === 'Team',
        }
      }
    }

    setSyncStatus('Checking if Rechat Deal exists in Loft47...')
    const mapping = await DealsMappingService.getMappingByRechatDealId(RechatDeal.id)
    if (mapping.error) {
      console.log('mapping:', mapping.error)
    } else if (mapping.notFound) {
      setSyncStatus('Creating Rechat Deal in Loft47...')
      await createMapping(tempLoft47Deal)
    } else {
      setSyncStatus('Updating Rechat Deal in Loft47...')
      await updateMapping(mapping.loft47_deal_id, tempLoft47Deal)
    }
    setTimeout(() => setSyncStatus(null), 2000)
    setIsLoading(false)
  }

  const openLoft47Deal = () => {
    if (loft47Url) {
      window.open(`${loft47Url}/brokerages/${loft47BrokeragesRef.current[0].id}/deals/${loft47DealId}`, '_blank')
    } else {
      setMessage('Loft47 URL not set. Please contact support.')
      showMessage()
    }
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

  return (
    <Ui.Grid container spacing={2}>
      <Ui.CircularProgress style={{ display: 'absolute', position: 'absolute', top: '50%', left: '50%' }} hidden={!isLoading} />
      <PeopleSyncStatus status={syncStatus} />
      <Ui.Grid item xs={12} md={12} lg={12}>
        <DealContextList
          contexts={DealContexts}
          getDealContext={getDealContext}
        />
      </Ui.Grid>
      
      <DealSelectors
        selectedDealType={selectedDealType}
        selectedDealSubType={selectedDealSubType}
        selectedLeadSource={selectedLeadSource}
        selectedPropertyType={selectedPropertyType}
        selectedSaleStatus={selectedSaleStatus}
        onDealTypeChange={handleDealTypeChange}
        onDealSubTypeChange={handleDealSubTypeChange}
        onLeadSourceChange={handleLeadSourceChange}
        onPropertyTypeChange={handlePropertyTypeChange}
        onSaleStatusChange={handleSaleStatusChange}
      />

      <ActionButtons
        isLoading={isLoading}
        onSync={syncWithLoft47}
        onClose={close}
        onOpenDeal={openLoft47Deal}
        canOpenDeal={!!loft47DealId}
      />

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
