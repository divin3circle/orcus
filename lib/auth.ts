import axios from "axios";
import { BASE_URL } from "./utils";

// Create an axios instance with default config
export const authAxios = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to include auth token
authAxios.interceptors.request.use(
  (config) => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("auth_data");
      if (authData) {
        try {
          const parsedAuthData = JSON.parse(authData);
          config.headers.Authorization = `Bearer ${parsedAuthData.token.token}`;
          // console.log("Auth request interceptor:", {
          //   url: config.url,
          //   method: config.method,
          //   hasToken: !!parsedAuthData.token.token,
          // });
        } catch (error) {
          console.error("Error parsing auth data:", error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authAxios.interceptors.response.use(
  (response) => {
    // console.log("Auth response interceptor:", {
    //   url: response.config.url,
    //   status: response.status,
    //   data: response.data,
    // });
    return response;
  },
  (error) => {
    console.log("Auth response error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_data");
        // Optionally redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to get the current token
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const authData = localStorage.getItem("auth_data");
  if (authData) {
    try {
      const parsedAuthData = JSON.parse(authData);
      // Check if token is expired
      if (new Date(parsedAuthData.token.expiry) > new Date()) {
        return parsedAuthData.token.token;
      } else {
        // Token expired, remove it
        localStorage.removeItem("auth_data");
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
      localStorage.removeItem("auth_data");
    }
  }
  return null;
};

// Helper function to get the merchant ID
export const getMerchantId = (): string | null => {
  if (typeof window === "undefined") return null;

  const authData = localStorage.getItem("auth_data");
  if (authData) {
    try {
      const parsedAuthData = JSON.parse(authData);
      // Check if token is expired
      if (new Date(parsedAuthData.token.expiry) > new Date()) {
        return parsedAuthData.merchant_id;
      } else {
        // Token expired, remove it
        localStorage.removeItem("auth_data");
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
      localStorage.removeItem("auth_data");
    }
  }
  return null;
};
