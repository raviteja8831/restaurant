
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, MESSAGES } from './constants';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ phone, otp, apiUrl }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${apiUrl || API_BASE_URL}/auth/login`, { phone, otp });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || MESSAGES.loginFailed);
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ phone, roleName, apiUrl }, { rejectWithValue }) => {
    try {
      await axios.post(`${apiUrl || API_BASE_URL}/auth/register`, { phone, roleName });
      return true;
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
