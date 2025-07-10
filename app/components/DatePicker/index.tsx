import Ui from '@libs/material-ui'
import React from '@libs/react'

interface Props {
  Picker: CoreComponents['DatePicker']
}

export function DatePicker({ Picker }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  return (
    <div>
      <Ui.TextField
        InputProps={{
          endAdornment: (
            <Ui.Button size="small" onClick={e => setAnchorEl(e.currentTarget)}>
              Date
            </Ui.Button>
          )
        }}
      />

      <Ui.Popover
        id={anchorEl ? 'date-picker-popover' : undefined}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <Picker onChange={date => console.log(date)} />
      </Ui.Popover>
    </div>
  )
}
