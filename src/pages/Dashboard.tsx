import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Products",
      value: "156",
      icon: ShoppingBagIcon,
      color: "bg-emerald-500",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Total Earnings",
      value: "₹45,230",
      icon: CurrencyRupeeIcon,
      color: "bg-teal-500",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Total Clicks",
      value: "2,847",
      icon: ChartBarIcon,
      color: "bg-lime-500",
      change: "-3%",
      trend: "down",
    },
    {
      title: "Conversion Rate",
      value: "4.2%",
      icon: UserGroupIcon,
      color: "bg-green-500",
      change: "+2%",
      trend: "up",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New product added",
      product: "Smart Watch Pro",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "Sale completed",
      product: "Wireless Earbuds",
      time: "5 hours ago",
    },
    {
      id: 3,
      action: "Commission earned",
      product: "Gaming Laptop",
      amount: "₹1,500",
      time: "1 day ago",
    },
    {
      id: 4,
      action: "New affiliate joined",
      product: "Premium Headphones",
      time: "2 days ago",
    },
  ];

  const quickActions = [
    {
      label: "Add Product",
      icon: ShoppingBagIcon,
      link: "/products/add",
      color: "bg-emerald-500",
    },
    {
      label: "View Analytics",
      icon: ChartBarIcon,
      link: "/analytics",
      color: "bg-teal-500",
    },
    {
      label: "Manage Profile",
      icon: Cog6ToothIcon,
      link: "/profile",
      color: "bg-lime-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{user?.name}</span>!
            {user?.role === "affiliate" &&
              " Here's your affiliate performance overview."}
            {user?.role === "admin" && " Here's your platform overview."}
            {user?.role === "user" && " Here's your activity overview."}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div
                  className={`flex items-center text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  {stat.trend === "up" ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className={`${action.color} p-3 rounded-lg`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Click to {action.label.toLowerCase()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.product}</p>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-semibold text-emerald-600">
                        {activity.amount}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Overview
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </span>
              </div>
              {user?.role === "affiliate" && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Affiliate ID</p>
                    <p className="font-mono text-sm text-gray-900">
                      {user?.affiliateId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Commission Rate</p>
                    <p className="font-medium text-gray-900">
                      {user?.commissionRate}%
                    </p>
                  </div>
                </>
              )}
              <div className="pt-3">
                <Link
                  to="/profile"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-emerald-600 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
