export const API_BASE_URL = "http://localhost:8080/api";

export const API_ENDPOINTS = {
  REVIEWS: {
    GET_USER_REVIEWS: (userId: number) => `/reviews/user/${userId}`,
    ADD_REVIEW: "/reviews",
  },
  USER: {
    PROFILE: (userId: number) => `/users/profile/${userId}`,
    UPDATE_PROFILE: (userId: number) => `/users/${userId}`,
    FAVORITES: (userId: number) => `/users/${userId}/favorites`,
    TRANSACTIONS: (userId: number) => `/users/${userId}/transactions`,
  },
};
