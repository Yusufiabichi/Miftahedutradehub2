import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { getAuthHeaders } from '../../../utils/auth';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string;
  tags: string[];
  read_time?: string;
  status?: 'Draft' | 'Published' | 'Archived';
  is_published?: boolean;
  published_at?: string;
  created_at: string;
}

type Toast = { kind: 'success' | 'error'; message: string } | null;
type StatusFilter = 'all' | 'Published' | 'Draft' | 'Archived';

const DEFAULT_BLOG_IMAGE = 'https://placehold.co/1200x630?text=Miftah+Edu-Trade+Hub';
const BLOG_CATEGORIES = [
  'Company News',
  'International Trade',
  'Education & Scholarships',
  'Travel & Visa',
  'Business Tips',
] as const;
const STATUS_FILTERS: StatusFilter[] = ['all', 'Published', 'Draft', 'Archived'];

const getBlogStatus = (blog: Blog): 'Draft' | 'Published' | 'Archived' =>
  blog.status || (blog.is_published ? 'Published' : 'Draft');

const formatDate = (value: string | undefined): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function BlogsManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formDirty, setFormDirty] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toast, setToast] = useState<Toast>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const response = await fetch('/api/blogs');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setFetchError('Unable to load blog posts. Please try again.');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Modal: escape + body scroll lock
  useEffect(() => {
    const open = showForm || Boolean(deletingBlog);
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving && !isDeleting) {
        closeForm();
        setDeletingBlog(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, deletingBlog, isSaving, isDeleting]);

  // Autofocus first input when modal opens
  useEffect(() => {
    if (showForm) {
      const id = window.setTimeout(() => firstInputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [showForm]);

  const openCreate = () => {
    setEditingBlog(null);
    setFormError('');
    setFormDirty(false);
    setShowForm(true);
  };

  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormError('');
    setFormDirty(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    if (formDirty && !confirm('You have unsaved changes. Discard them?')) return;
    setShowForm(false);
    setEditingBlog(null);
    setFormError('');
    setFormDirty(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;

    setFormError('');
    const formData = new FormData(e.currentTarget);

    const rawReadTime = String(formData.get('read_time') || '').trim();
    const readTimeMatch = rawReadTime.match(/\d+/);
    const readTime = readTimeMatch ? readTimeMatch[0] : rawReadTime;

    const rawImage = String(formData.get('image') || '').trim();

    const blogData = {
      title: String(formData.get('title') || '').trim(),
      excerpt: String(formData.get('excerpt') || '').trim(),
      content: String(formData.get('content') || '').trim(),
      author: String(formData.get('author') || '').trim(),
      category: formData.get('category') as string,
      image: rawImage || editingBlog?.image || DEFAULT_BLOG_IMAGE,
      tags: String(formData.get('tags') || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      read_time: readTime,
      status: (formData.get('status') as string) || 'Published',
    };

    if (!blogData.title || !blogData.excerpt || !blogData.content || !blogData.author) {
      setFormError('Title, excerpt, content, and author are required.');
      return;
    }
    if (blogData.excerpt.length > 300) {
      setFormError('Excerpt must be 300 characters or fewer.');
      return;
    }

    setIsSaving(true);
    const isEditing = Boolean(editingBlog);
    try {
      const url = isEditing ? `/api/blogs/${editingBlog!.id}` : '/api/blogs';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save blog post');
      }

      await fetchBlogs();
      setShowForm(false);
      setEditingBlog(null);
      setFormDirty(false);
      setToast({
        kind: 'success',
        message: isEditing ? 'Blog post updated successfully.' : 'Blog post created successfully.',
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to save blog post. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingBlog) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/blogs/${deletingBlog.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete blog post');

      setBlogs((prev) => prev.filter((b) => b.id !== deletingBlog.id));
      setToast({ kind: 'success', message: `"${deletingBlog.title}" was deleted.` });
      setDeletingBlog(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
      setToast({ kind: 'error', message: 'Failed to delete blog post. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBlogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const status = getBlogStatus(b);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [blogs, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: blogs.length,
      Published: blogs.filter((b) => getBlogStatus(b) === 'Published').length,
      Draft: blogs.filter((b) => getBlogStatus(b) === 'Draft').length,
      Archived: blogs.filter((b) => getBlogStatus(b) === 'Archived').length,
    }),
    [blogs]
  );

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
          <h2 className="text-2xl font-bold text-blue-900">Blog Posts</h2>
          <p className="text-sm text-gray-600 mt-1">
            {blogs.length} {blogs.length === 1 ? 'post' : 'posts'} ·{' '}
            {counts.Published} published · {counts.Draft} draft
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-800 hover:shadow-lg active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line text-lg" aria-hidden="true"></i>
          Add New Post
        </button>
      </div>

      {/* Search + Status filters */}
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
            placeholder="Search by title, author, category, or tag..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            aria-label="Search blog posts"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-900 hover:bg-blue-50'
                }`}
              >
                {status === 'all' ? 'All' : status}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {counts[status]}
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
              onClick={fetchBlogs}
              className="text-sm font-semibold underline mt-1 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-1/4 bg-gray-100 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && !fetchError && blogs.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="ri-article-line text-4xl text-blue-900" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto mb-6">
            Share insights, updates, and stories to build trust with your audience.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 hover:shadow-lg transition-all cursor-pointer"
          >
            <i className="ri-add-line text-lg" aria-hidden="true"></i>
            Write Your First Post
          </button>
        </div>
      )}

      {!loading && !fetchError && blogs.length > 0 && filteredBlogs.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-search-eye-line text-3xl text-gray-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-1">No matching posts</h3>
          <p className="text-gray-600 text-sm mb-5">Try a different search term or filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
            }}
            className="text-sm font-semibold text-blue-900 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !fetchError && filteredBlogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Post
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBlogs.map((blog) => {
                  const status = getBlogStatus(blog);
                  return (
                    <tr key={blog.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={blog.image || DEFAULT_BLOG_IMAGE}
                            alt=""
                            loading="lazy"
                            className="w-12 h-12 rounded-lg object-cover object-top flex-shrink-0 bg-gray-100"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-blue-900 truncate max-w-[280px]">
                              {blog.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {blog.read_time ? `${blog.read_time} min read` : '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {blog.author}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-900 rounded-full text-xs font-medium">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            status === 'Published'
                              ? 'bg-green-100 text-green-800'
                              : status === 'Archived'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(blog.published_at || blog.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(blog)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer mr-1"
                          aria-label={`Edit ${blog.title}`}
                          title="Edit"
                        >
                          <i className="ri-edit-line text-lg" aria-hidden="true"></i>
                        </button>
                        <button
                          onClick={() => setDeletingBlog(blog)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label={`Delete ${blog.title}`}
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

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-form-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-start justify-between gap-4">
              <div>
                <h3 id="blog-form-title" className="text-2xl font-bold text-blue-900">
                  {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingBlog
                    ? 'Update the details below and save your changes.'
                    : 'Write and publish a new post for your audience.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 -m-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              onChange={() => setFormDirty(true)}
              className="px-6 sm:px-8 py-6 space-y-5"
            >
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                >
                  <i className="ri-error-warning-line text-xl mt-0.5" aria-hidden="true"></i>
                  <p className="text-sm">{formError}</p>
                </div>
              )}

              <div>
                <label htmlFor="blog-title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="blog-title"
                  type="text"
                  name="title"
                  defaultValue={editingBlog?.title}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                  placeholder="A clear, compelling headline"
                />
              </div>

              <div>
                <label htmlFor="blog-excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
                  Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="blog-excerpt"
                  name="excerpt"
                  defaultValue={editingBlog?.excerpt}
                  required
                  maxLength={300}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm resize-y"
                  placeholder="Short summary shown on the blog list (max 300 chars)"
                />
                <p className="text-xs text-gray-500 mt-1">Shown in the blog preview list.</p>
              </div>

              <div>
                <label htmlFor="blog-content" className="block text-sm font-semibold text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="blog-content"
                  name="content"
                  defaultValue={editingBlog?.content}
                  required
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm resize-y font-mono leading-relaxed"
                  placeholder="Write your full article here. Markdown is supported."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="blog-author" className="block text-sm font-semibold text-gray-700 mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="blog-author"
                    type="text"
                    name="author"
                    defaultValue={editingBlog?.author}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                    placeholder="e.g. Miftah Team"
                  />
                </div>

                <div>
                  <label htmlFor="blog-category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="blog-category"
                    name="category"
                    defaultValue={editingBlog?.category || BLOG_CATEGORIES[0]}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm bg-white"
                  >
                    {BLOG_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="blog-image" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <input
                  id="blog-image"
                  type="url"
                  name="image"
                  defaultValue={editingBlog?.image}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the default cover image.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="blog-tags" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    id="blog-tags"
                    type="text"
                    name="tags"
                    defaultValue={editingBlog?.tags?.join(', ')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                    placeholder="trade, export, nigeria"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate with commas.</p>
                </div>

                <div>
                  <label htmlFor="blog-readtime" className="block text-sm font-semibold text-gray-700 mb-2">
                    Read Time (minutes)
                  </label>
                  <input
                    id="blog-readtime"
                    type="text"
                    name="read_time"
                    defaultValue={editingBlog?.read_time}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="blog-status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="blog-status"
                  name="status"
                  defaultValue={
                    editingBlog?.status ||
                    (editingBlog?.is_published ? 'Published' : 'Published')
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm bg-white"
                >
                  <option value="Published">Published — visible on the site</option>
                  <option value="Draft">Draft — saved but hidden</option>
                  <option value="Archived">Archived — kept for records</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 hover:shadow-lg transition-all whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>
                      {editingBlog ? 'Updating...' : 'Publishing...'}
                    </span>
                  ) : editingBlog ? (
                    'Update Post'
                  ) : (
                    'Create Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingBlog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-delete-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeletingBlog(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <i className="ri-delete-bin-6-line text-2xl text-red-600" aria-hidden="true"></i>
            </div>
            <h3 id="blog-delete-title" className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete this blog post?
            </h3>
            <p className="text-gray-600 text-sm text-center mb-1">You are about to delete</p>
            <p className="text-gray-900 font-semibold text-center mb-5 truncate">
              "{deletingBlog.title}"
            </p>
            <p className="text-xs text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setDeletingBlog(null)}
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
                  'Delete Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}