import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  UserIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Button from "../common/Button";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin, isAffiliate } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const roleColors = {
      admin: "bg-purple-100 text-purple-800",
      affiliate: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[user.role]}`}
      >
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </span>
    );
  };

  const navLinks = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Products", path: "/products", icon: ShoppingBagIcon },
  ];

  const authLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: ChartBarIcon,
      show: isAuthenticated,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserIcon,
      show: isAuthenticated,
    },
    { name: "Admin", path: "/admin", icon: ShieldCheckIcon, show: isAdmin() },
    {
      name: "Admin Panel",
      path: "/admin/affiliates",
      icon: ShieldCheckIcon,
      show: isAdmin(),
    },
    {
      name: "My Products",
      path: "/affiliate/products",
      icon: ShoppingBagIcon,
      show: isAffiliate() || isAdmin(),
    },
    {
      name: "Add Product",
      path: "/affiliate/products/add",
      icon: PlusIcon,
      show: isAffiliate() || isAdmin(),
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBagIcon className="h-8 w-8 text-lime-300" />
              <span className="text-2xl font-bold tracking-tight">
                Affiliate<span className="text-lime-300">Sarthi</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            ))}

            {authLinks.map(
              (link) =>
                link.show && (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                ),
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{user?.name}</span>
                  {getRoleBadge()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-white text-white hover:bg-white/20"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white/20"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="success"
                    size="sm"
                    className="bg-lime-500 hover:bg-lime-600 text-white"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-emerald-700/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            ))}

            {authLinks.map(
              (link) =>
                link.show && (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                ),
            )}

            {isAuthenticated ? (
              <div className="border-t border-white/20 pt-2 mt-2">
                <div className="px-3 py-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs opacity-75">{user?.email}</div>
                  </div>
                  {getRoleBadge()}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg hover:bg-white/20 transition-colors text-red-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-white/20 pt-2 mt-2 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-lg bg-lime-500 hover:bg-lime-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
