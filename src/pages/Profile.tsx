import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Validators, validateForm } from "../utils/validators";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  BanknotesIcon,
  CreditCardIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "payments"
  >("profile");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    paypalEmail: "",
    upiId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      if (user.paymentDetails) {
        setPaymentData({
          paymentMethod: user.paymentMethod || "",
          bankName: user.paymentDetails?.bankName || "",
          accountNumber: user.paymentDetails?.accountNumber || "",
          ifscCode: user.paymentDetails?.ifscCode || "",
          paypalEmail: user.paymentDetails?.paypalEmail || "",
          upiId: user.paymentDetails?.upiId || "",
        });
      }
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateProfile = () => {
    const rules = {
      name: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
      phone: [Validators.phone],
    };
    const result = validateForm(formData, rules);
    setErrors(result.errors);
    return result.isValid;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword)
      newErrors.newPassword = "New password is required";
    if (passwordData.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    if (!paymentData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }
    if (paymentData.paymentMethod === "bank") {
      if (!paymentData.bankName) newErrors.bankName = "Bank name is required";
      if (!paymentData.accountNumber)
        newErrors.accountNumber = "Account number is required";
      if (!paymentData.ifscCode) newErrors.ifscCode = "IFSC code is required";
    }
    if (paymentData.paymentMethod === "paypal" && !paymentData.paypalEmail) {
      newErrors.paypalEmail = "PayPal email is required";
    }
    if (paymentData.paymentMethod === "upi" && !paymentData.upiId) {
      newErrors.upiId = "UPI ID is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setFormLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      // Error handled by context
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setFormLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Error handled by context
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setFormLoading(true);
    try {
      const { paymentMethod, ...details } = paymentData;
      await updateProfile({
        paymentMethod: paymentData.paymentMethod,
        paymentDetails: details,
      });
    } catch (error) {
      // Error handled by context
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getRoleBadge = () => {
    const roleColors = {
      admin: "bg-purple-100 text-purple-800",
      affiliate: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${roleColors[user.role]}`}
      >
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-100 rounded-full p-3">
                <UserIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  {getRoleBadge()}
                </div>
              </div>
            </div>
            {user.role === "affiliate" && (
              <div className="mt-3 md:mt-0 flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Commission Rate</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {user.commissionRate}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-lg font-bold text-teal-600">
                    ₹{user.totalEarnings || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{user.availableBalance || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "profile", label: "Profile", icon: UserIcon },
                { id: "password", label: "Password", icon: LockClosedIcon },
                { id: "payments", label: "Payments", icon: CreditCardIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleSubmitProfile}>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    error={errors.name}
                    icon={<UserIcon className="h-5 w-5" />}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={user.email}
                    disabled
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                  />
                  <Input
                    label="Username"
                    type="text"
                    name="username"
                    value={user.username}
                    disabled
                    icon={<IdentificationIcon className="h-5 w-5" />}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    error={errors.phone}
                    icon={<PhoneIcon className="h-5 w-5" />}
                    disabled={!isEditing}
                  />

                  {user.role === "affiliate" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Affiliate ID
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm">
                            {user.affiliateId}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Commission Rate
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="px-3 py-2 bg-green-50 rounded-lg font-semibold text-green-700">
                            {user.commissionRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: user.name || "",
                              phone: user.phone || "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={formLoading}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                      >
                        <PencilSquareIcon className="h-5 w-5 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handleSubmitPassword}>
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    placeholder="Enter your current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={errors.currentPassword}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password (min 6 characters)"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={errors.newPassword}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={errors.confirmPassword}
                  />
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={formLoading}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && user.role === "affiliate" && (
              <form onSubmit={handleSubmitPayment}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={paymentData.paymentMethod}
                      onChange={handlePaymentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="upi">UPI</option>
                    </select>
                    {errors.paymentMethod && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.paymentMethod}
                      </p>
                    )}
                  </div>

                  {paymentData.paymentMethod === "bank" && (
                    <>
                      <Input
                        label="Bank Name"
                        type="text"
                        name="bankName"
                        placeholder="Enter your bank name"
                        value={paymentData.bankName}
                        onChange={handlePaymentChange}
                        error={errors.bankName}
                        icon={<BanknotesIcon className="h-5 w-5" />}
                      />
                      <Input
                        label="Account Number"
                        type="text"
                        name="accountNumber"
                        placeholder="Enter your account number"
                        value={paymentData.accountNumber}
                        onChange={handlePaymentChange}
                        error={errors.accountNumber}
                      />
                      <Input
                        label="IFSC Code"
                        type="text"
                        name="ifscCode"
                        placeholder="Enter IFSC code"
                        value={paymentData.ifscCode}
                        onChange={handlePaymentChange}
                        error={errors.ifscCode}
                      />
                    </>
                  )}

                  {paymentData.paymentMethod === "paypal" && (
                    <Input
                      label="PayPal Email"
                      type="email"
                      name="paypalEmail"
                      placeholder="Enter your PayPal email"
                      value={paymentData.paypalEmail}
                      onChange={handlePaymentChange}
                      error={errors.paypalEmail}
                      icon={<EnvelopeIcon className="h-5 w-5" />}
                    />
                  )}

                  {paymentData.paymentMethod === "upi" && (
                    <Input
                      label="UPI ID"
                      type="text"
                      name="upiId"
                      placeholder="Enter your UPI ID (e.g., name@upi)"
                      value={paymentData.upiId}
                      onChange={handlePaymentChange}
                      error={errors.upiId}
                    />
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={formLoading}
                    >
                      Save Payment Details
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Need to import LockClosedIcon
import { LockClosedIcon } from "@heroicons/react/24/outline";

export default Profile;
