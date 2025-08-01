type DealType = 
  | 'standard'
  | 'project_or_new_construction'
  | 'property_management'
  | 'referral'
  | 'lease';

type LeadSource = 'company' | 'agent';

type DealSubType = 
  | 'unknown'
  | 'single_family_home'
  | 'condo_townhome'
  | 'agricultural'
  | 'industrial'
  | 'land'
  | 'multi_family'
  | 'office'
  | 'retail';

type PropertyType = 'residential' | 'commercial';

type SaleStatus = 'conditional' | 'firm' | 'closed' | 'collapsed' | 'voided';

type Loft47Brokerage = {
  id: string
  [key: string]: unknown
}

type ProfileType = 'Agent' | 'Broker' | 'Conveyancer' | 'OfficeAdmin' | 'Organization' | 'Profile';

type ProfileFilters = {
  email: string
  type?: ProfileType
}

type Profile = {
  data: {
    type?: string
    id?: string
    attributes: {
      allowDirectPayout?: boolean
      email: string
      name: string
      type: ProfileType
      birthday?: string
      faxNumber?: string
      cellNumber?: string
      phoneNumber?: string
      corporateActiveAt?: string
    }
  }
}

type ProfileAccessAttributes = {
  profileId: string
  owner?: boolean
  permission?: Permission
  role: Role
  side: Side
}

type Permission = 'read' | 'write'

// Deal access roles of brokerage
type Role = 'buyer' | 'seller' | 'agent' | 'title' | 'tenant' | 'landlord'

type Side = 'list' | 'sell' | 'double_end' | 'not_applicable'

type ProfileAccess = {
  data: {
    type?: string
    id?: string
    attributes: ProfileAccessAttributes
  }
}

type DealAccessRoleAttributes = {
  name: string
}

type DealAccessRole = {
  data: {
    type?: string
    id?: string
    attributes: DealAccessRoleAttributes
  }
}

type AddressAttributes = {
  addressLineOne: string
  addressLineTwo?: string
  city: string
  country: string
  postalCode: string
  province: string
  unit?: string
}

type Address = {
  data: {
    type?: string
    id?: string
    attributes: AddressAttributes
  }
}

declare interface LoftDeal {
  data: {
    type?: string
    id?: string
    attributes: LoftDealAttributes
    relationships?: any
  }
}

declare interface LoftDealAttributes {
  adjustmentAt?: string
  adminReportReferral?: boolean
  block?: string
  buyerNames?: string
  closedAt?: string
  dealSubType?: DealSubType
  leadSource?: LeadSource
  dealType?: DealType
  depositHeldByName?: string
  depositHeldByUs?: boolean
  escrowNumber?: string
  exclusive?: boolean
  expectedTrustDeposit?: string
  externalTransactionId?: string
  officeId?: number
  ownerId: number
  firmedAt?: string
  fullDealNumber?: string
  lot?: string
  mlsNumber?: string
  offer?: boolean
  outsideBrokerageName?: string
  outsideBrokeragePayableByUs?: boolean
  ownerName?: string
  owningSide?: string
  plan?: string
  possessionAt?: string
  propertyType?: PropertyType
  saleStatus?: SaleStatus
  sellPrice?: string
  sellerNames?: string
  soldAt?: string
  sourceOfBusinessNames?: string
  taxExempt?: boolean
  teamDeal?: boolean
}