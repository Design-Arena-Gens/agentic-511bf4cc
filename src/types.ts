export type Role = 'admin' | 'guard'

export interface User {
  id: string
  role: Role
  username: string
  password: string
  fullName: string
  active: boolean
}

export interface LocationCheckpoint {
  id: string
  name: string
  latitude: number
  longitude: number
  checklistItems: string[]
  active: boolean
}

export interface GpsPoint {
  latitude: number
  longitude: number
  timestamp: number
}

export interface ChecklistResponse {
  item: string
  value: boolean
}

export interface Patrol {
  id: string
  guardId: string
  locationId: string
  date: string
  startedAt: number
  completedAt?: number
  gps: GpsPoint
  responses: ChecklistResponse[]
  photoBase64?: string
  status: 'completed' | 'incomplete'
}

export interface Database {
  users: User[]
  locations: LocationCheckpoint[]
  patrols: Patrol[]
  createdAt: number
  updatedAt: number
  version: number
}
