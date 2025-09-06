import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Appbar, Surface } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from './TabBarScreen';

export default function DashboardScreen({ onProfilePress }) {
  // Static data for demonstration
  const restaurantName = "Hotel Sai (3 Star)";
  const managerName = "Mohan";
  const today = "Wednesday";
  const date = "21.02.2025";
  const orders = 25;
  const tablesServed = 15;
  const customers = 30;
  const transactionAmt = "17,637";
  const reservedTables = 16;
  const nonReservedTables = 4;

  return (
    <><ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>


      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 0, marginBottom: 8 }}>
        <View>
          <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>Today</Text>
          <Text style={{ fontSize: 22, color: "#fff", fontWeight: "bold" }}>{today}</Text>
          <Text style={{ fontSize: 18, color: "#fff", marginBottom: 8 }}>{date}</Text>
          <Text style={{ fontSize: 16, color: "#fff", marginBottom: 8 }}>Hi {managerName}</Text>
        </View>
        <TouchableOpacity
          style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#d1c4e9", overflow: "hidden" }}
          onPress={onProfilePress}
        >
          <MaterialCommunityIcons name="account-circle" size={60} color="#7b6eea" />
        </TouchableOpacity>
      </View>

      {/* Custom Info Card with Buffet Icon and Toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 18, marginTop: 8, marginBottom: 12 }}>
        <Surface style={{ flex: 1.5, padding: 16, borderRadius: 16, backgroundColor: "#d1c4e9", elevation: 4, alignItems: "center" }}>
          <Text style={{ fontWeight: "bold", fontSize: 15, marginBottom: 8, textAlign: "center", color: "#222" }}>Current Info</Text>
          <View style={{ width: "100%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4, width: "100%" }}>
              <Text style={{ fontSize: 14, color: "#222", fontWeight: "500" }}>No of Orders:</Text>
              <Text style={{ fontSize: 14, color: "#7b6eea", fontWeight: "bold" }}>{orders}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4, width: "100%" }}>
              <Text style={{ fontSize: 14, color: "#222", fontWeight: "500" }}>No of Tables Served:</Text>
              <Text style={{ fontSize: 14, color: "#7b6eea", fontWeight: "bold" }}>{tablesServed}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4, width: "100%" }}>
              <Text style={{ fontSize: 14, color: "#222", fontWeight: "500" }}>No of Customer:</Text>
              <Text style={{ fontSize: 14, color: "#7b6eea", fontWeight: "bold" }}>{customers}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4, width: "100%" }}>
              <Text style={{ fontSize: 14, color: "#222", fontWeight: "500" }}>Transaction of Amt:</Text>
              <Text style={{ fontSize: 14, color: "#7b6eea", fontWeight: "bold" }}>{transactionAmt}</Text>
            </View>
          </View>
        </Surface>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginLeft: 8, marginTop: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#888', marginBottom: 2 }}>Buffet</Text>
          <MaterialCommunityIcons name="food-fork-drink" size={36} color="#444" style={{ marginTop: 4 }} />
          <MaterialCommunityIcons name="toggle-switch" size={32} color="#3ad1c6" style={{ marginTop: 8 }} />
        </View>
      </View>

      {/* Table Status Card */}
      <Surface style={{ marginHorizontal: 18, marginTop: 0, marginBottom: 12, padding: 16, borderRadius: 16, backgroundColor: "#d1c4e9", elevation: 4, alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", fontSize: 15, marginBottom: 8, textAlign: "center", color: "#222" }}>Table status</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: 13, color: "#222", textAlign: "center" }}>Reserved Tables</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#7b6eea", textAlign: "center" }}>{reservedTables}</Text>
          </View>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: 13, color: "#222", textAlign: "center" }}>Non Reserved Tables</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#7b6eea", textAlign: "center" }}>{nonReservedTables}</Text>
          </View>
        </View>
      </Surface>

      {/* Orders Chart */}
      <Surface style={{ marginHorizontal: 18, marginTop: 0, marginBottom: 16, padding: 16, borderRadius: 16, backgroundColor: "#ece9fa", elevation: 4, alignItems: "center", position: "relative" }}>
        <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, position: "relative" }}>
          <Text style={{ fontWeight: "bold", fontSize: 15, color: "#222" }}>Produce Sales</Text>
        </View>
        <LineChart
          data={{
            labels: [
              "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"
            ],
            datasets: [
              {
                data: [40, 70, 50, 50, 40, 30, 50, 70, 90],
                color: () => "#6c63b5",
                strokeWidth: 3,
              },
            ],
          }}
          width={Dimensions.get("window").width - 48}
          height={200}
          yAxisSuffix="k"
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(108, 99, 181, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
            propsForBackgroundLines: {
              stroke: "#e0e0e0",
              strokeDasharray: "4 4",
            },
            propsForLabels: {
              fontSize: 14,
              fontWeight: "bold",
            },
            propsForDots: {
              r: "6",
              strokeWidth: "3",
              stroke: "#fff",
              fill: "#6c63b5",
            },
          }}
          bezier
          style={{ borderRadius: 16, marginVertical: 8 }} />
      </Surface>

      {/* Income Graph */}
      <Surface style={{ marginHorizontal: 18, marginTop: 0, marginBottom: 16, padding: 16, borderRadius: 16, backgroundColor: "#ece9fa", elevation: 4, alignItems: "center", position: "relative" }}>
        <Text style={{ fontWeight: "bold", fontSize: 15, color: "#222" }}>Income Graph</Text>
        <LineChart
          data={{
            labels: [
              "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"
            ],
            datasets: [
              {
                data: [10, 20, 15, 30, 40, 50, 60, 55, 65],
                color: () => "#7b6eea",
                strokeWidth: 3,
              },
            ],
          }}
          width={Dimensions.get("window").width - 48}
          height={200}
          yAxisSuffix="k"
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(123, 110, 234, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
            propsForBackgroundLines: {
              stroke: "#e0e0e0",
              strokeDasharray: "4 4",
            },
            propsForLabels: {
              fontSize: 14,
              fontWeight: "bold",
            },
            propsForDots: {
              r: "6",
              strokeWidth: "3",
              stroke: "#fff",
              fill: "#7b6eea",
            },
          }}
          bezier
          style={{ borderRadius: 16, marginVertical: 8 }} />
      </Surface>
    </ScrollView>
    <TabBar></TabBar >
    </>
  );
}
