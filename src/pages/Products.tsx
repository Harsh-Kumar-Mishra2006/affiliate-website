import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import LoadingSpinner from "../components/common/Input";
import { type Product, type ProductFilters } from "../types/product.types";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ShoppingBagIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const Products: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    company: searchParams.get("company") || "",
    minPrice: searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(filters);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.error || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== 0) {
        params.set(k, v.toString());
      }
    });
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    handleFilterChange("search", search);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      search: "",
      category: "",
      company: "",
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
    setSearchParams({});
  };

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Discover amazing products from trusted affiliates
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
              {Object.keys(filters).some(
                (k) =>
                  [
                    "search",
                    "category",
                    "company",
                    "minPrice",
                    "maxPrice",
                  ].includes(k) && filters[k as keyof ProductFilters],
              ) && (
                <span className="ml-1 bg-emerald-500 text-white text-xs rounded-full px-2 py-0.5">
                  {
                    Object.keys(filters).filter(
                      (k) =>
                        [
                          "search",
                          "category",
                          "company",
                          "minPrice",
                          "maxPrice",
                        ].includes(k) && filters[k as keyof ProductFilters],
                    ).length
                  }
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search products by name, brand, or category..."
              defaultValue={filters.search}
              className="w-full px-4 py-3 pl-12 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter Products
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="Enter category"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={filters.company}
                  onChange={(e) =>
                    handleFilterChange("company", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minPrice",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxPrice",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            Showing {products.length} of {pagination.total} products
          </p>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
            </select>
            <button
              onClick={() =>
                handleFilterChange(
                  "sortOrder",
                  filters.sortOrder === "ASC" ? "DESC" : "ASC",
                )
              }
              className="p-1 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {filters.sortOrder === "ASC" ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <Link to={`/product/${product.slug}`}>
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <HeartIcon
                        className={`h-5 w-5 ${
                          wishlist.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    {/* Discount Badge */}
                    {product.discountedPrice &&
                      product.discountedPrice < product.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {Math.round(
                            ((product.price - product.discountedPrice) /
                              product.price) *
                              100,
                          )}
                          % OFF
                        </div>
                      )}
                    {/* Stock Badge */}
                    {product.stock === 0 && (
                      <div className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.company}
                  </p>

                  {/* Rating */}
                  <div className="mt-2">{renderStars(product.rating || 0)}</div>

                  {/* Price */}
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.discountedPrice || product.price)}
                    </span>
                    {product.discountedPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Category Tag */}
                  {product.Category && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                        {product.Category.name}
                      </span>
                    </div>
                  )}

                  {/* Affiliate Button */}
                  {isAuthenticated && product.affiliateUrl && (
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <ShoppingBagIcon className="h-4 w-4 mr-2" />
                      Buy Now
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() =>
                handleFilterChange("page", Math.max(1, filters.page! - 1))
              }
              disabled={filters.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center space-x-2">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => handleFilterChange("page", pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      filters.page === pageNum
                        ? "bg-emerald-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {pagination.totalPages > 5 && (
                <span className="px-3 py-2">...</span>
              )}
            </div>
            <button
              onClick={() =>
                handleFilterChange(
                  "page",
                  Math.min(pagination.totalPages, filters.page! + 1),
                )
              }
              disabled={filters.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
