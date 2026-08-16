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
  CurrencyDollarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
// ✅ Import the authService to get the token
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
}

const AddAffiliateProductForm: React.FC<AddAffiliateProductFormProps> = ({
  onSubmit,
  loading,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loadingAffiliates, setLoadingAffiliates] = useState(false);
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

  // Fetch affiliates on mount
  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setLoadingAffiliates(true);
    try {
      // ✅ Check if user is authenticated
      if (!authService.isAuthenticated()) {
        console.warn("User not authenticated, cannot fetch affiliates");
        toast.error("Please login to load affiliates");
        setLoadingAffiliates(false);
        return;
      }

      console.log("🔍 Fetching affiliates...");

      // ✅ Use the correct endpoint with authentication
      const response = await api.get<{
        success: boolean;
        data: Affiliate[];
      }>("/auth/affiliates");

      console.log("📊 Affiliates response:", response);

      if (response.success) {
        setAffiliates(response.data || []);
        console.log(`✅ Loaded ${response.data?.length || 0} affiliates`);
      } else {
        console.warn("⚠️ Affiliates request returned success: false");
        setAffiliates([]);
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch affiliates:", error);

      // ✅ Show more specific error message
      if (error.response?.status === 401) {
        toast.error("Please login to load affiliates");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to view affiliates");
      } else {
        toast.error(
          error.response?.data?.error || "Failed to load affiliates list",
        );
      }
      setAffiliates([]);
    } finally {
      setLoadingAffiliates(false);
    }
  };

  // ... rest of the component remains the same ...

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
    if (!formData.affiliateId)
      newErrors.affiliateId = "Please select an affiliate";
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
      affiliateId: formData.affiliateId,
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

  const selectedAffiliate = affiliates.find(
    (a) => a.id === parseInt(formData.affiliateId),
  );

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
            Select an affiliate who suggested this product. The admin will
            receive the commission rate you set (10-25%) and the affiliate will
            receive the rest.
          </p>
        </div>
      </div>

      {/* Affiliate Specific Fields */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
          Affiliate Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Affiliate <span className="text-red-500">*</span>
            </label>
            <select
              name="affiliateId"
              value={formData.affiliateId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loadingAffiliates}
            >
              <option value="">
                {loadingAffiliates ? "Loading..." : "Select an affiliate"}
              </option>
              {affiliates.map((affiliate) => (
                <option key={affiliate.id} value={affiliate.id}>
                  {affiliate.name} ({affiliate.email}) - {affiliate.affiliateId}
                </option>
              ))}
            </select>
            {errors.affiliateId && (
              <p className="text-red-500 text-sm mt-1">{errors.affiliateId}</p>
            )}
            {!loadingAffiliates && affiliates.length === 0 && (
              <p className="text-yellow-500 text-sm mt-1">
                No affiliates found. Please create an affiliate first.
              </p>
            )}
          </div>

          {selectedAffiliate && (
            <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-3">
              <div>
                <p className="text-xs text-gray-500">Selected Affiliate</p>
                <p className="text-sm font-medium text-gray-700">
                  {selectedAffiliate.name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedAffiliate.affiliateId}
                </p>
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <Input
              label="affiliateId"
              type="text"
              name="affiliateId"
              placeholder="affiliateId"
              value={formData.affiliateId}
              onChange={handleChange}
              error={errors.affiliateId}
              required
              helperText="affiliateId"
            />
          </div>

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
        <Button type="submit" variant="primary" isLoading={loading}>
          {loading ? "Uploading..." : "Add Affiliate Product"}
        </Button>
      </div>
    </form>
  );
};

export default AddAffiliateProductForm;
