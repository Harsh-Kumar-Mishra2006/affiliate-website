// pages/AddProductPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AddMasterProductForm from "../../components/forms/AddAdminProductsForm";
import AffiliateProductSelectForm from "../../components/forms/AffiliateProductSelectForm";
import productService from "../../services/productService";
import toast from "react-hot-toast";
import {
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const AddProduct: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminLoading, setAdminLoading] = useState(false);
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "affiliate">(
    user?.role === "admin" ? "admin" : "affiliate",
  );

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-700">
            Please Login
          </h2>
          <p className="text-yellow-600 mt-2">
            You need to be logged in to add products.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const isAffiliate = user.role === "affiliate";

  const handleAddMasterProduct = async (formData: FormData) => {
    setAdminLoading(true);
    try {
      const response = await productService.createMasterProduct(formData);
      if (response.success) {
        toast.success(
          "Master product created successfully! Affiliates can now select it.",
        );
        navigate("/admin/products");
      }
    } catch (error: any) {
      console.error("Failed to create master product:", error);
      toast.error(
        error.response?.data?.error || "Failed to create master product",
      );
    } finally {
      setAdminLoading(false);
    }
  };

  // ✅ This now correctly matches the AddAffiliateProductData type
  const handleAffiliateAddProduct = async (data: {
    masterProductId: number;
    affiliateId: string;
    commissionRate: number;
  }) => {
    setAffiliateLoading(true);
    try {
      const response = await productService.affiliateAddProduct(data);
      if (response.success) {
        toast.success("Product added to your store successfully!");
        navigate("/affiliate/products");
      }
    } catch (error: any) {
      console.error("Failed to add product:", error);
      toast.error(error.response?.data?.error || "Failed to add product");
    } finally {
      setAffiliateLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
        <p className="text-gray-500 mt-1">
          {isAdmin && isAffiliate
            ? "Choose how you want to add a product"
            : isAdmin
              ? "Create a master product for affiliates to promote"
              : "Select a product to promote and earn commissions"}
        </p>
      </div>

      {/* Only show tabs if user has both roles (unlikely but for safety) */}
      {isAdmin && isAffiliate && (
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "admin"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
              Admin (Master Product)
            </button>
            <button
              onClick={() => setActiveTab("affiliate")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "affiliate"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserIcon className="h-4 w-4 inline mr-2" />
              Affiliate (Select & Add)
            </button>
          </nav>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Admin Form - Only visible to admins */}
        {isAdmin && (activeTab === "admin" || !isAffiliate) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Master Product
                </h2>
                <p className="text-sm text-gray-500">
                  Create products that affiliates can select and promote
                </p>
              </div>
            </div>

            <AddMasterProductForm
              onSubmit={handleAddMasterProduct}
              loading={adminLoading}
              onCancel={() => navigate("/admin/products")}
            />
          </div>
        )}

        {/* Affiliate Form - Only visible to affiliates */}
        {isAffiliate && (activeTab === "affiliate" || !isAdmin) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Select & Add Product
                </h2>
                <p className="text-sm text-gray-500">
                  Choose from available master products to promote
                </p>
              </div>
            </div>

            <AffiliateProductSelectForm
              onSubmit={handleAffiliateAddProduct}
              loading={affiliateLoading}
              onCancel={() => navigate("/affiliate/products")}
            />
          </div>
        )}

        {/* If user is neither admin nor affiliate */}
        {!isAdmin && !isAffiliate && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <UserGroupIcon className="h-16 w-16 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-red-700">
              Access Denied
            </h2>
            <p className="text-red-600 mt-2">
              You don't have permission to add products. Please contact an
              administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
