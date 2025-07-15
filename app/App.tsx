import Ui from '@libs/material-ui'
import React from '@libs/react'
import ReactUse from '@libs/react-use'
import DealContextList from './components/DealContextList'
import { AuthService } from './service/AuthService'
import { BrokeragesService } from './service/BrokeragesService'
import { BrokerageDealsService } from './service/BrokerageDealsService'
import { DealsMappingService } from './service/DealsMappingService'
import { BrokerageProfilesService } from './service/BrokerageProfilesService'
import { usePersistentState } from './hooks/usePersistentState'

// Ensures sign-in happens only once even if the component remounts in development (e.g. React-StrictMode)
let didSignInGlobal = false;

// Minimal type for a Loft47 brokerage entry (extend as needed)
type Loft47Brokerage = {
  id: string
  [key: string]: unknown
}

export function App({
  models: { deal, roles, user },
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

  const [RechatDeal, setRechatDeal] = React.useState<IDeal>()
  const [Loft47Brokerages, setLoft47Brokerages] = React.useState<Loft47Brokerage[]>([])

  const DealContexts = [
    {
      id: 'full_address',
      label: 'Full Address',
      type: 'text'
    },
    {
      id: 'list_price',
      label: 'List Price',
      type: 'number'
    },
    {
      id: 'list_date',
      label: 'List Date',
      type: 'text'
    },
    {
      id: 'expiration_date',
      label: 'Expiration Date',
      type: 'text'
    },
    {
      id: 'closing_date',
      label: 'Closing Date',
      type: 'text'
    },
    {
      id: 'sales_price',
      label: 'Sales Price',
      type: 'number'
    },
    {
      id: 'contract_date',
      label: 'Contract Date',
      type: 'text'
    },
    {
      id: 'lease_price',
      label: 'Lease Price',
      type: 'number'
    },
    {
      id: 'leased_price',
      label: 'Leased Price',
      type: 'number'
    },
    {
      id: 'lease_begin',
      label: 'Lease Begin Date',
      type: 'text'
    },
    {
      id: 'lease_end',
      label: 'Lease End Date',
      type: 'text'
    }
  ]

  const dealTypes = [
    {
      id: 'standard',
      label: 'Standard'
    },
    {
      id: 'project_or_new_construction',
      label: 'Project or New Construction'
    },
    {
      id: 'property_management',
      label: 'Property Management'
    },
    {
      id: 'referral',
      label: 'Referral'
    },
    {
      id: 'lease',
      label: 'Lease'
    }
  ]

  const dealSubTypes = [
    {
      id: 'unknown',
      label: 'Unknown'
    },
    {
      id: 'single_family_home',
      label: 'Single Family Home' 
    },
    {
      id: 'condo_townhome',
      label: 'Condo/Townhome'
    },
    {
      id: 'agricultural',
      label: 'Agricultural'
    },
    {
      id: 'industrial',
      label: 'Industrial'
    },
    {
      id: 'land',
      label: 'Land'
    },
    {
      id: 'multi_family',
      label: 'Multi-Family'
    },
    {
      id: 'office', 
      label: 'Office'
    },
    {
      id: 'retail',
      label: 'Retail'
    }
  ]

  const leadSources = [
    {
      id: 'company',
      label: 'Company'
    },
    {
      id: 'agent',
      label: 'Agent'
    }
  ]

  const propertyType = [
    {
      id: 'residential',
      label: 'Residential'
    },
    {
      id: 'commercial',
      label: 'Commercial'
    }
  ]

  const saleStatus = [
    {
      id: 'conditional',
      label: 'Conditional'
    },
    {
      id: 'firm',
      label: 'Firm'
    },
    {
      id: 'closed',
      label: 'Closed'
    },
    {
      id: 'collapsed',
      label: 'Collapsed'
    },
    { 
      id: 'voided',
      label: 'Voided'
    }
  ]

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

  const [loft47Profile, setLoft47Profile] = React.useState<any>(null)

  const signInOnce = async () => {
    await AuthService.signIn(
      process.env.LOFT47_EMAIL_1 || '', 
      process.env.LOFT47_PASSWORD_1 || '')
    setRechatDeal(deal)
  }

  const retrieveBrokerages = async () => {
    const brokeragesData = await BrokeragesService.retrieveBrokerages()
    setLoft47Brokerages(brokeragesData?.data ?? [])

    const profilesData = await BrokerageProfilesService.getBrokerageProfiles(brokeragesData.data[0].id ?? '')
    
    const profile = profilesData.data.find((profile: any) => profile.attributes.email === user.email)
    
    setLoft47Profile({...profile.attributes})
  }

  const getBrokerageDeals = async () => {
    console.log('RechatDealId:', RechatDeal?.id)
    if (Loft47Brokerages.length > 0) {
      const dealsData = await BrokerageDealsService.getBrokerageDeals(Loft47Brokerages[0].id ?? '')
      console.log('dealsData', dealsData)
    }
  }

  const getBrokerageDeal = async () => {
    if (Loft47Brokerages.length > 0) {
      const dealData = await BrokerageDealsService.getBrokerageDeal(Loft47Brokerages[0].id ?? '', '12081')
      console.log('dealData', dealData)
    }
  }

  const toISOWithOffset = (date: Date) => {
    const tzOffset = -date.getTimezoneOffset(); // in minutes
    const sign = tzOffset >= 0 ? '+' : '-';
    const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
    const hours = pad(tzOffset / 60);
    const minutes = pad(tzOffset % 60);
    const iso = date.toISOString().slice(0, -1); // remove 'Z'
    return `${iso}${sign}${hours}:${minutes}`;
  }

  const createMapping = async () => {
    if (Loft47Brokerages.length > 0 && RechatDeal) {
      const block = getDealContext('block_number')
      const closedAt = getDealContext('closed_at')
      const lot = getDealContext('lot_number')
      const mlsNumber = getDealContext('mls_number')
      const salesPrice = getDealContext('sales_price')
      const updatedAt = RechatDeal?.updated_at
      const possessionAt = toISOWithOffset(new Date((getDealContext('possession_date')?.date ?? 0) * 1000))
      const buyer = roles.find(role => role.role === 'Buyer')
      const seller = roles.find(role => role.role === 'Seller')

      const tempRechatDeal = {
        data: {
          attributes: {
            ownerId: loft47Profile.id,
            ...(block && { block }),
            adjustmentAt: toISOWithOffset(new Date((updatedAt ?? 0) * 1000)),
            ...(buyer && { buyerNames: buyer.legal_full_name }),
            ...(closedAt && { closedAt }),
            dealSubType: selectedDealSubType,
            dealType: selectedDealType,
            leadSource: selectedLeadSource,
            propertyType: selectedPropertyType,
            saleStatus: selectedSaleStatus,
            exclusive: !deal.listing,
            externalexternalTransactionId: deal.id,
            ...(deal.brand.brand_type === 'Office' && { officeId: deal.brand.parent[0] }),
            ...(lot && { lot }),          
            ...(mlsNumber && { mlsNumber }),
            offer: deal.deal_type === 'Buying',
            ownerName: loft47Profile.legal_full_name,
            ...(possessionAt && { possessionAt }),
            ...(salesPrice && { sellPrice: salesPrice.text }),
            ...(seller && { sellerNames: seller.legal_full_name }),
            ...(closedAt && { soldAt: closedAt }),
            teamDeal: deal.brand.brand_type === 'Team'
          }
        }
      }
      const newLoft47Deal = await BrokerageDealsService.createDeal(Loft47Brokerages[0].id, tempRechatDeal)
      console.log('newLoft47Deal', newLoft47Deal)

      if (newLoft47Deal.error) {
        setMessage('Create deal in Loft47 failed!')
      } else {
        const mapping = await DealsMappingService.createMapping(RechatDeal.id, newLoft47Deal.data.id)
        if (!mapping.error) {
          setMessage('Rechat Deal(' + RechatDeal?.id + ') was successfully created in Loft47!')
        } else {
          setMessage('Error creating mapping: ' + mapping.error)
        }
      }
      showMessage()
    }
  }

  const updateMapping = async (loft47DealId: string) => {
    const block = getDealContext('block_number')
    const closedAt = getDealContext('closed_at')
    const lot = getDealContext('lot_number')
    const mlsNumber = getDealContext('mls_number')
    const salesPrice = getDealContext('sales_price')
    const updatedAt = RechatDeal?.updated_at
    const possessionAt = toISOWithOffset(new Date((getDealContext('possession_date')?.date ?? 0) * 1000))
    const buyer = roles.find(role => role.role === 'Buyer')
    const seller = roles.find(role => role.role === 'Seller')

    const tempRechatDeal = {
      data: {
        attributes: {
          ownerId: loft47Profile.id,
          ...(block && { block }),
          adjustmentAt: toISOWithOffset(new Date((updatedAt ?? 0) * 1000)),
          ...(buyer && { buyerNames: buyer.legal_full_name }),
          ...(closedAt && { closedAt }),
          dealSubType: selectedDealSubType,
          dealType: selectedDealType,
          leadSource: selectedLeadSource,
          propertyType: selectedPropertyType,
          saleStatus: selectedSaleStatus,
          exclusive: !deal.listing,
          externalexternalTransactionId: deal.id,
          ...(deal.brand.brand_type === 'Office' && { officeId: deal.brand.parent[0] }),
          ...(lot && { lot }),          
          ...(mlsNumber && { mlsNumber }),
          offer: deal.deal_type === 'Buying',
          ownerName: loft47Profile.legal_full_name,
          ...(possessionAt && { possessionAt }),
          ...(salesPrice && { sellPrice: salesPrice.text }),
          ...(seller && { sellerNames: seller.legal_full_name }),
          ...(closedAt && { soldAt: closedAt }),
          teamDeal: deal.brand.brand_type === 'Team'
        }
      }
    }
    const updatedLoft47Deal = await BrokerageDealsService.updateDeal(Loft47Brokerages[0].id ?? '', loft47DealId, tempRechatDeal)
    console.log('updatedLoft47Deal', updatedLoft47Deal);
    if (updatedLoft47Deal.error) {
      setMessage('Error updating deal in Loft47: ' + updatedLoft47Deal.error)
      showMessage()
      return
    }
    setMessage('Rechat Deal(' + RechatDeal?.id + ') was successfully updated in Loft47!')
    showMessage()
  }

  const syncWithLoft47 = async () => {
    if (!RechatDeal) {
      setMessage('Rechat Deal is empty')
      showMessage()
      return
    }

    if (selectedDealType === '') {
      setMessage('Please select a deal type')
      showMessage()
      return
    }

    if (!loft47Profile) {
      setMessage('Loft47 profile that corresponds to ' + user.email + ' doesn\'t exist')
      showMessage()
      return
    }

    setIsLoading(true)
    const mapping = await DealsMappingService.getMappingByRechatDealId(RechatDeal.id)
    console.log('mapping', mapping)
    
    if (!mapping.error) {
      setMessage('Rechat Deal(' + RechatDeal?.id + ') exists in Loft47. Updating deal in Loft47...')
      showMessage()
      await updateMapping(mapping.loft47_deal_id)
    } else {
      setMessage('Rechat Deal(' + RechatDeal?.id + ') does not exist in Loft47. Creating deal in Loft47...')
      showMessage()
      await createMapping()
    }
    setIsLoading(false)
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
    // immediately-invoked async helper
    (async () => {
      if (didSignInGlobal) return
      didSignInGlobal = true
      await signInOnce()
      await retrieveBrokerages()
    })()
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
          <Ui.Button variant="contained" color="primary" onClick={syncWithLoft47}>
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
