/* eslint-disable padding-line-between-statements */
// Slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    otp: null,
    tempEmail: null,
    measurementUnit: "inch",
    tempToken: null,
  },
  reducers: {
    setUser: (state, action) => {
      const userData = action.payload;
      state.user = userData;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setOtp: (state, action) => {
      state.otp = action.payload;
    },
    setTempEmail: (state, action) => {
      state.tempEmail = action.payload;
    },
    setMeasurementUnit: (state, action) => {
      state.measurementUnit = action.payload;
    },
    setTempToken: (state, action) => {
      state.tempToken = action.payload;
    },
  },
});

export const {
  setUser,
  logout,
  setOtp,
  setTempEmail,
  setMeasurementUnit,
  setTempToken,
} = authSlice.actions;
export const selectUser = (state) => state.auth?.user ?? null;
export const selectIsAuthenticated = (state) =>
  state.auth?.isAuthenticated ?? false;

export default authSlice.reducer;
