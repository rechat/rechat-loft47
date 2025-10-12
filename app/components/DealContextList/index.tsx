import React from '@libs/react'

import DealContextItem, { DealContext } from '../DealContextItem'

interface DealContextListProps {
  contexts: DealContext[]
  getDealContext: (id: string) => any
}

export default function DealContextList({
  contexts,
  getDealContext
}: DealContextListProps) {
  return (
    <>
      {contexts.map(context => {
        return (
          <DealContextItem
            key={context.id}
            context={context}
            getDealContext={getDealContext}
          />
        )
      })}
    </>
  )
}
