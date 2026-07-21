import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AffiliateManagement from "../pages/admin/AffiliateManagement";

const AdminRoutes: React.FC = () => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/affiliates" replace />} />
      <Route path="/affiliates" element={<AffiliateManagement />} />
      <Route path="/affiliates/add" element={<AffiliateManagement />} />
      <Route path="/affiliates/edit/:id" element={<AffiliateManagement />} />
      {/* Add more admin routes here */}
    </Routes>
  );
};

export default AdminRoutes;
