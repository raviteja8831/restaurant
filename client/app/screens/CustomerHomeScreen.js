import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FilterModal from "../Modals/FilterModal";
import SearchModal from "../Modals/SearchModal";
// import MapView, { Marker } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export default function CustomerHomeScreen() {
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

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
      {/* <View style={styles.mapArea}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825, // your default lat
            longitude: -122.4324, // your default lng
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
            title="My Location"
            description="Here’s a marker!"
          />
        </MapView>
      </View> */}

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
  mapArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
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
});
