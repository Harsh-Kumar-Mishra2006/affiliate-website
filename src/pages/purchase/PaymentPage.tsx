import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import purchaseService from "../../services/purchaseService";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  BanknotesIcon,
  QrCodeIcon,
  ClipboardIcon,
  ShoppingBagIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    orderId,
    product,
    paymentInstructions,
    totalAmount,
    commissionAmount,
  } = location.state || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Redirect if no order data
  if (!orderId || !product || !paymentInstructions) {
    navigate("/products");
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPayment = async () => {
    if (!selectedFile) {
      toast.error("Please select a payment screenshot");
      return;
    }

    setLoading(true);
    try {
      const response = await purchaseService.uploadPayment({
        orderId,
        screenshot: selectedFile,
        paymentNotes,
      });

      toast.success(response.message || "Payment uploaded successfully!");
      navigate("/my-purchases");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload payment");
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 ml-4">
            Complete Payment
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Instructions
              </h2>

              <div className="space-y-6">
                {/* QR Code Section */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Scan QR Code to Pay
                  </h3>
                  <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
                    <img
                      src="/payment-qr-code (2).jpg" // Replace with actual QR code path
                      alt="Payment QR Code"
                      className="h-48 w-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan with any UPI app
                  </p>
                </div>

                {/* UPI ID */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-emerald-100 rounded-full p-2">
                        <QrCodeIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">UPI ID</p>
                        <p className="font-mono font-medium text-gray-900">
                          {paymentInstructions.upiId}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(paymentInstructions.upiId)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy UPI ID"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowBankDetails(!showBankDetails)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <BanknotesIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Bank Transfer Details
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to {showBankDetails ? "hide" : "show"}
                        </p>
                      </div>
                    </div>
                    {showBankDetails ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {showBankDetails && (
                    <div className="border-t p-4 space-y-2 bg-gray-50">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bank Name</span>
                        <span className="font-medium">
                          {paymentInstructions.bankDetails.bankName}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Account Holder</span>
                        <span className="font-medium">
                          {paymentInstructions.bankDetails.accountHolder}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Account Number</span>
                        <span className="font-mono font-medium">
                          {paymentInstructions.bankDetails.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">IFSC Code</span>
                        <span className="font-mono font-medium">
                          {paymentInstructions.bankDetails.ifscCode}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `Bank: ${paymentInstructions.bankDetails.bankName}\nAccount: ${paymentInstructions.bankDetails.accountNumber}\nIFSC: ${paymentInstructions.bankDetails.ifscCode}`,
                          )
                        }
                        className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Copy All Details
                      </button>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-emerald-900">
                      Amount to Pay
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  {commissionAmount > 0 && (
                    <p className="text-xs text-emerald-700 mt-1">
                      💰 You'll earn {formatPrice(commissionAmount)} commission
                      on this purchase
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Payment Screenshot */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Payment Screenshot
              </h2>

              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    selectedFile
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-300 hover:border-emerald-500"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={previewUrl}
                        alt="Payment Screenshot"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">
                        {selectedFile?.name}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        Click or drag to upload payment screenshot
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports JPG, PNG, GIF, WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add any notes about your payment (e.g., transaction ID, UPI reference)"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  onClick={handleUploadPayment}
                  disabled={!selectedFile}
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Submit Payment
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Details
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono text-sm font-medium">{orderId}</p>
                </div>

                <div className="flex items-center space-x-3 py-3 border-t border-b">
                  <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">{product.company}</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold text-gray-900">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission</span>
                    <span className="font-medium text-emerald-600">
                      {formatPrice(commissionAmount)}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Payment Status
                      </p>
                      <p className="text-xs text-green-700">
                        Awaiting verification
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⏳ After uploading payment, our team will verify and confirm
                    your purchase within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
