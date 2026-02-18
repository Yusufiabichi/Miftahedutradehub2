import { useState, useEffect } from 'react';
import { getAccessToken } from '../../../utils/auth';
import ImageUpload from '../../../components/base/ImageUpload';

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  media_url: string;
  media_type: 'image' | 'video';
  category: string;
  is_active: boolean;
  created_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export default function GalleryManager() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/gallery-api`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      
      if (!response.ok || !Array.isArray(data)) {
        console.error('Error fetching gallery:', data);
        setGallery([]);
        return;
      }
      
      setGallery(data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setGallery([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const galleryData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      media_url: formData.get('media_url') as string,
      media_type: formData.get('media_type') as string,
      category: formData.get('category') as string,
      is_active: formData.get('is_active') === 'true',
    };

    try {
      const token = getAccessToken();
      if (!token) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      let response;
      
      if (editingItem) {
        response = await fetch(`${SUPABASE_URL}/functions/v1/gallery-api/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(galleryData),
        });
      } else {
        response = await fetch(`${SUPABASE_URL}/functions/v1/gallery-api`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(galleryData),
        });
      }

      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || `Failed to save gallery item: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      await fetchGallery();
      setShowForm(false);
      setEditingItem(null);
      alert('Gallery item saved successfully!');
    } catch (error) {
      console.error('Error saving gallery item:', error);
      alert(error instanceof Error ? error.message : 'Failed to save gallery item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = getAccessToken();
      if (!token) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/gallery-api/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        let errorMessage = `Failed to delete gallery item (Status: ${response.status})`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          errorMessage = `Failed to delete gallery item: ${response.statusText || 'Unknown error'}`;
        }
        
        throw new Error(errorMessage);
      }
      
      alert('Gallery item deleted successfully!');
      await fetchGallery();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete gallery item. Please try again.';
      alert(errorMessage);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line mr-2"></i>
          Add New Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingItem?.title}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingItem?.description}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                />
              </div>

              <ImageUpload
                currentImage={editingItem?.media_url}
                onImageChange={(url) => {
                  const form = document.querySelector('form');
                  if (form) {
                    const input = form.querySelector('input[name="media_url"]') as HTMLInputElement;
                    if (input) input.value = url;
                  }
                }}
                label="Media (Image/Video) *"
                bucket="images"
              />
              <input type="hidden" name="media_url" defaultValue={editingItem?.media_url} required />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                  <select
                    name="media_type"
                    defaultValue={editingItem?.media_type || 'image'}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingItem?.category}
                    required
                    placeholder="e.g., Vehicles, Education"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={editingItem?.is_active !== false}
                    className="w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {editingItem ? 'Update' : 'Create'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(gallery) && gallery.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative w-full h-48">
              {item.media_type === 'video' ? (
                <video
                  src={item.media_url}
                  className="w-full h-full object-cover object-top"
                  controls
                />
              ) : (
                <img
                  src={item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover object-top"
                />
              )}
              <div className="absolute top-2 right-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.is_active
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {item.media_type}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.category}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-900 hover:text-blue-700 cursor-pointer"
                  >
                    <i className="ri-edit-line text-lg"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
