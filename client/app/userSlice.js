
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MESSAGES } from './constants/constants';
import { registerUser as registerUserApi, loginUser as loginUserApi, registerRestaurantUser as registerRestaurantUserApi, loginRestaurantUser as loginRestaurantUserApi } from './api/userApi';
// Async thunk for restaurant manager registration
export const registerRestaurantUser = createAsyncThunk(
  'user/registerRestaurantUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await registerRestaurantUserApi(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || MESSAGES.registrationFailed);
    }
  }
);

// Async thunk for restaurant manager login
export const loginRestaurantUser = createAsyncThunk(
  'user/loginRestaurantUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await loginRestaurantUserApi(payload);
      if (response.data.token) {
        localStorage.setItem('jwtToken', response.data.token);
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || MESSAGES.loginFailed);
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await loginUserApi(payload);
      // Save JWT to localStorage
      if (response.data.accessToken) {
        localStorage.setItem('jwtToken', response.data.accessToken);
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || MESSAGES.loginFailed);
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await registerUserApi(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || MESSAGES.registrationFailed);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { id: action.payload.id, phone: action.payload.phone, role: action.payload.role };
        state.token = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectUser = state => state.user.user;
export const selectToken = state => state.user.token;
export const selectLoading = state => state.user.loading;
export const selectError = state => state.user.error;
