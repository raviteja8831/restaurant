export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const MESSAGES = {
  registrationSuccess: 'Registration successful! Please login.',
  registrationFailed: 'Registration failed',
  loginFailed: 'Login failed',
  invalidCredentials: 'Invalid credentials',
  invalidPhone: 'Please enter a valid phone number',
  invalidPhoneOtp: 'Please enter a valid phone and OTP',
};
