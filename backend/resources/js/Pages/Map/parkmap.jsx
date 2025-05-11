import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

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
  mapId: "f8b03cb54f9cde7", // Replace with your own Map ID
};

const ParkMap = () => {
  const [parks, setParks] = useState([]); // Empty list for now, use this if you're pulling data from API
  const [selectedPark, setSelectedPark] = useState(null);
  const [searchLocation, setSearchLocation] = useState(center);
  const [hoverLatLng, setHoverLatLng] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar open/close state
  const [selectedMapType, setSelectedMapType] = useState("roadmap"); // Default map type
  const [userLocation, setUserLocation] = useState(null); // Store user's geolocation
  const [directions, setDirections] = useState(null); // Store Directions
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for 360 image viewer
  const [selectedImage, setSelectedImage] = useState(null); // Store the selected image URL for modal
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/parks")
      .then((response) => setParks(response.data))
      .catch((error) => console.error("Error fetching park data:", error));

    // Get the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
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
    {
      id: 1,
      lat: 1.40180,
      lng: 110.31610,
      name: "E-Buggy",
      description: "Description of the E-Buggy.",
      picture: "/Pic/73607c33-b8f5-401f-8938-644eb4ca0ad5.jpg",
       // Park Icon for Garden-related places
    },
    {
      id: 7,
      lat: 1.40005,
      lng: 110.32450,
      name: "Sarawak Forestry Corporation",
      description: "Description of the Sarawak Forestry Corporation.",
      picture: "/Pic/2b725655-d3fd-40d4-b742-5ce5b2b7e57d.jpg",
       // Park Icon for Garden-related places
    },
    {
      id: 8,
      lat: 1.39973,
      lng: 110.32397,
      name: "Wild Orchid Garden",
      description: "Description of the Wild Orchid Garden.",
      picture: "Pic/a15246f0-b630-488e-8367-8b417bdc736f.jpg", // Park Icon for Garden-related places
    },
    {
      id: 9,
      lat: 1.40179,
      lng: 110.31453,
      name: "Nature Reserve",
      description: "Description of the Nature Reserve.",
      picture: "Pic/e908ac3d-e5d4-4d3f-a876-a46dbf73d731.jpg", // Park Icon for Garden-related places
    },
  ];
  

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen); // Toggle the sidebar open/close state
  };

  // Function to handle map type change
  const handleMapTypeChange = (type) => {
    setSelectedMapType(type); // Set map type to selected type (roadmap, satellite, terrain)
  };

  // Function to handle Directions
  const handleGetDirections = () => {
    if (userLocation && selectedPark) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: { lat: selectedPark.lat, lng: selectedPark.lng },
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error("Error fetching directions: ", status);
          }
        }
      );
    }
  };

  const handleExitDirections = () => {
    setDirections(null); // Clear directions when exiting
  };

  const handleMarkerClick = (marker) => {
    setSelectedPark(marker);
    setSidebarOpen(true);

    // Move the map to the clicked marker
    if (mapRef.current) {
      const map = mapRef.current.state.map;
      map.panTo({ lat: marker.lat, lng: marker.lng });
    }
  };

  const recenterToUserLocation = () => {
    if (userLocation && mapRef.current) {
      const map = mapRef.current.state.map;
      map.panTo(userLocation);
      map.setZoom(17); // Set zoom level to 17 when recentering
    }
  };

  // const openModal = (imageSrc) => {
  //   setSelectedImage(imageSrc); // Set the selected image to be displayed in the modal
  //   setIsModalOpen(true); // Open the modal
  // };

  // // Function to close the modal
  // const closeModal = () => {
  //   setIsModalOpen(false); // Close the modal
  // };


  return (
    <AuthenticatedLayout
        header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                Map
            </h2>
        }
    >
      <div style={{ display: "flex", position: "relative" }}>
        {/* Google Map */}
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places", "directions"]}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={searchLocation}
            zoom={17}
            options={options}
            onMouseMove={handleMouseMove}
            mapTypeId={selectedMapType}
            ref={mapRef}
          >
            {/* Markers */}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                icon={marker.icon}
                onClick={() => {
                  setSelectedPark(marker);
                  setSidebarOpen(true);
                  handleMarkerClick(marker);
                }}
                
              />
            ))}

            {/* Directions Renderer */}
            {directions && (
              <DirectionsRenderer directions={directions} />
            )}
          </GoogleMap>
        </LoadScript>

        {/* Sidebar */}
        {sidebarOpen && selectedPark && (
          <div
            style={{
              position: "fixed",
              left: sidebarOpen ? "0" : "-400px",
              top: 0,
              width: "400px",
              height: "100%",
              backgroundColor: "#1a1a1a",
              color: "white",
              padding: "20px",
              overflowY: "auto",
              boxShadow: "2px 0 5px rgba(0, 0, 0, 0.5)",
              transition: "left 0.3s ease",
              zIndex: 2,
            }}
          >
            <button
              onClick={toggleSidebar}
              style={{
                position: "absolute",
                top: "25px",
                right: "20px",
                backgroundColor: "solid #444",
                color: "white",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              X
            </button>
            <h3 style={{ marginBottom: "10px", fontSize: "22px", borderBottom: "1px solid #444", paddingBottom: "5px" }} >
              {selectedPark.name}
            </h3>
            <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>{selectedPark.description}</p>

            {/* 360 Image Container for the selected marker */}
            <div style={{ width: "100%", height: "250px", backgroundColor: "#333", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "8px", marginBottom: "20px" }}>
              <img
                src={selectedPark.picture} // Use the unique 360-degree image for the selected marker
                alt="360-degree view"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
              />
            </div>
            {/* Button Container */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        {/* Get Directions Button */}
        <button
          onClick={handleGetDirections}
          style={{
            width: "50px", // Make the button square
            height: "50px", // Make the button square
            backgroundColor: "#007bff", // Button background color
            color: "white",
            border: "none",
            borderRadius: "8px", // Rounded corners
            cursor: "pointer",
            display: "flex", // Center the icon inside the button
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="https://img.icons8.com/ios/452/route.png" // URL for route icon (use your own icon if needed)
            alt="Route Icon"
            style={{
              width: "24px", // Size of the route icon inside the button
              height: "24px", // Size of the route icon inside the button
            }}
          />
        </button>
        {/* vacant button */}
        <button
          onClick={handleGetDirections}
          style={{
            width: "50px", // Make the button square
            height: "50px", // Make the button square
            backgroundColor: "#ebb00f", // Button background color
            color: "white",
            border: "none",
            borderRadius: "8px", // Rounded corners
            cursor: "pointer",
            display: "flex", // Center the icon inside the button
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="https://img.icons8.com/ios/452/forest.png" // URL for route icon (use your own icon if needed)
            alt="Route Icon"
            style={{
              width: "24px", // Size of the route icon inside the button
              height: "24px", // Size of the route icon inside the button
            }}
          />
        </button>
        {/* "!" Button linking to Sarawak Forestry Website */}
        <a
          href="https://sarawakforestry.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            left: "180px",
            width: "50px", // Make the button square
            height: "50px", // Make the button square
            backgroundColor: "#5ced73", // Button background color (red)
            color: "white",
            border: "none",
            borderRadius: "8px", // Rounded corners
            cursor: "pointer",
            display: "flex", // Center the icon inside the button
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none", // Remove underline from the link
          }}
        >
          <span
            style={{
              fontSize: "24px", // Size of the "!" icon
              fontWeight: "bold", // Make the "!" icon bold
            }}
          >
            !
          </span>
        </a>
      </div>
      {/* History Section */}
      <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#2a2a2a", borderRadius: "8px" }}>
        <h4 style={{ color: "white", marginBottom: "10px" }}>History</h4>
        <p style={{ color: "#ccc", fontSize: "14px" }}>
          This is the history section where you can add some information related to this location. For example, you can describe the background of the park or any important events related to this place.
        </p>
        {/* Add more content or text as needed */}
      </div>
      
    </div>
        )}
        {/* Search Bar */}
        <div style={{ position: "absolute", top: "10px", left: sidebarOpen ? "405px" : "10px", zIndex: 1, transition: "left 0.3s ease" }}>
          
            <input 
              ref={autocompleteRef}
              type="text"
              placeholder="Search for a location..."
              style={{
                width: "300px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          
        </div>
      
        {/* Map View Toggle */}
        <div
          style={{
            position: "absolute",
            bottom: "25px",
            left: sidebarOpen ? "405px" : "10px", // Adjust position based on sidebar state
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
            zIndex: 1,
            transition: "left 0.3s ease",
          }}
        >

          {/* Recenter Button */}
        <div
          style={{
            position: "fixed",
            bottom: "70px",
            right: "14px",
            zIndex: 1,
          }}
        >
          <button
            onClick={recenterToUserLocation}
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            O
          </button>
        </div>

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
  {/* Exit Directions Button */}
  {directions && (
    <button
      onClick={handleExitDirections}
      style={{
        position: "absolute",
        bottom: "10px",
        padding: "10px 20px",
        left: "50%",
        marginTop: "20px",
        backgroundColor: "#ff4d4d", // Red color for the exit button
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Exit Directions
    </button>
  )}
        
      </div>
    </AuthenticatedLayout>
  );
};

export default ParkMap;
