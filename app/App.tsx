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
  getBuyersNames, 
  getSellersNames, 
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

// Ensures sign-in happens only once even if the component remounts in development (e.g. React-StrictMode)
let didSignInGlobal = false;

// Minimal type for a Loft47 brokerage entry (extend as needed)
type Loft47Brokerage = {
  id: string
  [key: string]: unknown
}

export function App({
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
}: EntryProps) {
  ReactUse.useDebounce(() => {}, 1000, [])

  const [Loft47Brokerages, setLoft47Brokerages] = React.useState<Loft47Brokerage[]>([])

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

  const [isLoading, setIsLoading] = React.useState(false)

  const [loft47PrimaryAgent, setLoft47PrimaryAgent] = React.useState<any>(null)

  const signInOnce = async () => {
    await AuthService.signIn(
      process.env.LOFT47_EMAIL_1 || '', 
      process.env.LOFT47_PASSWORD_1 || '')
  }

  const retrieveBrokerages = async () => {
    // console.log('RechatDeal:', RechatDeal)
    // console.log('roles:', roles)
    // console.log('user:', user)

    const brokeragesData = await BrokeragesService.retrieveBrokerages()
    setLoft47Brokerages(brokeragesData?.data ?? [])

    const mainAgent = getMainAgent(roles, RechatDeal)
    console.log('mainAgent', mainAgent)
    
    if (mainAgent) {
      const profilesData = await BrokerageProfilesService.getBrokerageProfiles(brokeragesData.data[0].id ?? '', {
        'email': mainAgent.email
      })
      console.log('profilesData:', profilesData)
      if (profilesData.data.length > 0) {
        const profile = profilesData.data[0]
        console.log('mainAgent profile', profile)
        setLoft47PrimaryAgent(profile)
      } else {
        const newAgentResp = await BrokerageProfilesService.createBrokerageProfile(
          brokeragesData.data[0].id ?? '',
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
        console.log('new mainAgent profile', newAgent)
        setLoft47PrimaryAgent(newAgent)
      }
    } else {
      setMessage('No Main Agent in Rechat!')
      showMessage()
    }
  }

  const createMapping = async (tempLoft47Deal: any) => {
    setIsLoading(true)
    if (Loft47Brokerages.length > 0) {
      const newLoft47Deal = await BrokerageDealsService.createDeal(Loft47Brokerages[0].id, tempLoft47Deal)
      console.log('newLoft47Deal', newLoft47Deal)

      if (newLoft47Deal.error) {
        setMessage('Create deal in Loft47 failed!')
        showMessage()
        return
      } else {
        const mapping = await DealsMappingService.createMapping(RechatDeal.id, newLoft47Deal.data.id)
        if (!mapping.error) {
          setMessage('Rechat Deal(' + RechatDeal?.id + ') was successfully created in Loft47!')
        } else {
          setMessage('Error creating mapping: ' + mapping.error)
        }
        showMessage()

        await updateLoft47DealAddress(newLoft47Deal)
        await updateDealPeople(newLoft47Deal)
      }
    }
    setIsLoading(false)
  }

  const updateMapping = async (loft47DealId: string, tempLoft47Deal: any) => {
    setIsLoading(true)
    const updatedLoft47Deal = await BrokerageDealsService.updateDeal(Loft47Brokerages[0].id ?? '', loft47DealId, tempLoft47Deal)
    if (updatedLoft47Deal.error) {
      setMessage('Error updating deal in Loft47: ' + updatedLoft47Deal.error)
      showMessage()
      return
    }

    setMessage('Rechat Deal(' + RechatDeal?.id + ') was successfully updated in Loft47!')
    showMessage()

    await updateLoft47DealAddress(updatedLoft47Deal)
    await updateDealPeople(updatedLoft47Deal)
    setIsLoading(false)
  }

  const updateLoft47DealAddress = async (loft47Deal: any) => {
    const streetAddress = getDealContext('street_address')
    if (!streetAddress) {
      setMessage('No address set for this deal!')
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

    if (!loft47PrimaryAgent) {
      setMessage('Loft47 primary agent doesn\'t exist')
      showMessage()
      return false
    }
    return true
  }

  const updateDealPeople = async (loft47Deal: any) => {
    await updateBuyerPeople(loft47Deal)
    
    await updateSellerPeople(loft47Deal)
  }

  const updateBuyerPeople = async (loft47Deal: any) => {
    const buyers = getBuyers(roles)
    if (buyers.length === 0) {
      return
    }

    const buyerEmails = getBuyersEmails(buyers)
    const buyerProfiles = await BrokerageProfilesService.getBrokerageProfiles(Loft47Brokerages[0].id ?? '', {
      'email': buyerEmails
    })
    if (buyerProfiles.error) {
      setMessage('Error getting buyer profiles: ' + buyerProfiles.error)
      showMessage()
      return
    }

    if (buyerProfiles.data.length > 0) {
      // Ensure we have an array even if API returns null/undefined
      const existingProfiles: any[] = buyerProfiles?.data ?? []
      // Map email -> profile for quick lookup
      const emailToProfile = new Map<string, any>(
        existingProfiles.map((p: any) => [p.attributes.email, p])
      )

      // 1. Create missing profiles
      for (const buyer of buyers) {
        if (!buyer.email) {
          continue
        }
        if (!emailToProfile.has(buyer.email)) {
          const newProfileResp = await BrokerageProfilesService.createBrokerageProfile(
            Loft47Brokerages[0].id ?? '',
            {
              data: {
                attributes: {
                  email: buyer.email,
                  name: buyer.legal_full_name,
                  type: 'Profile'
                }
              }
            }
          )
          if (newProfileResp?.data) {
            emailToProfile.set(buyer.email, newProfileResp.data)
          }
        }
      }

      // get all profiles ids corresponding to the buyers
      const buyerProfileIds = Array.from(emailToProfile.values()).map((p: any) => p.attributes.id)

      // 2. Sync profile accesses for the deal
      const accessesResp = await BrokerageDealsProfileAccessesService.retrieveBrokerageDealProfileAccesses(
        Loft47Brokerages[0].id ?? '',
        loft47Deal.data.id
      )
      const existingAccesses: any[] = accessesResp?.data.filter((a: any) => a.attributes.role === 'buyer') ?? []
      const existingAccessesProfileIds = existingAccesses
        .map((a: any) => a.attributes.profileId)

      // a) Add missing accesses
      for (const profileId of buyerProfileIds) {
        if (!existingAccessesProfileIds.includes(profileId)) {
          await BrokerageDealsProfileAccessesService.createBrokerageDealProfileAccess(
            Loft47Brokerages[0].id ?? '',
            loft47Deal.data.id,
            {
              data: {
                attributes: {
                  profileId: profileId,
                  role: "buyer",
                  side: "sell"
                }
              }
            }
          )
        }
      }

      // b) Remove extra accesses that no longer correspond to buyers
      for (const access of existingAccesses) {
        if (!buyerProfileIds.includes(access.attributes.profileId)) {
          await BrokerageDealsProfileAccessesService.deleteBrokerageDealProfileAccess(
            Loft47Brokerages[0].id ?? '',
            loft47Deal.data.id,
            access.id
          )
        }
      }
    } else {
      // No profiles found at all – create for every buyer and add access
      for (const buyer of buyers) {
        if (!buyer.email) {
          continue
        }
        const newProfileResp = await BrokerageProfilesService.createBrokerageProfile(
          Loft47Brokerages[0].id ?? '',
          {
            data: {
              attributes: {
                email: buyer.email,
                name: buyer.legal_full_name,
                type: 'Profile'
              }
            }
          }
        )
        const profileId = newProfileResp?.data?.id
        if (profileId) {
          await BrokerageDealsProfileAccessesService.createBrokerageDealProfileAccess(
            Loft47Brokerages[0].id ?? '',
            loft47Deal.data.id,
            {
              data: {
                attributes: {
                  profileId: profileId,
                  role: "buyer",
                  side: "sell"
                }
              }
            }
          )
        }
      }
    }
  }

  const updateSellerPeople = async (loft47Deal: any) => {
    const sellers = getSellers(roles)
    if (sellers.length === 0) {
      return
    }

    const sellerEmails = getSellersEmails(sellers)
    const sellerProfiles = await BrokerageProfilesService.getBrokerageProfiles(Loft47Brokerages[0].id ?? '', {
      'email': sellerEmails
    })
    if (sellerProfiles.error) {
      setMessage('Error getting seller profiles: ' + sellerProfiles.error)
      showMessage()
      return
    }

    if (sellerProfiles.data.length > 0) {
      // Ensure we have an array even if API returns null/undefined
      const existingProfiles: any[] = sellerProfiles?.data ?? []
      // Map email -> profile for quick lookup
      const emailToProfile = new Map<string, any>(
        existingProfiles.map((p: any) => [p.attributes.email, p])
      )

      // 1. Create missing profiles
      for (const seller of sellers) {
        if (!seller.email) {
          continue
        }
        if (!emailToProfile.has(seller.email)) {
          const newProfileResp = await BrokerageProfilesService.createBrokerageProfile(
            Loft47Brokerages[0].id ?? '',
            {
              data: {
                attributes: {
                  email: seller.email,
                  name: seller.legal_full_name,
                  type: 'Profile'
                }
              }
            }
          )
          if (newProfileResp?.data) {
            emailToProfile.set(seller.email, newProfileResp.data)
          }
        }
      }

      // get all profiles ids corresponding to the buyers
      const sellerProfileIds = Array.from(emailToProfile.values()).map((p: any) => p.attributes.id)

      // 2. Sync profile accesses for the deal
      const accessesResp = await BrokerageDealsProfileAccessesService.retrieveBrokerageDealProfileAccesses(
        Loft47Brokerages[0].id ?? '',
        loft47Deal.data.id
      )
      const existingAccesses: any[] = accessesResp?.data.filter((a: any) => a.attributes.role === 'seller') ?? []
      const existingAccessesProfileIds = existingAccesses
        .map((a: any) => a.attributes.profileId)

      // a) Add missing accesses
      for (const profileId of sellerProfileIds) {
        if (!existingAccessesProfileIds.includes(profileId)) {
          await BrokerageDealsProfileAccessesService.createBrokerageDealProfileAccess(
            Loft47Brokerages[0].id ?? '',
            loft47Deal.data.id,
            {
              data: {
                attributes: {
                  profileId: profileId,
                  role: "seller",
                  side: "list"
                }
              }
            }
          )
        }
      }

      // b) Remove extra accesses that no longer correspond to buyers
      for (const access of existingAccesses) {
        if (!sellerProfileIds.includes(access.attributes.profileId)) {
          await BrokerageDealsProfileAccessesService.deleteBrokerageDealProfileAccess(
            Loft47Brokerages[0].id ?? '',
            loft47Deal.data.id,
            access.id
          )
        }
      }
    } else {
      // No profiles found at all – create for every buyer and add access
      for (const seller of sellers) {
        if (!seller.email) {
          continue
        }
        const newProfileResp = await BrokerageProfilesService.createBrokerageProfile(
          Loft47Brokerages[0].id ?? '',
          {
            data: {
              attributes: {
                email: seller.email,
                name: seller.legal_full_name,
                type: 'Profile'
              }
            }
          }
        )
        const profileId = newProfileResp?.data?.id
        if (profileId) {
          await BrokerageDealsProfileAccessesService.createBrokerageDealProfileAccess(
            Loft47Brokerages[0].id ?? '',
            loft47Deal.data.id,
            {
              data: {
                attributes: {
                  profileId: profileId,
                  role: "seller",
                  side: "list"
                }
              }
            }
          )
        }
      }
    }
  }

  const syncWithLoft47 = async () => {
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
    const buyerNames = getBuyersNames(roles)
    const sellerNames = getSellersNames(roles)
    const mainAgent = getMainAgent(roles, RechatDeal)
    const otherAgent = getOtherAgent(roles, RechatDeal)
    const owningSide = decideOwningSide(RechatDeal)

    const tempLoft47Deal = {
      data: {
        attributes: {
          ownerId: loft47PrimaryAgent.id,
          ...(block && { block }),
          adjustmentAt: toISOWithOffset(new Date((updatedAt ?? 0) * 1000)),
          ...(buyerNames && { buyerNames }),
          ...(closedAt && { closedAt }),
          dealSubType: selectedDealSubType,
          dealType: selectedDealType,
          leadSource: selectedLeadSource,
          propertyType: selectedPropertyType,
          saleStatus: selectedSaleStatus,
          exclusive: !RechatDeal.listing,
          externalexternalTransactionId: RechatDeal.id,
          ...(RechatDeal.brand.brand_type === 'Office' && { officeId: RechatDeal.brand.parent[0] }),
          ...(lot && { lot }),          
          ...(mlsNumber && { mlsNumber }),
          offer: RechatDeal.deal_type === 'Buying',
          ...(otherAgent && { outsideBrokerageName: otherAgent.company_title }),
          ...(owningSide && { owningSide }),
          ...(mainAgent && { ownerName: mainAgent.legal_full_name }),
          ...(possessionAt && { possessionAt }),
          ...(salesPrice && { sellPrice: salesPrice.text }),
          ...(sellerNames && { sellerNames }),
          ...(closedAt && { soldAt: closedAt }),
          teamDeal: RechatDeal.brand.brand_type === 'Team',
        }
      }
    }

    setIsLoading(true)
    console.log('tempLoft47Deal', tempLoft47Deal)
    const mapping = await DealsMappingService.getMappingByRechatDealId(RechatDeal.id)
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

  // Message Snackbar
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

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
    let cancelled = false

    ;(async () => {
      setIsLoading(true)          // always set ON at the start

      if (!didSignInGlobal) {
        didSignInGlobal = true
        await signInOnce()
      }

      if (!cancelled) {
        await retrieveBrokerages()
        setIsLoading(false)       // OFF when everything is ready
      }
    })()

    return () => { cancelled = true }
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
      {/* Deal Type */}
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '100%', marginBottom: '10px' }}>
          <Ui.FormLabel id="demo-row-radio-buttons-group-label">Deal Type</Ui.FormLabel>
          <Ui.RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={selectedDealType}
            onChange={handleDealTypeChange}
          >
            {dealTypes.map((dealType) => (
              <Ui.FormControlLabel key={dealType.id} value={dealType.id} control={<Ui.Radio />} label={dealType.label} />
            ))}
          </Ui.RadioGroup>
        </Ui.FormControl>
      </Ui.Grid>
      {/* Deal Sub Type */}
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '100%', marginBottom: '10px' }}>
          <Ui.FormLabel id="demo-row-radio-buttons-group-label">Deal Sub Type</Ui.FormLabel>
          <Ui.RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={selectedDealSubType}
            onChange={handleDealSubTypeChange}
          >
            {dealSubTypes.map((dealSubType) => (
              <Ui.FormControlLabel key={dealSubType.id} value={dealSubType.id} control={<Ui.Radio />} label={dealSubType.label} />
            ))}
          </Ui.RadioGroup>
        </Ui.FormControl>
      </Ui.Grid>
      {/* Lead Source */}
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '100%', marginBottom: '10px' }}>
          <Ui.FormLabel id="demo-row-radio-buttons-group-label">Lead Source</Ui.FormLabel>
          <Ui.RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={selectedLeadSource}
            onChange={handleLeadSourceChange}
          >
            {leadSources.map((leadSource) => (
              <Ui.FormControlLabel key={leadSource.id} value={leadSource.id} control={<Ui.Radio />} label={leadSource.label} />
            ))}
          </Ui.RadioGroup>
        </Ui.FormControl>
      </Ui.Grid>
      {/* Property Type */}
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '100%', marginBottom: '10px' }}>
          <Ui.FormLabel id="demo-row-radio-buttons-group-label">Property Type</Ui.FormLabel>
          <Ui.RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={selectedPropertyType}
            onChange={handlePropertyTypeChange}
          >
            {propertyType.map((propertyType) => (
              <Ui.FormControlLabel key={propertyType.id} value={propertyType.id} control={<Ui.Radio />} label={propertyType.label} />
            ))}
          </Ui.RadioGroup>
        </Ui.FormControl>
      </Ui.Grid>
      {/* Sale Status */}
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '100%', marginBottom: '10px' }}>
          <Ui.FormLabel id="demo-row-radio-buttons-group-label">Sale Status</Ui.FormLabel>
          <Ui.RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={selectedSaleStatus}
            onChange={handleSaleStatusChange}
          >
            {saleStatus.map((saleStatus) => (
              <Ui.FormControlLabel key={saleStatus.id} value={saleStatus.id} control={<Ui.Radio />} label={saleStatus.label} />
            ))}
          </Ui.RadioGroup>
        </Ui.FormControl>
      </Ui.Grid>

      <Ui.Grid item container xs={12} spacing={2} direction="row">
        <Ui.Grid item>
          <Ui.Button 
            variant="contained" 
            color="primary" 
            disabled={!loft47PrimaryAgent || isLoading}
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
