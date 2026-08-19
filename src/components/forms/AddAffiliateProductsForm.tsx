// components/forms/AddAffiliateProductForm.tsx
import React, { useState, useRef, useEffect } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import toast from "react-hot-toast";
import {
  PlusIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  IdentificationIcon,
  UserGroupIcon,
  CheckCircleIcon,
  UserIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/apiService";
import authService from "../../services/authService";

interface AddAffiliateProductFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

interface Affiliate {
  id: number;
  name: string;
  email: string;
  affiliateId: string;
  commissionRate: number;
  isActive: boolean;
}

const AddAffiliateProductForm: React.FC<AddAffiliateProductFormProps> = ({
  onSubmit,
  loading,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loadingAffiliate, setLoadingAffiliate] = useState(false);
  const [affiliateSearchId, setAffiliateSearchId] = useState("");
  const [affiliateFound, setAffiliateFound] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    productId: "",
    price: "",
    company: "",
    category: "",
    description: "",
    shortDescription: "",
    serviceId: "",
    brand: "",
    stock: "",
    affiliateId: "",
    affiliateUrl: "",
    commissionRate: "",
    images: [] as File[],
    imagePreviews: [] as string[],
    tags: [] as string[],
    specifications: {} as Record<string, any>,
    metaTitle: "",
    metaDescription: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  // ✅ Debounce affiliate search
  useEffect(() => {
    if (affiliateSearchId.trim().length > 0) {
      const timer = setTimeout(() => {
        fetchAffiliateById(affiliateSearchId.trim());
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAffiliate(null);
      setAffiliateFound(false);
    }
  }, [affiliateSearchId]);

  const fetchAffiliateById = async (searchValue: string) => {
    // Check if it's a numeric ID or a string affiliateId
    const isNumeric = /^\d+$/.test(searchValue);

    setLoadingAffiliate(true);
    try {
      if (!authService.isAuthenticated()) {
        toast.error("Please login to search affiliates");
        setLoadingAffiliate(false);
        return;
      }

      let response;

      if (isNumeric) {
        // Search by ID
        response = await api.get<{
          success: boolean;
          data: Affiliate;
        }>(`/auth/affiliates/${searchValue}`);
      } else {
        // Search by affiliateId string (like AFFHRK12345)
        response = await api.get<{
          success: boolean;
          data: Affiliate[];
        }>(`/auth/affiliates?search=${searchValue}`);

        if (response.success && response.data.length > 0) {
          // Find exact match by affiliateId
          const found = response.data.find(
            (a) => a.affiliateId.toLowerCase() === searchValue.toLowerCase(),
          );
          if (found) {
            setAffiliate(found);
            setAffiliateFound(true);
            setFormData((prev) => ({
              ...prev,
              affiliateId: found.id.toString(),
            }));
            toast.success(`Affiliate found: ${found.name}`);
            setLoadingAffiliate(false);
            return;
          }
        }
        setLoadingAffiliate(false);
        return;
      }

      if (response.success && response.data) {
        const foundAffiliate = response.data;
        // ✅ Check if affiliate is active
        if (!foundAffiliate.isActive) {
          toast.error("This affiliate is inactive. Please contact admin.");
          setAffiliate(null);
          setAffiliateFound(false);
          setLoadingAffiliate(false);
          return;
        }
        setAffiliate(foundAffiliate);
        setAffiliateFound(true);
        setFormData((prev) => ({
          ...prev,
          affiliateId: foundAffiliate.id.toString(),
        }));
        toast.success(`Affiliate found: ${foundAffiliate.name}`);
      } else {
        setAffiliate(null);
        setAffiliateFound(false);
        toast.error("Affiliate not found");
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch affiliate:", error);
      if (error.response?.status === 404) {
        toast.error("Affiliate not found. Please check the ID.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to view affiliates");
      } else {
        toast.error(error.response?.data?.error || "Failed to fetch affiliate");
      }
      setAffiliate(null);
      setAffiliateFound(false);
    } finally {
      setLoadingAffiliate(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAffiliateSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setAffiliateSearchId(value);
    // If user clears the input, reset affiliate
    if (!value.trim()) {
      setAffiliate(null);
      setAffiliateFound(false);
      setFormData((prev) => ({ ...prev, affiliateId: "" }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
      }
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    if (formData.images.length + validFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const previews = validFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
      imagePreviews: [...prev.imagePreviews, ...previews],
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
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

    if (!affiliateFound || !affiliate) {
      newErrors.affiliateId = "Please enter a valid affiliate ID";
    }
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

    // ✅ Use the affiliate ID from the found affiliate
    const formDataToSend = new FormData();

    const textFields = {
      name: formData.name,
      productId: formData.productId,
      price: formData.price,
      company: formData.company,
      category: formData.category,
      description: formData.description,
      shortDescription: formData.shortDescription,
      serviceId: formData.serviceId,
      brand: formData.brand,
      stock: formData.stock,
      affiliateId: affiliate?.id.toString() || formData.affiliateId,
      affiliateUrl: formData.affiliateUrl,
      commissionRate: formData.commissionRate,
      tags: JSON.stringify(formData.tags),
      specifications: JSON.stringify(formData.specifications),
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
    };

    Object.entries(textFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formDataToSend.append(key, value.toString());
      }
    });

    formData.images.forEach((file) => {
      formDataToSend.append("images", file);
    });

    await onSubmit(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <UserGroupIcon className="h-5 w-5 text-blue-500 mt-0.5" />
        <div>
          <p className="text-sm text-blue-700 font-medium">
            Affiliate Product Addition
          </p>
          <p className="text-sm text-blue-600">
            Enter the affiliate ID to link this product. The affiliate will
            receive commission on sales.
          </p>
        </div>
      </div>

      {/* Affiliate Search Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-purple-600" />
          Affiliate Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Affiliate ID Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Affiliate ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdentificationIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={affiliateSearchId}
                onChange={handleAffiliateSearchChange}
                placeholder="Enter Affiliate ID (e.g., AFFHRK12345)"
                className={`w-full pl-10 pr-12 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  affiliateFound
                    ? "border-green-500 bg-green-50"
                    : affiliateSearchId && !loadingAffiliate
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                }`}
                disabled={loadingAffiliate}
              />
              {loadingAffiliate && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                </div>
              )}
              {affiliateFound && !loadingAffiliate && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Enter the affiliate's unique ID (e.g., AFFHRK12345) or numeric ID
            </p>
            {errors.affiliateId && (
              <p className="text-red-500 text-sm mt-1">{errors.affiliateId}</p>
            )}
          </div>

          {/* Affiliate Info Card */}
          <div>
            {affiliateFound && affiliate ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        {affiliate.name}
                      </h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {affiliate.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <IdentificationIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-mono text-gray-600">
                        ID: {affiliate.affiliateId}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Commission Rate: {affiliate.commissionRate}%
                    </div>
                  </div>
                </div>
              </div>
            ) : affiliateSearchId && !loadingAffiliate ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <XMarkIcon className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">
                      Affiliate not found
                    </p>
                    <p className="text-xs text-red-600">
                      Please check the ID and try again
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 text-center">
                  Enter an affiliate ID to see details here
                </p>
              </div>
            )}
          </div>

          {/* Affiliate URL */}
          <div className="md:col-span-2">
            <Input
              label="Affiliate URL"
              type="text"
              name="affiliateUrl"
              placeholder="https://example.com/ref/affiliate-id"
              value={formData.affiliateUrl}
              onChange={handleChange}
              error={errors.affiliateUrl}
              required
              helperText="The affiliate's referral link for this product"
            />
          </div>

          {/* Commission Rate */}
          <div>
            <Input
              label="Commission Rate (%)"
              type="number"
              name="commissionRate"
              placeholder="10-25"
              value={formData.commissionRate}
              onChange={handleChange}
              error={errors.commissionRate}
              required
              helperText="Admin receives this percentage on each sale"
            />
            <p className="text-xs text-gray-400 mt-1">
              Affiliate receives{" "}
              {(100 - parseFloat(formData.commissionRate || "0")).toFixed(0)}%
              of each sale
            </p>
          </div>
        </div>
      </div>

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdentificationIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="serviceId"
                placeholder="Enter service ID (optional)"
                value={formData.serviceId}
                onChange={handleChange}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Optional: Manual identifier for your service/product
            </p>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-400 mt-1">
                PNG, JPG, GIF up to 5MB (Max 10 images)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {formData.imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
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
          <Button type="button" variant="secondary" onClick={addSpecification}>
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={!affiliateFound}
        >
          {loading ? "Uploading..." : "Add Affiliate Product"}
        </Button>
      </div>
    </form>
  );
};

export default AddAffiliateProductForm;
