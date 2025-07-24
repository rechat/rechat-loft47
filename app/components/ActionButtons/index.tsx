import React from '@libs/react'
import Ui from '@libs/material-ui'

interface Props {
  isLoading: boolean
  onSync: () => void
  onClose: () => void
  onOpenDeal: () => void
  canOpenDeal: boolean
}

const ActionButtons: React.FC<Props> = ({
  isLoading,
  onSync,
  onClose,
  onOpenDeal,
  canOpenDeal
}) => (
  <Ui.Grid item container xs={12} spacing={2} style={{ margin: '8px 0' }}>
    <Ui.Grid item>
      <Ui.Button
        variant="contained"
        color="primary"
        disabled={isLoading}
        onClick={onSync}
      >
        Sync with Loft47
      </Ui.Button>
    </Ui.Grid>
    <Ui.Grid item>
      <Ui.Button variant="contained" color="primary" onClick={onClose}>
        Close App
      </Ui.Button>
    </Ui.Grid>
    <Ui.Grid item>
      <Ui.Button
        variant="contained"
        color="primary"
        onClick={onOpenDeal}
        disabled={!canOpenDeal}
      >
        Open Loft47 Deal
      </Ui.Button>
    </Ui.Grid>
  </Ui.Grid>
)

export default ActionButtons 