import { useEffect, useState } from 'react';
import { getAccessToken } from '../../../utils/auth';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
  features: string[];
  specifications: string[];
  status: 'active' | 'inactive';
}

interface ApiProduct {
  id: number;
  product_name: string;
  category: string;
  description: string;
  key_features: string | null;
  specifications: string | null;
  images: string[] | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

const parseTextList = (value: string | null | undefined): string[] => {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const categories = ['all', 'Trucks', 'Tippers', 'Tractors', 'Electric Bikes', 'Phones'];

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setFetchError('');

      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ApiProduct[] = await response.json();
      const mappedProducts: Product[] = data.map((item) => {
        const images = Array.isArray(item.images) ? item.images : [];

        return {
          id: item.id,
          name: item.product_name,
          category: item.category,
          description: item.description || '',
          image: images[0] || '',
          images,
          features: parseTextList(item.key_features),
          specifications: parseTextList(item.specifications),
          status: 'active',
        };
      });

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setFetchError('Unable to load products from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleStatus = (id: number) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, status: product.status === 'active' ? 'inactive' : 'active' } : product
    ));
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts((prevProducts) => prevProducts.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase storage configuration');
    }

    const token = getAccessToken();
    if (!token) {
      throw new Error('Session expired. Please log in again.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/images/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: file,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return `${SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const imageFiles = formData
      .getAll('images')
      .filter((file): file is File => file instanceof File && file.size > 0);
    const featuresInput = formData.get('features') as string;
    const features = featuresInput
      .split('\n')
      .map((feature) => feature.trim())
      .filter(Boolean);
    const specsInput = formData.get('specifications') as string;
    const specifications = specsInput
      .split('\n')
      .map((spec) => spec.trim())
      .filter(Boolean);
    let image = editingProduct?.image || '';
    let images = editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : []);

    if (imageFiles.length > 0) {
      try {
        images = await Promise.all(imageFiles.map((file) => uploadImageToStorage(file)));
        image = images[0] || '';
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to upload selected image');
        return;
      }
    }

    if (!name || !category || !description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const isEditing = Boolean(editingProduct);
      const url = isEditing
        ? `${API_BASE_URL}/api/products/${editingProduct!.id}`
        : `${API_BASE_URL}/api/products`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: name,
          category,
          description,
          keyFeatures: features.join(', '),
          specifications: specifications.join(', '),
          images,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = isEditing ? 'Failed to update product' : 'Failed to create product';

        try {
          const parsed = JSON.parse(errorText);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error instanceof Error ? error.message : 'Failed to save product');
      return;
    }

    setShowAddModal(false);
    setEditingProduct(null);
    setImagePreviews([]);
  };

  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products.filter(product => product.category === filterCategory);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Manage Products</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setImagePreviews([]);
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2"
        >
          <i className="ri-add-line text-xl"></i>
          <span>Add Product</span>
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-full text-center text-gray-500 py-8">Loading products...</div>
        )}
        {!isLoading && fetchError && (
          <div className="col-span-full text-center text-red-600 py-8">{fetchError}</div>
        )}
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all">
            <div className="relative h-48 bg-gray-100">
              {(product.image || (product.images && product.images.length > 0)) ? (
                <img
                  src={product.image || product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No image
                </div>
              )}
              <div className="absolute top-3 left-3 flex space-x-2">
                <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                  {product.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-blue-900 mb-1">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{product.description}</p>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-1">Specifications:</p>
                <ul className="space-y-1">
                  {product.specifications.slice(0, 3).map((spec, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <i className="ri-check-line text-green-600 mr-1 mt-0.5"></i>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setImagePreviews(product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-sm whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={() => toggleStatus(product.id)}
                  className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer text-sm whitespace-nowrap"
                >
                  <i className="ri-toggle-line mr-1"></i>
                  Toggle
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  defaultValue={editingProduct?.category}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Trucks">Trucks</option>
                  <option value="Tippers">Tippers</option>
                  <option value="Tractors">Tractors</option>
                  <option value="Electric Bikes">Electric Bikes</option>
                  <option value="Phones">Phones</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Brief product description"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onChange={async (event) => {
                    const files = Array.from(event.target.files || []);
                    if (files.length === 0) {
                      setImagePreviews(
                        editingProduct?.images && editingProduct.images.length > 0
                          ? editingProduct.images
                          : editingProduct?.image
                            ? [editingProduct.image]
                            : []
                      );
                      return;
                    }

                    try {
                      const previews = await Promise.all(files.map(file => readFileAsDataUrl(file)));
                      setImagePreviews(previews);
                    } catch {
                      setImagePreviews(
                        editingProduct?.images && editingProduct.images.length > 0
                          ? editingProduct.images
                          : editingProduct?.image
                            ? [editingProduct.image]
                            : []
                      );
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload one or more images (optional). For edits, leave empty to keep current images.
                </p>
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <img
                        key={`${preview}-${index}`}
                        src={preview}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Features (one per line)</label>
                <textarea
                  name="features"
                  defaultValue={editingProduct?.features.join('\n')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter features, one per line"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specifications (one per line)</label>
                <textarea
                  name="specifications"
                  defaultValue={editingProduct?.specifications.join('\n')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter specifications, one per line"
                ></textarea>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                    setImagePreviews([]);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
