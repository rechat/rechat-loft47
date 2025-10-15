// Simple utility functions for the integration

// Form options
export const dealTypes = [
  { id: 'standard', label: 'Standard' },
  { id: 'lease', label: 'Lease' }
]

export const dealSubTypes = [
  { id: 'single_family_home', label: 'Single Family Home' },
  { id: 'condo_townhome', label: 'Condo/Townhome' },
  { id: 'land', label: 'Land' },
  { id: 'multi_family', label: 'Multi-Family' },
  { id: 'office', label: 'Office' },
  { id: 'retail', label: 'Retail' }
]

export const leadSources = [
  { id: 'company', label: 'Company' },
  { id: 'agent', label: 'Agent' }
]

export const propertyTypes = [
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' }
]

export const saleStatuses = [
  { id: 'conditional', label: 'Conditional' },
  { id: 'firm', label: 'Firm' },
  { id: 'closed', label: 'Closed' },
  { id: 'collapsed', label: 'Collapsed' },
  { id: 'voided', label: 'Voided' }
]

// Deal contexts we care about
export const dealContexts = [
  { id: 'full_address', label: 'Full Address', type: 'text' },
  { id: 'city', label: 'City', type: 'text' },
  { id: 'state', label: 'State', type: 'text' },
  { id: 'postal_code', label: 'Postal Code', type: 'text' },
  { id: 'sales_price', label: 'Sales Price', type: 'text' },
  { id: 'closing_date', label: 'Closing Date', type: 'date' },
  { id: 'possession_date', label: 'Possession Date', type: 'date' }
]

// Helper functions
export function getMainAgent(roles: any[], deal: any) {
  const agentType = deal.deal_type === 'Buying' ? 'BuyerAgent' : 'SellerAgent'

  return roles.find(role => role.role === agentType)
}

export function formatDate(timestamp: number) {
  // Don't format invalid timestamps (0, null, undefined, etc.)
  if (!timestamp || timestamp <= 0) {
    return null
  }

  const date = new Date(timestamp * 1000)

  // Check if the resulting date is valid
  if (isNaN(date.getTime())) {
    return null
  }

  const tzOffset = -date.getTimezoneOffset()
  const sign = tzOffset >= 0 ? '+' : '-'
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0')
  const hours = pad(tzOffset / 60)
  const minutes = pad(tzOffset % 60)
  const iso = date.toISOString().slice(0, -1)

  return `${iso}${sign}${hours}:${minutes}`
}

export function decideRoleType(role: any) {
  if (
    ['BuyerAgent', 'SellerAgent', 'CoBuyerAgent', 'CoSellerAgent'].includes(
      role.role
    )
  ) {
    return 'agent'
  }

  if (role.role === 'Title') {
    return 'title'
  }

  if (['Buyer', 'Seller', 'Tenant', 'Landlord'].includes(role.role)) {
    return role.role.toLowerCase()
  }

  return 'other'
}

export function isAgentRole(roleType: string) {
  return [
    'BuyerAgent',
    'SellerAgent',
    'CoBuyerAgent',
    'CoSellerAgent'
  ].includes(roleType)
}

export function decideOwningSide(deal: any) {
  let side = deal.deal_type === 'Buying' ? 'sell' : 'list'
  const enderType = deal.context.ender_type?.text

  if (
    ['OfficeDoubleEnder', 'OfficeSingleEnder', 'AgentDoubleEnder'].includes(
      enderType
    )
  ) {
    side = 'double_end'
  }

  return side
}

export const getOtherAgents = (roles: IDealRole[], deal: IDeal) => {
  let other_agent_type = ''
  if (deal.deal_type === 'Buying') {
    other_agent_type = 'SellerAgent'
  } else if (deal.deal_type === 'Selling') {
    other_agent_type = 'BuyerAgent'
  }
  const otherAgents = roles.filter(role => role.role === other_agent_type)
  return otherAgents
}

// Extract brand IDs from a deal's brand hierarchy
export const extractBrandIds = (deal: IDeal): string[] => {
  const brandIds: string[] = []
  let currentBrand = deal.brand
  while (currentBrand) {
    brandIds.push(currentBrand.id)
    currentBrand = currentBrand.parent
  }
  return brandIds
}