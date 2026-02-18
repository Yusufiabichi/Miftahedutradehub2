import { useState, useEffect } from 'react';
import { getAccessToken, ensureValidSession, logout, isAuthenticated } from '../../../utils/auth';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface ProductInquiry {
  id: number;
  product_name: string;
  customer_name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  created_at: string;
}

export default function ProductInquiriesManager() {
  const [inquiries, setInquiries] = useState<ProductInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ProductInquiry | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    setError('');

    try {
      // Ensure session is valid before making the request
      const isValid = await ensureValidSession();
      if (!isValid) {
        setError('Session expired. Please log in again.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      const token = getAccessToken();
      if (!token) {
        setError('Please log in to view inquiries.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/product-inquiries-api`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          window.REACT_APP_NAVIGATE('/login');
          return;
        }
        throw new Error('Failed to fetch inquiries');
      }

      const data = await response.json();
      setInquiries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inquiries';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'new' | 'contacted' | 'resolved') => {
    const isValid = await ensureValidSession();
    if (!isValid) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
      const token = getAccessToken();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/product-inquiries-api/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchInquiries();
      setSelectedInquiry(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const deleteInquiry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) {
      return;
    }

    const isValid = await ensureValidSession();
    if (!isValid) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
      const token = getAccessToken();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/product-inquiries-api/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });

      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.REACT_APP_NAVIGATE('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete inquiry');
      }

      alert('Inquiry deleted successfully!');
      fetchInquiries();
      setSelectedInquiry(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete inquiry');
    }
  };

  const filteredInquiries = filterStatus === 'all'
    ? inquiries
    : inquiries.filter(inquiry => inquiry.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-yellow-500 animate-spin"></i>
          <p className="mt-4 text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Product Inquiries</h2>
        <button
          onClick={fetchInquiries}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2"
        >
          <i className="ri-refresh-line"></i>
          Refresh
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'new', 'contacted', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === status
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {filteredInquiries.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No product inquiries found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-blue-900">{inquiry.product_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInquiry(inquiry)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Details
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Customer Name</p>
                  <p className="text-sm text-gray-900">{inquiry.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${inquiry.email}`} className="text-sm text-blue-600 hover:underline">
                    {inquiry.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Phone</p>
                  <a href={`tel:${inquiry.phone}`} className="text-sm text-blue-600 hover:underline">
                    {inquiry.phone}
                  </a>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">Message</p>
                <p className="text-sm text-gray-700 line-clamp-2">{inquiry.message}</p>
              </div>

              <div className="flex gap-2">
                {inquiry.status !== 'contacted' && (
                  <button
                    onClick={() => updateStatus(inquiry.id, 'contacted')}
                    className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer text-sm whitespace-nowrap"
                  >
                    Mark as Contacted
                  </button>
                )}
                {inquiry.status !== 'resolved' && (
                  <button
                    onClick={() => updateStatus(inquiry.id, 'resolved')}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors cursor-pointer text-sm whitespace-nowrap"
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  onClick={() => deleteInquiry(inquiry.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer text-sm whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-blue-900">Inquiry Details</h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Product</p>
                <p className="text-lg font-bold text-blue-900">{selectedInquiry.product_name}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Customer Name</p>
                  <p className="text-gray-900">{selectedInquiry.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedInquiry.status)}`}>
                    {selectedInquiry.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Email</p>
                <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:underline">
                  {selectedInquiry.email}
                </a>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Phone</p>
                <a href={`tel:${selectedInquiry.phone}`} className="text-blue-600 hover:underline">
                  {selectedInquiry.phone}
                </a>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Message</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Received</p>
                <p className="text-gray-700">
                  {new Date(selectedInquiry.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {selectedInquiry.status !== 'contacted' && (
                  <button
                    onClick={() => updateStatus(selectedInquiry.id, 'contacted')}
                    className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Mark as Contacted
                  </button>
                )}
                {selectedInquiry.status !== 'resolved' && (
                  <button
                    onClick={() => updateStatus(selectedInquiry.id, 'resolved')}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
