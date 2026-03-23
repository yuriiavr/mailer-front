import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { apiClient, setAuthToken } from "../../components/api/url";

export const updateAccessToken = createAction('auth/updateAccessToken');
export const updateRefreshToken = createAction('auth/updateRefreshToken');

export const registerUser = createAsyncThunk(
  "auth/register",
  async (credentials, thunkAPI) => {
    try {
      const { data } = await apiClient.post("/auth/register", credentials);
      setAuthToken(data.accessToken);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const { data } = await apiClient.post("/auth/login", credentials);
      setAuthToken(data.accessToken);
      return data;
    } catch (error) {
      if (error.response && error.response.status === 401 || error.response.status === 400) {
        // Якщо помилка 401, ми знаємо, що проблема в облікових даних,
        // тому повертаємо зрозуміле повідомлення.
        return thunkAPI.rejectWithValue("Invalid email or password. Please try again.");
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user.accessToken;
      if (token) {
        setAuthToken(null);
      }
      return;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const currentAccessToken = state.user.accessToken;

      if (!currentAccessToken) {
        return thunkAPI.rejectWithValue("No token found");
      }

      setAuthToken(currentAccessToken);
      const { data } = await apiClient.get("/auth/current");
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const currentRefreshToken = state.user.refreshToken;

      if (!currentRefreshToken) {
        return thunkAPI.rejectWithValue("No refresh token found");
      }

      const { data } = await apiClient.post("/auth/refreshToken", { refreshToken: currentRefreshToken });

      setAuthToken(data.accessToken);

      return data;
    } catch (error) {
      thunkAPI.dispatch(logoutUser());
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const changeEmail = createAsyncThunk(
  "auth/changeEmail",
  async ({ newEmail }, thunkAPI) => {
    try {
      const { data } = await apiClient.patch("/auth/email", { newEmail });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const changeDbLink = createAsyncThunk(
  "auth/changeDbLink",
  async (dbLink, thunkAPI) => { 
    try {
      const response = await apiClient.put(`/auth/db-link`, { dbLink });
      return response.data.user; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || "Failed to change DB link.");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (_, thunkAPI) => {
    try {
      const { data } = await apiClient.delete("/auth/");
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);