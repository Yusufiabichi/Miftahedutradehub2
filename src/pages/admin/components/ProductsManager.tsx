import { useState, useEffect, FormEvent } from 'react';
import { getAccessToken, refreshSession, ensureValidSession, logout, isAuthenticated } from '../../../utils/auth';
import ImageUpload from '../../../components/base/ImageUpload';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  full_description: string;
  image: string;
  images: string[];
  specifications: string[];
  features: string[];
  is_active: boolean;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formImages, setFormImages] = useState({ image1: '', image2: '', image3: '' });

  const categories = ['all', 'Trucks', 'Tippers', 'Tractors', 'Electric Bikes', 'Phones'];

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset form images when modal opens/closes
  useEffect(() => {
    if (showAddModal || editingProduct) {
      setFormImages({
        image1: editingProduct?.images?.[0] || editingProduct?.image || '',
        image2: editingProduct?.images?.[1] || '',
        image3: editingProduct?.images?.[2] || '',
      });
    } else {
      setFormImages({ image1: '', image2: '', image3: '' });
    }
  }, [showAddModal, editingProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAccessToken();
      if (!token) {
        setError('Please log in to view products.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/products-api`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });

      if (!response.ok) {
        // If authentication fails, try to refresh and retry once
        if (response.status === 401) {
          const refreshed = await refreshSession();
          if (refreshed) {
            // Retry the request with new token
            const newToken = getAccessToken();
            const retryResponse = await fetch(`${SUPABASE_URL}/functions/v1/products-api`, {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'apikey': SUPABASE_ANON_KEY,
              },
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setProducts(data);
              return;
            }
          }
          
          // If refresh failed or retry failed, redirect to login
          setError('Session expired. Please log in again.');
          setTimeout(() => {
            logout();
            window.REACT_APP_NAVIGATE('/login');
          }, 1500);
          return;
        }
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Ensure valid session before making API call
    const isValid = await ensureValidSession();
    if (!isValid) {
      setError('Session expired. Please log in again.');
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    
    // Validate required fields first
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value;
    const category = (form.elements.namedItem('category') as HTMLSelectElement)?.value;
    const priceValue = (form.elements.namedItem('price') as HTMLInputElement)?.value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement)?.value;
    const full_description = (form.elements.namedItem('full_description') as HTMLTextAreaElement)?.value;
    const featuresText = (form.elements.namedItem('features') as HTMLTextAreaElement)?.value;
    const specificationsText = (form.elements.namedItem('specifications') as HTMLTextAreaElement)?.value;
    
    const price = parseFloat(priceValue);
    
    // Validate required fields
    if (!name || !category || !price || !description || !full_description) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate at least one image
    if (!formImages.image1) {
      alert('Please upload at least one product image');
      return;
    }

    // Parse features and specifications
    const features = featuresText.split('\n').filter(f => f.trim());
    const specifications = specificationsText ? specificationsText.split('\n').filter(s => s.trim()) : [];
    
    // Build images array
    const images = [formImages.image1, formImages.image2, formImages.image3].filter(img => img);

    const productData = {
      name,
      category,
      price,
      description,
      full_description,
      image: formImages.image1,
      images,
      features,
      specifications,
      is_active: true,
    };

    setSubmitting(true);

    try {
      const token = getAccessToken();
      
      if (!token) {
        alert('Please log in to continue.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      const url = editingProduct
        ? `${SUPABASE_URL}/functions/v1/products-api/${editingProduct.id}`
        : `${SUPABASE_URL}/functions/v1/products-api`;

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      // Handle authentication errors
      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('supabase_access_token');
        localStorage.removeItem('supabase_refresh_token');
        localStorage.removeItem('supabase_user');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      setShowAddModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    // Ensure valid session before making API call
    const isValid = await ensureValidSession();
    if (!isValid) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
      const token = getAccessToken();
      
      if (!token) {
        alert('Please log in to continue.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/products-api/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !product.is_active }),
      });

      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update product status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    // Ensure valid session before making API call
    const isValid = await ensureValidSession();
    if (!isValid) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
      const token = getAccessToken();
      
      if (!token) {
        alert('Please log in to continue.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/products-api/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
        },
      });

      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      alert('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products.filter(product => product.category === filterCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-yellow-500 animate-spin"></i>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Manage Products</h2>
        <button
          onClick={() => setShowAddModal(true)}
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

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No products found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors cursor-pointer"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-48 bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                    {product.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-blue-900 mb-1">{product.name}</h3>
                <p className="text-2xl font-bold text-yellow-600 mb-2">${product.price.toLocaleString()}</p>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                {product.specifications && product.specifications.length > 0 && (
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
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingProduct(product)}
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
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price * (for internal records)</label>
                <input
                  type="number"
                  name="price"
                  defaultValue={editingProduct?.price}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter price (not displayed on front-end)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Price is required for database but won't be shown to customers</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description *</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Brief product description (shown in product cards)"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Description *</label>
                <textarea
                  name="full_description"
                  defaultValue={editingProduct?.full_description}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Detailed product description (shown on product detail page)"
                  required
                ></textarea>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-bold text-blue-900 mb-4">Product Images</h4>
                <div className="space-y-4">
                  <div>
                    <ImageUpload
                      currentImage={formImages.image1}
                      onImageChange={(url) => setFormImages(prev => ({ ...prev, image1: url }))}
                      label="Main Image (Required) *"
                      bucket="images"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      currentImage={formImages.image2}
                      onImageChange={(url) => setFormImages(prev => ({ ...prev, image2: url }))}
                      label="Additional Image 2 (Optional)"
                      bucket="images"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      currentImage={formImages.image3}
                      onImageChange={(url) => setFormImages(prev => ({ ...prev, image3: url }))}
                      label="Additional Image 3 (Optional)"
                      bucket="images"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-bold text-blue-900 mb-4">Product Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Key Features * (one per line)</label>
                    <textarea
                      name="features"
                      defaultValue={editingProduct?.features?.join('\n')}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="GPS tracking system with real-time monitoring&#10;Advanced ABS braking system&#10;Air conditioning cabin&#10;Adjustable driver seat with lumbar support&#10;LED headlights and taillights&#10;Reinforced cargo bed with tie-down points&#10;Fuel-efficient engine technology&#10;Comprehensive warranty coverage"
                      required
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">These features will be displayed as bullet points on the product detail page</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Technical Specifications (one per line, format: Label: Value)</label>
                    <textarea
                      name="specifications"
                      defaultValue={editingProduct?.specifications?.join('\n')}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Payload Capacity: 15-20 tons&#10;Engine Type: 400HP Diesel&#10;Transmission: 12-speed manual&#10;Fuel Tank: 400 liters&#10;Max Speed: 120 km/h&#10;Wheelbase: 5,200 mm"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Optional: Technical specifications for reference</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
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
