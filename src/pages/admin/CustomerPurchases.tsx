// pages/admin/CustomerPurchases.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useAuth";
import purchaseService from "../../services/purchaseService";
import { type Purchase } from "../../types/purchase.types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import {
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  PhotoIcon,
  BanknotesIcon,
  UserGroupIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const CustomerPurchases: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    completed: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalAdminCommission: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    paymentStatus: "",
    status: "",
    productOwner: "",
    search: "",
  });
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationAction, setVerificationAction] = useState<
    "verified" | "rejected"
  >("verified");

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <XCircleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            Only administrators can manage customer purchases.
          </p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPurchases();
  }, [pagination.page, filters]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getAllPurchases(
        pagination.page,
        pagination.limit,
        filters,
      );
      setPurchases(response.data.purchases);
      setSummary(response.data.summary);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error("Error fetching purchases:", error);
      toast.error(error.response?.data?.error || "Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleVerifyPayment = async (
    orderId: string,
    action: "verified" | "rejected",
  ) => {
    try {
      setVerifyingOrderId(orderId);
      const response = await purchaseService.verifyPayment(
        orderId,
        action,
        verificationNotes,
      );
      toast.success(response.message || `Payment ${action} successfully!`);
      setShowVerificationModal(false);
      setSelectedPurchase(null);
      setVerificationNotes("");
      fetchPurchases();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to verify payment");
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const openVerificationModal = (
    purchase: Purchase,
    action: "verified" | "rejected",
  ) => {
    setSelectedPurchase(purchase);
    setVerificationAction(action);
    setShowVerificationModal(true);
    setVerificationNotes("");
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

  const getProductOwnerBadge = (role?: string) => {
    if (!role) return null;
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          role === "admin"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-purple-100 text-purple-700"
        }`}
      >
        {role === "admin" ? "Admin Product" : "Affiliate Product"}
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-8 w-8 text-emerald-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Customer Purchases
                </h1>
              </div>
              <p className="text-gray-600 mt-1">
                Manage and verify all customer purchases and commission
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPurchases()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Pending Verification</p>
            <p className="text-2xl font-bold text-yellow-600">
              {summary.pending}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatPrice(summary.totalRevenue || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">Admin Commission</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(summary.totalAdminCommission || 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.paymentStatus}
              onChange={(e) =>
                handleFilterChange("paymentStatus", e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.productOwner}
              onChange={(e) =>
                handleFilterChange("productOwner", e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="">All Products</option>
              <option value="admin">Admin Products</option>
              <option value="affiliate">Affiliate Products</option>
            </select>

            <input
              type="text"
              placeholder="Search by order ID, buyer, or product..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No purchases found
              </h3>
              <p className="text-gray-600">
                {filters.search || filters.paymentStatus || filters.productOwner
                  ? "Try adjusting your filters"
                  : "Customers haven't made any purchases yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order / Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Screenshot
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
                      <tr className="hover:bg-gray-50 transition-colors">
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
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {purchase.productName}
                                </span>
                                {getProductOwnerBadge(
                                  purchase.Product?.addedByRole,
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-mono">
                                  {purchase.orderId}
                                </span>
                                <span>•</span>
                                <span>
                                  {purchase.Product?.company || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {purchase.buyerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {purchase.buyerEmail}
                          </div>
                          <div className="text-xs text-gray-400">
                            {purchase.buyerPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(purchase.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Qty: {purchase.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-emerald-600 font-medium">
                            {formatPrice(purchase.commissionAmount || 0)}
                          </div>
                          <div className="text-xs text-blue-600">
                            Admin:{" "}
                            {formatPrice(purchase.adminCommissionAmount || 0)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Rate: {purchase.commissionRate || 0}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(purchase.paymentStatus)}
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(purchase.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {purchase.paymentScreenshot ? (
                            <button
                              onClick={() => {
                                window.open(
                                  purchase.paymentScreenshot?.url,
                                  "_blank",
                                );
                              }}
                              className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 text-sm"
                              title="View Screenshot"
                            >
                              <PhotoIcon className="h-5 w-5" />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No upload
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleExpand(purchase.id)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title={
                                expandedId === purchase.id
                                  ? "Hide Details"
                                  : "View Details"
                              }
                            >
                              {expandedId === purchase.id ? (
                                <ChevronUpIcon className="h-5 w-5" />
                              ) : (
                                <ChevronDownIcon className="h-5 w-5" />
                              )}
                            </button>

                            {purchase.paymentStatus === "pending" && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    openVerificationModal(purchase, "verified")
                                  }
                                  className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Verify Payment"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    openVerificationModal(purchase, "rejected")
                                  }
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject Payment"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedId === purchase.id && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="border-t border-gray-200 pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Order Information */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                    Order Details
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">
                                        Order ID
                                      </span>
                                      <span className="text-sm font-mono font-medium text-gray-900">
                                        {purchase.orderId}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">
                                        Product
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {purchase.productName}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">
                                        Quantity
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {purchase.quantity}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">
                                        Product Owner
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {purchase.Product?.addedByRole || "N/A"}
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
                                      {getStatusBadge(purchase.paymentStatus)}
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
                                    {purchase.paymentVerifiedByUser && (
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                          Verified By
                                        </span>
                                        <span className="text-sm text-gray-900">
                                          {purchase.paymentVerifiedByUser.name}
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

                                {/* Commission Details */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <BanknotesIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                    Commission Breakdown
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">
                                        Commission Rate
                                      </span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {purchase.commissionRate || 0}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">
                                        Affiliate Commission
                                      </span>
                                      <span className="text-sm font-medium text-emerald-600">
                                        {formatPrice(
                                          purchase.commissionAmount || 0,
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-500">
                                        Admin Commission
                                      </span>
                                      <span className="text-sm font-medium text-blue-600">
                                        {formatPrice(
                                          purchase.adminCommissionAmount || 0,
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

                                {/* Buyer Information */}
                                <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2 lg:col-span-3">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <UserIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                    Buyer Information
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                          {purchase.buyerName}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                          {purchase.buyerEmail}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                          {purchase.buyerPhone}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      {purchase.shippingAddress && (
                                        <div className="flex items-start gap-2">
                                          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
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
                                </div>

                                {/* Payment Screenshot */}
                                {purchase.paymentScreenshot && (
                                  <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2 lg:col-span-3">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                      <PhotoIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                      Payment Screenshot
                                    </h4>
                                    <div className="flex flex-col sm:flex-row items-start gap-4">
                                      <img
                                        src={purchase.paymentScreenshot.url}
                                        alt="Payment Screenshot"
                                        className="max-w-xs max-h-64 rounded-lg border border-gray-200"
                                        onClick={() =>
                                          window.open(
                                            purchase.paymentScreenshot?.url,
                                            "_blank",
                                          )
                                        }
                                      />
                                      <div className="text-sm text-gray-600">
                                        <p>
                                          <span className="font-medium">
                                            Original Name:
                                          </span>{" "}
                                          {
                                            purchase.paymentScreenshot
                                              .originalName
                                          }
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Format:
                                          </span>{" "}
                                          {purchase.paymentScreenshot.format ||
                                            "N/A"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Size:
                                          </span>{" "}
                                          {purchase.paymentScreenshot.size
                                            ? `${(purchase.paymentScreenshot.size / 1024).toFixed(0)} KB`
                                            : "N/A"}
                                        </p>
                                      </div>
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

      {/* Verification Modal */}
      {showVerificationModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {verificationAction === "verified" ? "Verify" : "Reject"}{" "}
                Payment
              </h3>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setSelectedPurchase(null);
                  setVerificationNotes("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono font-medium text-gray-900">
                  {selectedPurchase.orderId}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-medium text-gray-900">
                  {selectedPurchase.productName}
                </p>
                <p className="text-sm text-gray-500">
                  Amount: {formatPrice(selectedPurchase.totalAmount)}
                </p>
              </div>

              {selectedPurchase.paymentScreenshot && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Payment Screenshot
                  </p>
                  <img
                    src={selectedPurchase.paymentScreenshot.url}
                    alt="Payment Screenshot"
                    className="max-h-48 rounded-lg cursor-pointer"
                    onClick={() =>
                      window.open(
                        selectedPurchase.paymentScreenshot?.url,
                        "_blank",
                      )
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Add notes for ${verificationAction} this payment...`}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setSelectedPurchase(null);
                    setVerificationNotes("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={
                    verificationAction === "verified" ? "primary" : "danger"
                  }
                  onClick={() => {
                    if (selectedPurchase) {
                      handleVerifyPayment(
                        selectedPurchase.orderId,
                        verificationAction,
                      );
                    }
                  }}
                  isLoading={verifyingOrderId === selectedPurchase?.orderId}
                  className="flex-1"
                >
                  {verificationAction === "verified" ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Verify Payment
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPurchases;
