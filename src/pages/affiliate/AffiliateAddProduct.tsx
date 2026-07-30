// pages/affiliate/AddProduct.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAffiliate } from "../../hooks/useAuth";
import productService from "../../services/productService";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const AffiliateAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const isAffiliate = useIsAffiliate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    productId: "",
    price: "",
    company: "",
    category: "",
    description: "",
    shortDescription: "",
    discountedPrice: "",
    brand: "",
    stock: "",
    affiliateUrl: "",
    commissionRate: "",
    mainImage: "",
    images: [] as string[],
    tags: [] as string[],
    specifications: {} as Record<string, any>,
    metaTitle: "",
    metaDescription: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageInput, setImageInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  // Check if user is affiliate
  if (!isAffiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <XMarkIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            Only affiliates can add products.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
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

  const addImage = () => {
    if (imageInput && !formData.images.includes(imageInput)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageInput],
      }));
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput],
      }));
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: specValue,
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData((prev) => ({
      ...prev,
      specifications: newSpecs,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Product name is required";
    if (!formData.productId) newErrors.productId = "Product ID is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.company) newErrors.company = "Company name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.affiliateUrl) {
      newErrors.affiliateUrl = "Affiliate URL is required";
    } else if (!formData.affiliateUrl.startsWith("http")) {
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
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice
          ? parseFloat(formData.discountedPrice)
          : undefined,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        images: formData.images,
        tags: formData.tags,
        specifications: formData.specifications,
        commissionRate: parseFloat(formData.commissionRate),
      };

      const response = await productService.createProduct(productData);
      toast.success(response.message || "Product added successfully!");
      navigate("/affiliate/products");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // Get user email from localStorage
  const getUserEmail = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email || "Not logged in";
      }
    } catch {
      return "Not logged in";
    }
    return "Not logged in";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/affiliate/products")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Products
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                Affiliate
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Add a new product with your affiliate link
            </p>
          </div>
          <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
            Affiliate Panel
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700 font-medium">
              Affiliate Product Addition
            </p>
            <p className="text-sm text-blue-600">
              You'll earn commission on this product. The admin will receive the
              commission you set (10-25%). Make sure to provide a valid
              affiliate URL.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 space-y-6"
        >
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                type="text"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
              <Input
                label="Product ID / SKU"
                type="text"
                name="productId"
                placeholder="Enter product ID"
                value={formData.productId}
                onChange={handleChange}
                error={errors.productId}
                required
              />
              <Input
                label="Price (₹)"
                type="number"
                name="price"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                required
              />
              <Input
                label="Discounted Price (₹)"
                type="number"
                name="discountedPrice"
                placeholder="Enter discounted price"
                value={formData.discountedPrice}
                onChange={handleChange}
              />
              <Input
                label="Company Name"
                type="text"
                name="company"
                placeholder="Enter company name"
                value={formData.company}
                onChange={handleChange}
                error={errors.company}
                required
              />
              <Input
                label="Category"
                type="text"
                name="category"
                placeholder="Enter category"
                value={formData.category}
                onChange={handleChange}
                error={errors.category}
                required
              />
              <Input
                label="Brand"
                type="text"
                name="brand"
                placeholder="Enter brand name"
                value={formData.brand}
                onChange={handleChange}
              />
              <Input
                label="Stock Quantity"
                type="number"
                name="stock"
                placeholder="Enter stock quantity"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Affiliate Specific Fields */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
              Affiliate Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Affiliate URL"
                  type="text"
                  name="affiliateUrl"
                  placeholder="https://example.com/ref/your-affiliate-id"
                  value={formData.affiliateUrl}
                  onChange={handleChange}
                  error={errors.affiliateUrl}
                  required
                  helperText="Your unique affiliate link for this product"
                />
              </div>
              <div>
                <Input
                  label="Commission Rate (%)"
                  type="number"
                  name="commissionRate"
                  placeholder="10-25%"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  error={errors.commissionRate}
                  required
                  helperText="Set between 10% and 25%"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Admin will receive this commission on sales
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Your Email</p>
                  <p className="text-sm font-medium text-gray-700">
                    {getUserEmail()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  placeholder="Brief product description"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Detailed product description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Images
            </h2>
            <div className="space-y-4">
              <Input
                label="Main Image URL"
                type="text"
                name="mainImage"
                placeholder="Enter main image URL"
                value={formData.mainImage}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Images
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button type="button" variant="secondary" onClick={addImage}>
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:text-red-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Specifications
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Value"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addSpecification}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            {Object.keys(formData.specifications).length > 0 && (
              <div className="mt-3 space-y-2">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="ml-2 text-gray-600">{value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              SEO Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Meta Title"
                type="text"
                name="metaTitle"
                placeholder="Enter meta title"
                value={formData.metaTitle}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  rows={3}
                  placeholder="Enter meta description"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/affiliate/products")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AffiliateAddProduct;
