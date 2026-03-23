import { createSlice, createAction } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
  refreshToken,
  changeDbLink,
  changeEmail
} from "./operations";

export const updateAccessToken = createAction("auth/updateAccessToken");
export const updateRefreshToken = createAction("auth/updateRefreshToken");

const initialState = {
  user: { userName: null, email: null, userId: null, role: 'user', dbLink: null },
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
  isRefreshing: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        const { accessToken, user, refreshToken } = payload;
        state.user = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isLoggedIn = true;
        state.error = null;
        state.isRefreshing = false;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.error = payload;
        state.isRefreshing = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        const { accessToken, user, refreshToken } = payload;
        state.user = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isLoggedIn = true;
        state.error = null;
        state.isRefreshing = false;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.error = payload;
        state.isRefreshing = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = { userName: null, email: null, userId: null };
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        state.isRefreshing = false;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isLoggedIn = true;
        state.isRefreshing = false;
        state.error = null;
        state.refreshToken = payload.user.refreshToken; 
      })
      .addCase(fetchCurrentUser.rejected, (state, { payload }) => {
        state.error = payload;
        state.isLoggedIn = false;
        state.isRefreshing = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = { userName: null, email: null, userId: null };
      })
      .addCase(refreshToken.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isRefreshing = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, { payload }) => {
        state.isRefreshing = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        state.error = payload;
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        state.user.email = action.payload.email; 
      })
      .addCase(changeDbLink.fulfilled, (state, action) => {
        state.user.dbLink = action.payload.dbLink;
      })
  },
});

export const { reducer: userReducer } = authSlice;
export const selectUserState = (state) => state.user;