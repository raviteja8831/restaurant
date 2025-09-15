import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
  TextInput,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FilterModal from "../Modals/FilterModal";
import SearchModal from "../Modals/SearchModal";
import { useUserData } from "../services/getUserData";
import axiosInstance from '../api/axiosService';
import { RESTAURANT_API } from '../constants/restaurantApi';
import * as Location from 'expo-location';

// For web
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api';

let MapView, NativeMarker;
if (Platform.OS === 'web') {
  // Use Google Maps for web
  MapView = GoogleMap;
  NativeMarker = Marker;
} else {
  try {
    const maps = require('expo-maps');
    MapView = maps.MapView;
    NativeMarker = maps.Marker;
  } catch (e) {
    MapView = null;
    NativeMarker = null;
  }
}

const { width, height } = Dimensions.get("window");
const mapContainerStyle = { width: '100%', height: '100%' };
const customMarkerIcon = {
  url: 'https://img.icons8.com/ios-filled/50/6B4EFF/marker.png', // Example marker icon
  scaledSize: { width: 40, height: 40 },
};

// Set Hyderabad as map center for web
const HYDERABAD_CENTER = { lat: 17.3850, lng: 78.4867 };

export default function CustomerHomeScreen() {
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState({ latitude: 37.78825, longitude: -122.4324 });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filter, setFilter] = useState('');
  const { isLoaded } = Platform.OS === 'web'
    ? useJsApiLoader({
        googleMapsApiKey: 'AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ', // Replace with your key
      })
    : { isLoaded: true };

  const router = useRouter();
  const { userId, loading, error } = useUserData();

  useEffect(() => {
    async function fetchUserLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Permission denied, use default location
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchUserLocation();
  }, []);

  // Remove API fetch, use only mock Hyderabad restaurants
  useEffect(() => {
    setRestaurants([
      { id: 1, name: 'Paradise Biryani', latitude: 17.4375, longitude: 78.4456, cuisine: 'Biryani' },
      { id: 2, name: 'Bawarchi', latitude: 17.4065, longitude: 78.4891, cuisine: 'Indian' },
      { id: 3, name: 'Chutneys', latitude: 17.4255, longitude: 78.4500, cuisine: 'South Indian' },
      { id: 4, name: 'Shah Ghouse', latitude: 17.3840, longitude: 78.4569, cuisine: 'Mughlai' },
      { id: 5, name: 'Cafe Bahar', latitude: 17.3926, longitude: 78.4738, cuisine: 'Biryani' },
    ]);
  }, []);

  const handleFilterPress = () => {
    setShowFilter(!showFilter);
  };

  const handleSearchPress = () => {
    setShowSearch(!showSearch);
  };

  const handleFilterSelect = (option) => {
    console.log("Filter option selected:", option.name);
    // You can add your filter logic here
  };

  const handleSearch = (searchTerm) => {
    console.log("Search term:", searchTerm);
    // You can add your search logic here
  };

  const handlePersonTabPress = () => {
    router.push("/user-profile");
  };

  const handleScanPress = () => {
    router.push("/qr-scanner");
  };

  const handleRestaurantPress = (restaurant) => {
    setSelectedRestaurant(restaurant);
    router.push({ pathname: '/restaurant-reviews', params: { restaurantId: restaurant.id } });
  };

  // Filter logic
  const filteredRestaurants = filter
    ? restaurants.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()))
    : restaurants;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error loading user data. Please try again.</Text>
      </View>
    );
  }

  if (!MapView) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>
          Map functionality is not available on this platform or build.
        </Text>
        <Text>
          Please use a custom dev client or EAS Build for full map support.
        </Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    if (!isLoaded) {
      return <Text>Loading map...</Text>;
    }
    return (
      <View style={{ flex: 1 }}>
        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TextInput
            style={styles.filterInput}
            placeholder="Filter restaurants..."
            value={filter}
            onChangeText={setFilter}
          />
        </View>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={HYDERABAD_CENTER}
          zoom={13}
        >
          {/* User marker */}
          <Marker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            label="You"
            icon={customMarkerIcon}
          />
          {/* Restaurant markers */}
          {filteredRestaurants.map(r => (
            <Marker
              key={r.id}
              position={{ lat: r.latitude, lng: r.longitude }}
              label={r.name}
              icon={customMarkerIcon}
              onClick={() => setSelectedRestaurant(r)}
              opacity={selectedRestaurant && selectedRestaurant.id === r.id ? 1 : 0.7}
            >
              {selectedRestaurant && selectedRestaurant.id === r.id && (
                <InfoWindow position={{ lat: r.latitude, lng: r.longitude }} onCloseClick={() => setSelectedRestaurant(null)}>
                  <div>
                    <h4>{r.name}</h4>
                    <p>{r.cuisine}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navBtn}>
            <Text style={styles.navIcon}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => {
            if (selectedRestaurant) {
              // Navigate to QR scanner for selected restaurant
              router.push({ pathname: '/qr-scanner', params: { restaurantId: selectedRestaurant.id } });
            }
          }}>
            <Text style={styles.navIcon}>🔳</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Text style={styles.navIcon}>🧭</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.gpsIndicator}
          onPress={handleFilterPress}
        >
          <Image
            source={require("../../assets/images/filter-image.png")}
            style={styles.filterImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <MaterialIcons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Map Area (placeholder for now) */}
      <View style={styles.mapArea}>
        <Text style={styles.mapText}>Map will go here</Text>
      </View>
      <View style={styles.mapArea}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* User marker */}
          <NativeMarker
            coordinate={userLocation}
            title="You"
            pinColor="#6B4EFF"
          />
          {/* Restaurant markers */}
          {filteredRestaurants.map(r => (
            <NativeMarker
              key={r.id}
              coordinate={{ latitude: r.latitude, longitude: r.longitude }}
              title={r.name}
              description={r.cuisine}
              pinColor={selectedRestaurant && selectedRestaurant.id === r.id ? '#6B4EFF' : '#43a047'}
              onPress={() => setSelectedRestaurant(r)}
            />
          ))}
        </MapView>
      </View> 

      {/* Filter Component */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onFilterSelect={handleFilterSelect}
      />

      {/* Search Modal */}
      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onSearch={handleSearch}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePersonTabPress}
        >
          <MaterialIcons name="person" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.scanButton]}
          onPress={handleScanPress}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <MaterialIcons name="navigation" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapArea: {
    flex: 1,
    height: 300, // or whatever height you want
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  topControls: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  gpsIndicator: {
    // backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    /*   shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, */
  },
  filterImage: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  searchButton: {
    // backgroundColor: "white",
    borderRadius: 25,
    padding: 12,
    /*   shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, */
  },

  mapText: {
    fontSize: 18,
    color: "#666",
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    backgroundColor: "#BBBAEF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  scanButton: {
    padding: 20,
    transform: [{ scale: 1.1 }],
  },
  filterBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterInput: {
    fontSize: 16,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f7f7ff',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 78, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 24,
  },
  navBtn: {
    backgroundColor: '#eae6ff',
    borderRadius: 18,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  navIcon: {
    fontSize: 28,
    color: '#6B4EFF',
    fontWeight: 'bold',
  },
});
