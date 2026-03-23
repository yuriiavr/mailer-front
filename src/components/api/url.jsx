import axios from "axios";
import { logoutUser, refreshToken } from "../../redux/auth/operations";
import { BASE_URL } from "./api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

let isInterceptorsSetup = false;

export const setupInterceptors = (store) => {
  if (isInterceptorsSetup) {
    return;
  }

  apiClient.interceptors.request.use(
    (config) => {
      if (config.url === '/auth/login') { 
        return config;
      }
      
      const state = store.getState();
      const accessToken = state.user?.accessToken;
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/register') {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._isRetry && originalRequest.url !== '/auth/refreshToken') {
        originalRequest._isRetry = true;
        try {
          const resultAction = await store.dispatch(refreshToken());

          if (refreshToken.fulfilled.match(resultAction)) {
            const newAccessToken = resultAction.payload.accessToken;
            setAuthToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          store.dispatch(logoutUser());
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
  isInterceptorsSetup = true;
};