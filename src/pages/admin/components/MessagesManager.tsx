import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuthHeaders } from '../../../utils/auth';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

type Filter = 'all' | 'unread' | 'read' | 'replied';
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

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || '?';

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const response = await fetch('/api/enquiries/message', { headers: getAuthHeaders() });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Failed to fetch messages');
      }

      const rows = Array.isArray(data) ? data : [];
      setMessages(
        rows.map((row) => ({
          ...row,
          status: (row.status || 'unread') as Message['status'],
        }))
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      setFetchError(
        error instanceof Error ? error.message : 'Unable to load messages right now.'
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Modal: escape + body scroll lock
  useEffect(() => {
    const open = Boolean(selectedMessage) || Boolean(deletingMessage);
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        setSelectedMessage(null);
        setDeletingMessage(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedMessage, deletingMessage, isDeleting]);

  const updateMessageInState = (id: string, patch: Partial<Message>) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...patch } : msg)));
    setSelectedMessage((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  const handleStatusChange = async (id: string, newStatus: Message['status']) => {
    const previous = messages.find((m) => m.id === id)?.status;
    updateMessageInState(id, { status: newStatus });

    try {
      const response = await fetch(`/api/enquiries/message/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to update message');
      }
    } catch (error) {
      if (previous) updateMessageInState(id, { status: previous });
      setToast({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Failed to update message.',
      });
    }
  };

  const handleReply = async (message: Message) => {
    const subject = `Re: ${message.subject}`;
    const body = `Hello ${message.name},\n\nThank you for contacting us.\n\nBest regards,\nMiftah Edu-Trade Hub`;
    window.location.href = `mailto:${encodeURIComponent(
      message.email
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (message.status !== 'replied') {
      await handleStatusChange(message.id, 'replied');
    }
  };

  const confirmDelete = async () => {
    if (!deletingMessage) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/enquiries/message/${deletingMessage.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to delete message');
      }
      setMessages((prev) => prev.filter((m) => m.id !== deletingMessage.id));
      if (selectedMessage?.id === deletingMessage.id) setSelectedMessage(null);
      setToast({ kind: 'success', message: 'Message deleted.' });
      setDeletingMessage(null);
    } catch (error) {
      setToast({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete message.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      handleStatusChange(message.id, 'read');
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

  const counts = useMemo(
    () => ({
      all: messages.length,
      unread: messages.filter((m) => m.status === 'unread').length,
      read: messages.filter((m) => m.status === 'read').length,
      replied: messages.filter((m) => m.status === 'replied').length,
    }),
    [messages]
  );

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      const matchesFilter = filter === 'all' || m.status === filter;
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [messages, filter, search]);

  const FILTERS: { key: Filter; label: string; tone: string }[] = [
    { key: 'all', label: 'All', tone: 'bg-blue-900 text-white' },
    { key: 'unread', label: 'Unread', tone: 'bg-blue-900 text-white' },
    { key: 'read', label: 'Read', tone: 'bg-blue-900 text-white' },
    { key: 'replied', label: 'Replied', tone: 'bg-blue-900 text-white' },
  ];

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
          <h2 className="text-2xl font-bold text-blue-900">Contact Messages</h2>
          <p className="text-sm text-gray-600 mt-1">
            {counts.unread > 0 ? (
              <>
                <span className="font-semibold text-blue-900">{counts.unread}</span> unread{' '}
                {counts.unread === 1 ? 'message' : 'messages'} need your attention
              </>
            ) : (
              'You are all caught up.'
            )}
          </p>
        </div>
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
            placeholder="Search by name, email, subject, or message..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            aria-label="Search messages"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-900 hover:bg-blue-50'
                }`}
              >
                {label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {counts[key]}
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
              onClick={fetchMessages}
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
              className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && !fetchError && messages.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="ri-mail-line text-4xl text-blue-900" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">No messages yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            When visitors submit your contact form, their messages will appear here.
          </p>
        </div>
      )}

      {!loading && !fetchError && messages.length > 0 && filteredMessages.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-search-eye-line text-3xl text-gray-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-1">No matching messages</h3>
          <p className="text-gray-600 text-sm mb-5">
            {search ? 'Try a different search term.' : `No ${filter} messages.`}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setFilter('all');
            }}
            className="text-sm font-semibold text-blue-900 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !fetchError && filteredMessages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    From
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Received
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMessages.map((message) => {
                  const isUnread = message.status === 'unread';
                  return (
                    <tr
                      key={message.id}
                      className={`cursor-pointer transition-colors ${
                        isUnread ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50/70'
                      }`}
                      onClick={() => handleViewMessage(message)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              isUnread
                                ? 'bg-blue-900 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                            aria-hidden="true"
                          >
                            {initialsOf(message.name)}
                          </div>
                          <div className="min-w-0">
                            <div
                              className={`text-sm truncate ${
                                isUnread ? 'font-bold text-blue-900' : 'font-medium text-gray-900'
                              }`}
                            >
                              {message.name}
                              {isUnread && (
                                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {message.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div
                          className={`text-sm truncate ${
                            isUnread ? 'font-semibold text-gray-900' : 'text-gray-800'
                          }`}
                        >
                          {message.subject}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {message.message}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            message.status === 'unread'
                              ? 'bg-blue-100 text-blue-800'
                              : message.status === 'read'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatRelative(message.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingMessage(message);
                          }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label={`Delete message from ${message.name}`}
                          title="Delete"
                        >
                          <i className="ri-delete-bin-line text-lg" aria-hidden="true"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMessage(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3
                  id="message-detail-title"
                  className="text-xl sm:text-2xl font-bold text-gray-900 break-words"
                >
                  {selectedMessage.subject}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {formatDateTime(selectedMessage.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 -m-1 flex-shrink-0"
                aria-label="Close"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6 space-y-6">
              {/* Sender card */}
              <div className="flex flex-wrap items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {initialsOf(selectedMessage.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900">{selectedMessage.name}</div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-1">
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="inline-flex items-center gap-1.5 text-blue-800 hover:underline"
                    >
                      <i className="ri-mail-line" aria-hidden="true"></i>
                      {selectedMessage.email}
                    </a>
                    {selectedMessage.phone && (
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="inline-flex items-center gap-1.5 text-blue-800 hover:underline"
                      >
                        <i className="ri-phone-line" aria-hidden="true"></i>
                        {selectedMessage.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(selectedMessage.email, 'Email')}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                    title="Copy email"
                    aria-label="Copy email"
                  >
                    <i className="ri-file-copy-line" aria-hidden="true"></i>
                  </button>
                  {selectedMessage.phone && (
                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-green-600 hover:bg-green-100 transition-colors"
                      title="Chat on WhatsApp"
                      aria-label="Chat on WhatsApp"
                    >
                      <i className="ri-whatsapp-line text-lg" aria-hidden="true"></i>
                    </a>
                  )}
                </div>
              </div>

              {/* Message body */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Message
                </p>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                  disabled={selectedMessage.status === 'read'}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedMessage.status === 'read'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <i className="ri-mail-open-line" aria-hidden="true"></i>
                  Mark as Read
                </button>
                <button
                  onClick={() => handleReply(selectedMessage)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-reply-line" aria-hidden="true"></i>
                  Reply via Email
                </button>
              </div>
              <button
                onClick={() => setDeletingMessage(selectedMessage)}
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
      {deletingMessage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-delete-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeletingMessage(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <i className="ri-delete-bin-6-line text-2xl text-red-600" aria-hidden="true"></i>
            </div>
            <h3
              id="message-delete-title"
              className="text-xl font-bold text-gray-900 text-center mb-2"
            >
              Delete this message?
            </h3>
            <p className="text-gray-600 text-sm text-center mb-1">From</p>
            <p className="text-gray-900 font-semibold text-center mb-5 truncate">
              {deletingMessage.name} · {deletingMessage.subject}
            </p>
            <p className="text-xs text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setDeletingMessage(null)}
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
                  'Delete Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}