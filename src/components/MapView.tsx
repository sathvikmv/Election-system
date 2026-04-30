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
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = React.useState(true);

  React.useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setApiKey(data.googleMapsApiKey);
      } catch (err) {
        console.error("Failed to fetch Google Maps config:", err);
      } finally {
        setIsLoadingKey(false);
      }
    }
    fetchConfig();
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "",
  });

  if (isLoadingKey) {
    return (
      <div style={{...containerStyle, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="shimmer" style={{width: '100%', height: '100%', borderRadius: '12px'}} />
      </div>
    );
  }

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
        Please check Cloud Run environment variables.
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
      options={{
        disableDefaultUI: true,
        styles: [
          {
            elementType: "geometry",
            stylers: [{ color: "#242f3e" }],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#242f3e" }],
          },
          {
            elementType: "labels.text.fill",
            stylers: [{ color: "#746855" }],
          },
        ]
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  ) : (
    <div style={{...containerStyle, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      Loading...
    </div>
  );
}
