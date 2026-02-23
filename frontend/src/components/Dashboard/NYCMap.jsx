import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import neighborhoodToNtaMap from '../../data/neighborhoodToNtaMap';

const STATES_ZOOM_THRESHOLD = 10; // Hide states layer when zoom >= this

const NYC_CENTER = [40.7128, -73.97];
const NYC_ZOOM = 11;

// Lava gradient — neighborhood registration density
function getNeighborhoodColor(count) {
  if (count === 0) return '#EEEDE9';
  if (count <= 2) return '#FFD4CC';
  if (count <= 5) return '#FF7A5C';
  if (count <= 10) return '#FF5F46';
  return '#FF3621';
}

// Muted navy — state registration density
function getStateColor(count) {
  if (count === 0) return '#E8ECF0';
  if (count <= 3) return '#C5D0DB';
  return '#8FA3B5';
}

// Fix grey tiles on direct page load — Leaflet needs a size recalc after mount
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Toggles states layer visibility based on zoom level
function ZoomWatcher({ statesRef }) {
  const updateVisibility = useCallback((zoom) => {
    if (!statesRef.current) return;
    const container = statesRef.current.getPane?.('overlayPane') || statesRef.current._map?.getPane('overlayPane');
    // Toggle each layer's opacity based on zoom
    statesRef.current.eachLayer((layer) => {
      if (zoom >= STATES_ZOOM_THRESHOLD) {
        layer.setStyle({ fillOpacity: 0, opacity: 0 });
      } else {
        layer.setStyle({ fillOpacity: 0.5, opacity: 0.6 });
      }
    });
  }, [statesRef]);

  useMapEvents({
    zoomend: (e) => updateVisibility(e.target.getZoom()),
    layeradd: () => {
      // Re-check after states layer is first added
      if (statesRef.current?._map) {
        updateVisibility(statesRef.current._map.getZoom());
      }
    },
  });

  return null;
}

function NYCMap({ registrations = [] }) {
  const [neighborhoodGeo, setNeighborhoodGeo] = useState(null);
  const [boroughGeo, setBoroughGeo] = useState(null);
  const [statesGeo, setStatesGeo] = useState(null);

  const neighborhoodRef = useRef(null);
  const statesRef = useRef(null);

  // Aggregate registrations → NTA polygon counts
  const ntaCounts = useMemo(() => {
    const counts = {};
    registrations.forEach((r) => {
      if (r.location_type === 'nyc' && r.neighborhood) {
        const ntaNames = neighborhoodToNtaMap[r.neighborhood];
        if (ntaNames) {
          ntaNames.forEach((nta) => {
            counts[nta] = (counts[nta] || 0) + 1;
          });
        }
      }
    });
    return counts;
  }, [registrations]);

  // Aggregate registrations → state counts (non-NYC only)
  const stateCounts = useMemo(() => {
    const counts = {};
    registrations.forEach((r) => {
      if (r.location_type !== 'nyc' && r.state) {
        counts[r.state] = (counts[r.state] || 0) + 1;
      }
    });
    return counts;
  }, [registrations]);

  // Load all three GeoJSON files
  useEffect(() => {
    fetch('/nyc_neighborhoods.geojson')
      .then((res) => res.json())
      .then(setNeighborhoodGeo)
      .catch((err) => console.error('Failed to load neighborhoods GeoJSON:', err));

    fetch('/nyc_boroughs.geojson')
      .then((res) => res.json())
      .then(setBoroughGeo)
      .catch((err) => console.error('Failed to load boroughs GeoJSON:', err));

    fetch('/surrounding_states.geojson')
      .then((res) => res.json())
      .then(setStatesGeo)
      .catch((err) => console.error('Failed to load states GeoJSON:', err));
  }, []);

  // Update neighborhood styles when registrations change
  useEffect(() => {
    if (neighborhoodRef.current) {
      neighborhoodRef.current.eachLayer((layer) => {
        const name = layer.feature.properties.name;
        const borough = layer.feature.properties.borough || '';
        const count = ntaCounts[name] || 0;
        const boroughLine = borough ? `<span style="color:#888;font-size:11px">${borough}</span><br/>` : '';
        layer.setStyle({
          fillColor: getNeighborhoodColor(count),
          fillOpacity: 0.7,
        });
        layer.setTooltipContent(
          `<strong>${name}</strong><br/>${boroughLine}${count} registration${count !== 1 ? 's' : ''}`
        );
      });
    }
  }, [ntaCounts]);

  // Update state styles when registrations change (only colors, preserve zoom-based visibility)
  useEffect(() => {
    if (statesRef.current) {
      const zoom = statesRef.current._map?.getZoom() || NYC_ZOOM;
      const visible = zoom < STATES_ZOOM_THRESHOLD;
      statesRef.current.eachLayer((layer) => {
        const name = layer.feature.properties.name;
        const count = stateCounts[name] || 0;
        layer.setStyle({
          fillColor: getStateColor(count),
          fillOpacity: visible ? 0.5 : 0,
          opacity: visible ? 0.6 : 0,
        });
        layer.setTooltipContent(
          `<strong>${name}</strong><br/>${count} registration${count !== 1 ? 's' : ''}`
        );
      });
    }
  }, [stateCounts]);

  // --- Layer 1 (bottom): Surrounding states ---
  // Starts hidden since default zoom (11) >= threshold (10)
  const stateStyle = (feature) => {
    const count = stateCounts[feature.properties.name] || 0;
    return {
      fillColor: getStateColor(count),
      weight: 1,
      opacity: 0,
      color: '#8FA3B5',
      fillOpacity: 0,
    };
  };

  const onEachState = (feature, layer) => {
    const name = feature.properties.name;
    const count = stateCounts[name] || 0;
    layer.bindTooltip(
      `<strong>${name}</strong><br/>${count} registration${count !== 1 ? 's' : ''}`,
      { sticky: true }
    );
    layer.on({
      mouseover: (e) => {
        const zoom = e.target._map?.getZoom() || NYC_ZOOM;
        if (zoom < STATES_ZOOM_THRESHOLD) {
          e.target.setStyle({ fillOpacity: 0.7, weight: 1.5 });
        }
      },
      mouseout: (e) => {
        const zoom = e.target._map?.getZoom() || NYC_ZOOM;
        if (zoom < STATES_ZOOM_THRESHOLD) {
          e.target.setStyle({ fillOpacity: 0.5, weight: 1 });
        }
      },
    });
  };

  // --- Layer 2 (middle): Neighborhood NTA polygons ---
  const neighborhoodStyle = (feature) => {
    const count = ntaCounts[feature.properties.name] || 0;
    return {
      fillColor: getNeighborhoodColor(count),
      weight: 0.8,
      opacity: 0.8,
      color: '#5A6E7A',
      fillOpacity: 0.7,
    };
  };

  const onEachNeighborhood = (feature, layer) => {
    const name = feature.properties.name;
    const borough = feature.properties.borough || '';
    const count = ntaCounts[name] || 0;
    const boroughLine = borough ? `<span style="color:#888;font-size:11px">${borough}</span><br/>` : '';
    layer.bindTooltip(
      `<strong>${name}</strong><br/>${boroughLine}${count} registration${count !== 1 ? 's' : ''}`,
      { sticky: true }
    );
    layer.on({
      mouseover: (e) => e.target.setStyle({ weight: 2, fillOpacity: 0.9 }),
      mouseout: (e) => e.target.setStyle({ weight: 0.8, fillOpacity: 0.7 }),
    });
  };

  // --- Layer 3 (top): Borough boundary outlines ---
  const boroughStyle = () => ({
    fillColor: 'transparent',
    fillOpacity: 0,
    weight: 2.5,
    opacity: 1,
    color: '#1B3139',
  });

  const onEachBorough = (_feature, layer) => {
    // Pure outline layer — no hover or tooltip interaction
    layer.options.interactive = false;
  };

  return (
    <div className="h-[300px] md:h-[450px] lg:h-[550px] w-full pb-12">
      <MapContainer
        center={NYC_CENTER}
        zoom={NYC_ZOOM}
        minZoom={7}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <InvalidateSizeOnMount />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomWatcher statesRef={statesRef} />

        {/* Layer 1: Surrounding states (bottom) */}
        {statesGeo && (
          <GeoJSON
            ref={statesRef}
            data={statesGeo}
            style={stateStyle}
            onEachFeature={onEachState}
          />
        )}

        {/* Layer 2: Neighborhood NTA polygons (middle) */}
        {neighborhoodGeo && (
          <GeoJSON
            ref={neighborhoodRef}
            data={neighborhoodGeo}
            style={neighborhoodStyle}
            onEachFeature={onEachNeighborhood}
          />
        )}

        {/* Layer 3: Borough outlines (top) */}
        {boroughGeo && (
          <GeoJSON
            data={boroughGeo}
            style={boroughStyle}
            onEachFeature={onEachBorough}
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="flex flex-col items-center mt-3 gap-1 text-xs text-gray-500">
        {/* Row 1: Neighborhoods */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="font-medium text-gray-600">Neighborhoods:</span>
          <div className="flex items-center">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1" style={{ backgroundColor: '#EEEDE9' }}></span>
            0
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1" style={{ backgroundColor: '#FFD4CC' }}></span>
            1-2
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1" style={{ backgroundColor: '#FF7A5C' }}></span>
            3-5
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1" style={{ backgroundColor: '#FF5F46' }}></span>
            6-10
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1" style={{ backgroundColor: '#FF3621' }}></span>
            10+
          </div>
        </div>
        {/* Row 2: Tri-State + Borough outlines */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="font-medium text-gray-600">Tri-State:</span>
          <div className="flex items-center">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1" style={{ backgroundColor: '#E8ECF0' }}></span>
            0
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1" style={{ backgroundColor: '#C5D0DB' }}></span>
            1-3
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3.5 h-3.5 rounded-sm mr-1" style={{ backgroundColor: '#8FA3B5' }}></span>
            4+
          </div>
          <div className="flex items-center ml-2">
            <span className="inline-block w-5 h-0 mr-1" style={{ borderTop: '2.5px solid #1B3139' }}></span>
            Borough
          </div>
        </div>
      </div>
    </div>
  );
}

export default NYCMap;
