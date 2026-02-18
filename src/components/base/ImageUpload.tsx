
import { useState, useRef } from 'react';
import { getAccessToken } from '../../utils/auth';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  label?: string;
  bucket?: string;
}

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  label = 'Image',
  bucket = 'images'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [useUrl, setUseUrl] = useState(!!currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const token = getAccessToken();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Create form data with proper content type
      const uploadFormData = new FormData();
      uploadFormData.append('', file);

      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: file,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload error:', errorData);
        throw new Error(errorData.message || 'Upload failed');
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
      setImageUrl(publicUrl);
      onImageChange(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    onImageChange(url);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="flex items-center space-x-4 mb-3">
        <button
          type="button"
          onClick={() => setUseUrl(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            !useUrl
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className="ri-upload-2-line mr-2"></i>
          Upload Image
        </button>
        <button
          type="button"
          onClick={() => setUseUrl(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            useUrl
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className="ri-link mr-2"></i>
          Use URL
        </button>
      </div>

      {!useUrl ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900 mr-2"></div>
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <i className="ri-image-add-line text-3xl text-gray-400 mb-2"></i>
                <span className="text-sm text-gray-600">Click to select image</span>
                <span className="text-xs text-gray-500 mt-1">Max size: 5MB</span>
              </div>
            )}
          </button>
        </div>
      ) : (
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
        />
      )}

      {imageUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover object-top"
          />
          <button
            type="button"
            onClick={() => {
              setImageUrl('');
              onImageChange('');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}
    </div>
  );
}
