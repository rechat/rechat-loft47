import Ui from '@libs/material-ui'
import React from '@libs/react'
import ReactUse from '@libs/react-use'

import ActionButtons from './components/ActionButtons'
import DealContextList from './components/DealContextList'
import DealSelectors from './components/DealSelectors'
import PeopleSyncStatus from './components/PeopleSyncStatus'
import {
  DealContexts,
  toISOWithOffset,
  getMainAgent,
  getOtherAgents,
  decideOwningSide,
  getEmailsFromRoles,
  decideRoleType,
  isAgentRole
} from './core/utils'
import { usePersistentState } from './hooks/usePersistentState'
import { AddressService } from './service/AddressService'
import { AuthService } from './service/AuthService'
import { BrokerageDealAccessRolesService } from './service/BrokerageDealAccessRoles'
import { BrokerageDealsProfileAccessesService } from './service/BrokerageDealsProfileAccessesService'
import { BrokerageDealsService } from './service/BrokerageDealsService'
import { BrokerageProfilesService } from './service/BrokerageProfilesService'
import { BrokeragesService } from './service/BrokeragesService'
import { ConfigService } from './service/ConfigService'
import { DealsMappingService } from './service/DealsMappingService'

export const App: React.FC<EntryProps> = ({
  models: { deal: RechatDeal, roles, user },
  api: {
    getDealContext,
    updateDealContext,
    deleteRole,
    updateRole,
    notifyOffice,
    updateTaskStatus,
    close
  },
  Components: {
    DatePicker: DayPicker,
    Wizard,
    RoleForm,
    RoleCard,
    ContactRoles,
    AgentsPicker
  },
  utils: { notify, isBackOffice },
  hooks
}) => {
  ReactUse.useDebounce(() => {}, 1000, [])

  const loft47BrokeragesRef = React.useRef<Loft47Brokerage[]>([])

  const [isLoading, setIsLoading] = React.useState(false)
  const loft47PrimaryAgentRef = React.useRef<any>(null)
  const [loft47DealId, setLoft47DealId] = React.useState('')
  const [loft47Url, setLoft47Url] = React.useState('')
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null)
  const [syncStatusType, setSyncStatusType] = React.useState<
    'normal' | 'warning'
  >('normal')

  const [selectedDealType, setSelectedDealType] = usePersistentState(
    'dealType',
    ''
  )
  const [selectedDealSubType, setSelectedDealSubType] = usePersistentState(
    'dealSubType',
    ''
  )
  const [selectedLeadSource, setSelectedLeadSource] = usePersistentState(
    'leadSource',
    ''
  )
  const [selectedPropertyType, setSelectedPropertyType] = usePersistentState(
    'propertyType',
    ''
  )
  const [selectedSaleStatus, setSelectedSaleStatus] = usePersistentState(
    'saleStatus',
    ''
  )

  const handleDealTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedDealType(event.target.value as string)
  }
  const handleDealSubTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedDealSubType(event.target.value as string)
  }
  const handleLeadSourceChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedLeadSource(event.target.value as string)
  }
  const handlePropertyTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedPropertyType(event.target.value as string)
  }
  const handleSaleStatusChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedSaleStatus(event.target.value as string)
  }

  const handleSyncStatus = (
    status: string,
    type: 'normal' | 'warning' = 'normal'
  ) => {
    setSyncStatus(status)
    setSyncStatusType(type)
  }
  const handleSyncStatusTimeout = () => {
    setTimeout(() => {
      setSyncStatus(null)
      setSyncStatusType('normal')
    }, 3000)
  }

  const signInOnce = async () => {
    handleSyncStatus('Signing in...')

    const env = await ConfigService.getPublicEnv()

    if (env.error) {
      handleSyncStatus('Loft47 credentials not provided by backend', 'warning')

      return false
    }

    setLoft47Url(env.LOFT47_URL ?? '')

    const authData = await AuthService.signIn(
      env.LOFT47_EMAIL,
      env.LOFT47_PASSWORD
    )

    if (authData.error) {
      console.log('authData:', authData.error)
      handleSyncStatus('Sign in failed. Please try again later.', 'warning')

      return false
    }

    return true
  }

  const retrieveBrokerages = async () => {
    const brokeragesData = await BrokeragesService.retrieveBrokerages()

    if (brokeragesData.error) {
      console.log('brokeragesData:', brokeragesData.error)

      return
    }

    loft47BrokeragesRef.current = brokeragesData.data
  }

  const setPrimaryAgent = async () => {
    const mainAgent = getMainAgent(roles, RechatDeal)

    if (mainAgent) {
      const profilesData = await BrokerageProfilesService.getBrokerageProfiles(
        loft47BrokeragesRef.current[0].id ?? '',
        {
          email: mainAgent.email
        }
      )

      if (profilesData.error) {
        console.log('profilesData:', profilesData.error)

        return
      }

      if (profilesData.data.length > 0) {
        const profile = profilesData.data[0]

        loft47PrimaryAgentRef.current = profile
      } else {
        const newAgentResp =
          await BrokerageProfilesService.createBrokerageProfile(
            loft47BrokeragesRef.current[0].id ?? '',
            {
              data: {
                attributes: {
                  email: mainAgent.email,
                  name: mainAgent.legal_full_name,
                  type: 'Agent'
                }
              }
            }
          )
        const newAgent = newAgentResp.data

        loft47PrimaryAgentRef.current = newAgent
      }
    } else {
      handleSyncStatus('No Main Agent in Rechat!', 'warning')
    }
  }

  const createMapping = async (tempLoft47Deal: LoftDeal) => {
    if (loft47BrokeragesRef.current.length > 0) {
      const newLoft47Deal = await BrokerageDealsService.createDeal(
        loft47BrokeragesRef.current[0].id,
        tempLoft47Deal
      )

      if (newLoft47Deal.error) {
        if (newLoft47Deal.status === 422) {
          handleSyncStatus(
            newLoft47Deal.error.errors[0]?.detail ??
              'Error creating Rechat Deal in Loft47!',
            'warning'
          )
        }

        console.log('newLoft47Deal:', newLoft47Deal.error)
      } else {
        setLoft47DealId(newLoft47Deal.data.id)

        const mapping = await DealsMappingService.createMapping(
          RechatDeal.id,
          newLoft47Deal.data.id
        )

        if (!mapping.error) {
          handleSyncStatus('Rechat Deal was successfully created in Loft47!')

          await updateLoft47DealAddress(newLoft47Deal)
          await updateDealPeople(newLoft47Deal)
        } else {
          console.log('mapping:', mapping.error)
        }
      }
    }
  }

  const updateMapping = async (
    _loft47DealId: string,
    tempLoft47Deal: LoftDeal
  ) => {
    const updatedLoft47Deal = await BrokerageDealsService.updateDeal(
      loft47BrokeragesRef.current[0].id ?? '',
      _loft47DealId,
      tempLoft47Deal
    )

    if (updatedLoft47Deal.error) {
      if (
        updatedLoft47Deal.status === 422 ||
        updatedLoft47Deal.status === 404
      ) {
        handleSyncStatus(
          updatedLoft47Deal.error.errors[0]?.detail ??
            'Error updating Rechat Deal in Loft47!',
          'warning'
        )
      }

      console.log('updatedLoft47Deal:', updatedLoft47Deal.error)
    } else {
      setLoft47DealId(updatedLoft47Deal.data.id)

      handleSyncStatus('Rechat Deal was successfully updated in Loft47!')

      await updateLoft47DealAddress(updatedLoft47Deal)
      await updateDealPeople(updatedLoft47Deal)
    }
  }

  const updateLoft47DealAddress = async (loft47Deal: LoftDeal) => {
    const streetAddress = getDealContext('street_address')

    const addressId = loft47Deal.data.relationships.address.data.id
    const tempAddress = {
      data: {
        attributes: {
          addressLineOne: streetAddress?.text ?? RechatDeal.title,
          city: getDealContext('city')?.text,
          country: getDealContext('country')?.text,
          postalCode: getDealContext('postal_code')?.text,
          province: getDealContext('state')?.text
        }
      }
    }
    const address = await AddressService.updateAddress(addressId, tempAddress)

    if (address.error) {
      console.log('address:', address.error)
    }
  }

  const checkIfAllContextsAreFilled = () => {
    if (!RechatDeal) {
      handleSyncStatus('Rechat Deal is empty', 'warning')

      return false
    }

    if (selectedDealSubType === '') {
      handleSyncStatus('Please select a deal sub type', 'warning')

      return false
    }

    if (selectedDealType === '') {
      handleSyncStatus('Please select a deal type', 'warning')

      return false
    }

    if (selectedLeadSource === '') {
      handleSyncStatus('Please select a lead source', 'warning')

      return false
    }

    if (selectedPropertyType === '') {
      handleSyncStatus('Please select a property type', 'warning')

      return false
    }

    if (selectedSaleStatus === '') {
      handleSyncStatus('Please select a sale status', 'warning')

      return false
    }

    if (!loft47PrimaryAgentRef.current) {
      handleSyncStatus("Loft47 primary agent doesn't exist", 'warning')

      return false
    }

    return true
  }

  const updateDealPeople = async (loft47Deal: LoftDeal) => {
    handleSyncStatus('Syncing deal people...')

    const emails = getEmailsFromRoles(roles)
    let profilesResp: any = { data: [] }

    if (roles.length > 0) {
      profilesResp = await BrokerageProfilesService.getBrokerageProfiles(
        loft47BrokeragesRef.current[0].id ?? '',
        { email: emails }
      )

      if (profilesResp.error) {
        console.log('profilesResp:', profilesResp.error)

        return
      }
    }

    // Ensure we have an array even if API returns null/undefined
    const existingProfiles: any[] = profilesResp.data
    // Map email -> profile for quick lookup
    const emailToProfile = new Map<string, any>(
      existingProfiles.map((p: any) => [p.attributes.email, p])
    )

    // 1. Create missing profiles
    for (const person of roles) {
      if (!person.email) {
        continue
      }

      const personRole = decideRoleType(person) as Role

      if (!emailToProfile.has(person.email)) {
        const newProfileResp =
          await BrokerageProfilesService.createBrokerageProfile(
            loft47BrokeragesRef.current[0].id ?? '',
            {
              data: {
                attributes: {
                  email: person.email,
                  name: person.legal_full_name,
                  type: personRole === 'agent' ? 'Agent' : 'Profile'
                }
              }
            }
          )

        if (newProfileResp?.data) {
          emailToProfile.set(person.email, {
            ...newProfileResp.data,
            role: personRole
          })
        } else {
          console.log('newProfileResp.error:', newProfileResp.error)
        }
      } else {
        // update existing profile
        const compareRoleType = personRole === 'agent' ? 'Agent' : 'Profile'
        const existingProfile = emailToProfile.get(person.email)

        if (existingProfile?.attributes.type !== compareRoleType) {
          const updateProfileResp =
            await BrokerageProfilesService.updateBrokerageProfile(
              loft47BrokeragesRef.current[0].id ?? '',
              existingProfile.attributes.id,
              {
                data: {
                  attributes: {
                    email: person.email,
                    name: person.legal_full_name,
                    type: compareRoleType
                  }
                }
              }
            )

          if (updateProfileResp?.error) {
            console.log('updateProfileResp.error:', updateProfileResp.error)
          } else {
            emailToProfile.set(person.email, {
              ...updateProfileResp.data,
              role: personRole
            })
          }
        }

        emailToProfile.set(person.email, {
          ...existingProfile,
          role: personRole
        })
      }
    }

    // Get all profiles ids corresponding to the roles
    const existingProfileIds = Array.from(emailToProfile.values()).map(
      (p: any) => p.attributes.id
    )
    // 2. Retrieve existing accesses of this deal
    const dealAccessesResp =
      await BrokerageDealsProfileAccessesService.retrieveBrokerageDealProfileAccesses(
        loft47BrokeragesRef.current[0].id ?? '',
        loft47Deal.data.id ?? ''
      )

    const existingDealAccesses: any[] = dealAccessesResp?.data ?? []
    const existingDealAccessProfileIds = existingDealAccesses.map(
      (a: any) => a.attributes.profileId
    )

    // a) Add missing accesses (process sequentially so the shared array updates before the next iteration)
    for (const existingProfile of emailToProfile.values()) {
      if (
        !existingDealAccesses.some(
          (a: any) => a.attributes.profileId == existingProfile.attributes.id
        )
      ) {
        const newAccessResp =
          await BrokerageDealsProfileAccessesService.createBrokerageDealProfileAccess(
            loft47BrokeragesRef.current[0].id ?? '',
            loft47Deal.data.id ?? '',
            {
              data: {
                attributes: {
                  profileId: String(existingProfile.attributes.id),
                  role: existingProfile.role as Role,
                  side: decideOwningSide(RechatDeal) as Side
                }
              }
            }
          )

        if (newAccessResp.error) {
          if (newAccessResp.status === 422) {
            handleSyncStatus(
              newAccessResp.error.errors[0]?.detail ??
                'Error creating Rechat Deal Access in Loft47!',
              'warning'
            )
            handleSyncStatusTimeout()
          }

          console.log('newAccessResp.error:', newAccessResp.error)
        } else {
          existingDealAccesses.push(newAccessResp.data)
        }
      }
    }

    // b) Remove stale accesses that no longer correspond to the people
    for (const access of existingDealAccesses) {
      if (
        !existingProfileIds.includes(access.attributes.profileId) ||
        existingProfileIds.length === 0
      ) {
        const deleteAccessResp =
          await BrokerageDealsProfileAccessesService.deleteBrokerageDealProfileAccess(
            loft47BrokeragesRef.current[0].id ?? '',
            loft47Deal.data.id ?? '',
            access.id
          )

        if (deleteAccessResp.error) {
          if (deleteAccessResp.status === 422) {
            handleSyncStatus(
              deleteAccessResp.error.errors[0]?.detail ??
                'Error deleting Rechat Deal Access in Loft47!',
              'warning'
            )
            handleSyncStatusTimeout()
          }

          console.log('deleteAccessResp.error:', deleteAccessResp.error)
        }
      }
    }

    handleSyncStatus('Sync completed')
  }

  const updateDealAccessRoles = async (roles: IDealRole[]) => {
    const dealAccessRoles =
      await BrokerageDealAccessRolesService.retrieveBrokerageDealAccessRoles(
        loft47BrokeragesRef.current[0].id ?? ''
      )

    if (dealAccessRoles.error) {
      console.log('dealAccessRoles:', dealAccessRoles.error)
    }

    for (const role of roles) {
      const isFindRole = dealAccessRoles.data.some((d: any) =>
        isAgentRole(role.role)
          ? 'agent'
          : d.attributes.name == role.role.toLowerCase()
      )

      if (!isFindRole) {
        const createDealAccessRoleResp =
          await BrokerageDealAccessRolesService.createBrokerageDealAccessRole(
            loft47BrokeragesRef.current[0].id ?? '',
            {
              data: {
                attributes: {
                  name: isAgentRole(role.role)
                    ? 'agent'
                    : role.role.toLowerCase()
                }
              }
            }
          )

        console.log('createDealAccessRoleResp:', createDealAccessRoleResp)
      }
    }
  }

  const syncWithLoft47 = async () => {
    setIsLoading(true)

    const isAuthenticated = await signInOnce()

    if (!isAuthenticated) {
      setIsLoading(false)

      return
    }

    await retrieveBrokerages()

    if (loft47BrokeragesRef.current.length === 0) {
      handleSyncStatus(
        'No brokerages found. Please try again later.',
        'warning'
      )
      handleSyncStatusTimeout()
      setIsLoading(false)

      return
    }

    updateDealAccessRoles(roles)

    await setPrimaryAgent()

    if (!checkIfAllContextsAreFilled()) {
      setIsLoading(false)
      handleSyncStatusTimeout()

      return
    }

    const block = getDealContext('block_number')?.text
    const closedAt = toISOWithOffset(
      new Date((getDealContext('closing_date')?.date ?? 0) * 1000)
    )
    const lot = getDealContext('lot_number')?.text
    const mlsNumber = getDealContext('mls_number')?.text
    const salesPrice = getDealContext('sales_price')?.text
    const leasedPrice = getDealContext('leased_price')?.text
    const isLease = RechatDeal.property_type.is_lease
    const updatedAt = RechatDeal.updated_at
    const possessionAt = toISOWithOffset(
      new Date((getDealContext('possession_date')?.date ?? 0) * 1000)
    )
    const otherAgents = getOtherAgents(roles, RechatDeal)
    const owningSide = decideOwningSide(RechatDeal)
    const tempLoft47Deal = {
      data: {
        attributes: {
          ownerId: Number(loft47PrimaryAgentRef.current.id),
          ...(block && { block }),
          adjustmentAt: toISOWithOffset(new Date((updatedAt ?? 0) * 1000)),
          ...(closedAt && { closedAt }),
          dealSubType: selectedDealSubType as DealSubType,
          dealType: selectedDealType as DealType,
          leadSource: selectedLeadSource as LeadSource,
          propertyType: selectedPropertyType as PropertyType,
          saleStatus: selectedSaleStatus as SaleStatus,
          exclusive: !RechatDeal.listing,
          externalTransactionId: RechatDeal.id,
          ...(RechatDeal.brand.brand_type === 'Office' && {
            officeId: RechatDeal.brand.parent[0]
          }),
          ...(lot && { lot }),
          ...(mlsNumber && { mlsNumber }),
          offer: RechatDeal.deal_type === 'Buying',
          ...(otherAgents.length > 0 && {
            outsideBrokerageName: otherAgents[0].company_title
          }),
          ...(owningSide && { owningSide }),
          ownerName: loft47PrimaryAgentRef.current.attributes.name,
          ...(possessionAt && { possessionAt }),
          ...(isLease
            ? leasedPrice && { sellPrice: leasedPrice }
            : salesPrice && { sellPrice: salesPrice }),
          ...(closedAt && { soldAt: closedAt }),
          teamDeal: RechatDeal.brand.brand_type === 'Team'
        }
      }
    }

    handleSyncStatus('Checking if Rechat Deal exists in Loft47...')

    const mapping = await DealsMappingService.getMappingByRechatDealId(
      RechatDeal.id
    )

    if (mapping.error) {
      console.log('mapping:', mapping.error)
    } else if (mapping.notFound) {
      handleSyncStatus('Creating Rechat Deal in Loft47...')
      await createMapping(tempLoft47Deal)
    } else {
      handleSyncStatus('Updating Rechat Deal in Loft47...')
      await updateMapping(mapping.loft47DealId, tempLoft47Deal)
    }

    handleSyncStatusTimeout()
    setIsLoading(false)
  }

  const openLoft47Deal = () => {
    if (loft47Url) {
      window.open(
        `${loft47Url}/brokerages/${loft47BrokeragesRef.current[0].id}/deals/${loft47DealId}`,
        '_blank'
      )
    } else {
      handleSyncStatus('Loft47 URL not set. Please contact support.', 'warning')
    }
  }

  return (
    <Ui.Grid container spacing={2}>
      <Ui.CircularProgress
        style={{
          display: 'absolute',
          position: 'absolute',
          top: '50%',
          left: '50%'
        }}
        hidden={!isLoading}
      />
      <PeopleSyncStatus status={syncStatus} type={syncStatusType} />
      <Ui.Grid item xs={12} md={12} lg={12}>
        <DealContextList
          contexts={DealContexts}
          getDealContext={getDealContext}
        />
      </Ui.Grid>

      <DealSelectors
        selectedDealType={selectedDealType}
        selectedDealSubType={selectedDealSubType}
        selectedLeadSource={selectedLeadSource}
        selectedPropertyType={selectedPropertyType}
        selectedSaleStatus={selectedSaleStatus}
        onDealTypeChange={handleDealTypeChange}
        onDealSubTypeChange={handleDealSubTypeChange}
        onLeadSourceChange={handleLeadSourceChange}
        onPropertyTypeChange={handlePropertyTypeChange}
        onSaleStatusChange={handleSaleStatusChange}
      />

      <ActionButtons
        isLoading={isLoading}
        onSync={syncWithLoft47}
        onClose={close}
        onOpenDeal={openLoft47Deal}
        canOpenDeal={!!loft47DealId}
      />
    </Ui.Grid>
  )
}
