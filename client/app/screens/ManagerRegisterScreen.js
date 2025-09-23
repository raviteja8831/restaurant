// Reusable RedStar component
const RedStar = () => (
  <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold' }}>*</Text>
);
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
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
import * as Location from "expo-location";
import { registerManager } from "../api/managerApi";
import { showApiError } from "../services/messagingService";
import FormService from "../components/formService";
import { uploadImage } from "../api/imageApi";
import { API_BASE_URL } from "../constants/api.constants";

// Set a default Google address
const DEFAULT_ADDRESS =
  "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA";

export default function ManagerRegisterScreen() {
  const [address, setAddress] = React.useState(DEFAULT_ADDRESS);
  // Location logic
  const GOOGLE_API_KEY = "AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ";
  const handleUseCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setAddress("Location permission denied");
        setFormState((prev) => ({
          ...prev,
          restaurantAddress: "Location permission denied",
        }));
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      // Use Google Maps Geocoding API
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const addr = data.results[0].formatted_address;
        setAddress(addr);
        setFormState((prev) => ({ ...prev, restaurantAddress: addr }));
      } else {
        setAddress("Address not found");
        setFormState((prev) => ({
          ...prev,
          restaurantAddress: "Address not found",
        }));
      }
    } catch (error) {
      setAddress("Error fetching location or address");
      setFormState((prev) => ({
        ...prev,
        restaurantAddress: "Error fetching location or address",
      }));
    }
  };
  const router = useRouter();
  const alert = useAlert();
  const [step, setStep] = React.useState(1);
  const [tableService, setTableService] = React.useState(false);
  const [selfService, setSelfService] = React.useState(false);
  const [pureVeg, setPureVeg] = React.useState(false);
  const [nonVeg, setNonVeg] = React.useState(false);
  const [enableBuffet, setEnableBuffet] = React.useState(false);
  const [enableBoth, setEnableBoth] = React.useState(false);

  // When enableBoth changes, update both service states
  React.useEffect(() => {
    if (enableBoth) {
      setTableService(true);
      setSelfService(true);
    }
  }, [enableBoth]);
  const [ambianceImage, setAmbianceImage] = React.useState(null);
  // const [logo, setLogo] = React.useState(null); // Removed unused variable
  // Remove parent error state for form steps
  const [loading, setLoading] = React.useState(false);
  // const [error, setError] = React.useState(""); // Removed unused variable
  const formConfig = [
    {
      label:<> First Name <Text style={{ color: 'red' }}>*</Text></>,
      name: "firstname",
      type: "text",
      required: true,
    },
    {
      label: "Last Name",
      name: "lastname",
      type: "text",
    },
    {
      label: <>Phone Number <Text style={{ color: 'red' }}>*</Text></>,
      name: "phone",
      type: "text",
      keyboardType: "phone-pad",
      required: true,
    },
    {
      label: <>UPI <Text style={{ color: 'red' }}>*</Text></>,
      name: "upi",
      type: "text",
      keyboardType: "text",
      required: true,
    },
    {
      label: <>Restaurant Name <Text style={{ color: 'red' }}>*</Text></>,
      name: "name",
      type: "text",
      required: true,
    },
    {
      label: <>Restaurant Address <Text style={{ color: 'red' }}>*</Text></>,
      name: "restaurantAddress",
      type: "textarea",
      value: address,
      multiline: true,
      editable: true,
      required: true,
    },
    {
      label: "Restaurant Type",
      name: "restaurantType",
      type: "select",
      required: true,
      options: [
        { label: "Multi-cuisine", value: "Multi-cuisine" },
        { label: "Cafe", value: "Cafe" },
        { label: "3 Star", value: "3 Star" },
        { label: "5 Star", value: "5 Star" },
        { label: "Other", value: "Other" },
      ],
      placeholder: "Select type",
    },
  ];

  // Single form state for all fields
  const [form, setFormState] = React.useState({
    firstname: "",
    lastname: "",
    phone: "",
    name: "",
    upi: "",
    restaurantAddress: DEFAULT_ADDRESS,
    restaurantType: "",
    restaurantTypeOther: "",
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setAmbianceImage(asset.uri); // just preview local image
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Geocode address to get latitude and longitude
      let latitude = null;
      let longitude = null;
      try {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(form.restaurantAddress)}&key=${GOOGLE_API_KEY}`
        );
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          latitude = geoData.results[0].geometry.location.lat;
          longitude = geoData.results[0].geometry.location.lng;
        }
      } catch (geoErr) {
        // If geocoding fails, leave lat/lng null
      }
      // Service type: send array if both selected, else single value or empty
      let ambianceImageUrl = "";
      if (ambianceImage) {
        if (
          ambianceImage.startsWith("file://") ||
          ambianceImage.startsWith("content://")
        ) {
          // Local file, upload as file object
          const filename = ambianceImage.split("/").pop();
          const match = /\.(\w+)$/.exec(filename ?? "");
          const typeMime = match ? `image/${match[1]}` : `image/jpeg`;
          const fileObj = {
            uri: ambianceImage,
            name: filename,
            type: typeMime,
          };
          try {
            const data = await uploadImage(fileObj);
            const SERVER_URL = API_BASE_URL;
            let imageUrl = data.url;
            imageUrl =
              SERVER_URL +
              (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl =
                SERVER_URL +
                (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
            }
            ambianceImageUrl = imageUrl;
          } catch (err) {
            showApiError(err);
            ambianceImageUrl = "";
          }
        } else if (ambianceImage.startsWith("http")) {
          // Already a URL, use as is
          ambianceImageUrl = ambianceImage;
        } else if (ambianceImage.startsWith("data:image/")) {
          // Handle base64 data URL
          try {
            // Extract mime and base64 data
            const matches = ambianceImage.match(
              /^data:(image\/(png|jpeg|jpg));base64,(.+)$/
            );
            if (!matches) throw new Error("Invalid base64 image format");
            const mimeType = matches[1];
            const base64Data = matches[3];
            // Create a blob from base64 (browser only)
            let fileObj;
            if (typeof window !== "undefined" && window.File) {
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: mimeType });
              const filename = `ambiance_${Date.now()}.${
                mimeType.split("/")[1]
              }`;
              fileObj = new File([blob], filename, { type: mimeType });
            } else {
              // React Native: just pass uri, name, type
              const filename = `ambiance_${Date.now()}.${
                mimeType.split("/")[1]
              }`;
              fileObj = {
                uri: ambianceImage,
                name: filename,
                type: mimeType,
              };
            }
            const data = await uploadImage(fileObj);
            const SERVER_URL = API_BASE_URL;
            let imageUrl = data.url;
            imageUrl =
              SERVER_URL +
              (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl =
                SERVER_URL +
                (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
            }
            ambianceImageUrl = imageUrl;
          } catch (err) {
            showApiError(err);
            ambianceImageUrl = "";
          }
        } else {
          alert.error("Please select a valid image.");
          setLoading(false);
          return;
        }
      }

      // If you add logo upload, repeat the same logic for logo here

      // Always call upload API before registerManager
      const payload = {
        phone: form.phone || "",
        role_id: 1,
        ...form,
        ambianceImage: ambianceImageUrl,
        enableBuffet,
        enableVeg: pureVeg,
        enableNonveg: nonVeg,
        enableTableService: tableService,
        enableSelfService: selfService,
        restaurantType: form.restaurantType === 'Other' ? form.restaurantTypeOther : form.restaurantType,
        latitude,
        longitude,
      };
      const data = await registerManager(payload);
      alert.success(data.message || "Registered successfully");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      showApiError(err);
      const msg =
        err?.response?.data?.message || err?.message || "Registration failed";
      alert.error(msg);
    }
    setLoading(false);
  };
 return (
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#8D8BEA' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Image
                        source={require("../../assets/images/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Surface style={styles.formSurface}>
              <View style={styles.formWrapper}>
                {step === 1 && (
                  <View style={styles.stepBox}>
                    <View style={styles.stepFormAreaScroll}>
                      <FormService
                        config={formConfig.filter(f => f.name !== "restaurantType")}
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
                      {/* Restaurant Name field with red star */}
                      <View>
                        <FormService
                          config={formConfig.filter(f => f.name === "name")}
                          values={form}
                          setValues={setForm}
                          onSubmit={() => {}}
                          submitLabel={null}
                          loading={loading}
                          hiddenFields={[]}
                          inputStyle={styles.inputStep}
                          labelStyle={styles.labelStep}
                        />
                      </View>
                      {/* Restaurant Address field with red star */}
                      <View>
                        <FormService
                          config={formConfig.filter(f => f.name === "restaurantAddress")}
                          values={form}
                          setValues={setForm}
                          onSubmit={() => {}}
                          submitLabel={null}
                          loading={loading}
                          hiddenFields={[]}
                          inputStyle={styles.inputStep}
                          labelStyle={styles.labelStep}
                        />
                      </View>
                      {/* Use Current Location button below address */}
                      <Button
                        mode="contained"
                        style={styles.locationBtnStep2}
                        icon="crosshairs-gps"
                        onPress={handleUseCurrentLocation}
                      >
                        Use Current Location
                      </Button>
                      {/* Restaurant Type dropdown */}
                      <FormService
                        config={formConfig.filter(f => f.name === "restaurantType")}
                        values={form}
                        setValues={setForm}
                        onSubmit={() => {}}
                        submitLabel={null}
                        loading={loading}
                        hiddenFields={[]}
                        inputStyle={styles.inputStep}
                        labelStyle={styles.labelStep}
                      />
                      {/* If 'Other' is selected, show a text input for custom value */}
                      {form.restaurantType === 'Other' && (
                        <FormService
                          config={[{
                            label: "Enter Restaurant Type",
                            name: "restaurantTypeOther",
                            type: "text",
                            placeholder: "Enter custom type",
                          }]}
                          values={form}
                          setValues={setForm}
                          onSubmit={() => {}}
                          submitLabel={null}
                          loading={loading}
                          inputStyle={styles.inputStep}
                          labelStyle={styles.labelStep}
                        />
                      )}
                      {/* Extra controls below the form, not inside it */}
                      <View style={{ marginTop: 24 }}>
                        <Text style={styles.sectionTitleStep2Grid}>
                        </Text>
                        <View style={styles.typeFoodGridRow}>
                          <View style={styles.typeFoodGridCol}>
                            <TouchableOpacity
                              style={[
                                styles.typeBoxStep2,
                                tableService && styles.typeBoxActiveStep2,
                              ]}
                              onPress={() => {
                                if (enableBoth) return; // Prevent toggling if both enabled
                                setTableService(!tableService);
                              }}
                            >
                              <Image
                                source={require("../../assets/images/table_service.jpg")}
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
                              onPress={() => {
                                if (enableBoth) return; // Prevent toggling if both enabled
                                setSelfService(!selfService);
                              }}
                            >
                              <Image
                                source={require("../../assets/images/self_service.jpg")}
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
                            onPress={() => {
                              if (!enableBoth) {
                                setEnableBoth(true);
                              } else {
                                setEnableBoth(false);
                                setTableService(false);
                                setSelfService(false);
                              }
                            }}
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
                              <Image
                                source={require("../../assets/images/veg.png")}
                                style={styles.foodCircleVegStep2}
                              />
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
                              <Image
                                source={require("../../assets/images/non-veg.png")}
                                style={styles.foodCircleNonVegStep2}
                              />
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
                              onError={() =>
                                alert.error(
                                  "Image failed to load. Check the URL or server."
                                )
                              }
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
                {/* Fixed bottom bar for Next/Register button */}
                {step === 1 && (
                  <View >
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
                  <View >
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
          </ScrollView>
        </KeyboardAvoidingView>
      );
  // return (
  //   <View >
  //   <ScrollView>
  //   <KeyboardAvoidingView
     
  //     behavior={Platform.OS === "ios" ? "padding" : undefined}
  //   >
  //     <Surface style={styles.formSurface}>
  //       <View style={styles.formWrapper}>
  //         <View
            
  //           contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
  //           keyboardShouldPersistTaps="handled"
  //           showsVerticalScrollIndicator={false}
  //         >
  //           {step === 1 && (
  //             <View style={styles.stepBox}>
  //               <View style={styles.stepFormAreaScroll}>
  //                 <FormService
  //                   config={formConfig}
  //                   values={form}
  //                   setValues={setForm}
  //                   onSubmit={handleNext}
  //                   submitLabel={null}
  //                   loading={loading}
  //                   hiddenFields={["name", "restaurantAddress"]}
  //                   inputStyle={styles.inputStep}
  //                   labelStyle={styles.labelStep}
  //                 />
  //               </View>
  //             </View>
  //           )}
  //           {step === 2 && (
  //             <View style={styles.stepBox}>
  //               <View style={styles.stepFormAreaScroll}>
  //                 {/* Show only restaurant fields, styled like step 1 */}
  //                 <FormService
  //                   config={formConfig}
  //                   values={form}
  //                   setValues={setForm}
  //                   onSubmit={() => {}}
  //                   submitLabel={null}
  //                   loading={loading}
  //                   hiddenFields={["firstname", "lastname", "phone"]}
  //                   inputStyle={styles.inputStep}
  //                   labelStyle={styles.labelStep}
  //                 />
  //                 {/* Extra controls below the form, not inside it */}
  //                 <View style={{ marginTop: 24 }}>
  //                   <Button
  //                     mode="contained"
  //                     style={styles.locationBtnStep2}
  //                     icon="crosshairs-gps"
  //                     onPress={handleUseCurrentLocation}
  //                   >
  //                     Use Current Location
  //                   </Button>
  //                   <Text style={styles.sectionTitleStep2Grid}>
  //                     Choose your Restaurant Type
  //                   </Text>
  //                   <View style={styles.typeFoodGridRow}>
  //                     <View style={styles.typeFoodGridCol}>
  //                       <TouchableOpacity
  //                         style={[
  //                           styles.typeBoxStep2,
  //                           tableService && styles.typeBoxActiveStep2,
  //                         ]}
  //                         onPress={() => {
  //                           if (enableBoth) return; // Prevent toggling if both enabled
  //                           setTableService(!tableService);
  //                         }}
  //                       >
  //                         <Image
  //                           source={require("../../assets/images/table_service.jpg")}
  //                           style={styles.typeIconStep2}
  //                         />
  //                         <Text style={styles.typeLabelStep2Small}>
  //                           Table Service
  //                         </Text>
  //                       </TouchableOpacity>
  //                     </View>
  //                     <View style={styles.typeFoodGridCol}>
  //                       <TouchableOpacity
  //                         style={[
  //                           styles.typeBoxStep2,
  //                           selfService && styles.typeBoxActiveStep2,
  //                         ]}
  //                         onPress={() => {
  //                           if (enableBoth) return; // Prevent toggling if both enabled
  //                           setSelfService(!selfService);
  //                         }}
  //                       >
  //                         <Image
  //                           source={require("../../assets/images/self_service.jpg")}
  //                           style={styles.typeIconStep2}
  //                         />
  //                         <Text style={styles.typeLabelStep2Small}>
  //                           Self Service
  //                         </Text>
  //                       </TouchableOpacity>
  //                     </View>
  //                   </View>
  //                   <View style={styles.enableBothRowCenter}>
  //                     <TouchableOpacity
  //                       style={styles.checkboxRowStep2Grid}
  //                       onPress={() => {
  //                         if (!enableBoth) {
  //                           setEnableBoth(true);
  //                         } else {
  //                           setEnableBoth(false);
  //                           setTableService(false);
  //                           setSelfService(false);
  //                         }
  //                       }}
  //                     >
  //                       <View
  //                         style={[
  //                           styles.checkboxStep2,
  //                           enableBoth && styles.checkboxActiveStep2,
  //                         ]}
  //                       />
  //                       <Text style={styles.enableTextStep2Grid}>
  //                         Enable Both
  //                       </Text>
  //                     </TouchableOpacity>
  //                   </View>
  //                   <View style={styles.typeFoodGridRow}>
  //                     <View style={styles.typeFoodGridCol}>
  //                       <TouchableOpacity
  //                         style={[
  //                           styles.foodTypeBoxStep2,
  //                           styles.foodTypeBoxVeg,
  //                           pureVeg && styles.foodTypeBoxVegActive,
  //                         ]}
  //                         onPress={() => setPureVeg(!pureVeg)}
  //                         activeOpacity={0.8}
  //                       >
  //                         <Image
  //                           source={require("../../assets/images/veg.png")}
  //                           style={styles.foodCircleVegStep2}
  //                         />
  //                         <Text style={styles.foodLabelStep2}>Pure Veg</Text>
  //                       </TouchableOpacity>
  //                     </View>
  //                     <View style={styles.typeFoodGridCol}>
  //                       <TouchableOpacity
  //                         style={[
  //                           styles.foodTypeBoxStep2,
  //                           styles.foodTypeBoxNonVeg,
  //                           nonVeg && styles.foodTypeBoxNonVegActive,
  //                         ]}
  //                         onPress={() => setNonVeg(!nonVeg)}
  //                         activeOpacity={0.8}
  //                       >
  //                         <Image
  //                           source={require("../../assets/images/non-veg.png")}
  //                           style={styles.foodCircleNonVegStep2}
  //                         />
  //                         <Text style={styles.foodLabelStep2}>Non Veg</Text>
  //                       </TouchableOpacity>
  //                     </View>
  //                   </View>
  //                   <View style={styles.buffetRowGrid}>
  //                     <TouchableOpacity
  //                       style={styles.checkboxRowStep2Grid}
  //                       onPress={() => setEnableBuffet(!enableBuffet)}
  //                     >
  //                       <View
  //                         style={[
  //                           styles.checkboxStep2,
  //                           enableBuffet && styles.checkboxActiveStep2,
  //                         ]}
  //                       />
  //                       <Text style={styles.checkboxLabelStep2Grid}>
  //                         Enable Buffet
  //                       </Text>
  //                     </TouchableOpacity>
  //                   </View>
  //                   <Text style={styles.sectionTitleStep2Grid}>
  //                     Upload Ambiance Photo
  //                   </Text>
  //                   <TouchableOpacity
  //                     style={styles.photoUploadBoxStep2}
  //                     onPress={pickImage}
  //                   >
  //                     {ambianceImage ? (
  //                       <Image
  //                         source={{ uri: ambianceImage }}
  //                         style={styles.photoPreviewStep2}
  //                         onError={() =>
  //                           alert.error(
  //                             "Image failed to load. Check the URL or server."
  //                           )
  //                         }
  //                       />
  //                     ) : (
  //                       <Image
  //                         source={require("../../assets/images/camera-icon.png")}
  //                         style={styles.cameraIconStep2}
  //                       />
  //                     )}
  //                   </TouchableOpacity>
  //                 </View>
  //               </View>
  //             </View>
  //           )}
  //         </View>
  //         {/* Fixed bottom bar for Next/Register button */}
  //         {step === 1 && (
  //           <View style={styles.fixedBottomBarStep}>
  //             <Button
  //               mode="contained"
  //               style={styles.bottomButtonStep}
  //               labelStyle={styles.buttonTextStep}
  //               onPress={handleNext}
  //               loading={loading}
  //             >
  //               Next
  //             </Button>
  //           </View>
  //         )}
  //         {step === 2 && (
  //           <View style={styles.fixedBottomBarStep}>
  //             <Button
  //               mode="contained"
  //               style={styles.bottomButtonStep}
  //               labelStyle={styles.buttonTextStep}
  //               onPress={handleRegister}
  //               loading={loading}
  //             >
  //               Register
  //             </Button>
  //           </View>
  //         )}
  //       </View>
  //     </Surface>
  //   </KeyboardAvoidingView>
  //   </ScrollView>
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: "#8D8BEA" },
  appbar: { backgroundColor: "#8D8BEA", elevation: 0 },
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
  logo: {
    width: 180,
    height: 120,
    marginBottom: 24,
    alignSelf: "center",
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
    backgroundColor: "#8D8BEA",
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
    backgroundColor: "#8D8BEA",
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
    backgroundColor: "#8D8BEA",
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
  requiredstyle: {
      color: 'red',
      fontSize: 16,
      fontWeight: 'bold',
    },
  fixedBottomBarStep: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#8D8BEA",
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
    // backgroundColor: "#fff",
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#eae6ff",
    width: 110,
    height: 110,
  },
  typeBoxActiveStep2: {
    borderColor: "#7b6eea",
    // backgroundColor: "#d1c4e9",
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
    // backgroundColor: "#fff",
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
