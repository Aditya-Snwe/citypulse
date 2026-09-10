import { useEffect } from 'react'
import L from 'leaflet'
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { NASHIK_CENTER } from '../data/mockReports'
import type { GeoPoint, Report } from '../types/report'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function severityColor(report: Report): string {
  if (report.status === 'Resolved') return '#007d55'
  if (report.severity === 'High') return '#ef4444'
  if (report.severity === 'Medium') return '#f59e0b'
  return '#10b981'
}

function ClickHandler({ onPick }: { onPick?: (point: GeoPoint) => void }) {
  useMapEvents({
    click(event) {
      onPick?.({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

function Recenter({ point }: { point: GeoPoint }) {
  const map = useMap()
  useEffect(() => {
    map.setView([point.lat, point.lng])
  }, [map, point.lat, point.lng])
  return null
}

interface MapViewProps {
  reports?: Report[]
  selectedId?: string | null
  onSelect?: (report: Report) => void
  pickable?: boolean
  picked?: GeoPoint | null
  onPick?: (point: GeoPoint) => void
  center?: GeoPoint
  zoom?: number
}

export function MapView({
  reports = [],
  selectedId,
  onSelect,
  pickable = false,
  picked,
  onPick,
  center = NASHIK_CENTER,
  zoom = 14,
}: MapViewProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter point={picked ?? center} />
      <ClickHandler onPick={pickable ? onPick : undefined} />
      {reports.map((report) => (
        <CircleMarker
          key={report.id}
          center={[report.latitude, report.longitude]}
          radius={selectedId === report.id ? 12 : 9}
          pathOptions={{
            color: '#ffffff',
            weight: 2,
            fillColor: severityColor(report),
            fillOpacity: 1,
          }}
          eventHandlers={{
            click: (event) => {
              event.originalEvent.stopPropagation()
              onSelect?.(report)
            },
          }}
        />
      ))}
      {picked && <Marker position={[picked.lat, picked.lng]} icon={defaultIcon} />}
    </MapContainer>
  )
}
