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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; label: string }> =
      {
        pending: {
          icon: ClockIcon,
          color: "bg-yellow-100 text-yellow-800",
          label: "Pending",
        },
        verified: {
          icon: CheckCircleIcon,
          color: "bg-green-100 text-green-800",
          label: "Verified",
        },
        completed: {
          icon: CheckCircleIcon,
          color: "bg-blue-100 text-blue-800",
          label: "Completed",
        },
        rejected: {
          icon: XCircleIcon,
          color: "bg-red-100 text-red-800",
          label: "Rejected",
        },
      };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
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
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {summary.pending}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.verified}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.completed}
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
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
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
                  {purchases.map((purchase) => (
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
                          {getStatusBadge(purchase.paymentStatus)}
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
                                        {getStatusBadge(purchase.paymentStatus)}
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
                                      <span className="text-sm font-medium">
                                        {purchase.paymentStatus ===
                                        "verified" ? (
                                          <span className="text-green-600">
                                            ✅ Verified
                                          </span>
                                        ) : purchase.paymentStatus ===
                                          "pending" ? (
                                          <span className="text-yellow-600">
                                            ⏳ Pending
                                          </span>
                                        ) : purchase.paymentStatus ===
                                          "rejected" ? (
                                          <span className="text-red-600">
                                            ❌ Rejected
                                          </span>
                                        ) : (
                                          <span className="text-gray-600">
                                            {purchase.paymentStatus}
                                          </span>
                                        )}
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
                  ))}
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
