import Ui from '@libs/material-ui'
import React from '@libs/react'

interface Props {
  status: string | null
  type: 'normal' | 'warning'
}

const PeopleSyncStatus: React.FC<Props> = ({ status, type = 'normal' }) => {
  if (!status) {
    return null
  }

  return (
    <Ui.Paper
      style={{
        width: '100%',
        padding: 8,
        marginBottom: 8,
        background: type === 'normal' ? '#e3f2fd' : '#ff9800'
      }}
      elevation={0}
    >
      <Ui.Typography variant="body2">{status}</Ui.Typography>
    </Ui.Paper>
  )
}

export default PeopleSyncStatus
