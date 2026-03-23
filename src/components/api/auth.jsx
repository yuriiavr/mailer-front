import axios from "axios";
import { BASE_URL } from "./api";

export const login = (credentials, token) => {
  return axios.post(`${BASE_URL}/auth/login`, credentials, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const register = (credentials) => {
  return axios.post(`${BASE_URL}/auth/signup`, credentials);
};

export const refresh = (token) => {
  return axios.get(`${BASE_URL}/auth/current`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const logout = (token) => {
  return axios.post(`${BASE_URL}/auth/logout`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};