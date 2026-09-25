import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { getAccessToken, getAuthHeaders } from '../../../utils/auth';
import { API_BASE_URL } from '../../../utils/api';

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

type Toast = { kind: 'success' | 'error'; message: string } | null;

const CATEGORIES = ['Trucks', 'Tippers', 'Tractors', 'Electric Bikes', 'Phones'] as const;
const FILTERS = ['all', ...CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

const parseTextList = (value: string | null | undefined): string[] => {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

export default function ProductsManager() {
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // UI state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Filter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formDirty, setFormDirty] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');

      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');

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
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Body scroll lock + Escape to close modal
  useEffect(() => {
    const modalOpen = showAddModal || Boolean(editingProduct) || Boolean(deletingProduct);
    if (!modalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving && !isDeleting) {
        closeFormModal();
        setDeletingProduct(null);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddModal, editingProduct, deletingProduct, isSaving, isDeleting]);

  const openAddModal = () => {
    setEditingProduct(null);
    setImagePreviews([]);
    setFormError('');
    setFormDirty(false);
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setImagePreviews(
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : []
    );
    setFormError('');
    setFormDirty(false);
    setShowAddModal(true);
  };

  const closeFormModal = () => {
    if (isSaving) return;
    if (formDirty && !confirm('You have unsaved changes. Discard them?')) return;
    setShowAddModal(false);
    setEditingProduct(null);
    setImagePreviews([]);
    setFormError('');
    setFormDirty(false);
  };

  const toggleStatus = (id: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete product');

      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setToast({ kind: 'success', message: `"${deletingProduct.name}" deleted.` });
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ kind: 'error', message: 'Failed to delete product. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const token = getAccessToken();
    if (!token) throw new Error('Session expired. Please log in again.');

    const uploadData = new FormData();
    uploadData.append('image', file);
    const response = await fetch(`${API_BASE_URL || ''}/api/products/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uploadData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const data = await response.json();
    return `${API_BASE_URL || ''}${data.url}`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;

    setFormError('');
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    const category = formData.get('category') as string;
    const description = (formData.get('description') as string)?.trim();
    const imageFiles = formData
      .getAll('images')
      .filter((file): file is File => file instanceof File && file.size > 0);
    const features = ((formData.get('features') as string) || '')
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    const specifications = ((formData.get('specifications') as string) || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name || !category || !description) {
      setFormError('Please fill in the product name, category, and description.');
      return;
    }

    setIsSaving(true);

    let image = editingProduct?.image || '';
    let images = editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : []);

    try {
      if (imageFiles.length > 0) {
        images = await Promise.all(imageFiles.map((file) => uploadImageToStorage(file)));
        image = images[0] || '';
      }

      const isEditing = Boolean(editingProduct);
      const url = isEditing ? `/api/products/${editingProduct!.id}` : '/api/products';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      await fetchProducts();
      setToast({
        kind: 'success',
        message: isEditing ? 'Product updated successfully.' : 'Product added successfully.',
      });
      setShowAddModal(false);
      setEditingProduct(null);
      setImagePreviews([]);
      setFormDirty(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, filterCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    CATEGORIES.forEach((c) => {
      counts[c] = products.filter((p) => p.category === c).length;
    });
    return counts;
  }, [products]);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed top-6 right-6 z-[60] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg max-w-sm ${
            toast.kind === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <i
            className={
              toast.kind === 'success'
                ? 'ri-checkbox-circle-line text-xl'
                : 'ri-error-warning-line text-xl'
            }
            aria-hidden="true"
          ></i>
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer"
            aria-label="Dismiss"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Manage Products</h2>
          <p className="text-sm text-gray-600 mt-1">
            {products.length} {products.length === 1 ? 'product' : 'products'} in your catalogue
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-lg hover:from-yellow-600 hover:to-yellow-700 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line text-lg" aria-hidden="true"></i>
          <span>Add Product</span>
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative">
          <i
            className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          ></i>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, category, or description..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            aria-label="Search products"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((cat) => {
            const active = filterCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
        >
          <i className="ri-error-warning-line text-xl mt-0.5" aria-hidden="true"></i>
          <div className="flex-1">
            <p className="text-sm font-medium">{fetchError}</p>
            <button
              onClick={fetchProducts}
              className="text-sm font-semibold underline mt-1 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden"
            >
              <div className="h-48 bg-gray-100 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-9 flex-1 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-9 flex-1 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-9 w-10 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!isLoading && !fetchError && products.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="ri-shopping-bag-3-line text-4xl text-yellow-500" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">No products yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto mb-6">
            Add your first product to start building your catalogue.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
          >
            <i className="ri-add-line text-lg" aria-hidden="true"></i>
            Add Your First Product
          </button>
        </div>
      )}

      {/* No results for filter/search */}
      {!isLoading &&
        !fetchError &&
        products.length > 0 &&
        filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-search-eye-line text-3xl text-gray-400" aria-hidden="true"></i>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">No matches found</h3>
            <p className="text-gray-600 text-sm mb-5">
              Try a different search term or category filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setFilterCategory('all');
              }}
              className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

      {/* Grid */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-200 transition-all flex flex-col"
            >
              <div className="relative h-48 bg-gray-100">
                {product.image || (product.images && product.images.length > 0) ? (
                  <img
                    src={product.image || product.images?.[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <i className="ri-image-line text-3xl" aria-hidden="true"></i>
                    <span className="text-xs">No image</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full shadow-sm">
                    {product.category}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                {product.images && product.images.length > 1 && (
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm">
                    <i className="ri-image-2-line mr-1" aria-hidden="true"></i>
                    {product.images.length}
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-blue-900 mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {product.specifications.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Specifications
                    </p>
                    <ul className="space-y-1">
                      {product.specifications.slice(0, 3).map((spec, index) => (
                        <li
                          key={index}
                          className="text-xs text-gray-600 flex items-start gap-1.5"
                        >
                          <i
                            className="ri-check-line text-green-600 mt-0.5 flex-shrink-0"
                            aria-hidden="true"
                          ></i>
                          <span className="line-clamp-1">{spec}</span>
                        </li>
                      ))}
                      {product.specifications.length > 3 && (
                        <li className="text-xs text-gray-400 pl-4">
                          +{product.specifications.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-2 mt-auto border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-sm font-medium"
                  >
                    <i className="ri-edit-line" aria-hidden="true"></i>
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(product.id)}
                    title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer text-sm font-medium"
                  >
                    <i
                      className={
                        product.status === 'active' ? 'ri-eye-off-line' : 'ri-eye-line'
                      }
                      aria-hidden="true"
                    ></i>
                    {product.status === 'active' ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => setDeletingProduct(product)}
                    title="Delete product"
                    aria-label={`Delete ${product.name}`}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFormModal();
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Sticky modal header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-start justify-between gap-4">
              <div>
                <h3
                  id="product-modal-title"
                  className="text-2xl font-bold text-blue-900"
                >
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingProduct
                    ? 'Update the details below to save your changes.'
                    : 'Fill in the details below to add a product to your catalogue.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 -m-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              onChange={() => setFormDirty(true)}
              className="px-6 sm:px-8 py-6 space-y-5"
            >
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                >
                  <i
                    className="ri-error-warning-line text-xl mt-0.5"
                    aria-hidden="true"
                  ></i>
                  <p className="text-sm">{formError}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                  placeholder="e.g. 2024 Ford Ranger XLT"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="product-category"
                  name="category"
                  defaultValue={editingProduct?.category || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="product-description"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="product-description"
                  name="description"
                  defaultValue={editingProduct?.description}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm resize-y"
                  placeholder="Brief product description shown on the website"
                  required
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="product-images"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Product Images
                </label>
                <label
                  htmlFor="product-images"
                  className="flex flex-col items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 hover:bg-yellow-50/40 transition-colors"
                >
                  <i className="ri-upload-cloud-2-line text-3xl text-gray-400" aria-hidden="true"></i>
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload images
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, or WEBP — multiple files supported
                  </span>
                  <input
                    id="product-images"
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    className="sr-only"
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
                        const previews = await Promise.all(
                          files.map((file) => readFileAsDataUrl(file))
                        );
                        setImagePreviews(previews);
                      } catch {
                        setFormError('Failed to read one or more image files.');
                      }
                    }}
                  />
                </label>

                {editingProduct && imagePreviews.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep the current images.
                  </p>
                )}

                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={`${preview.slice(0, 32)}-${index}`}
                        className="relative group rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-yellow-500 text-white text-[10px] font-semibold rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="product-features"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Key Features
                </label>
                <textarea
                  id="product-features"
                  name="features"
                  defaultValue={editingProduct?.features.join('\n')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm resize-y"
                  placeholder={'One feature per line\ne.g. Air conditioning\nBluetooth audio'}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Enter one feature per line.
                </p>
              </div>

              <div>
                <label
                  htmlFor="product-specs"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Specifications
                </label>
                <textarea
                  id="product-specs"
                  name="specifications"
                  defaultValue={editingProduct?.specifications.join('\n')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm resize-y"
                  placeholder={
                    'One spec per line\ne.g. Engine: 2.0L Turbo\nTransmission: Automatic'
                  }
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Enter one specification per line.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>
                      {editingProduct ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : editingProduct ? (
                    'Update Product'
                  ) : (
                    'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeletingProduct(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <i className="ri-delete-bin-6-line text-2xl text-red-600" aria-hidden="true"></i>
            </div>
            <h3
              id="delete-modal-title"
              className="text-xl font-bold text-gray-900 text-center mb-2"
            >
              Delete this product?
            </h3>
            <p className="text-gray-600 text-sm text-center mb-1">
              You are about to delete
            </p>
            <p className="text-gray-900 font-semibold text-center mb-5 truncate">
              "{deletingProduct.name}"
            </p>
            <p className="text-xs text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>
                    Deleting...
                  </span>
                ) : (
                  'Delete Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}