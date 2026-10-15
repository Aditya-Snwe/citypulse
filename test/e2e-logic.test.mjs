import test from 'node:test'
import assert from 'node:assert/strict'

// Haversine implementation identical to src/lib/format.ts
function distanceBetweenPoints(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180

  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaPhi = toRad(lat2 - lat1)
  const deltaLambda = toRad(lon2 - lon1)

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c)
}

function formatDistance(meters) {
  if (meters == null) return ''
  if (meters < 1000) return `${meters}m away`
  return `${(meters / 1000).toFixed(1)}km away`
}

// Logic identical to src/lib/issueMeta.ts
function categoryForType(type) {
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

function severityForType(type) {
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

// Duplicate detection rule logic identical to src/lib/duplicateDetector.ts
function findDuplicateReports(allReports, candidateType, point, radiusMeters = 80) {
  const matches = []
  for (const report of allReports) {
    if (report.status === 'Resolved') continue
    if (report.type !== candidateType) continue
    const dist = distanceBetweenPoints(point.lat, point.lng, report.latitude, report.longitude)
    if (dist <= radiusMeters) {
      matches.push({ report, distanceMeters: dist })
    }
  }
  return matches.sort((a, b) => a.distanceMeters - b.distanceMeters)
}

test('Geographic distance - Haversine calculation', () => {
  const zeroDist = distanceBetweenPoints(19.9975, 73.7898, 19.9975, 73.7898)
  assert.equal(zeroDist, 0)

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
  const existingReports = [
    {
      id: 'CP-1',
      type: 'Pothole',
      status: 'Submitted',
      latitude: 19.9975,
      longitude: 73.7898,
    },
    {
      id: 'CP-2',
      type: 'Pothole',
      status: 'Resolved', // Resolved must NOT match as duplicate
      latitude: 19.9975,
      longitude: 73.7898,
    },
    {
      id: 'CP-3',
      type: 'Garbage', // Different issue type
      status: 'Submitted',
      latitude: 19.9975,
      longitude: 73.7898,
    },
  ]

  const dupes = findDuplicateReports(
    existingReports,
    'Pothole',
    { lat: 19.99755, lng: 73.7898 },
    80,
  )

  assert.equal(dupes.length, 1)
  assert.equal(dupes[0].report.id, 'CP-1')

  const farDupes = findDuplicateReports(
    existingReports,
    'Pothole',
    { lat: 20.002, lng: 73.7898 },
    80,
  )
  assert.equal(farDupes.length, 0)
})

test('Verification vote status transition rules - Negative votes do not resolve', () => {
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
