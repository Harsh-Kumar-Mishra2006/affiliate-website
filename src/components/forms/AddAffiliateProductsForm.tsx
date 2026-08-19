// components/forms/AffiliateProductAddForm.tsx
import React, { useState } from "react";
import Button from "../common/Button";
import { type Product } from "../../types/product.types";
import { XMarkIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Percent } from "lucide-react";

interface AffiliateProductAddFormProps {
  selectedProduct: Product | null;
  onSubmit: (data: {
    masterProductId: number;
    affiliateUrl: string;
    commissionRate: number;
  }) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

const AffiliateProductAddForm: React.FC<AffiliateProductAddFormProps> = ({
  selectedProduct,
  onSubmit,
  loading,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    affiliateUrl: "",
    commissionRate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.affiliateUrl) {
      newErrors.affiliateUrl = "Affiliate URL is required";
    } else if (
      !formData.affiliateUrl.startsWith("http://") &&
      !formData.affiliateUrl.startsWith("https://")
    ) {
      newErrors.affiliateUrl =
        "Please enter a valid URL starting with http:// or https://";
    }

    if (!formData.commissionRate) {
      newErrors.commissionRate = "Commission rate is required";
    } else {
      const rate = parseFloat(formData.commissionRate);
      if (isNaN(rate) || rate < 10 || rate > 25) {
        newErrors.commissionRate =
          "Commission rate must be between 10% and 25%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedProduct) return;

    await onSubmit({
      masterProductId: selectedProduct.id,
      affiliateUrl: formData.affiliateUrl,
      commissionRate: parseFloat(formData.commissionRate),
    });
  };

  if (!selectedProduct) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700">
          No product selected. Please go back and select a product.
        </p>
        <Button onClick={onCancel} variant="secondary" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Product Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-4">
          {selectedProduct.mainImage ? (
            <img
              src={selectedProduct.mainImage}
              alt={selectedProduct.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
          ) : (
            <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No img</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {selectedProduct.name}
            </h3>
            <p className="text-sm text-gray-600">{selectedProduct.company}</p>
            <p className="text-sm font-medium text-emerald-600 mt-1">
              ₹{selectedProduct.price.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Affiliate URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Affiliate URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LinkIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="affiliateUrl"
            placeholder="https://example.com/ref/your-id"
            value={formData.affiliateUrl}
            onChange={handleChange}
            className={`w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.affiliateUrl ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.affiliateUrl && (
          <p className="text-red-500 text-sm mt-1">{errors.affiliateUrl}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Your referral link where customers will be redirected
        </p>
      </div>

      {/* Commission Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commission Rate (%) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Percent className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            name="commissionRate"
            placeholder="10-25"
            value={formData.commissionRate}
            onChange={handleChange}
            min="10"
            max="25"
            step="0.5"
            className={`w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.commissionRate ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.commissionRate && (
          <p className="text-red-500 text-sm mt-1">{errors.commissionRate}</p>
        )}
        <div className="mt-2 text-xs text-gray-500">
          <p>
            You will earn:{" "}
            <span className="font-medium text-green-600">
              {100 - parseFloat(formData.commissionRate || "0")}%
            </span>{" "}
            of each sale
          </p>
          <p>
            Admin commission:{" "}
            <span className="font-medium text-purple-600">
              {parseFloat(formData.commissionRate || "0")}%
            </span>
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={loading}>
          {loading ? "Adding..." : "Add Product to Store"}
        </Button>
      </div>
    </form>
  );
};

export default AffiliateProductAddForm;
