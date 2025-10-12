import Ui from '@libs/material-ui'
import React from '@libs/react'

function FormattedCurrency({ amount }: { amount: number | string }) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(amount))

  return <Ui.Typography>{formatted}</Ui.Typography>
}

export interface DealContext {
  id: string
  label: string
  type: string
}

interface DealContextItemProps {
  context: DealContext
  getDealContext: (id: string) => any
}

export default function DealContextItem({
  context,
  getDealContext
}: DealContextItemProps) {
  const [dealContext, setDealContext] = React.useState(null)

  React.useEffect(() => {
    const _dealContext = getDealContext(context.id)?.[context.type]

    setDealContext(_dealContext)
  }, [context.id, context.type, getDealContext])

  return dealContext ? (
    <Ui.Grid
      container
      direction="row"
      alignItems="center"
      spacing={1}
      key={context.id}
    >
      <Ui.Grid item>
        <Ui.Typography variant="body2">{context.label}: </Ui.Typography>
      </Ui.Grid>
      <Ui.Grid item>
        {context.id.includes('price') ? (
          <FormattedCurrency amount={dealContext} />
        ) : (
          <Ui.Typography variant="subtitle1">{dealContext}</Ui.Typography>
        )}
      </Ui.Grid>
    </Ui.Grid>
  ) : (
    <></>
  )
}
