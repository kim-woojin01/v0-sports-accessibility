"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet"
import L from "leaflet"

type LatLng = {
  lat: number
  lng: number
}

interface FacilityMapProps {
  facilities: any[]
  center: LatLng
  userLocation?: LatLng | null
}

const facilityIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -32],
  shadowSize: [41, 41],
})

function ChangeView({ center }: { center: LatLng }) {
  const map = useMap()
  useEffect(() => {
    if (center && map) {
      map.setView(center)
    }
  }, [center, map])
  return null
}

export function FacilityMap({ facilities, center, userLocation }: FacilityMapProps) {
  const markerData = useMemo(
    () =>
      facilities
        .filter(
          (facility) =>
            typeof facility.lat === "number" &&
            !Number.isNaN(facility.lat) &&
            typeof facility.lng === "number" &&
            !Number.isNaN(facility.lng),
        )
        .map((facility) => ({
          ...facility,
          position: [facility.lat as number, facility.lng as number] as [number, number],
        })),
    [facilities],
  )

  return (
    <MapContainer center={center} zoom={12} className="w-full h-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={center} />
      {markerData.map((facility) => (
        <Marker position={facility.position} icon={facilityIcon} key={facility.id}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{facility.name}</p>
              <p className="text-xs text-muted-foreground">{facility.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={10}
          pathOptions={{ color: "#8b5cf6", fillColor: "#c084fc", fillOpacity: 0.6 }}
        >
          <Popup>현재 위치</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  )
}

export default FacilityMap

