"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Token {
  token: string;
  expiry: string;
}

interface AuthData {
  merchant_id: string;
  token: Token;
}

interface AuthContextType {
  token: Token | null;
  merchantId: string | null;
  isAuthenticated: boolean;
  login: (authData: AuthData) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<Token | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAuthData = localStorage.getItem("auth_data");
      if (storedAuthData) {
        try {
          const parsedAuthData = JSON.parse(storedAuthData);

          // Check if token is expired
          const tokenExpiry = new Date(parsedAuthData.token.expiry);
          const now = new Date();

          if (tokenExpiry > now) {
            setToken(parsedAuthData.token);
            setMerchantId(parsedAuthData.merchant_id);
          } else {
            // Token expired, remove it
            localStorage.removeItem("auth_data");
          }
        } catch (error) {
          console.error("Error parsing stored auth data:", error);
          localStorage.removeItem("auth_data");
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = (authData: AuthData) => {
    setToken(authData.token);
    setMerchantId(authData.merchant_id);
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_data", JSON.stringify(authData));
    }
  };

  const logout = () => {
    setToken(null);
    setMerchantId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_data");
    }
  };

  const isAuthenticated = !!token && new Date(token.expiry) > new Date();

  const value = {
    token,
    merchantId,
    isAuthenticated,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
