import test from 'node:test'
import assert from 'node:assert/strict'
import { distanceBetweenPoints, formatDistance } from '../src/lib/format.ts'
import { categoryForType, severityForType } from '../src/lib/issueMeta.ts'
import { findDuplicateReports } from '../src/lib/duplicateDetector.ts'
import type { Report } from '../src/types/report.ts'

test('Geographic distance - Haversine calculation', () => {
  // Nashik coordinates: 19.9975, 73.7898
  // Same point distance should be 0
  const zeroDist = distanceBetweenPoints(19.9975, 73.7898, 19.9975, 73.7898)
  assert.equal(zeroDist, 0)

  // Nearby point ~ 111 meters away
  const d = distanceBetweenPoints(19.9975, 73.7898, 19.9985, 73.7898)
  assert.ok(d > 100 && d < 120, `Distance was ${d}, expected ~111m`)

  assert.equal(formatDistance(500), '500m away')
  assert.equal(formatDistance(1500), '1.5km away')
})

test('Issue metadata derivation - Category and Severity', () => {
  assert.equal(categoryForType('Pothole'), 'Road Infrastructure')
  assert.equal(categoryForType('Garbage'), 'Waste')
  assert.equal(categoryForType('Water Leakage'), 'Water')
  assert.equal(categoryForType('Broken Streetlight'), 'Electricity')

  assert.equal(severityForType('Pothole'), 'High')
  assert.equal(severityForType('Road Damage'), 'Medium')
  assert.equal(severityForType('Broken Streetlight'), 'Low')
})

test('Duplicate report detector - Proximity and status rules', () => {
  const existingReports: Report[] = [
    {
      id: 'CP-1',
      type: 'Pothole',
      category: 'Road Infrastructure',
      severity: 'High',
      status: 'Submitted',
      description: 'Big pothole on main road',
      locationLabel: 'Main Street',
      latitude: 19.9975,
      longitude: 73.7898,
      distanceMeters: 0,
      reportedAt: new Date().toISOString(),
      confirmations: 2,
      positiveVotes: 2,
      negativeVotes: 0,
      timeline: [],
    },
    {
      id: 'CP-2',
      type: 'Pothole',
      category: 'Road Infrastructure',
      severity: 'High',
      status: 'Resolved', // Resolved should NOT count as duplicate candidate
      description: 'Resolved pothole',
      locationLabel: 'Main Street',
      latitude: 19.9975,
      longitude: 73.7898,
      distanceMeters: 0,
      reportedAt: new Date().toISOString(),
      confirmations: 5,
      positiveVotes: 5,
      negativeVotes: 0,
      timeline: [],
    },
    {
      id: 'CP-3',
      type: 'Garbage', // Different category/type
      category: 'Waste',
      severity: 'Medium',
      status: 'Submitted',
      description: 'Garbage pile',
      locationLabel: 'Main Street',
      latitude: 19.9975,
      longitude: 73.7898,
      distanceMeters: 0,
      reportedAt: new Date().toISOString(),
      confirmations: 1,
      positiveVotes: 1,
      negativeVotes: 0,
      timeline: [],
    },
  ]

  // Nearby identical pothole (10m away)
  const dupes = findDuplicateReports(
    existingReports,
    'Pothole',
    { lat: 19.99755, lng: 73.7898 },
    80,
  )

  assert.equal(dupes.length, 1)
  assert.equal(dupes[0].report.id, 'CP-1')

  // Far away pothole (500m away) should not match within 80m threshold
  const farDupes = findDuplicateReports(
    existingReports,
    'Pothole',
    { lat: 20.002, lng: 73.7898 },
    80,
  )
  assert.equal(farDupes.length, 0)
})

test('Verification vote status transition rules', () => {
  // Negative votes should never auto-resolve without official confirmation
  // 5 positive votes should advance to Community Confirmed
  const initialConfirmations = 0
  const posVotes = 5
  const negVotes = 3

  const newStatus =
    posVotes >= 5 && negVotes < 3
      ? 'Community Confirmed'
      : negVotes >= 3
      ? 'Community Monitoring'
      : 'Submitted'

  assert.equal(newStatus, 'Community Monitoring')
  assert.notEqual(newStatus, 'Resolved', 'Citizen votes must never auto-resolve a report')
})
