"use client";

import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "160px",
  borderRadius: "12px",
};

const center = {
  lat: 15.2993,  // Goa example
  lng: 74.1240,
};

export default function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "",
  });

  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    return (
      <div style={{
        ...containerStyle,
        background: 'var(--surface-alt)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border)',
        fontSize: '0.8rem',
        color: 'var(--text-tertiary)',
        textAlign: 'center',
        padding: '1rem'
      }}>
        Google Maps API Key Missing or Invalid.<br/>
        Please update .env.local
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{...containerStyle, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        Error loading maps
      </div>
    );
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
    >
      <Marker position={center} />
    </GoogleMap>
  ) : (
    <div style={{...containerStyle, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      Loading...
    </div>
  );
}
