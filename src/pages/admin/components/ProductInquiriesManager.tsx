import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuthHeaders } from '../../../utils/auth';

interface ProductInquiry {
  id: number;
  product_name: string;
  customer_name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

type Toast = { kind: 'success' | 'error'; message: string } | null;

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelative = (value: string) => {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ProductInquiriesManager() {
  const [inquiries, setInquiries] = useState<ProductInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ProductInquiry | null>(null);
  const [deletingInquiry, setDeletingInquiry] = useState<ProductInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const response = await fetch('/api/enquiries/product', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch product inquiries');
      const data = await response.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setFetchError('Unable to load product inquiries. Please try again.');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Modal escape + scroll lock
  useEffect(() => {
    const open = Boolean(selectedInquiry) || Boolean(deletingInquiry);
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        setSelectedInquiry(null);
        setDeletingInquiry(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedInquiry, deletingInquiry, isDeleting]);

  const confirmDelete = async () => {
    if (!deletingInquiry) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/enquiries/product/${deletingInquiry.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete inquiry');

      setInquiries((prev) => prev.filter((i) => i.id !== deletingInquiry.id));
      if (selectedInquiry?.id === deletingInquiry.id) setSelectedInquiry(null);
      setToast({ kind: 'success', message: 'Inquiry deleted.' });
      setDeletingInquiry(null);
    } catch (error) {
      setToast({ kind: 'error', message: 'Failed to delete inquiry. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ kind: 'success', message: `${label} copied to clipboard.` });
    } catch {
      setToast({ kind: 'error', message: 'Failed to copy.' });
    }
  };

  const filteredInquiries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter(
      (i) =>
        i.customer_name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q) ||
        i.product_name.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
    );
  }, [inquiries, search]);

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
          <h2 className="text-2xl font-bold text-blue-900">Product Inquiries</h2>
          <p className="text-sm text-gray-600 mt-1">
            {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'} from customers
            interested in your products
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-teal-700 border border-teal-200 rounded-lg font-medium hover:bg-teal-50 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-refresh-line" aria-hidden="true"></i>
          Refresh
        </button>
      </div>

      {/* Search */}
      {inquiries.length > 0 && (
        <div className="mb-6 relative">
          <i
            className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          ></i>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, product, or message..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            aria-label="Search product inquiries"
          />
        </div>
      )}

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
              onClick={fetchInquiries}
              className="text-sm font-semibold underline mt-1 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-100 last:border-0"
            >
              {Array.from({ length: 6 }).map((__, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && !fetchError && inquiries.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="ri-questionnaire-line text-4xl text-teal-600" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">No product inquiries yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            When customers ask about a product, their inquiries will appear here.
          </p>
        </div>
      )}

      {!loading && !fetchError && inquiries.length > 0 && filteredInquiries.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-search-eye-line text-3xl text-gray-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-1">No matching inquiries</h3>
          <p className="text-gray-600 text-sm mb-5">Try a different search term.</p>
          <button
            onClick={() => setSearch('')}
            className="text-sm font-semibold text-teal-700 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !fetchError && filteredInquiries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Received
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="font-medium text-gray-800">
                        {formatRelative(inquiry.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-medium">
                        {inquiry.product_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-blue-900">
                        {inquiry.customer_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[260px]">
                        {inquiry.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="truncate max-w-[200px]">{inquiry.email}</div>
                      {inquiry.phone && (
                        <div className="text-xs text-gray-500">{inquiry.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInquiry(inquiry);
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer mr-1"
                        aria-label={`View inquiry from ${inquiry.customer_name}`}
                        title="View details"
                      >
                        <i className="ri-eye-line text-lg" aria-hidden="true"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingInquiry(inquiry);
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label={`Delete inquiry from ${inquiry.customer_name}`}
                        title="Delete"
                      >
                        <i className="ri-delete-bin-line text-lg" aria-hidden="true"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-inquiry-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedInquiry(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-semibold mb-2">
                  Product Inquiry
                </span>
                <h3
                  id="product-inquiry-title"
                  className="text-xl sm:text-2xl font-bold text-blue-900 break-words"
                >
                  {selectedInquiry.product_name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Received {formatDateTime(selectedInquiry.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 -m-1 flex-shrink-0"
                aria-label="Close"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6 space-y-6">
              {/* Customer card */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Customer
                </p>
                <div className="text-lg font-semibold text-gray-900 mb-3">
                  {selectedInquiry.customer_name}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="inline-flex items-center gap-2 text-blue-800 hover:underline"
                  >
                    <i className="ri-mail-line" aria-hidden="true"></i>
                    {selectedInquiry.email}
                  </a>
                  {selectedInquiry.phone && (
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="inline-flex items-center gap-2 text-blue-800 hover:underline"
                    >
                      <i className="ri-phone-line" aria-hidden="true"></i>
                      {selectedInquiry.phone}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => copyToClipboard(selectedInquiry.email, 'Email')}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                  >
                    <i className="ri-file-copy-line" aria-hidden="true"></i>
                    Copy email
                  </button>
                  {selectedInquiry.phone && (
                    <>
                      <button
                        onClick={() => copyToClipboard(selectedInquiry.phone, 'Phone')}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                      >
                        <i className="ri-file-copy-line" aria-hidden="true"></i>
                        Copy phone
                      </button>
                      <a
                        href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <i className="ri-whatsapp-line text-base" aria-hidden="true"></i>
                        WhatsApp
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Message
                </p>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
              <a
                href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                  `Re: ${selectedInquiry.product_name}`
                )}&body=${encodeURIComponent(
                  `Hello ${selectedInquiry.customer_name},\n\nThank you for your interest in ${selectedInquiry.product_name}.\n\nBest regards,\nMiftah Edu-Trade Hub`
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg transition-all whitespace-nowrap"
              >
                <i className="ri-reply-line" aria-hidden="true"></i>
                Reply via Email
              </a>
              <button
                onClick={() => setDeletingInquiry(selectedInquiry)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-delete-bin-line" aria-hidden="true"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingInquiry && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-inquiry-delete-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeletingInquiry(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <i className="ri-delete-bin-6-line text-2xl text-red-600" aria-hidden="true"></i>
            </div>
            <h3
              id="product-inquiry-delete-title"
              className="text-xl font-bold text-gray-900 text-center mb-2"
            >
              Delete this inquiry?
            </h3>
            <p className="text-gray-600 text-sm text-center mb-1">From</p>
            <p className="text-gray-900 font-semibold text-center mb-5 truncate">
              {deletingInquiry.customer_name} · {deletingInquiry.product_name}
            </p>
            <p className="text-xs text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setDeletingInquiry(null)}
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
                  'Delete Inquiry'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}