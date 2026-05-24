"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { PlaceWithDeals } from "@/types";
import { useEffect, useMemo } from "react";
import { formatDistance, priceLevelToDollar, formatLiveLabel } from "@/lib/utils";

const pinIcon = (active: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div class="pulse-pin" ${
      active ? "" : 'style="background:#56565F;box-shadow:0 0 0 2px #0a0a0c;"'
    }></div>`
  });

/**
 * Imperatively keeps the map framed on the right area.
 *
 * Priority:
 *  1. If places exist -> fit bounds around all place markers.
 *  2. Else if a city center is provided -> recenter on that city.
 *  3. Else -> leave the map where it is.
 *
 * This is necessary because react-leaflet's <MapContainer center> prop is
 * only read once at mount; changing it later (e.g. when the user picks a
 * new city) does nothing without this component.
 */
function MapController({
  places,
  center
}: {
  places: PlaceWithDeals[];
  center?: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (places.length > 0) {
      if (places.length === 1) {
        map.setView([places[0].lat, places[0].lng], 14, { animate: true });
      } else {
        const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: true });
      }
      return;
    }
    // No places -> still center on the selected city so the map is never
    // stuck on a stale location (e.g. showing Chicago for Los Angeles).
    if (center) {
      map.setView([center.lat, center.lng], 12, { animate: true });
    }
  }, [places, center, map]);

  return null;
}

export default function MapView({
  places,
  center
}: {
  places: PlaceWithDeals[];
  center?: { lat: number; lng: number };
}) {
  // Initial center: city if provided, else first place, else US center.
  const initialCenter = useMemo(() => {
    if (center) return center;
    if (places.length) return { lat: places[0].lat, lng: places[0].lng };
    return { lat: 39.8283, lng: -98.5795 };
  }, [center, places]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06] h-[600px] relative">
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={12}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController places={places} center={center} />
        {places.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={pinIcon(p.liveStatus.active)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-semibold mb-1" style={{ color: "#FFF7ED" }}>
                  {p.name}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {p.neighborhood} · {priceLevelToDollar(p.priceLevel)} · ★ {p.rating.toFixed(1)}
                </p>
                <p className="text-xs mt-1" style={{ color: "#FFB562" }}>
                  {formatLiveLabel(p.liveStatus)}
                </p>
                {p.distanceKm != null && (
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {formatDistance(p.distanceKm)} away
                  </p>
                )}
                <a
                  href={`/place/${p.slug}`}
                  className="inline-block mt-2 text-xs px-3 py-1 rounded-full"
                  style={{ background: "#FF7A1A", color: "#0a0a0c", fontWeight: 600 }}
                >
                  View deal →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
