"use client";

import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "160px",
  borderRadius: "12px",
};

const center = {
  lat: 15.2993,
  lng: 74.1240,
};

// Read key from process.env (hardcoded in next.config.ts at build time)
// Also try runtime fetch as fallback
const BUILD_TIME_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function MapView() {
  const [apiKey, setApiKey] = React.useState<string>(BUILD_TIME_KEY);
  const [keyResolved, setKeyResolved] = React.useState(!!BUILD_TIME_KEY);

  // If build-time key is missing, try fetching at runtime
  React.useEffect(() => {
    if (apiKey) {
      setKeyResolved(true);
      return;
    }
    async function fetchConfig() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        if (data.googleMapsApiKey) {
          setApiKey(data.googleMapsApiKey);
        }
      } catch (err) {
        console.error("MapView: Failed to fetch config:", err);
      } finally {
        setKeyResolved(true);
      }
    }
    fetchConfig();
  }, [apiKey]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "",
  });

  if (!keyResolved) {
    return (
      <div style={{...containerStyle, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="shimmer" style={{width: '100%', height: '100%', borderRadius: '12px'}} />
      </div>
    );
  }

  if (!apiKey || apiKey.length < 10) {
    return (
      <div style={{
        ...containerStyle,
        background: 'var(--surface-alt)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border)',
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
        textAlign: 'center',
        padding: '1rem'
      }}>
        Map temporarily unavailable
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{...containerStyle, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>
        Map loading error
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
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        ]
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  ) : (
    <div style={{...containerStyle, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>
      Loading map...
    </div>
  );
}
