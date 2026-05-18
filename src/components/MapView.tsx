"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { PlaceWithDeals } from "@/types";
import { useEffect, useMemo } from "react";
import { formatDistance, priceLevelToDollar, formatLiveLabel } from "@/lib/utils";

const pinIcon = (active: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div class="${active ? "pulse-pin" : "pulse-pin"}" ${
      active ? "" : 'style="background:#56565F;box-shadow:0 0 0 2px #0a0a0c;"'
    }></div>`
  });

function FitBounds({ places }: { places: PlaceWithDeals[] }) {
  // No-op placeholder for future imperative fitting.
  useEffect(() => {}, [places]);
  return null;
}

export default function MapView({
  places,
  center
}: {
  places: PlaceWithDeals[];
  center?: { lat: number; lng: number };
}) {
  const computed = useMemo(() => {
    if (center) return center;
    if (places.length) {
      const avgLat = places.reduce((s, p) => s + p.lat, 0) / places.length;
      const avgLng = places.reduce((s, p) => s + p.lng, 0) / places.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 41.8781, lng: -87.6298 }; // Chicago default
  }, [places, center]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06] h-[600px] relative">
      <MapContainer
        center={[computed.lat, computed.lng]}
        zoom={12}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds places={places} />
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
