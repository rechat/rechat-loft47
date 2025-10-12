import Ui from '@libs/material-ui'
import React from '@libs/react'

import {
  dealTypes,
  dealSubTypes,
  leadSources,
  propertyType,
  saleStatus
} from '../../core/utils'
import SelectField from '../SelectField'

interface Props {
  selectedDealType: string
  selectedDealSubType: string
  selectedLeadSource: string
  selectedPropertyType: string
  selectedSaleStatus: string
  onDealTypeChange: (e: React.ChangeEvent<{ value: unknown }>) => void
  onDealSubTypeChange: (e: React.ChangeEvent<{ value: unknown }>) => void
  onLeadSourceChange: (e: React.ChangeEvent<{ value: unknown }>) => void
  onPropertyTypeChange: (e: React.ChangeEvent<{ value: unknown }>) => void
  onSaleStatusChange: (e: React.ChangeEvent<{ value: unknown }>) => void
}

const DealSelectors: React.FC<Props> = ({
  selectedDealType,
  selectedDealSubType,
  selectedLeadSource,
  selectedPropertyType,
  selectedSaleStatus,
  onDealTypeChange,
  onDealSubTypeChange,
  onLeadSourceChange,
  onPropertyTypeChange,
  onSaleStatusChange
}) => (
  <>
    {/* First row */}
    <Ui.Grid item xs={12}>
      <Ui.Grid container spacing={2}>
        <SelectField
          label="Deal Type"
          id="deal-type-select"
          value={selectedDealType}
          onChange={onDealTypeChange}
          options={dealTypes}
          sm={6}
        />

        <SelectField
          label="Deal Sub Type"
          id="deal-sub-type-select"
          value={selectedDealSubType}
          onChange={onDealSubTypeChange}
          options={dealSubTypes}
          sm={6}
        />
      </Ui.Grid>
    </Ui.Grid>

    {/* Second row */}
    <Ui.Grid item xs={12}>
      <Ui.Grid container spacing={2}>
        <SelectField
          label="Lead Source"
          id="lead-source-select"
          value={selectedLeadSource}
          onChange={onLeadSourceChange}
          options={leadSources}
          sm={4}
        />

        <SelectField
          label="Property Type"
          id="property-type-select"
          value={selectedPropertyType}
          onChange={onPropertyTypeChange}
          options={propertyType}
          sm={4}
        />

        <SelectField
          label="Sale Status"
          id="sale-status-select"
          value={selectedSaleStatus}
          onChange={onSaleStatusChange}
          options={saleStatus}
          sm={4}
        />
      </Ui.Grid>
    </Ui.Grid>
  </>
)

export default DealSelectors
