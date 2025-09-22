
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FilterModal from "../Modals/FilterModal";
import SearchModal from "../Modals/SearchModal";
import * as Location from 'expo-location';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { getAllRestaurants } from '../api/restaurantApi';


function CustomerHomeScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState({ latitude: 17.4375, longitude: 78.4456 });
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  // Only for web: load Google Maps API
  const { isLoaded } = Platform.OS === 'web'
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ? useJsApiLoader({ googleMapsApiKey: 'AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ' })
    : { isLoaded: true };

  // Get user location and fetch restaurants on mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (_e) {
        // Use default location
      }
      try {
        const data = await getAllRestaurants();
        setRestaurants(data);
      } catch (_e) {
        setRestaurants([]);
      }
      setLoading(false);
    })();
  }, []);

  // Filtering logic: Only include restaurants with valid lat/lng
  const filteredRestaurants = restaurants.filter(r =>
    typeof r.latitude === 'number' && typeof r.longitude === 'number' && !isNaN(r.latitude) && !isNaN(r.longitude)
  );
  // Handlers
  const handleFilterPress = () => setShowFilter(true);
  const handleSearchPress = () => setShowSearch(true);
  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setShowFilter(false);
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSearch(false);
  };
 
  const handlePersonTabPress = () => router.push('/user-profile');
  const handleScanPress = () => router.push('/qr-scanner');

  // Platform-specific map rendering
  let mapContent = null;
  if (Platform.OS === 'web') {
    if (!isLoaded) {
      mapContent = <Text>Loading map...</Text>;
    } else {
      mapContent = (
        <GoogleMap
          mapContainerStyle={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, borderRadius: 0, overflow: 'hidden' }}
          center={{ lat: userLocation.latitude, lng: userLocation.longitude }}
          zoom={13}
        >
          {/* User marker */}
          <Marker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            label="You"
          />
          {/* Restaurant markers */}
          {filteredRestaurants.map(r => (
            <Marker
              key={r.id}
              position={{ lat: r.latitude, lng: r.longitude }}
              label={r.name}
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
      );
    }
  } else {
    let MapView, NativeMarker;
    try {
      const maps = require('expo-maps');
      MapView = maps.MapView;
      NativeMarker = maps.Marker;
    } catch (_e) {
      MapView = null;
      NativeMarker = null;
    }
    mapContent = MapView ? (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <NativeMarker
          coordinate={userLocation}
          title="You"
          pinColor="#6B4EFF"
        />
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
    ) : (
      <Text style={styles.mapText}>Map not available</Text>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

    return (
      <View style={Platform.OS === 'web' ? styles.fullScreenWeb : styles.container}>
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

        {/* Map Area */}
        <View style={styles.mapWebContainer}>
          {mapContent}
        </View>



        {/* Filter Modal */}
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
  restaurantListContainer: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 10,
    zIndex: 2,
    maxHeight: 260,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  restaurantListItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
  },
  noRestaurantsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    paddingVertical: 12,
  },
  mapWebContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
  },
  fullScreenWeb: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    backgroundColor: '#fff',
    zIndex: 0,
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

export default CustomerHomeScreen;
   
