import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { buffetsimescreenstyles } from "./styles/responsive";
import { router, useLocalSearchParams } from "expo-router";
// import { buffetData } from "./Mock/CustomerHome";
import { useEffect } from "react";
import { createBuffetOrder } from "./api/buffetOrder";
import { getRestaurantById } from "./api/restaurantApi";
const BuffetTimeScreen = () => {
  const [persons, setPersons] = React.useState(0);
  const [currentBuffet, setcurrentBuffet] = React.useState(0);

  const params = useLocalSearchParams();
  // const currentBuffet = buffetData[0];
  const handleBack = () => {
    router.push({
      pathname: "/menu-list",
      params: {
        hotelName: params.hotelName,
        hotelId: params.hotelId,
        ishotel: params.ishotel,
      },
    });
  };
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        if (params.hotelId) {
          const data = await getRestaurantById(params.hotelId);
          console.log("Fetched restaurant data:", data);
          setcurrentBuffet(data);
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        // Alert.alert("Error", "Failed to load restaurant details");
      }
    };

    fetchRestaurantData();
  }, [params.hotelId]);
  const handleCreateBuffetOrder = async () => {
    // Logic to create buffet order and navigate to payment
    try {
      var obj = {
        userId: params.userId || 1,
        restaurantId: params.hotelId || 1,
        persons: persons,
      };
      const data = await createBuffetOrder(obj);
    } catch (error) {
      console.error("Error creating buffet order:", error);
      // Alert.alert("Error", "Failed to create buffet order");
    }
  };

  return (
    <SafeAreaView style={buffetsimescreenstyles.container}>
      <TouchableOpacity
        style={buffetsimescreenstyles.backButton}
        onPress={handleBack}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={buffetsimescreenstyles.scrollContainer}
      >
        {/* Header */}

        <Text style={buffetsimescreenstyles.header}>Buffet Time</Text>

        {/* Clock Image */}
        <View style={buffetsimescreenstyles.centerContent}>
          <Image
            source={require("../assets/images/hotel-buffet-time.png")} // replace with your clock image
            style={buffetsimescreenstyles.clock}
            resizeMode="contain"
          />
        </View>

        {/* Buffet Table Image */}
        <Image
          source={require("../assets/images/hotel-buffet-table.png")} // replace with your buffet image
          style={buffetsimescreenstyles.buffet}
          resizeMode="contain"
        />

        {/* Buffet Info */}
        <View style={buffetsimescreenstyles.buffetInfo}>
          <Text style={buffetsimescreenstyles.buffetTitle}>
            {/* {currentBuffet.type} */}
            Available Buffet Items
          </Text>
          <Text style={buffetsimescreenstyles.personsLabel}>
            No. of Persons
          </Text>
          <View style={buffetsimescreenstyles.personsInputContainer}>
            <TouchableOpacity
              style={buffetsimescreenstyles.personButton}
              onPress={() => setPersons(Math.max(0, persons - 1))}
            >
              <Text style={buffetsimescreenstyles.personButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={buffetsimescreenstyles.personsInput}
              value={persons.toString()}
              keyboardType="numeric"
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setPersons(Math.max(0, value));
              }}
            />
            <TouchableOpacity
              style={buffetsimescreenstyles.personButton}
              onPress={() => setPersons(persons + 1)}
            >
              <Text style={buffetsimescreenstyles.personButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={buffetsimescreenstyles.buffetItems}>
            {currentBuffet.buffetitems}
          </Text>
        </View>

        {/* Price */}
        <Text style={buffetsimescreenstyles.price}>
          Buffet Price Per Person {currentBuffet.buffetPrice} Rs
        </Text>

        {/* Total Amount and Pay Button */}
        <View style={buffetsimescreenstyles.actionContainer}>
          <View style={buffetsimescreenstyles.totalContainer}>
            <Text style={buffetsimescreenstyles.totalLabel}>Total Amount:</Text>
            <Text style={buffetsimescreenstyles.totalAmount}>
              Rs {(currentBuffet.buffetPrice || 0) * persons}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              buffetsimescreenstyles.payButton,
              persons === 0 && buffetsimescreenstyles.payButtonDisabled,
            ]}
            onPress={handleCreateBuffetOrder}
            disabled={persons === 0}
          >
            <Text style={buffetsimescreenstyles.payText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuffetTimeScreen;
