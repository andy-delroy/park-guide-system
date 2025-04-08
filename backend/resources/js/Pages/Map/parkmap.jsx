import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Autocomplete,
} from "@react-google-maps/api";
import axios from "axios";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = { lat: 1.40164, lng: 110.31443 }; // Default Park Location

const options = {
  minZoom: 17,
  maxZoom: 18,
  streetViewControl: false,
  mapTypeControl: false,
};

const ParkMap = () => {
  const [parks, setParks] = useState([]); // Empty list for now, use this if you're pulling data from API
  const [selectedPark, setSelectedPark] = useState(null);
  const [searchLocation, setSearchLocation] = useState(center);
  const [hoverLatLng, setHoverLatLng] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar open/close state
  const [selectedMapType, setSelectedMapType] = useState("roadmap"); // Default map type
  const autocompleteRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/parks")
      .then((response) => setParks(response.data))
      .catch((error) => console.error("Error fetching park data:", error));
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      setSearchLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const handleMouseMove = (event) => {
    const latLng = event.latLng;
    setHoverLatLng({
      lat: latLng.lat(),
      lng: latLng.lng(),
    });
  };

  const markers = [
    { id: 1, lat: 1.40180, lng: 110.31610, name: "E-Buggy", description: "E-Buggy rental station." },
    { id: 2, lat: 1.4015, lng: 110.3185, name: "Marker 2", description: "Another interesting spot." },
    { id: 3, lat: 1.40022, lng: 110.31586, name: "Orangutan Feeding", description: "Orangutan feeding area." },
    { id: 4, lat: 1.39954, lng: 110.32066, name: "Sarawak Arobetum", description: "Plant species observation." },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen); // Toggle the sidebar open/close state
  };

  // Function to handle map type change
  const handleMapTypeChange = (type) => {
    setSelectedMapType(type); // Set map type to selected type (roadmap, satellite, terrain)
  };

  return (
    <div style={{ display: "flex", position: "relative" }}>
      {/* Google Map */}
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={searchLocation}
          zoom={17}
          options={options}
          onMouseMove={handleMouseMove}
          mapTypeId={selectedMapType}
        >
          {/* Markers */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => {
                setSelectedPark(marker);
                setSidebarOpen(true);
              }}
            />
          ))}

          {/* InfoWindow */}
          {selectedPark && (
            <InfoWindow
              position={{ lat: selectedPark.lat, lng: selectedPark.lng }}
              onCloseClick={() => setSelectedPark(null)}
            >
              <div style={{ textAlign: "center" }}>
                <h3 style={{ margin: "0 0 5px", fontSize: "18px", color: "#333" }}>{selectedPark.name}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>{selectedPark.description}</p>
              </div>
            </InfoWindow>
          )}

          {/* Hover Coordinates */}
          {hoverLatLng && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                zIndex: 1,
              }}
            >
              <strong>Lat:</strong> {hoverLatLng.lat.toFixed(5)} | <strong>Lng:</strong> {hoverLatLng.lng.toFixed(5)}
            </div>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Sidebar */}
      {sidebarOpen && selectedPark && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "300px",
            height: "100%",
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: "20px",
            overflowY: "auto",
            boxShadow: "2px 0 5px rgba(0, 0, 0, 0.5)",
            transition: "transform 0.3s ease",
          }}
        >
          <button
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "transparent",
              color: "white",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✖
          </button>
          <h3 style={{ marginBottom: "10px", fontSize: "22px", borderBottom: "1px solid #444", paddingBottom: "5px" }} >
            {selectedPark.name}
          </h3>
          <p style={{ fontSize: "16px", lineHeight: "1.5" }}>{selectedPark.description}</p>
        </div>
      )}

      {/* Map View Toggle */}
      <div
        style={{
          position: "absolute",
          bottom: "25px",
          left: sidebarOpen ? "310px" : "10px", // Adjust position based on sidebar state
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
          zIndex: 1,
          transition: "left 0.3s ease", // Smooth transition for position change
        }}
      >
        <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "#333" }}>Map View</h3>
        <button
          onClick={() => handleMapTypeChange("roadmap")}
          style={{
            marginRight: "10px",
            padding: "8px 12px",
            backgroundColor: selectedMapType === "roadmap" ? "#007bff" : "#f0f0f0",
            color: selectedMapType === "roadmap" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Roadmap
        </button>
        <button
          onClick={() => handleMapTypeChange("satellite")}
          style={{
            padding: "8px 12px",
            backgroundColor: selectedMapType === "satellite" ? "#007bff" : "#f0f0f0",
            color: selectedMapType === "satellite" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Satellite
        </button>
      </div>
    </div>
  );
};

export default ParkMap;