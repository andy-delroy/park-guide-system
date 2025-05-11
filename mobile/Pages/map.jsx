import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

const DESTINATIONS = {
  NATURE_RESERVE: {
    title: 'Nature Reserve',
    coords: { latitude: 1.401994833233966, longitude: 110.31443883621625 },
  },
  BUGGY_SERVICE: {
    title: 'Buggy Service',
    coords: { latitude: 1.399967179410839, longitude: 110.32461550924961 },
  },
  RETURN_BUGGY_SERVICE: {
    title: 'Return Buggy Service',
    coords: { latitude: 1.4017268332362651, longitude: 110.3161111950124 },
  },
  ORCHID_GARDEN: {
    title: 'Orchid Garden',
    coords: { latitude: 1.3997638641192718, longitude: 110.32396317404869 },
  },
  PARK_ENTRANCE: {
    title: 'Park Entrance',
    coords: { latitude: 1.4001975665811914, longitude: 110.32460753499603 },
  },
  SFC_OFFICE: {
    title: 'SFC Office',
    coords: { latitude: 1.3998428181643348, longitude: 110.32435873823738 },
  },
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyArjGYJEA7XHnAlgk4TkAr5P_kRdm_QMAo'; // Replace with your key

const Map = () => {
  const [location, setLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [weatherData, setWeatherData] = useState({});

  const fetchGoogleWeather = async (lat, lon) => {
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${lat}&location.longitude=${lon}`;

    try {
      const res = await fetch(url);
      const json = await res.json();

      // console.log('Google Weather Response:', JSON.stringify(json, null, 2));

      if (json.weatherCondition && json.temperature) {
        return {
          description: json.weatherCondition.description.text,
          temperature: json.temperature.degrees,
          feelsLike: json.feelsLikeTemperature?.degrees,
          rainChance: json.precipitation?.probability?.percent,
          humidity: json.relativeHumidity,
        };
      }

      return null;
    } catch (err) {
      console.error('Google Weather fetch failed:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadWeather = async () => {
      const data = {};

      for (const [key, { coords }] of Object.entries(DESTINATIONS)) {
        const weather = await fetchGoogleWeather(coords.latitude, coords.longitude);
        if (weather) {
          data[key] = weather;
        }
      }

      setWeatherData(data);
    };

    loadWeather();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  const fetchRoute = async (destinationCoords) => {
    if (!location) {
      Alert.alert('Location not available', 'Please wait for current location.');
      return;
    }

    setLoadingRoute(true);
    const origin = `${location.latitude},${location.longitude}`;
    const destination = `${destinationCoords.latitude},${destinationCoords.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoordinates = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(routeCoordinates);
      } else {
        Alert.alert('Route not found', 'No directions data received.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch directions.');
    } finally {
      setLoadingRoute(false);
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: DESTINATIONS.NATURE_RESERVE.coords.latitude,
          longitude: DESTINATIONS.NATURE_RESERVE.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* User's current location */}
        <Marker coordinate={location} title="You" pinColor="blue" />

        {/* Dynamic markers for all destinations */}
        {Object.entries(DESTINATIONS).map(([key, { title, coords }]) => {
          const weather = weatherData[key];
          const description = weather
            ? `${weather.description}\n${weather.temperature}°C (feels like ${weather.feelsLike}°C)\n💧${weather.humidity}% humidity | 🌧️ ${weather.rainChance}% rain`
            : 'Loading weather...';

          return (
            <Marker
              key={key}
              coordinate={coords}
              onPress={() => fetchRoute(coords)}
            >
              <Callout tooltip={false}>
                <View style={{ padding: 8, maxWidth: 250 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{title}</Text>
                  <Text>{weather
                    ? `${weather.description}\n${weather.temperature}°C (feels like ${weather.feelsLike}°C)\n💧${weather.humidity}% humidity | 🌧️ ${weather.rainChance}% rain`
                    : 'Loading weather...'}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}


        {/* Display route if available */}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#00693D" />
        )}
      </MapView>

      {loadingRoute && (
        <View style={styles.routeLoadingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  routeLoadingOverlay: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 10,
  },
});

export default Map;
