// Simple utility functions for the integration

// Form options
export const dealTypes = [
  { id: 'sale', label: 'Sale' },
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
  { id: 'referral', label: 'Referral' },
  { id: 'website', label: 'Website' },
  { id: 'advertising', label: 'Advertising' },
  { id: 'sign_call', label: 'Sign Call' }
]

export const propertyTypes = [
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' }
]

export const saleStatuses = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'closed', label: 'Closed' }
]

// Deal contexts we care about
export const dealContexts = [
  { id: 'full_address', label: 'Full Address', type: 'text' },
  { id: 'city', label: 'City', type: 'text' },
  { id: 'state', label: 'State', type: 'text' },
  { id: 'postal_code', label: 'Postal Code', type: 'text' },
  { id: 'sales_price', label: 'Sales Price', type: 'text' },
  { id: 'closing_date', label: 'Closing Date', type: 'date' }
]

// Helper functions
export function getMainAgent(roles: any[], deal: any) {
  const agentType = deal.deal_type === 'Buying' ? 'BuyerAgent' : 'SellerAgent'
  return roles.find(role => role.role === agentType)
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  const tzOffset = -date.getTimezoneOffset()
  const sign = tzOffset >= 0 ? '+' : '-'
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0')
  const hours = pad(tzOffset / 60)
  const minutes = pad(tzOffset % 60)
  const iso = date.toISOString().slice(0, -1)
  return `${iso}${sign}${hours}:${minutes}`
}

export function decideRoleType(role: any) {
  if (['BuyerAgent', 'SellerAgent', 'CoBuyerAgent', 'CoSellerAgent'].includes(role.role)) {
    return 'agent'
  }
  if (role.role === 'Title') return 'title'
  if (['Buyer', 'Seller', 'Tenant', 'Landlord'].includes(role.role)) {
    return role.role.toLowerCase()
  }
  return 'other'
}

export function isAgentRole(roleType: string) {
  return ['BuyerAgent', 'SellerAgent', 'CoBuyerAgent', 'CoSellerAgent'].includes(roleType)
}

export function decideOwningSide(deal: any) {
  let side = deal.deal_type === 'Buying' ? 'sell' : 'list'
  const enderType = deal.context.ender_type?.text
  if (['OfficeDoubleEnder', 'OfficeSingleEnder', 'AgentDoubleEnder'].includes(enderType)) {
    side = 'double_end'
  }
  return side
}