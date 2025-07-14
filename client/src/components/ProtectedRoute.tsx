import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that checks for the presence of an auth token.
 * Redirects to /auth if not authenticated.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/auth" replace />;
}
