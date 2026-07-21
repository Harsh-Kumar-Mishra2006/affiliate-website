import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import affiliateService from "../../services/affiliateService";
import {
  type Affiliate,
  type AddAffiliateData,
  type AffiliateStats,
} from "../../types/affiliate.types";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";

const AffiliateManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(
    null,
  );
  const [newPassword, setNewPassword] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortField, setSortField] = useState<
    "name" | "email" | "createdAt" | "commissionRate"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // In AffiliateManagement.tsx - Temporary fix
  const [stats, setStats] = useState<AffiliateStats>({
    totalAffiliates: 0,
    activeAffiliates: 0,
    inactiveAffiliates: 0,
    totalEarnings: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
  });
  const [formData, setFormData] = useState<AddAffiliateData>({
    name: "",
    email: "",
    username: "",
    phone: "",
    commissionRate: 10,
    paymentMethod: "",
    paymentDetails: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      toast.error("Access denied. Admin only.");
      return;
    }
    fetchAffiliates();
    fetchStats();
  }, []);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const response = await affiliateService.getAffiliates();
      setAffiliates(response.data);
    } catch (error: any) {
      console.error("Error fetching affiliates:", error);
      toast.error(error.response?.data?.error || "Failed to fetch affiliates");
    } finally {
      setLoading(false);
    }
  };

  // Update the fetchStats function:
  const fetchStats = async () => {
    try {
      const response = await affiliateService.getAffiliateStats();
      if (response.success && response.data) {
        setStats({
          totalAffiliates: response.data.totalAffiliates || 0,
          activeAffiliates: response.data.activeAffiliates || 0,
          inactiveAffiliates: response.data.inactiveAffiliates || 0,
          totalEarnings: Number(response.data.totalEarnings) || 0,
          totalCommissions: Number(response.data.totalCommissions) || 0,
          pendingCommissions: Number(response.data.pendingCommissions) || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Don't show toast for stats error, just use default values
    }
  };

  const handleAddAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const response = await affiliateService.addAffiliate(formData);
      toast.success(response.message || "Affiliate added successfully!");

      // Show temporary password in modal
      if (response.data.temporaryPassword) {
        setNewPassword(response.data.temporaryPassword);
        setShowPasswordModal(true);
      }

      setShowAddModal(false);
      resetForm();
      fetchAffiliates();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add affiliate");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAffiliate) return;

    setFormLoading(true);
    try {
      // const response = await affiliateService.updateAffiliate(
      //   selectedAffiliate.id,
      //   {
      //     name: selectedAffiliate.name,
      //     email: selectedAffiliate.email,
      //     username: selectedAffiliate.username,
      //     phone: selectedAffiliate.phone,
      //     commissionRate: selectedAffiliate.commissionRate,
      //     isActive: selectedAffiliate.isActive,
      //   },
      // );
      toast.success("Affiliate updated successfully!");
      setShowEditModal(false);
      setSelectedAffiliate(null);
      fetchAffiliates();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update affiliate");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAffiliate = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this affiliate? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await affiliateService.deleteAffiliate(id);
      toast.success("Affiliate deleted successfully");
      fetchAffiliates();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete affiliate");
    }
  };

  const handleResetPassword = async (id: number) => {
    if (
      !confirm(
        "Reset password for this affiliate? A new temporary password will be generated.",
      )
    ) {
      return;
    }

    try {
      const response = await affiliateService.resetAffiliatePassword(id);
      setNewPassword(response.data.temporaryPassword);
      setShowPasswordModal(true);
      toast.success(response.message || "Password reset successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reset password");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await affiliateService.toggleAffiliateStatus(id, !currentStatus);
      toast.success(
        `Affiliate ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
      fetchAffiliates();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (
      formData.commissionRate !== undefined &&
      (formData.commissionRate < 0 || formData.commissionRate > 100)
    ) {
      newErrors.commissionRate = "Commission rate must be between 0 and 100";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      username: "",
      phone: "",
      commissionRate: 10,
      paymentMethod: "",
      paymentDetails: {},
    });
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "commissionRate" ? parseFloat(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (selectedAffiliate) {
      setSelectedAffiliate({
        ...selectedAffiliate,
        [name]: name === "commissionRate" ? parseFloat(value) : value,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const filteredAffiliates = affiliates
    .filter((affiliate) => {
      const matchesSearch =
        affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.affiliateId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && affiliate.isActive) ||
        (filterStatus === "inactive" && !affiliate.isActive);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "commissionRate":
          comparison = (a.commissionRate || 0) - (b.commissionRate || 0);
          break;
        case "createdAt":
        default:
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

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
            <h1 className="text-3xl font-bold text-gray-900">
              Affiliate Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your affiliates and their commissions
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Affiliate
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-emerald-100 rounded-lg p-3">
                <UserGroupIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Affiliates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAffiliates}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Affiliates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeAffiliates}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.totalEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Commissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.pendingCommissions?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search affiliates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="createdAt">Date Joined</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="commissionRate">Commission Rate</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === "asc" ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affiliate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAffiliates.map((affiliate) => (
                  <tr
                    key={affiliate.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-700 font-semibold">
                            {affiliate.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {affiliate.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {affiliate.affiliateId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {affiliate.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {affiliate.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(affiliate.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {affiliate.commissionRate}%
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-600">
                        ₹
                        {(() => {
                          const earnings =
                            typeof affiliate.totalEarnings === "number"
                              ? affiliate.totalEarnings
                              : Number(affiliate.totalEarnings || 0);
                          return earnings.toFixed(2);
                        })()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Balance: ₹
                        {(() => {
                          const balance =
                            typeof affiliate.availableBalance === "number"
                              ? affiliate.availableBalance
                              : Number(affiliate.availableBalance || 0);
                          return balance.toFixed(2);
                        })()}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(affiliate.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(affiliate.id, affiliate.isActive)
                          }
                          className={`p-1 rounded-lg transition-colors ${
                            affiliate.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={affiliate.isActive ? "Deactivate" : "Activate"}
                        >
                          {affiliate.isActive ? (
                            <XCircleIcon className="h-5 w-5" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleResetPassword(affiliate.id)}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAffiliate(affiliate);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAffiliate(affiliate.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAffiliates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No affiliates found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Affiliate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Affiliate
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddAffiliate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Username"
                    type="text"
                    name="username"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleInputChange}
                    error={errors.username}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    required
                  />
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      name="commissionRate"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.commissionRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.commissionRate && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.commissionRate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-emerald-800">
                    <strong>Note:</strong> A temporary password will be
                    generated and shown after submission. The affiliate must use
                    this password to login and will be prompted to change it.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={formLoading}
                  >
                    Add Affiliate
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Affiliate Modal */}
      {showEditModal && selectedAffiliate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Affiliate
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAffiliate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateAffiliate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={selectedAffiliate.name}
                    onChange={handleEditInputChange}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={selectedAffiliate.email}
                    onChange={handleEditInputChange}
                    required
                  />
                  <Input
                    label="Username"
                    type="text"
                    name="username"
                    value={selectedAffiliate.username}
                    onChange={handleEditInputChange}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={selectedAffiliate.phone}
                    onChange={handleEditInputChange}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      name="commissionRate"
                      min="0"
                      max="100"
                      step="0.5"
                      value={selectedAffiliate.commissionRate}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="isActive"
                      value={selectedAffiliate.isActive ? "active" : "inactive"}
                      onChange={(e) => {
                        if (selectedAffiliate) {
                          setSelectedAffiliate({
                            ...selectedAffiliate,
                            isActive: e.target.value === "active",
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAffiliate(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={formLoading}
                  >
                    Update Affiliate
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-emerald-100 rounded-full p-3">
                  <KeyIcon className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Temporary Password Generated
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Please share this password with the affiliate. They will be
                prompted to change it on first login.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono font-bold text-emerald-600">
                    {newPassword}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newPassword)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <ClipboardIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword("");
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateManagement;
