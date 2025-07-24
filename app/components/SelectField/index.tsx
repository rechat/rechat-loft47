import React from '@libs/react'
import Ui from '@libs/material-ui'

interface Option {
  id: string
  label: string
}

interface SelectFieldProps {
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<{ value: unknown }>) => void
  options: Option[]
  /** Grid sizing props */
  xs?: 12 | 6 | 4
  sm?: 12 | 6 | 4
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  xs = 12,
  sm = 6
}) => (
  <Ui.Grid item xs={xs} sm={sm}>
    <Ui.FormControl variant="standard" fullWidth>
      <Ui.InputLabel id={`${id}-label`}>{label}</Ui.InputLabel>
      <Ui.Select
        labelId={`${id}-label`}
        id={id}
        value={value}
        onChange={onChange}
        label={label}
      >
        {options.map((opt) => (
          <Ui.MenuItem key={opt.id} value={opt.id}>
            {opt.label}
          </Ui.MenuItem>
        ))}
      </Ui.Select>
    </Ui.FormControl>
  </Ui.Grid>
)

export default SelectField 