// components/admin/MasterProductsList.tsx
import React, { useState, useEffect } from "react";
import { type Product } from "../../types/product.types";
import productService from "../../services/productService";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface MasterProductsListProps {
  onAddNew: () => void;
}

const MasterProductsList: React.FC<MasterProductsListProps> = ({
  onAddNew,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasterProducts();
  }, []);

  const fetchMasterProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getMasterProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch master products:", error);
      toast.error("Failed to load master products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this master product?"))
      return;

    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        toast.success("Master product deleted successfully");
        fetchMasterProducts();
      }
    } catch (error) {
      console.error("Failed to delete master product:", error);
      toast.error("Failed to delete master product");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Master Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            These products are available for affiliates to select and add to the
            store
          </p>
        </div>
        <Button onClick={onAddNew} variant="primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Master Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">
            No master products created yet
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Create master products that affiliates can choose from
          </p>
          <Button onClick={onAddNew} variant="primary" className="mt-4">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create First Master Product
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.mainImage ? (
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-medium">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {product.company}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {product.Category?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : product.status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : product.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.status === "draft" && "Available"}
                      {product.status === "pending" && "Taken"}
                      {product.status === "active" && "Active"}
                      {product.status === "inactive" && "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MasterProductsList;
