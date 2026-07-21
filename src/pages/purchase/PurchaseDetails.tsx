import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import purchaseService from "../../services/purchaseService";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import {
  ShoppingBagIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const PurchaseDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const product = location.state?.product;

  const [formData, setFormData] = useState({
    buyerName: user?.name || "",
    buyerEmail: user?.email || "",
    buyerPhone: user?.phone || "",
    shippingAddress: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login", { state: { from: location.pathname } });
    return null;
  }

  // Redirect if no product
  if (!product) {
    navigate("/products");
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.buyerName) newErrors.buyerName = "Full name is required";
    if (!formData.buyerEmail) newErrors.buyerEmail = "Email is required";
    if (!formData.buyerPhone) newErrors.buyerPhone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await purchaseService.initiatePurchase({
        productId: product.id,
        quantity: 1,
        ...formData,
      });

      // Navigate to payment page with order details
      navigate(`/payment/${response.data.orderId}`, {
        state: {
          orderId: response.data.orderId,
          product: product,
          purchase: response.data.purchase,
          paymentInstructions: response.data.paymentInstructions,
          totalAmount: response.data.totalAmount,
          commissionAmount: response.data.commissionAmount,
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to initiate purchase");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="h-20 w-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.company}</p>
                </div>
              </div>
              <div className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-emerald-600 text-lg">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
                <p className="font-medium">
                  💡 You'll earn 10-25% commission on this purchase
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Purchase Details
              </h1>
              <p className="text-gray-600 mb-6">
                Please fill in your details to complete the purchase
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  name="buyerName"
                  placeholder="Enter your full name"
                  value={formData.buyerName}
                  onChange={handleChange}
                  error={errors.buyerName}
                  icon={<UserIcon className="h-5 w-5" />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="buyerEmail"
                  placeholder="Enter your email"
                  value={formData.buyerEmail}
                  onChange={handleChange}
                  error={errors.buyerEmail}
                  icon={<EnvelopeIcon className="h-5 w-5" />}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  name="buyerPhone"
                  placeholder="Enter your phone number"
                  value={formData.buyerPhone}
                  onChange={handleChange}
                  error={errors.buyerPhone}
                  icon={<PhoneIcon className="h-5 w-5" />}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="shippingAddress"
                      rows={3}
                      placeholder="Enter your shipping address"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Any additional notes or instructions"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You will be redirected to the payment
                    page where you can pay via UPI, Bank Transfer, or upload a
                    payment screenshot for verification.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Go Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    className="flex-1"
                  >
                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                    Proceed to Payment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetails;
