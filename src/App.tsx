import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Products from "./pages/Products";

// ✅ Admin Pages (Correct imports)
import AdminProducts from "./pages/admin/AdminProducts";
import AddProduct from "./pages/admin/AddProducts";

// Affiliate Pages (Keep for later use)
import AffiliateProducts from "./pages/affiliate/AffiliateProducts";

// Purchase Pages
import PurchaseDetails from "./pages/purchase/PurchaseDetails";
import PaymentPage from "./pages/purchase/PaymentPage";
import MyPurchases from "./pages/purchase/MyPurchases";
import AdminCommission from "./pages/admin/AdminCommission";
import AffiliateCommission from "./pages/affiliate/AffiliateCommission";
import AffiliateAddProduct from "./pages/affiliate/AffiliateAddProduct";
import CustomerPurchases from "./pages/admin/CustomerPurchases";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Role-based Route Component
const RoleRoute: React.FC<{ children: React.ReactNode; roles: string[] }> = ({
  children,
  roles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ============ PUBLIC ROUTES ============ */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/products" element={<Products />} />

      {/* ============ PROTECTED ROUTES (Any logged-in user) ============ */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ============ PURCHASE ROUTES (Logged-in users) ============ */}
      <Route
        path="/purchase/details"
        element={
          <ProtectedRoute>
            <PurchaseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:orderId"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-purchases"
        element={
          <ProtectedRoute>
            <MyPurchases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/affiliate-add-products"
        element={
          <ProtectedRoute>
            <AffiliateAddProduct />
          </ProtectedRoute>
        }
      />

      {/* ============ ADMIN ROUTES (Admin only) ============ */}
      <Route
        path="/admin"
        element={
          <RoleRoute roles={["admin"]}>
            <Navigate to="/admin/products" replace />
          </RoleRoute>
        }
      />

      {/* ✅ Admin Products Management */}
      <Route
        path="/admin/products"
        element={
          <RoleRoute roles={["admin"]}>
            <AdminProducts />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/products/add"
        element={
          <RoleRoute roles={["admin"]}>
            <AddProduct />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/products/edit/:id"
        element={
          <RoleRoute roles={["admin"]}>
            <AddProduct />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/customer-purchases"
        element={
          <RoleRoute roles={["admin"]}>
            <CustomerPurchases />
          </RoleRoute>
        }
      />

      {/* ✅ Admin Dashboard (Placeholder - can add more) */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute roles={["admin"]}>
            <Dashboard />
          </RoleRoute>
        }
      />

      {/* ============ AFFILIATE ROUTES (For later use) ============ */}
      <Route
        path="/affiliate"
        element={
          <RoleRoute roles={["affiliate", "admin"]}>
            <Navigate to="/affiliate/products" replace />
          </RoleRoute>
        }
      />
      <Route
        path="/affiliate/products"
        element={
          <RoleRoute roles={["affiliate", "admin"]}>
            <AffiliateProducts />
          </RoleRoute>
        }
      />

      {/* Commission Routes */}
      <Route
        path="/admin/commission"
        element={
          <RoleRoute roles={["admin"]}>
            <AdminCommission />
          </RoleRoute>
        }
      />

      <Route
        path="/affiliate/commission"
        element={
          <RoleRoute roles={["affiliate"]}>
            <AffiliateCommission />
          </RoleRoute>
        }
      />

      {/* ============ 404 NOT FOUND ============ */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Simple 404 Component
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
};

export default App;
