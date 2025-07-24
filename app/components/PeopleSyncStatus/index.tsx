import React from '@libs/react'
import Ui from '@libs/material-ui'

interface Props {
  status: string | null
}

const PeopleSyncStatus: React.FC<Props> = ({ status }) => {
  if (!status) return null
  return (
    <Ui.Paper style={{ width: '100%', padding: 8, marginBottom: 8, background: '#e3f2fd' }} elevation={0}>
      <Ui.Typography variant="body2">{status}</Ui.Typography>
    </Ui.Paper>
  )
}

export default PeopleSyncStatus 