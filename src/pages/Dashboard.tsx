// pages/dashboard/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import {
  UserIcon,
  ShoppingBagIcon,
  // CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
  CurrencyDollarIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [_userData, setUserData] = useState<any>(null);
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const profileResponse = await authService.getProfile();
      if (profileResponse.success) {
        setUserData(profileResponse.data.user);
      }

      // Fetch role-specific data
      if (user?.role === "admin") {
        // Admin: Fetch all users and affiliate details
        const usersResponse = await authService.getAllUsers({
          page: 1,
          limit: 10,
        });
        if (usersResponse.success) {
          setDashboardStats(usersResponse.data.summary);
          setRecentActivity(usersResponse.data.users.slice(0, 5));
        }

        // Fetch affiliate details for stats
        const affiliateDetails = await authService.getAffiliateDetails(user.id);
        if (affiliateDetails.success) {
          setAffiliateData(affiliateDetails.data);
        }
      } else if (user?.role === "affiliate") {
        // Affiliate: Fetch affiliate-specific data
        const affiliateDetails = await authService.getAffiliateDetails(user.id);
        if (affiliateDetails.success) {
          setAffiliateData(affiliateDetails.data);
        }

        // Fetch recent purchases/commissions
        // This would be a separate API call
        setRecentActivity([]);
      } else {
        // Regular user: Fetch purchase history
        // This would be a separate API call
        setRecentActivity([]);
      }
    } catch (error: any) {
      console.error("Dashboard fetch error:", error);
      toast.error(
        error.response?.data?.error || "Failed to fetch dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ============= RENDER FUNCTIONS =============

  const renderAdminDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats?.totalUsers || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-purple-600 font-medium">Admins</span>
                <p className="text-gray-700">
                  {dashboardStats?.totalAdmins || 0}
                </p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Affiliates</span>
                <p className="text-gray-700">
                  {dashboardStats?.totalAffiliates || 0}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Users</span>
                <p className="text-gray-700">
                  {dashboardStats?.totalCustomers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardStats?.activeUsers || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-red-600">
                {dashboardStats?.inactiveUsers || 0}
              </span>
              <span className="text-gray-500"> inactive</span>
            </div>
          </div>

          {/* <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ₹
                  {affiliateData?.stats?.purchases?.revenue?.toFixed(2) ||
                    "0.00"}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹
                  {affiliateData?.stats?.commissions?.total?.toFixed(2) ||
                    "0.00"}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-yellow-600">Pending</span>
                <p className="text-gray-700">
                  ₹
                  {affiliateData?.stats?.commissions?.pending?.toFixed(2) ||
                    "0.00"}
                </p>
              </div>
              <div>
                <span className="text-green-600">Paid</span>
                <p className="text-gray-700">
                  ₹
                  {affiliateData?.stats?.commissions?.paid?.toFixed(2) ||
                    "0.00"}
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Users
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  {/* <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivity.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "affiliate"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                      >
                        View
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAffiliateDashboard = () => {
    const stats = affiliateData?.stats || {};
    const affiliate = affiliateData?.affiliate || {};

    return (
      <div className="space-y-6">
        {/* Affiliate Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {affiliate.name || user?.name}! 👋
              </h2>
              <p className="text-blue-100 mt-1">
                Affiliate ID:{" "}
                {affiliate.affiliateId || user?.affiliateId || "N/A"}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">
                Commission Rate:{" "}
                {affiliate.commissionRate || user?.commissionRate || 10}%
              </span>
            </div>
          </div>
        </div>

        {/* Affiliate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.products?.total || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600">
                {stats.products?.active || 0} active
              </span>
              <span className="text-gray-400 mx-1">•</span>
              <span className="text-red-600">
                {stats.products?.inactive || 0} inactive
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.purchases?.total || 0}
                </p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Revenue: ₹{stats.purchases?.revenue?.toFixed(2) || "0.00"}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{stats.earnings?.totalEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-blue-600">
                Available: ₹
                {stats.earnings?.availableBalance?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Affiliate Links</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.links?.total || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Clicks: {stats.links?.totalClicks || 0}
            </div>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Commission Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{stats.commissions?.total?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-xl font-bold text-yellow-700">
                ₹{stats.commissions?.pending?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Approved</p>
              <p className="text-xl font-bold text-green-700">
                ₹{stats.commissions?.approved?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Paid</p>
              <p className="text-xl font-bold text-blue-700">
                ₹{stats.commissions?.paid?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        {affiliateData?.products && affiliateData.products.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affiliateData.products.slice(0, 6).map((product: any) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500">₹{product.price}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full
                      ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Sales: {product.purchaseCount || 0} • Revenue: ₹
                    {product.totalRevenue?.toFixed(2) || "0.00"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUserDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600">
                {user?.email} • Member since{" "}
                {new Date(user?.createdAt || "").toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-emerald-600">₹0.00</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">0</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity to show</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Start Shopping →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============= MAIN RENDER =============
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === "admin" &&
                "Manage users, affiliates, and monitor platform activity"}
              {user?.role === "affiliate" &&
                "Track your earnings, products, and affiliate performance"}
              {user?.role === "user" &&
                "View your purchases and account activity"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Role-based Dashboard */}
        {user?.role === "admin" && renderAdminDashboard()}
        {user?.role === "affiliate" && renderAffiliateDashboard()}
        {user?.role === "user" && renderUserDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
