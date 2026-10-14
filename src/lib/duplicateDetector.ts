import { distanceBetweenPoints } from './format'
import type { IssueType, Report } from '../types/report'

export interface DuplicateCandidate {
  report: Report
  distanceMeters: number
  matchReason: string
}

/**
 * Transparent rule-based duplicate detector.
 *
 * Checks if there is an active (unresolved) report with the identical issue type
 * within a configurable geographic radius (default 80 meters for street-level issues).
 */
export function findDuplicateReports(
  allReports: Report[],
  candidateType: IssueType,
  point: { lat: number; lng: number },
  radiusMeters = 80,
): DuplicateCandidate[] {
  const matches: DuplicateCandidate[] = []

  for (const report of allReports) {
    // Only compare with active issues
    if (report.status === 'Resolved') continue

    // Exact issue type match
    if (report.type !== candidateType) continue

    const dist = distanceBetweenPoints(point.lat, point.lng, report.latitude, report.longitude)

    if (dist <= radiusMeters) {
      matches.push({
        report,
        distanceMeters: dist,
        matchReason: `Matching '${candidateType}' reported ${dist}m away`,
      })
    }
  }

  // Sort closest duplicate first
  return matches.sort((a, b) => a.distanceMeters - b.distanceMeters)
}
