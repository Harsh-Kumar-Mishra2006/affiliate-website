// pages/admin/AddProduct.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useAuth";
import productService from "../../services/productService";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// ✅ FIX: Correct import paths
import AddAdminProductForm from "../../components/forms/AddAdminProductsForm";
import AddAffiliateProductForm from "../../components/forms/AddAffiliateProductsForm";

type ProductType = "admin" | "affiliate";

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState<ProductType>("admin");

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <UserGroupIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            Only administrators can add products.
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

  const handleAdminProductSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await productService.addAdminProduct(formData);
      toast.success(response.message || "Product added successfully!");
      navigate("/admin/products");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add product");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAffiliateProductSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await productService.addAffiliateProduct(formData);
      toast.success(
        response.message || "Affiliate product added successfully!",
      );
      navigate("/admin/products");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to add affiliate product",
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Products
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheckIcon className="h-3 w-3" />
                Admin
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Add your own product or add a product suggested by an affiliate
            </p>
          </div>
        </div>

        {/* Product Type Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setProductType("admin")}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                productType === "admin"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 hover:border-emerald-300 text-gray-600"
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Admin's Own Product</p>
                <p className="text-xs opacity-75">
                  No commission, 100% to admin
                </p>
              </div>
            </button>
            <button
              onClick={() => setProductType("affiliate")}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                productType === "affiliate"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-purple-300 text-gray-600"
              }`}
            >
              <UserGroupIcon className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Affiliate Product</p>
                <p className="text-xs opacity-75">
                  Split commission with affiliate
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {productType === "admin" ? (
            <AddAdminProductForm
              onSubmit={handleAdminProductSubmit}
              loading={loading}
              onCancel={() => navigate("/admin/products")}
            />
          ) : (
            <AddAffiliateProductForm
              onSubmit={handleAffiliateProductSubmit}
              loading={loading}
              onCancel={() => navigate("/admin/products")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
