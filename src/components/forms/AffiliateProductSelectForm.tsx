// AffiliateProductSelectForm.tsx - Full component with better UX

import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import toast from "react-hot-toast";
import productService from "../../services/productService";
import { type Product } from "../../types/product.types";
import {
  IdentificationIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Percent } from "lucide-react";

interface AffiliateProductSelectFormProps {
  onSubmit: (data: {
    masterProductId: number;
    affiliateId: string;
    commissionRate: number;
  }) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

const AffiliateProductSelectForm: React.FC<AffiliateProductSelectFormProps> = ({
  onSubmit,
  loading,
  onCancel,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formData, setFormData] = useState({
    affiliateId: "",
    commissionRate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchAvailableProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await productService.getAvailableMasterProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch available products:", error);
      toast.error("Failed to load available products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedProduct) {
      newErrors.product = "Please select a product";
    }

    if (!formData.affiliateId) {
      newErrors.affiliateId = "Affiliate ID is required";
    } else if (formData.affiliateId.trim().length < 3) {
      newErrors.affiliateId = "Affiliate ID must be at least 3 characters";
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
    if (!validateForm()) return;

    await onSubmit({
      masterProductId: selectedProduct!.id,
      affiliateId: formData.affiliateId.trim(),
      commissionRate: parseFloat(formData.commissionRate),
    });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Category?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loadingProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const isFormValid =
    selectedProduct &&
    formData.affiliateId.trim().length >= 3 &&
    formData.commissionRate &&
    parseFloat(formData.commissionRate) >= 10 &&
    parseFloat(formData.commissionRate) <= 25;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a Product <span className="text-red-500">*</span>
        </label>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products available</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back later for new products
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProduct?.id === product.id
                    ? "border-purple-500 bg-purple-50 shadow-md"
                    : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                }`}
                onClick={() => handleSelectProduct(product)}
              >
                <div className="flex items-start gap-3">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No img</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {product.company}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600">
                      ₹{Number(product.price).toFixed(2)}
                    </p>
                    {selectedProduct?.id === product.id && (
                      <CheckCircleIcon className="h-5 w-5 text-purple-500 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {errors.product && (
          <p className="text-red-500 text-sm mt-2">{errors.product}</p>
        )}
      </div>

      {/* Selected Product Summary - Shows when product is selected */}
      {selectedProduct ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-green-700 font-medium">
                ✅ Product Selected
              </p>
              <h4 className="font-semibold text-gray-900">
                {selectedProduct.name}
              </h4>
              <p className="text-sm text-gray-600">{selectedProduct.company}</p>
              <p className="text-sm font-medium text-emerald-600 mt-1">
                ₹{Number(selectedProduct.price).toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-700 text-sm">
            👆 Please select a product from the list above to continue
          </p>
        </div>
      )}

      {/* Affiliate ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Affiliate ID <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IdentificationIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="affiliateId"
            placeholder="Enter your affiliate ID (e.g., AFF12345)"
            value={formData.affiliateId}
            onChange={handleChange}
            className={`w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.affiliateId ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.affiliateId && (
          <p className="text-red-500 text-sm mt-1">{errors.affiliateId}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Your unique affiliate identifier provided by the admin
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
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-500">Your Earnings:</span>
            <span className="font-medium text-green-600 block">
              {100 - parseFloat(formData.commissionRate || "0")}%
            </span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-500">Admin Commission:</span>
            <span className="font-medium text-purple-600 block">
              {parseFloat(formData.commissionRate || "0")}%
            </span>
          </div>
        </div>
      </div>

      {/* Submit - Button is enabled when form is valid */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={!isFormValid} // ✅ Better validation
        >
          {loading ? "Adding..." : "Add Product to Store"}
        </Button>
      </div>

      {/* Show validation status */}
      <div className="text-xs text-gray-400 text-right">
        {!selectedProduct && "⚠️ Select a product"}
        {selectedProduct && !formData.affiliateId && " ⚠️ Enter affiliate ID"}
        {selectedProduct &&
          formData.affiliateId &&
          !formData.commissionRate &&
          " ⚠️ Enter commission rate"}
        {isFormValid && " ✅ Ready to submit"}
      </div>
    </form>
  );
};

export default AffiliateProductSelectForm;
