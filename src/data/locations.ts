/** Floor sequence left → right: B3 → B2 → B1 → G → 1 → 10 */
export const FLOORS = [
  'B3',
  'B2',
  'B1',
  'G',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
] as const

export type Floor = (typeof FLOORS)[number]

const FLOOR_LABELS: Record<string, string> = {
  B3: 'Basement 3',
  B2: 'Basement 2',
  B1: 'Basement 1',
  G: 'Ground Floor',
  '1': '1st Floor',
  '2': '2nd Floor',
  '3': '3rd Floor',
  '4': '4th Floor',
  '5': '5th Floor',
  '6': '6th Floor',
  '7': '7th Floor',
  '8': '8th Floor',
  '9': '9th Floor',
  '10': '10th Floor',
}

/** Display label for floor codes (B1 → Basement 1, G → Ground Floor, 1 → 1st Floor) */
export function formatFloorLabel(floor: string): string {
  if (!floor || floor === '—') return '—'
  return FLOOR_LABELS[floor] ?? floor
}

export const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'] as const

export type Zone = (typeof ZONES)[number]

export interface DeptLocation {
  floor: Floor
  zone: Zone
}

/**
 * Optional department → location catalog.
 * SNHC Directory 25-Aug-2026 seed does not include floor/zone mapping yet,
 * so filters primarily use departments present in directory data.
 */
export const DEPARTMENT_LOCATIONS: Record<string, DeptLocation[]> = {}

export const DEPARTMENTS = Object.keys(DEPARTMENT_LOCATIONS).sort()

export function zonesForFloor(_floor: string): string[] {
  return [...ZONES]
}

export function departmentsForLocation(floor: string, zone: string): string[] {
  return DEPARTMENTS.filter((dept) => {
    const locs = DEPARTMENT_LOCATIONS[dept] ?? []
    return locs.some((loc) => {
      if (floor && loc.floor !== floor) return false
      if (zone && loc.zone !== zone) return false
      return true
    })
  })
}

export function floorRank(floor: string): number {
  const i = FLOORS.indexOf(floor as Floor)
  return i === -1 ? 999 : i
}

export function compareFloors(a: string, b: string): number {
  return floorRank(a) - floorRank(b)
}

export function sortFloors(floors: string[]): string[] {
  return [...floors].sort(compareFloors)
}
