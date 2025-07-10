import Ui from '@libs/material-ui'
import React from '@libs/react'
import ReactUse from '@libs/react-use'

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
  console.log(deal)
  console.log(roles)
  console.log(user)

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
        {DealContexts.map(context => (
          <Ui.Grid
            key={context.id}
            container
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Ui.Grid item>
              <Ui.Typography variant="body2">{context.label}: </Ui.Typography>
            </Ui.Grid>
            <Ui.Grid item>
              {context.id.includes('price') ? (
                <FormattedCurrency
                  amount={
                    getDealContext(context.id)?.[
                      context.type as keyof typeof getDealContext
                    ] || 'N/A'
                  }
                />
              ) : (
                <Ui.Typography variant="subtitle1">
                  {getDealContext(context.id)?.[
                    context.type as keyof typeof getDealContext
                  ] || 'N/A'}
                </Ui.Typography>
              )}
            </Ui.Grid>
          </Ui.Grid>
        ))}
      </Ui.Grid>
      <Ui.Grid item container xs={12} spacing={2} direction="row">
        <Ui.Grid item>
          <Ui.Button variant="contained" color="primary" onClick={close}>
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
