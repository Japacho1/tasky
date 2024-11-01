import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Optional: Custom marker icon for better visibility (or you can use the default one)
const markerIcon = new L.Icon({
  iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
  iconSize: [38, 95],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76],
  shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
  shadowSize: [50, 64],
  shadowAnchor: [4, 62],
});

const Map = () => {
  // State to store the user's current position
  const [position, setPosition] = useState(null);

  // Effect to get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // On success, set the position to user's current location
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user's location:", error);
          // Set a default position in case of error or denial of geolocation
          setPosition({ lat: 51.505, lng: -0.09 }); // Default position (London)
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
      // Set a default position if geolocation is not supported
      setPosition({ lat: 51.505, lng: -0.09 });
    }
  }, []);

  function DraggableMarker() {
    const [markerPosition, setMarkerPosition] = useState(position);
    const markerRef = React.useRef(null);

    useEffect(() => {
      // Update marker position when user's location is obtained
      if (position) {
        setMarkerPosition(position);
      }
    }, [position]);

    const eventHandlers = React.useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            setMarkerPosition(marker.getLatLng());
            setPosition(marker.getLatLng());
          }
        },
      }),
      []
    );

    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);
        setPosition(e.latlng);
      },
    });

    return markerPosition ? (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={markerPosition}
        ref={markerRef}
        icon={markerIcon} // Optional: Use custom icon
      >
        <Popup minWidth={90}>
          <span>Drag to adjust your location, or click on the map to reposition the marker.</span>
        </Popup>
      </Marker>
    ) : null;
  }

  return position ? (
    <MapContainer
      center={position} // Center the map on user's current location
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      {/* OpenStreetMap Tile Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Draggable marker */}
      <DraggableMarker />
    </MapContainer>
  ) : (
    <div>Loading your location...</div> // Show a loading message until the position is obtained
  );
};

export default Map;
