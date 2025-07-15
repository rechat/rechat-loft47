import Ui from '@libs/material-ui'
import React from '@libs/react'
import ReactUse from '@libs/react-use'
import DealContextList from './components/DealContextList'
import { AuthService } from './service/AuthService'
import { BrokeragesService } from './service/BrokeragesService'
import { BrokerageDealsService } from './service/BrokerageDealsService'
import { DealsMappingService } from './service/DealsMappingService'
import { BrokerageProfilesService } from './service/BrokerageProfilesService'

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

  const [selectedDealType, setSelectedDealType] = React.useState<string>('')
  const [selectedDealSubType, setSelectedDealSubType] = React.useState<string>('')
  const [selectedLeadSource, setSelectedLeadSource] = React.useState<string>('')
  const [selectedPropertyType, setSelectedPropertyType] = React.useState<string>('')
  const [selectedSaleStatus, setSelectedSaleStatus] = React.useState<string>('')

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
    const authData = await AuthService.signIn(
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
      const buyer = roles.find(role => role.role === 'Buyer')
      const seller = roles.find(role => role.role === 'Seller')

      const tempRechatDeal = {
        data: {
          attributes: {
            ownerId: loft47Profile.id,
            adjustmentAt: toISOWithOffset(new Date((RechatDeal?.updated_at ?? 0) * 1000)),
            ...(buyer && { buyerNames: buyer.legal_full_name }),
            ...(getDealContext('closed_at') && { closedAt: getDealContext('closed_at') }),
            dealType: selectedDealType,
            dealSubType: selectedDealSubType,
            leadSource: selectedLeadSource,
            propertyType: selectedPropertyType,
            saleStatus: selectedSaleStatus,
            ...(getDealContext('lot_number') && { lot: getDealContext('lot_number') }),          
            exclusive: getDealContext('mls_number') ? false : true,
            ...(getDealContext('mls_number') && { mlsNumber: getDealContext('mls_number') }),
            ...(getDealContext('sales_price') && { sellPrice: getDealContext('sales_price').text }),
            ...(seller && { sellerNames: seller.legal_full_name }),
            ...(getDealContext('closed_at') && { soldAt: getDealContext('closed_at') }),
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
    const buyer = roles.find(role => role.role === 'Buyer')
    const seller = roles.find(role => role.role === 'Seller')

    const tempRechatDeal = {
      data: {
        attributes: {
          ownerId: loft47Profile.id,
          adjustmentAt: toISOWithOffset(new Date((RechatDeal?.updated_at ?? 0) * 1000)),
          ...(buyer && { buyerNames: buyer.legal_full_name }),
          ...(getDealContext('closed_at') && { closedAt: getDealContext('closed_at') }),
          dealType: selectedDealType,
          dealSubType: selectedDealSubType,
          leadSource: selectedLeadSource,
          propertyType: selectedPropertyType,
          saleStatus: selectedSaleStatus,
          ...(getDealContext('lot_number') && { lot: getDealContext('lot_number') }),          
          exclusive: getDealContext('mls_number') ? false : true,
          ...(getDealContext('mls_number') && { mlsNumber: getDealContext('mls_number') }),
          ...(getDealContext('sales_price') && { sellPrice: getDealContext('sales_price').text }),
          ...(seller && { sellerNames: seller.legal_full_name }),
          ...(getDealContext('closed_at') && { soldAt: getDealContext('closed_at') }),
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
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '20%', marginBottom: '10px' }}>
          <Ui.InputLabel id="demo-simple-select-autowidth-label">Deal Type</Ui.InputLabel>
          <Ui.Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={selectedDealType}
            onChange={handleDealTypeChange}
            autoWidth
            label="Deal Type"
          >
            {dealTypes.map((dealType) => (
              <Ui.MenuItem key={dealType.id} value={dealType.id}>
                {dealType.label}
              </Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '20%', marginBottom: '10px' }}>
          <Ui.InputLabel id="demo-simple-select-autowidth-label">Deal Sub Type</Ui.InputLabel>
          <Ui.Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={selectedDealSubType}
            onChange={handleDealSubTypeChange}
            autoWidth
            label="Deal Sub Type"
          >
            {dealSubTypes.map((dealSubType) => (
              <Ui.MenuItem key={dealSubType.id} value={dealSubType.id}>
                {dealSubType.label}
              </Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '20%', marginBottom: '10px' }}>
          <Ui.InputLabel id="demo-simple-select-autowidth-label">Lead Source</Ui.InputLabel>
          <Ui.Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={selectedLeadSource}
            onChange={handleLeadSourceChange}
            autoWidth
            label="Lead Source"
          >
            {leadSources.map((leadSource) => (
              <Ui.MenuItem key={leadSource.id} value={leadSource.id}>
                {leadSource.label}
              </Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '20%', marginBottom: '10px' }}>
          <Ui.InputLabel id="demo-simple-select-autowidth-label">Property Type</Ui.InputLabel>
          <Ui.Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={selectedPropertyType}
            onChange={handlePropertyTypeChange}
            autoWidth
            label="Property Type"
          >
            {propertyType.map((propertyType) => (
              <Ui.MenuItem key={propertyType.id} value={propertyType.id}>
                {propertyType.label}
              </Ui.MenuItem>
            ))}
          </Ui.Select>
        </Ui.FormControl>
      </Ui.Grid>
      <Ui.Grid item xs={12} md={12} lg={12}>
        <Ui.FormControl style={{ width: '20%', marginBottom: '10px' }}>
        <Ui.InputLabel id="demo-simple-select-autowidth-label">Sale Status</Ui.InputLabel>
          <Ui.Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={selectedSaleStatus}
            onChange={handleSaleStatusChange}
            autoWidth
            label="Sale Status"
          >
            {saleStatus.map((saleStatus) => (
              <Ui.MenuItem key={saleStatus.id} value={saleStatus.id}>
                {saleStatus.label}
              </Ui.MenuItem>
            ))}
          </Ui.Select>
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
