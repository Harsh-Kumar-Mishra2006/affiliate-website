// pages/MyPurchases.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import purchaseService from "../../services/purchaseService";
import { type Purchase } from "../../types/purchase.types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
import {
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChevronUpIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const MyPurchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    completed: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchPurchases();
  }, [pagination.page, filterStatus]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getMyPurchases(
        pagination.page,
        pagination.limit,
        filterStatus,
      );
      setPurchases(response.data.purchases);
      setSummary(response.data.summary);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Updated to use both paymentStatus and status
  const getStatusBadge = (purchase: Purchase) => {
    // If order is completed (delivered), show as delivered
    if (purchase.status === "completed") {
      return {
        icon: CheckCircleIcon,
        color: "bg-blue-100 text-blue-800 border border-blue-300",
        label: "Delivered",
      };
    }

    // Otherwise show payment status
    const badges: Record<string, { icon: any; color: string; label: string }> =
      {
        pending: {
          icon: ArrowPathIcon,
          color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          label: "Verifying",
        },
        verified: {
          icon: CheckCircleIcon,
          color: "bg-green-100 text-green-800 border border-green-300",
          label: "Verified ✓",
        },
        rejected: {
          icon: XCircleIcon,
          color: "bg-red-100 text-red-800 border border-red-300",
          label: "Cancelled",
        },
      };
    return badges[purchase.paymentStatus] || badges.pending;
  };

  const getStatusColor = (purchase: Purchase) => {
    if (purchase.status === "completed") {
      return "text-blue-600";
    }
    const colors = {
      pending: "text-emerald-600",
      verified: "text-green-700",
      rejected: "text-red-600",
    };
    return colors[purchase.paymentStatus] || "text-gray-600";
  };

  const getStatusIcon = (purchase: Purchase) => {
    if (purchase.status === "completed") {
      return CheckCircleIcon;
    }
    const icons = {
      pending: ArrowPathIcon,
      verified: CheckCircleIcon,
      rejected: XCircleIcon,
    };
    return icons[purchase.paymentStatus] || ClockIcon;
  };

  const getStatusDisplayText = (purchase: Purchase) => {
    if (purchase.status === "completed") {
      return "Delivered";
    }
    const texts = {
      pending: "Verifying...",
      verified: "Verified ✓",
      rejected: "Cancelled",
    };
    return texts[purchase.paymentStatus] || "Unknown";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
          <p className="text-gray-600 mt-1">
            Track all your purchases and orders
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Verifying</p>
            <p className="text-2xl font-bold text-emerald-600">
              {summary.pending || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-2xl font-bold text-green-700">
              {summary.verified || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Delivered</p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.completed || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Orders</option>
              <option value="pending">Verifying</option>
              <option value="verified">Verified</option>
              <option value="completed">Delivered</option>
              <option value="rejected">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No purchases yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start shopping to see your orders here
              </p>
              <Link to="/products">
                <Button variant="primary">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases.map((purchase) => {
                    const badge = getStatusBadge(purchase);
                    const Icon = badge.icon;
                    return (
                      <React.Fragment key={purchase.id}>
                        {/* Main Row */}
                        <tr
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => toggleExpand(purchase.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                {purchase.Product?.mainImage ? (
                                  <img
                                    src={purchase.Product.mainImage}
                                    alt={purchase.productName}
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
                                  {purchase.productName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {purchase.Product?.company || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm">
                              {purchase.orderId}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-gray-900">
                              {formatPrice(purchase.totalAmount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(purchase.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(purchase.id);
                              }}
                              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm inline-flex items-center"
                            >
                              {expandedId === purchase.id ? (
                                <>
                                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  View Details
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {expandedId === purchase.id && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* Order Information */}
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                      <DocumentTextIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                      Order Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Order ID
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 font-mono">
                                          {purchase.orderId}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Status
                                        </span>
                                        <span>
                                          <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                                          >
                                            <Icon className="h-3 w-3 mr-1" />
                                            {badge.label}
                                          </span>
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Date
                                        </span>
                                        <span className="text-sm text-gray-900">
                                          {formatDate(purchase.createdAt)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Quantity
                                        </span>
                                        <span className="text-sm text-gray-900">
                                          {purchase.quantity || 1}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment Details */}
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                      <CurrencyRupeeIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                      Payment Details
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Product Price
                                        </span>
                                        <span className="text-sm text-gray-900">
                                          {formatPrice(purchase.productPrice)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Total Amount
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                          {formatPrice(purchase.totalAmount)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Payment Status
                                        </span>
                                        <span
                                          className={`text-sm font-medium ${getStatusColor(purchase)}`}
                                        >
                                          <span className="flex items-center">
                                            {(() => {
                                              const StatusIcon =
                                                getStatusIcon(purchase);
                                              return (
                                                <StatusIcon className="h-4 w-4 mr-1" />
                                              );
                                            })()}
                                            {getStatusDisplayText(purchase)}
                                          </span>
                                        </span>
                                      </div>
                                      {purchase.paymentVerifiedAt && (
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">
                                            Verified At
                                          </span>
                                          <span className="text-sm text-gray-900">
                                            {formatDate(
                                              purchase.paymentVerifiedAt,
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {purchase.paymentNotes && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded">
                                          <p className="text-xs text-gray-600">
                                            <span className="font-medium">
                                              Note:
                                            </span>{" "}
                                            {purchase.paymentNotes}
                                          </p>
                                        </div>
                                      )}
                                      {/* Status Messages */}
                                      {purchase.paymentStatus === "pending" &&
                                        purchase.status !== "completed" && (
                                          <div className="mt-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                                            <p className="text-xs text-emerald-700 flex items-center">
                                              {/* <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" /> */}
                                              Your payment is being verified.
                                            </p>
                                          </div>
                                        )}
                                      {purchase.paymentStatus === "verified" &&
                                        purchase.status !== "completed" && (
                                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                            <p className="text-xs text-green-700 flex items-center">
                                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                                              Your payment has been verified
                                              successfully! ✓
                                            </p>
                                          </div>
                                        )}
                                      {purchase.status === "completed" && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                          <p className="text-xs text-blue-700 flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            Your order has been delivered. Thank
                                            you for your purchase!
                                          </p>
                                        </div>
                                      )}
                                      {purchase.paymentStatus ===
                                        "rejected" && (
                                        <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                                          <p className="text-xs text-red-700 flex items-center">
                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                            Your payment was cancelled. Please
                                            contact support if you have
                                            questions.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Buyer Information */}
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                      <UserIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                      Buyer Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center">
                                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900">
                                          {purchase.buyerName}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900">
                                          {purchase.buyerEmail}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900">
                                          {purchase.buyerPhone}
                                        </span>
                                      </div>
                                      {purchase.shippingAddress && (
                                        <div className="flex items-start mt-2">
                                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                          <span className="text-sm text-gray-900">
                                            {purchase.shippingAddress}
                                          </span>
                                        </div>
                                      )}
                                      {purchase.notes && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded">
                                          <p className="text-xs text-gray-600">
                                            <span className="font-medium">
                                              Notes:
                                            </span>{" "}
                                            {purchase.notes}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Commission Information (if affiliate) */}
                                  {purchase.commissionAmount > 0 && (
                                    <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2 lg:col-span-3">
                                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                        <CurrencyRupeeIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                        Commission Details
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">
                                            Commission Rate
                                          </span>
                                          <span className="text-sm font-medium text-gray-900">
                                            {purchase.commissionRate}%
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">
                                            Commission Amount
                                          </span>
                                          <span className="text-sm font-bold text-emerald-600">
                                            {formatPrice(
                                              purchase.commissionAmount,
                                            )}
                                          </span>
                                        </div>
                                        {purchase.affiliate && (
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">
                                              Affiliate
                                            </span>
                                            <span className="text-sm text-gray-900">
                                              {purchase.affiliate.name}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
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
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPurchases;
