import type { IssueCategory, IssueType, MapFilter, Severity } from '../types/report'

export const ISSUE_TYPES: IssueType[] = [
  'Pothole',
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Waterlogging',
  'Broken Streetlight',
  'Fallen Tree',
  'Other',
]

export function categoryForType(type: IssueType): IssueCategory {
  switch (type) {
    case 'Pothole':
    case 'Road Damage':
    case 'Fallen Tree':
      return 'Road Infrastructure'
    case 'Garbage':
      return 'Waste'
    case 'Water Leakage':
    case 'Waterlogging':
      return 'Water'
    case 'Broken Streetlight':
      return 'Electricity'
    default:
      return 'Other'
  }
}

export function severityForType(type: IssueType): Severity {
  switch (type) {
    case 'Pothole':
    case 'Waterlogging':
    case 'Fallen Tree':
    case 'Water Leakage':
      return 'High'
    case 'Road Damage':
    case 'Garbage':
      return 'Medium'
    case 'Broken Streetlight':
    case 'Other':
    default:
      return 'Low'
  }
}

export function matchesMapFilter(category: IssueCategory, filter: MapFilter): boolean {
  if (filter === 'All') return true
  if (filter === 'Roads') return category === 'Road Infrastructure'
  return category === filter
}

export function issueEmoji(type: IssueType): string {
  switch (type) {
    case 'Pothole':
      return '🕳️'
    case 'Road Damage':
      return '🛣️'
    case 'Garbage':
      return '🗑️'
    case 'Water Leakage':
      return '💧'
    case 'Waterlogging':
      return '🌊'
    case 'Broken Streetlight':
      return '💡'
    case 'Fallen Tree':
      return '🌳'
    default:
      return '📌'
  }
}
