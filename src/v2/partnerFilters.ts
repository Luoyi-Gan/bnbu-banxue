import type { Room, RoomType } from '../../shared/v2/model'

export type PartnerDetails = {
  startsAt?: string
  departurePlace?: string
  destinationPlace?: string
  departureAddress?: string
  destinationAddress?: string
  placeAddress?: string
  activityType?: string
  gpaMin?: number
  gpaMax?: number
  sportType?: string
  locationScope?: 'campus' | 'outside'
  extraCost?: boolean
  costDescription?: string
  genderPreference?: 'any' | 'male' | 'female'
  coordinates?: [number, number]
  departureCoordinates?: [number, number]
  destinationCoordinates?: [number, number]
}
export type PartnerRoom = Room & { memberCount: number; details: PartnerDetails }
export type PartnerFilters = {
  type: 'all' | RoomType
  query: string
  location: string
  timeFrom: string
  timeTo: string
  activityType: string
  gpaMin: string
  gpaMax: string
  sportType: string
  locationScope: string
  extraCost: string
  genderPreference: string
}
export const emptyPartnerFilters: PartnerFilters = { type: 'all', query: '', location: '', timeFrom: '', timeTo: '', activityType: '', gpaMin: '', gpaMax: '', sportType: '', locationScope: '', extraCost: '', genderPreference: '' }

const match = (value: string, query: string) => value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
const timeValue = (value?: string) => value ? Date.parse(value) : NaN

export function filterPartnerRooms(rooms: PartnerRoom[], filters: PartnerFilters): PartnerRoom[] {
  return rooms.filter(room => {
    if (room.status !== 'open' || filters.type !== 'all' && room.type !== filters.type) return false
    const details = room.details
    if (filters.query && !match([room.title, room.body, room.place].join(' '), filters.query)) return false
    if (filters.location && !match([room.place, details.departurePlace, details.destinationPlace, details.departureAddress, details.destinationAddress, details.placeAddress].filter(Boolean).join(' '), filters.location)) return false
    if (filters.timeFrom || filters.timeTo) {
      const actual = timeValue(details.startsAt)
      if (!Number.isFinite(actual)) return false
      if (filters.timeFrom && actual < timeValue(filters.timeFrom)) return false
      if (filters.timeTo && actual > timeValue(filters.timeTo)) return false
    }
    if (filters.activityType && (room.type !== 'entertainment' || details.activityType !== filters.activityType)) return false
    if (filters.gpaMin || filters.gpaMax) {
      if (room.type !== 'study' || details.gpaMin === undefined || details.gpaMax === undefined) return false
      if (filters.gpaMin && details.gpaMax < Number(filters.gpaMin)) return false
      if (filters.gpaMax && details.gpaMin > Number(filters.gpaMax)) return false
    }
    if (filters.sportType && (room.type !== 'sport' || details.sportType !== filters.sportType)) return false
    if (filters.locationScope && (room.type !== 'sport' || details.locationScope !== filters.locationScope)) return false
    if (filters.extraCost && (room.type !== 'sport' || details.extraCost !== (filters.extraCost === 'yes'))) return false
    if (filters.genderPreference && (room.type !== 'sport' || details.genderPreference !== filters.genderPreference)) return false
    return true
  })
}
