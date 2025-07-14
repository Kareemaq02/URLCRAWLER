import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// Represents the decoded user information from the JWT token
interface User {
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
  exp?: number;
}

// Describes the shape of the authentication context
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility to safely decode and check expiration
function safeDecodeToken(token: string): User | null {
  try {
    const decoded = jwtDecode<User>(token);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) return null; // token expired
    return decoded;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      const decodedUser = safeDecodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
        localStorage.setItem("authToken", token);
      } else {
        setUser(null);
        localStorage.removeItem("authToken");
      }
    } else {
      setUser(null);
      localStorage.removeItem("authToken");
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
