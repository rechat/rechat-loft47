import Ui from '@libs/material-ui'
import React from '@libs/react'
import ReactUse from '@libs/react-use'
import DealContextList from './components/DealContextList'
import { AuthService } from './service/AuthService'
import { BrokeragesService } from './service/BrokeragesService'

// Ensures sign-in happens only once even if the component remounts in development (e.g. React-StrictMode)
let didSignInGlobal = false;

function FormattedCurrency({ amount }: { amount: number }) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount)

  return <Ui.Typography>{formatted}</Ui.Typography>
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
  const signInOnce = async () => {
    const authData = await AuthService.signIn(
      process.env.LOFT47_EMAIL_1 || '', 
      process.env.LOFT47_PASSWORD_1 || '')
    console.log('authData', authData)
  }

  const retrieveBrokerages = async () => {
    const brokeragesData = await BrokeragesService.retrieveBrokerages()
    console.log('brokeragesData', brokeragesData)
  }

  React.useEffect(() => {
    // immediately-invoked async helper
    (async () => {
      console.log('didSignInGlobal', didSignInGlobal)
      if (didSignInGlobal) return
      didSignInGlobal = true
      await signInOnce()
      // await retrieveBrokerages()
    })()
  }, [])

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

  return (
    <Ui.Grid container spacing={2}>
      <Ui.Grid item xs={12} md={12} lg={12}>
        <DealContextList
          contexts={DealContexts}
          getDealContext={getDealContext}
        />
        
      </Ui.Grid>
      <Ui.Grid item container xs={12} spacing={2} direction="row">
        <Ui.Grid item>
          <Ui.Button variant="contained" color="primary" onClick={retrieveBrokerages}>
            Sync with Loft47
          </Ui.Button>
        </Ui.Grid>
        <Ui.Grid item>
          <Ui.Button variant="contained" color="primary" onClick={close}>
            Close App
          </Ui.Button>
        </Ui.Grid>
      </Ui.Grid>
    </Ui.Grid>
  )
}
