import React from "react";
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { useAlert } from "../services/alertService";
import * as ImagePicker from "expo-image-picker";
import { registerManager } from "../api/managerApi";
import { showApiError } from "../services/messagingService";
import FormService from "../components/formService";
import { uploadImage } from "../api/imageApi";



// Set a default Google address
const DEFAULT_ADDRESS = "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA";


export default function ManagerRegisterScreen() {
  const [address] = React.useState(DEFAULT_ADDRESS);
  const router = useRouter();
  const alert = useAlert();
  const [step, setStep] = React.useState(1);
  const [tableService, setTableService] = React.useState(false);
  const [selfService, setSelfService] = React.useState(false);
  const [pureVeg, setPureVeg] = React.useState(false);
  const [nonVeg, setNonVeg] = React.useState(false);
  const [enableBuffet, setEnableBuffet] = React.useState(false);
  const [enableBoth, setEnableBoth] = React.useState(false);
  const [ambianceImage, setAmbianceImage] = React.useState(null);
  // const [logo, setLogo] = React.useState(null); // Removed unused variable
  // Remove parent error state for form steps
  const [loading, setLoading] = React.useState(false);
  // const [error, setError] = React.useState(""); // Removed unused variable
const formConfig = [
  {
    label: "First Name",
    name: "firstname",
    type: "text",
  },
  {
    label: "Last Name",
    name: "lastname",
    type: "text",
  },
  {
    label: "Phone",
    name: "phone",
    type: "text",
    keyboardType: "phone-pad",
  },
  {
    label: "Restaurant Name",
    name: "name",
    type: "text",
  },
  {
    label: "Restaurant Address",
    name: "restaurantAddress",
    type: "textarea",
    value: address,
    multiline: true,
  },
];

  // Single form state for all fields
  const [form, setFormState] = React.useState({
    firstname: "",
    lastname: "",
    phone: "",
    name: "",
    restaurantAddress: DEFAULT_ADDRESS,
  });


  // Custom setForm to keep restaurantAddress equal to restaurantName
  const setForm = (updater) => {
    setFormState((prev) => {
      let next = typeof updater === "function" ? updater(prev) : updater;
      // If restaurantName is updated, set restaurantAddress to same value
      if (next.name !== undefined) {
        next = {
          ...next,
          restaurantAddress: next.restaurantAddress,
        };
      }
      return next;
    });
  };

  const handleNext = () => {
    setStep(2);
  };

// useEffect(() => {
//     (async () => {
//       // 1. Request location permission
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission to access location was denied');
//         setAddress('Location permission denied');
//         return;
//       }
//        // 2. Get current position
//       try {
//         let location = await Location.getCurrentPositionAsync({});
//         const { latitude, longitude } = location.coords;

//         // 3. Perform reverse geocoding
//         let json = await Geocoder.from(latitude, longitude);

//         if (json.results && json.results.length > 0) {
//           const formattedAddress = json.results[0].formatted_address;
//           setAddress(formattedAddress);
//         } else {
//           setAddress('Address not found');
//         }

//       } catch (error) {
//         console.error(error);
//         setAddress('Error fetching location or address');
//       }
//     })();
//   }, []);

  const pickImage = async (type = "ambiance") => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const localUri = asset.uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename ?? "");
      const typeMime = match ? `image/${match[1]}` : `image`;
      const file = {
        uri: localUri,
        name: filename,
        type: typeMime,
      };
      try {
        const data = await uploadImage(file);
        // Always use absolute URL for image preview
        const SERVER_URL = "http://localhost:8080"; // Change if needed
        let imageUrl = data.url;
        if (imageUrl && !imageUrl.startsWith("http")) {
          if (imageUrl.startsWith("/")) {
            imageUrl = SERVER_URL + imageUrl;
          } else {
            imageUrl = SERVER_URL + "/" + imageUrl;
          }
        }
        if (type === "ambiance") {
          setAmbianceImage(imageUrl);
          console.log("[DEBUG] ambianceImage set to:", imageUrl);
  }
      } catch (err) {
        showApiError(err);
      }
    }
  };

  const handleRegister = async () => {
    setLoading(true);
  // setError("");
    try {
      // Service type: send array if both selected, else single value or empty
      let restaurantType = "";
      if (tableService && selfService) restaurantType = ["table", "self"];
      else if (tableService) restaurantType = ["table"];
      else if (selfService) restaurantType = ["self"];
      else restaurantType = [];

      // Food type: send array if both selected, else single value or empty
      let foodType = "";
      if (pureVeg && nonVeg) foodType = ["veg", "nonveg"];
      else if (pureVeg) foodType = ["veg"];
      else if (nonVeg) foodType = ["nonveg"];
      else foodType = [];

      // Only send ambianceImage if it is not empty
      const payload = {
        phone: "", // Add phone logic if needed
        role_id: 1,
        ...form,
        restaurantType,
        foodType,
        ambianceImage: ambianceImage || "",
        enableBuffet,
      };
      const data = await registerManager(payload);
      alert.success(data.message || "Registered successfully");
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err) {
      showApiError(err);
      const msg =
        err?.response?.data?.message || err?.message || "Registration failed";
  // setError(msg);
      alert.error(msg);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Surface style={styles.formSurface}>
        <View style={styles.formWrapper}>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === 1 && (
              <View style={styles.stepBox}>
                <View style={styles.stepFormAreaScroll}>
                  <FormService
                    config={formConfig}
                    values={form}
                    setValues={setForm}
                    onSubmit={handleNext}
                    submitLabel={null}
                    loading={loading}
                    hiddenFields={["name", "restaurantAddress"]}
                    inputStyle={styles.inputStep}
                    labelStyle={styles.labelStep}
                  />
                </View>
              </View>
            )}
            {step === 2 && (
              <View style={styles.stepBox}>
                <View style={styles.stepFormAreaScroll}>
                  {/* Show only restaurant fields, styled like step 1 */}
                  <FormService
                    config={formConfig}
                    values={form}
                    setValues={setForm}
                    onSubmit={() => {}}
                    submitLabel={null}
                    loading={loading}
                    hiddenFields={["firstname", "lastname", "phone"]}
                    inputStyle={styles.inputStep}
                    labelStyle={styles.labelStep}
                  />
                  {/* Extra controls below the form, not inside it */}
                  <View style={{ marginTop: 24 }}>
                    <Button
                      mode="contained"
                      style={styles.locationBtnStep2}
                      icon="crosshairs-gps"
                      onPress={() =>
                        Alert.alert(
                          "Location",
                          "Use Current Location feature coming soon!"
                        )
                      }
                    >
                      Use Current Location
                    </Button>
                    <Text style={styles.sectionTitleStep2Grid}>
                      Choose your Restaurant Type
                    </Text>
                    <View style={styles.typeFoodGridRow}>
                      <View style={styles.typeFoodGridCol}>
                        <TouchableOpacity
                          style={[
                            styles.typeBoxStep2,
                            tableService && styles.typeBoxActiveStep2,
                          ]}
                          onPress={() => setTableService(!tableService)}
                        >
                          <Image
                            source={require("../../assets/images/table-service.png")}
                            style={styles.typeIconStep2}
                          />
                          <Text style={styles.typeLabelStep2Small}>
                            Table Service
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.typeFoodGridCol}>
                        <TouchableOpacity
                          style={[
                            styles.typeBoxStep2,
                            selfService && styles.typeBoxActiveStep2,
                          ]}
                          onPress={() => setSelfService(!selfService)}
                        >
                          <Image
                            source={require("../../assets/images/self-service.jpg")}
                            style={styles.typeIconStep2}
                          />
                          <Text style={styles.typeLabelStep2Small}>
                            Self Service
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.enableBothRowCenter}>
                      <TouchableOpacity
                        style={styles.checkboxRowStep2Grid}
                        onPress={() => setEnableBoth(!enableBoth)}
                      >
                        <View
                          style={[
                            styles.checkboxStep2,
                            enableBoth && styles.checkboxActiveStep2,
                          ]}
                        />
                        <Text style={styles.enableTextStep2Grid}>
                          Enable Both
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.typeFoodGridRow}>
                      <View style={styles.typeFoodGridCol}>
                        <TouchableOpacity
                          style={[
                            styles.foodTypeBoxStep2,
                            styles.foodTypeBoxVeg,
                            pureVeg && styles.foodTypeBoxVegActive,
                          ]}
                          onPress={() => setPureVeg(!pureVeg)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.foodCircleVegStep2} />
                          <Text style={styles.foodLabelStep2}>Pure Veg</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.typeFoodGridCol}>
                        <TouchableOpacity
                          style={[
                            styles.foodTypeBoxStep2,
                            styles.foodTypeBoxNonVeg,
                            nonVeg && styles.foodTypeBoxNonVegActive,
                          ]}
                          onPress={() => setNonVeg(!nonVeg)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.foodCircleNonVegStep2} />
                          <Text style={styles.foodLabelStep2}>Non Veg</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.buffetRowGrid}>
                      <TouchableOpacity
                        style={styles.checkboxRowStep2Grid}
                        onPress={() => setEnableBuffet(!enableBuffet)}
                      >
                        <View
                          style={[
                            styles.checkboxStep2,
                            enableBuffet && styles.checkboxActiveStep2,
                          ]}
                        />
                        <Text style={styles.checkboxLabelStep2Grid}>
                          Enable Buffet
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.sectionTitleStep2Grid}>
                      Upload Ambiance Photo
                    </Text>
                    <TouchableOpacity
                      style={styles.photoUploadBoxStep2}
                      onPress={pickImage}
                    >
                      {ambianceImage ? (
                        <Image
                          source={{ uri: ambianceImage }}
                          style={styles.photoPreviewStep2}
                          onError={() => alert.error("Image failed to load. Check the URL or server.")}
                        />
                      ) : (
                        <Image
                          source={require("../../assets/images/camera-icon.png")}
                          style={styles.cameraIconStep2}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          {/* Fixed bottom bar for Next/Register button */}
          {step === 1 && (
            <View style={styles.fixedBottomBarStep}>
              <Button
                mode="contained"
                style={styles.bottomButtonStep}
                labelStyle={styles.buttonTextStep}
                onPress={handleNext}
                loading={loading}
              >
                Next
              </Button>
            </View>
          )}
          {step === 2 && (
            <View style={styles.fixedBottomBarStep}>
              <Button
                mode="contained"
                style={styles.bottomButtonStep}
                labelStyle={styles.buttonTextStep}
                onPress={handleRegister}
                loading={loading}
              >
                Register
              </Button>
            </View>
          )}
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: "#a6a6e7" },
  appbar: { backgroundColor: "#a6a6e7", elevation: 0 },
  appbarTitle: { fontWeight: "bold", fontSize: 20, textAlign: "center" },
  formSurface: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 0,
    backgroundColor: "transparent",
    elevation: 0,
  },
  formWrapper: {
    flex: 1,
  },
  typeFoodGridRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    gap: 18,
  },
  input: {
    // ...existing input styles...
  },
  enableBothRowCenter: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginBottom: 12,
    flexDirection: "row",
  },
  buffetRowGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
    width: "100%",
    display: "flex",
  },
  checkboxRowStep2Grid: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    alignSelf: "center",
    marginLeft: 0,
  },
  photoUploadBoxStep2: {
    width: 180,
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    alignSelf: "center",
  },
  typeIcon: { width: 60, height: 60, marginBottom: 5 },
  typeLabel: { fontSize: 14, fontWeight: "bold", color: "#333" },
  enableText: {
    fontSize: 13,
    color: "#7b6eea",
    marginVertical: 5,
    textAlign: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#7b6eea",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  checkboxActive: { backgroundColor: "#7b6eea" },
  checkboxLabel: { fontSize: 14, color: "#333" },
  foodTypeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  foodTypeBox: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#eae6ff",
    marginHorizontal: 10,
  },
  foodTypeBoxActive: {
    borderColor: "#7b6eea",
    borderWidth: 2,
    backgroundColor: "#d1c4e9",
  },
  foodCircle: { width: 30, height: 30, borderRadius: 15, marginBottom: 5 },
  foodLabel: { fontSize: 14, fontWeight: "bold", color: "#333" },
  photoUploadBox: {
    width: 180,
    height: 120,
    backgroundColor: "#eae6ff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  cameraIcon: { width: 60, height: 60 },
  photoPreview: { width: 120, height: 100, borderRadius: 10 },
  bottomBar: {
    padding: 16,
    backgroundColor: "#a6a6e7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
  bottomButton: {
    borderRadius: 24,
    width: "95%",
    alignSelf: "center",
    paddingVertical: 10,
    backgroundColor: "#7b6eea",
    marginTop: 16,
  },
  outerStep1Box: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  innerStep1Box: {
    width: "100%",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  formFullWidth: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  buttonBar: {
    display: "none",
  },
  fixedBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#a6a6e7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    alignItems: "center",
    padding: 16,
    zIndex: 10,
  },
  stepBox: {
    flex: 1,
    width: "100%",
    backgroundColor: "#a6a6e7",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  stepFormArea: {
    width: "90%",
    backgroundColor: "transparent",
    alignItems: "flex-start",
    marginBottom: 0,
    flex: 1,
    justifyContent: "flex-start",
  },
  stepFormAreaScroll: {
    width: "100%",
    backgroundColor: "transparent",
    alignItems: "flex-start",
    marginBottom: 0,
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  inputStep: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 44,
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    borderWidth: 0,
    color: "#222",
  },
  labelStep: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 2,
  },
  fixedBottomBarStep: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#a6a6e7",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: "center",
    padding: 12,
    zIndex: 10,
  },
  bottomButtonStep: {
    borderRadius: 14,
    width: "92%",
    alignSelf: "center",
    paddingVertical: 8,
    backgroundColor: "#6c6cf2",
    marginTop: 0,
    marginBottom: 0,
    elevation: 0,
  },
  buttonTextStep: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "400",
    letterSpacing: 1,
    // lineHeight removed for button text
  },
  stepFormAreaStep2: {
    width: "92%",
    backgroundColor: "transparent",
    alignItems: "center",
    marginBottom: 0,
    flex: 1,
    justifyContent: "flex-start",
  },
  locationBtnStep2: {
    marginBottom: 18,
    backgroundColor: "#7b6eea",
    width: "100%",
    borderRadius: 8,
    alignSelf: "center",
  },
  sectionTitleStep2: {
    fontSize: 15,
    fontWeight: "bold",
    marginVertical: 8,
    textAlign: "center",
    color: "#fff",
  },
  sectionTitleStep2Grid: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 12,
    textAlign: "left",
    color: "#fff",
    alignSelf: "center",
  },

  typeFoodGridCol: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
  },

  enableTextStep2Grid: {
    fontSize: 14,
    color: "#fff",
    marginRight: 8,
    fontWeight: "400",
  },

  checkboxLabelStep2Grid: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 6,
  },
  typeRowStep2: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  typeBoxStep2: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#eae6ff",
    width: 110,
    height: 110,
  },
  typeBoxActiveStep2: {
    borderColor: "#7b6eea",
    backgroundColor: "#d1c4e9",
  },
  typeIconStep2: { width: 48, height: 48, marginBottom: 2 },
  typeLabelStep2: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flexWrap: "wrap",
    width: "100%",
    marginTop: 4,
  },
  typeLabelStep2Small: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flexWrap: "wrap",
    width: "100%",
    marginTop: 4,
  },
  foodTypeRowStep2: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  foodTypeBoxStep2: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#eae6ff",
    width: 110,
    height: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 2.0,
    elevation: 4,
  },
  foodTypeBoxVeg: {
    borderColor: "#1ca11c",
  },
  foodTypeBoxNonVeg: {
    borderColor: "#c22a2a",
  },
  foodTypeBoxVegActive: {
    borderColor: "#1ca11c",
    borderWidth: 3,
  },
  foodTypeBoxNonVegActive: {
    borderColor: "#c22a2a",
    borderWidth: 3,
  },
  foodCircleVegStep2: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginBottom: 8,
    backgroundColor: "#1ca11c",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  foodCircleNonVegStep2: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginBottom: 8,
    backgroundColor: "#c22a2a",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  foodLabelStep2: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  enableTextStep2: {
    fontSize: 13,
    color: "#fff",
    marginVertical: 5,
    textAlign: "center",
  },
  checkboxRowStep2: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  checkboxStep2: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#7b6eea",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  checkboxActiveStep2: { backgroundColor: "#7b6eea" },
  checkboxLabelStep2: { fontSize: 14, color: "#fff" },

  cameraIconStep2: { width: 60, height: 60 },
  photoPreviewStep2: { width: 120, height: 100, borderRadius: 10 },
});
