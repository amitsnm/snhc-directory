export interface TariffMasterItem {
  tariff: string
  serviceType: string
  serviceItem: string
  code: string
  billingCategory: string
  priority: string
  price: number | null
  department: string
  subDepartment: string
  status: string
}

/** @deprecated Use TariffMasterItem */
export type ServiceMasterItem = TariffMasterItem
