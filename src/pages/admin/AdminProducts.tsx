// pages/admin/AdminProducts.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useAuth";
import productService from "../../services/productService";
import { type Product } from "../../types/product.types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import {
  PlusIcon,
  // PencilSquareIcon,
  TrashIcon,
  // EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const AdminProducts: React.FC = () => {
  const isAdmin = useIsAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null,
  );
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
  });
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Access denied. Admin only.");
      return;
    }
    fetchProducts();
    fetchStats();
  }, [showInactive]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAdminProducts({
        showInactive,
        limit: 100,
      });
      setProducts(response.data.products);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error(error.response?.data?.error || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await productService.getProductStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // ✅ FIXED: Use FormData for status update
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append("isActive", String(!currentStatus));

      await productService.updateProduct(id, formData);
      toast.success(`Product ${!currentStatus ? "activated" : "deactivated"}`);
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully");
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Helper function to safely parse tags
  const getTagsArray = (tags: any): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // ✅ Helper function to safely parse specifications
  const getSpecificationsObject = (specs: any): Record<string, any> => {
    if (!specs) return {};
    if (typeof specs === "object" && !Array.isArray(specs)) return specs;
    if (typeof specs === "string") {
      try {
        const parsed = JSON.parse(specs);
        return typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch {
        return {};
      }
    }
    return {};
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  // Access denied for non-admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <XCircleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            Only administrators can manage products.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Product Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all products in your affiliate store
                </p>
              </div>
            </div>
          </div>
          <Link to="/admin/products/add">
            <Button variant="primary" size="lg" className="mt-4 md:mt-0">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Active Products</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Inactive Products</p>
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatPrice(stats.totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Show Inactive</p>
              <p className="text-xs text-gray-400 mt-1">
                {showInactive ? "Showing all" : "Active only"}
              </p>
            </div>
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showInactive ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showInactive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  // ✅ Parse tags and specifications safely
                  const tags = getTagsArray(product.tags);
                  const specifications = getSpecificationsObject(
                    product.specifications,
                  );

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                              {product.mainImage ? (
                                <img
                                  src={product.mainImage}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.company} • {product.Category?.name}
                              </div>
                              {/* ✅ NEW: Service ID display */}
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Service ID:
                                </span>
                                <span className="font-medium text-purple-600">
                                  {product.serviceId || "N/A"}
                                </span>
                              </div>
                              {product.sku && (
                                <div className="text-xs text-gray-400">
                                  SKU: {product.sku}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(Number(product.price))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              product.stock > 10
                                ? "text-green-600"
                                : product.stock > 0
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {product.stock > 0 ? product.stock : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(product.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.addedByUser?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.addedByUser?.email || ""}
                          </div>
                          {product.addedByRole && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                product.addedByRole === "admin"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {product.addedByRole}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleExpand(product.id)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title={
                                expandedProductId === product.id
                                  ? "Hide Details"
                                  : "View Details"
                              }
                            >
                              {expandedProductId === product.id ? (
                                <ChevronUpIcon className="h-5 w-5" />
                              ) : (
                                <ChevronDownIcon className="h-5 w-5" />
                              )}
                            </button>
                            <Link
                              to={`/product/${product.slug}`}
                              target="_blank"
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Product"
                            >
                              {/* <EyeIcon className="h-5 w-5" /> */}
                            </Link>
                            <button
                              onClick={() =>
                                handleToggleStatus(product.id, product.isActive)
                              }
                              className={`p-1 rounded-lg transition-colors ${
                                product.isActive
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                product.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              {product.isActive ? (
                                <XCircleIcon className="h-5 w-5" />
                              ) : (
                                <CheckCircleIcon className="h-5 w-5" />
                              )}
                            </button>
                            {/* <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </Link> */}
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedProductId === product.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Basic Info */}
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                  Product Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">SKU:</span>
                                    <span className="font-medium">
                                      {product.sku}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Brand:
                                    </span>
                                    <span className="font-medium">
                                      {product.brand || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Company:
                                    </span>
                                    <span className="font-medium">
                                      {product.company}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Category:
                                    </span>
                                    <span className="font-medium">
                                      {product.Category?.name || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Added By:
                                    </span>
                                    <span className="font-medium">
                                      {product.addedByUser?.name || "Unknown"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Sales Info */}
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                  Sales & Revenue
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Total Sales:
                                    </span>
                                    <span className="font-medium">
                                      {product.purchaseCount || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Total Revenue:
                                    </span>
                                    <span className="font-medium">
                                      {formatPrice(product.totalRevenue || 0)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Commission Rate:
                                    </span>
                                    <span className="font-medium text-emerald-600">
                                      {product.commissionRate || "N/A"}%
                                    </span>
                                  </div>
                                  {product.affiliateUrl && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Affiliate URL:
                                      </span>
                                      <a
                                        href={product.affiliateUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-blue-600 hover:underline truncate max-w-[150px]"
                                      >
                                        Link
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                  Dates
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Created:
                                    </span>
                                    <span className="font-medium">
                                      {formatDate(product.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Last Updated:
                                    </span>
                                    <span className="font-medium">
                                      {formatDate(product.updatedAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {product.description && (
                                <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2 lg:col-span-3">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {product.description}
                                  </p>
                                  {product.shortDescription && (
                                    <p className="text-sm text-gray-500 mt-2">
                                      <span className="font-medium">
                                        Short:
                                      </span>{" "}
                                      {product.shortDescription}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Tags */}
                              {tags.length > 0 && (
                                <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2 lg:col-span-3">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    Tags
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Specifications */}
                              {Object.keys(specifications).length > 0 && (
                                <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2 lg:col-span-3">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    Specifications
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(specifications).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex justify-between border-b border-gray-100 py-1"
                                        >
                                          <span className="text-sm text-gray-500">
                                            {key}:
                                          </span>
                                          <span className="text-sm font-medium">
                                            {String(value)}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                {showInactive
                  ? "No products match your filters."
                  : "Start adding products to your affiliate store."}
              </p>
              <Link to="/admin/products/add">
                <Button variant="primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
