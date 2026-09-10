export type Severity = 'High' | 'Medium' | 'Low'

export type ReportStatus =
  | 'Submitted'
  | 'In Progress'
  | 'Community Confirmed'
  | 'Community Monitoring'
  | 'Resolved'

export type IssueType =
  | 'Pothole'
  | 'Road Damage'
  | 'Garbage'
  | 'Water Leakage'
  | 'Waterlogging'
  | 'Broken Streetlight'
  | 'Fallen Tree'
  | 'Other'

export type IssueCategory =
  | 'Road Infrastructure'
  | 'Waste'
  | 'Water'
  | 'Electricity'
  | 'Other'

export type MapFilter = 'All' | 'Roads' | 'Waste' | 'Water' | 'Electricity' | 'Other'

export interface Report {
  id: string
  type: IssueType
  category: IssueCategory
  description: string
  locationLabel: string
  latitude: number
  longitude: number
  severity: Severity
  status: ReportStatus
  reportedAt: string
  confirmations: number
  image: string | null
  isMine?: boolean
  distanceMeters?: number
  timeline?: TimelineStep[]
}

export interface TimelineStep {
  label: string
  done: boolean
  active?: boolean
}

export interface GeoPoint {
  lat: number
  lng: number
}
