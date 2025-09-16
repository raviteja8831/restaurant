// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://10.0.2.2:8080/api", // Change to your backend URL
//   timeout: 10000,
// });

// export default api;

import axios from "axios";

// Detect environment dynamically
const getBaseURL = () => {
  if (Platform.OS === "android") {
    // For Android emulator use 10.0.2.2
    return "http://10.0.2.2:8080/api";
  } else if (Platform.OS === "ios") {
    // For iOS simulator use localhost
    return "http://localhost:8080/api";
  } else {
    // For web/laptop browser
    return "http://localhost:8080/api";
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

export default api;
