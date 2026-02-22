import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const NYC_CENTER = [40.7128, -73.97];
const NYC_ZOOM = 11;

// Lava color scale — more registrations = deeper red
function getColor(count) {
  if (count === 0) return '#EEEDE9';
  if (count <= 2) return '#FFD4CC';
  if (count <= 5) return '#FF7A5C';
  if (count <= 10) return '#FF5F46';
  return '#FF3621';
}

function style(feature, registrationCounts) {
  const name = feature.properties.name;
  const count = registrationCounts[name] || 0;
  return {
    fillColor: getColor(count),
    weight: 1.5,
    opacity: 1,
    color: '#1B3139',
    fillOpacity: 0.7,
  };
}

function NYCMap({ registrations = [] }) {
  const [geoData, setGeoData] = useState(null);
  const geoJsonRef = useRef(null);

  // Aggregate registrations by borough
  const registrationCounts = {};
  registrations.forEach((r) => {
    const key = r.borough || r.state || 'Unknown';
    registrationCounts[key] = (registrationCounts[key] || 0) + 1;
  });

  useEffect(() => {
    fetch('/nyc_boroughs.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error('Failed to load GeoJSON:', err));
  }, []);

  // Update styles when registrations change
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle((feature) => style(feature, registrationCounts));
    }
  });

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.name;
    const count = registrationCounts[name] || 0;
    layer.bindTooltip(
      `<strong>${name}</strong><br/>${count} registration${count !== 1 ? 's' : ''}`,
      { sticky: true }
    );
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 3, fillOpacity: 0.9 });
      },
      mouseout: (e) => {
        e.target.setStyle({ weight: 1.5, fillOpacity: 0.7 });
      },
    });
  };

  return (
    <div style={{ height: 450, width: '100%' }}>
      <MapContainer
        center={NYC_CENTER}
        zoom={NYC_ZOOM}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {geoData && (
          <GeoJSON
            ref={geoJsonRef}
            data={geoData}
            style={(feature) => style(feature, registrationCounts)}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded mr-1" style={{ backgroundColor: '#EEEDE9' }}></span>
          0
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded mr-1" style={{ backgroundColor: '#FFD4CC' }}></span>
          1-2
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded mr-1" style={{ backgroundColor: '#FF7A5C' }}></span>
          3-5
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded mr-1" style={{ backgroundColor: '#FF5F46' }}></span>
          6-10
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded mr-1" style={{ backgroundColor: '#FF3621' }}></span>
          10+
        </div>
      </div>
    </div>
  );
}

export default NYCMap;
