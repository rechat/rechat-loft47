
export const DealContexts = [
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

export const dealTypes = [
  {
    id: 'standard',
    label: 'Standard'
  },
  {
    id: 'project_or_new_construction',
    label: 'Project or New Construction'
  },
  {
    id: 'property_management',
    label: 'Property Management'
  },
  {
    id: 'referral',
    label: 'Referral'
  },
  {
    id: 'lease',
    label: 'Lease'
  }
]

export const dealSubTypes = [
  {
    id: 'unknown',
    label: 'Unknown'
  },
  {
    id: 'single_family_home',
    label: 'Single Family Home' 
  },
  {
    id: 'condo_townhome',
    label: 'Condo/Townhome'
  },
  {
    id: 'agricultural',
    label: 'Agricultural'
  },
  {
    id: 'industrial',
    label: 'Industrial'
  },
  {
    id: 'land',
    label: 'Land'
  },
  {
    id: 'multi_family',
    label: 'Multi-Family'
  },
  {
    id: 'office', 
    label: 'Office'
  },
  {
    id: 'retail',
    label: 'Retail'
  }
]

export const leadSources = [
  {
    id: 'company',
    label: 'Company'
  },
  {
    id: 'agent',
    label: 'Agent'
  }
]

export const propertyType = [
  {
    id: 'residential',
    label: 'Residential'
  },
  {
    id: 'commercial',
    label: 'Commercial'
  }
]

export const saleStatus = [
  {
    id: 'conditional',
    label: 'Conditional'
  },
  {
    id: 'firm',
    label: 'Firm'
  },
  {
    id: 'closed',
    label: 'Closed'
  },
  {
    id: 'collapsed',
    label: 'Collapsed'
  },
  { 
    id: 'voided',
    label: 'Voided'
  }
]

export const toISOWithOffset = (date: Date) => {
  const tzOffset = -date.getTimezoneOffset(); // in minutes
  const sign = tzOffset >= 0 ? '+' : '-';
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const hours = pad(tzOffset / 60);
  const minutes = pad(tzOffset % 60);
  const iso = date.toISOString().slice(0, -1); // remove 'Z'
  return `${iso}${sign}${hours}:${minutes}`;
}

export const getBuyersNames = (roles: IDealRole[]) => {
  const buyersNames = roles.filter(role => role.role === 'Buyer').map(role => role.legal_full_name)
  return buyersNames.join(', ')
}

export const getSellersNames = (roles: IDealRole[]) => {
  const sellersNames = roles.filter(role => role.role === 'Seller').map(role => role.legal_full_name)
  return sellersNames.join(', ')
}

export const getMainAgent = (roles: IDealRole[], deal: IDeal) => {
  let main_agent_type = ''
  if (deal.deal_type === 'Buying') {
    main_agent_type = 'BuyerAgent'
  } else if (deal.deal_type === 'Selling') {
    main_agent_type = 'SellerAgent'
  }

  const mainAgent = roles.find(role => role.role === main_agent_type)
  return mainAgent
}

export const getOtherAgent = (roles: IDealRole[], deal: IDeal) => {
  let other_agent_type = ''
  if (deal.deal_type === 'Buying') {
    other_agent_type = 'SellerAgent'
  } else if (deal.deal_type === 'Selling') {
    other_agent_type = 'BuyerAgent'
  }
  const otherAgent = roles.find(role => role.role === other_agent_type)
  return otherAgent
}
