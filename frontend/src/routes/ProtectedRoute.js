import React from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <Spin fullscreen />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && !user?.is_staff)
    return <Navigate to="/" replace />; // неадминам — редирект на главную

  return children;
};

export default ProtectedRoute;
