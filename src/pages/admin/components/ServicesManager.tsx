import { useState, useEffect } from 'react';
import { getAccessToken } from '../../../utils/auth';
import ImageUpload from '../../../components/base/ImageUpload';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface Service {
  id: string;
  title: string;
  short_description: string;
  full_description: string;
  icon: string;
  image?: string;
  category?: string;
  price_range?: string;
  duration?: string;
  features?: string[];
  benefits?: string[];
  process_steps?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    full_description: '',
    icon: '',
    image: '',
    category: '',
    price_range: '',
    duration: '',
    features: '',
    benefits: '',
    process_steps: '',
    faqs: '',
  });

  // Fetch services from database
  useEffect(() => {
    fetchServices();
  }, []);

  // const fetchServices = async () => {
  //   try {
  //     setLoading(true);
  //     const token = getAccessToken();
  //     const response = await fetch(`${SUPABASE_URL}/functions/v1/services-api`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //       },
  //     });
      
  //     if (response.ok) {
  //       const data = await response.json();
  //       setServices(data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching services:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchServices = async () => {
      try {
        const token = getAccessToken();
        const response = await fetch(`${SUPABASE_URL}/functions/v1/services-api`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        // Ensure data is always an array
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

  const toggleStatus = async (id: string) => {
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;

      const token = getAccessToken();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/services-api/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...service,
          is_active: !service.is_active,
        }),
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('Failed to update service status. Please try again.');
    }
  };

  const deleteService = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this service?')) {
        const token = getAccessToken();
        const response = await fetch(`${SUPABASE_URL}/functions/v1/services-api/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await fetchServices();
        } else {
          alert('Failed to delete service. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse arrays from line-separated text
      const parseLines = (text: string): string[] => {
        return text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      };

      // Parse FAQs from line-separated text (question and answer pairs)
      const parseFAQs = (text: string): Array<{ question: string; answer: string }> => {
        const lines = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        const faqs: Array<{ question: string; answer: string }> = [];
        for (let i = 0; i < lines.length; i += 2) {
          if (lines[i] && lines[i + 1]) {
            faqs.push({
              question: lines[i],
              answer: lines[i + 1]
            });
          }
        }
        return faqs;
      };

      const serviceData = {
        title: formData.title,
        short_description: formData.short_description,
        full_description: formData.full_description,
        icon: formData.icon,
        image: formData.image,
        category: formData.category,
        price_range: formData.price_range,
        duration: formData.duration,
        features: parseLines(formData.features),
        benefits: parseLines(formData.benefits),
        process_steps: parseLines(formData.process_steps),
        faqs: parseFAQs(formData.faqs),
        is_active: true,
      };

      const token = getAccessToken();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/services-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          title: '',
          short_description: '',
          full_description: '',
          icon: '',
          image: '',
          category: '',
          price_range: '',
          duration: '',
          features: '',
          benefits: '',
          process_steps: '',
          faqs: '',
        });
        fetchServices();
      } else {
        const error = await response.text();
        alert(`Failed to add service: ${error}`);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service. Please check your JSON formatting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      // Parse arrays from line-separated text
      const parseLines = (text: string): string[] => {
        return text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      };

      // Parse FAQs from line-separated text (question and answer pairs)
      const parseFAQs = (text: string): Array<{ question: string; answer: string }> => {
        const lines = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        const faqs: Array<{ question: string; answer: string }> = [];
        for (let i = 0; i < lines.length; i += 2) {
          if (lines[i] && lines[i + 1]) {
            faqs.push({
              question: lines[i],
              answer: lines[i + 1]
            });
          }
        }
        return faqs;
      };

      const serviceData = {
        title: formData.title,
        short_description: formData.short_description,
        full_description: formData.full_description,
        icon: formData.icon,
        image: formData.image,
        category: formData.category,
        price_range: formData.price_range,
        duration: formData.duration,
        features: parseLines(formData.features),
        benefits: parseLines(formData.benefits),
        process_steps: parseLines(formData.process_steps),
        faqs: parseFAQs(formData.faqs),
      };

      const token = getAccessToken();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/services-api/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingService(null);
        setFormData({
          title: '',
          short_description: '',
          full_description: '',
          icon: '',
          image: '',
          category: '',
          price_range: '',
          duration: '',
          features: '',
          benefits: '',
          process_steps: '',
          faqs: '',
        });
        fetchServices();
      } else {
        const error = await response.text();
        alert(`Failed to update service: ${error}`);
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service. Please check your JSON formatting.');
    }
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    
    // Convert arrays to line-separated text
    const arrayToLines = (arr: string[] | undefined): string => {
      return arr ? arr.join('\n') : '';
    };

    // Convert FAQs to line-separated text (question and answer pairs)
    const faqsToLines = (faqs: Array<{ question: string; answer: string }> | undefined): string => {
      if (!faqs) return '';
      return faqs.map(faq => `${faq.question}\n${faq.answer}`).join('\n');
    };

    setFormData({
      title: service.title,
      short_description: service.short_description || '',
      full_description: service.full_description || '',
      icon: service.icon,
      image: service.image || '',
      category: service.category || '',
      price_range: service.price_range || '',
      duration: service.duration || '',
      features: arrayToLines(service.features),
      benefits: arrayToLines(service.benefits),
      process_steps: arrayToLines(service.process_steps),
      faqs: faqsToLines(service.faqs),
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingService(null);
    setFormData({
      title: '',
      short_description: '',
      full_description: '',
      icon: '',
      image: '',
      category: '',
      price_range: '',
      duration: '',
      features: '',
      benefits: '',
      process_steps: '',
      faqs: '',
    });
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      short_description: service.short_description || '',
      full_description: service.full_description || '',
      icon: service.icon,
      image: service.image || '',
      category: service.category || '',
      price_range: service.price_range || '',
      duration: service.duration || '',
      features: JSON.stringify(service.features, null, 2),
      benefits: JSON.stringify(service.benefits, null, 2),
      process_steps: JSON.stringify(service.process_steps, null, 2),
      faqs: JSON.stringify(service.faqs, null, 2),
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Manage Services</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2"
        >
          <i className="ri-add-line text-xl"></i>
          <span>Add New Service</span>
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <i className="ri-service-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No services yet. Add your first service!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className={`${service.icon} text-2xl text-blue-600`}></i>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {service.is_active ? 'active' : 'inactive'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.short_description}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditClick(service)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={() => toggleStatus(service.id)}
                  className="flex-1 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-toggle-line mr-1"></i>
                  Toggle
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Service</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="e.g., Education Consulting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Brief description for service cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Detailed description for service detail page"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Class *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      placeholder="e.g., ri-graduation-cap-line"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Browse icons at{' '}
                      <a
                        href="https://remixicon.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline"
                      >
                        remixicon.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <ImageUpload
                      currentImage={formData.image}
                      onImageChange={(url) => {
                        setFormData({ ...formData, image: url });
                      }}
                      label="Service Image"
                      bucket="images"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features (One per line) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter one feature per line</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits (One per line) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter one benefit per line</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Process Steps (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.process_steps}
                    onChange={(e) => setFormData({ ...formData, process_steps: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Step 1: Initial consultation&#10;Step 2: Document preparation&#10;Step 3: Processing"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter one step per line (optional)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FAQs (Question and Answer pairs)
                  </label>
                  <textarea
                    rows={6}
                    value={formData.faqs}
                    onChange={(e) => setFormData({ ...formData, faqs: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="What is the processing time?&#10;Processing typically takes 2-4 weeks&#10;What documents are needed?&#10;You'll need passport, photos, and application form"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter question on one line, answer on next line. Repeat for multiple FAQs (optional)</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Add Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Service</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="e.g., Education Consulting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Brief description for service cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Detailed description for service detail page"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Class *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      placeholder="e.g., ri-graduation-cap-line"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Browse icons at{' '}
                      <a
                        href="https://remixicon.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline"
                      >
                        remixicon.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <ImageUpload
                      currentImage={formData.image}
                      onImageChange={(url) => {
                        setFormData({ ...formData, image: url });
                      }}
                      label="Service Image"
                      bucket="images"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features (One per line) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter one feature per line</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits (One per line) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter one benefit per line</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Process Steps (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.process_steps}
                    onChange={(e) => setFormData({ ...formData, process_steps: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Step 1: Initial consultation&#10;Step 2: Document preparation&#10;Step 3: Processing"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter one step per line (optional)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FAQs (Question and Answer pairs)
                  </label>
                  <textarea
                    rows={6}
                    value={formData.faqs}
                    onChange={(e) => setFormData({ ...formData, faqs: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="What is the processing time?&#10;Processing typically takes 2-4 weeks&#10;What documents are needed?&#10;You'll need passport, photos, and application form"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter question on one line, answer on next line. Repeat for multiple FAQs (optional)</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Update Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
