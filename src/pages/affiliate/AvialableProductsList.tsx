// components/affiliate/AvailableProductsList.tsx
import React, { useState, useEffect } from "react";
import { type Product } from "../../types/product.types";
import productService from "../../services/productService";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import { ShoppingBagIcon, PlusIcon } from "@heroicons/react/24/outline";

interface AvailableProductsListProps {
  onSelectProduct: (product: Product) => void;
}

const AvailableProductsList: React.FC<AvailableProductsListProps> = ({
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchAvailableProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAvailableMasterProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch available products:", error);
      toast.error("Failed to load available products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select a product to add to your store with your affiliate link
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No products available</p>
          <p className="text-sm text-gray-400 mt-2">
            Check back later for new products from admin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="relative h-48 bg-gray-100">
                {product.mainImage ? (
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                {product.isFeatured && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {product.company} • {product.Category?.name}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xl font-bold text-emerald-600">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>
                {product.shortDescription && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
                <Button
                  onClick={() => onSelectProduct(product)}
                  variant="primary"
                  className="w-full mt-4"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Select & Add to Store
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableProductsList;
