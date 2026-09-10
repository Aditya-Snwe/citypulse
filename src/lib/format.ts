export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(0, Math.round(diff / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (hours < 48) return 'yesterday'
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} days ago`
  return formatDate(iso)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
}

export function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatDistance(meters?: number): string {
  if (meters == null) return ''
  if (meters < 1000) return `${meters}m away`
  return `${(meters / 1000).toFixed(1)}km away`
}
