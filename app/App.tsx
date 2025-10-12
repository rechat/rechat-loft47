import React from '@libs/react'

import LoftIntegration from './LoftIntegration'

interface EntryProps {
  models: { deal: any, roles: any[], user: any }
  api: {
    getDealContext: (id: string) => any
    updateDealContext: any
    deleteRole: any
    updateRole: any
  }
}

export const App: React.FC<EntryProps> = (props) => {
  return <LoftIntegration {...props} />
}