import { useState, useEffect, useMemo } from 'react';
import { getAuthHeaders } from '../../../utils/auth';

interface Stats {
  products: number;
  blogs: number;
  messages: number;
  serviceInquiries: number;
  productInquiries: number;
}

interface RecentItem {
  id: string | number;
  title: string;
  subtitle?: string;
  createdAt?: string;
  icon: string;
  tone: 'blue' | 'amber' | 'indigo' | 'red' | 'teal';
}

interface OverviewTabProps {
  onNavigate?: (tab: any) => void;
}

const EMPTY_STATS: Stats = {
  products: 0,
  blogs: 0,
  messages: 0,
  serviceInquiries: 0,
  productInquiries: 0,
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function relativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function OverviewTab({ onNavigate }: OverviewTabProps) {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      const [productsRes, blogsRes, messagesRes, serviceRes, productRes] =
        await Promise.all([
          fetch('/api/products'),
          fetch('/api/blogs'),
          fetch('/api/enquiries/message', { headers: getAuthHeaders() }),
          fetch('/api/enquiries/service', { headers: getAuthHeaders() }),
          fetch('/api/enquiries/product', { headers: getAuthHeaders() }),
        ]);

      const [products, blogs, messages, serviceInquiries, productInquiries] =
        await Promise.all([
          productsRes.ok ? productsRes.json() : [],
          blogsRes.ok ? blogsRes.json() : [],
          messagesRes.ok ? messagesRes.json() : [],
          serviceRes.ok ? serviceRes.json() : [],
          productRes.ok ? productRes.json() : [],
        ]);

      const safeArray = (v: unknown) => (Array.isArray(v) ? v : []);

      setStats({
        products: safeArray(products).length,
        blogs: safeArray(blogs).length,
        messages: safeArray(messages).length,
        serviceInquiries: safeArray(serviceInquiries).length,
        productInquiries: safeArray(productInquiries).length,
      });

      // Build a simple "recent activity" list from the newest items across sources
      const activity: RecentItem[] = [
        ...safeArray(messages).map((m: any) => ({
          id: `msg-${m.id}`,
          title: m.name || m.email || 'New contact message',
          subtitle: m.subject || m.message?.slice(0, 80) || 'Contact form submission',
          createdAt: m.created_at,
          icon: 'ri-mail-line',
          tone: 'red' as const,
        })),
        ...safeArray(serviceInquiries).map((i: any) => ({
          id: `svc-${i.id}`,
          title: i.name || 'Service inquiry',
          subtitle: i.service_name || i.service || 'Requested a service',
          createdAt: i.created_at,
          icon: 'ri-question-answer-line',
          tone: 'indigo' as const,
        })),
        ...safeArray(productInquiries).map((i: any) => ({
          id: `prd-${i.id}`,
          title: i.name || 'Product inquiry',
          subtitle: i.product_name || 'Product question',
          createdAt: i.created_at,
          icon: 'ri-questionnaire-line',
          tone: 'teal' as const,
        })),
      ]
        .filter((item) => item.createdAt)
        .sort(
          (a, b) =>
            new Date(b.createdAt as string).getTime() -
            new Date(a.createdAt as string).getTime()
        )
        .slice(0, 5);

      setRecent(activity);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Some data failed to load. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = useMemo(
    () => [
      {
        key: 'products' as const,
        label: 'Products',
        value: stats.products,
        icon: 'ri-shopping-bag-line',
        color: 'from-yellow-500 to-yellow-600',
        tab: 'products',
        hint: 'Items in your catalogue',
      },
      {
        key: 'blogs' as const,
        label: 'Blog Posts',
        value: stats.blogs,
        icon: 'ri-article-line',
        color: 'from-purple-500 to-purple-600',
        tab: 'blogs',
        hint: 'Published articles',
      },
      {
        key: 'messages' as const,
        label: 'Contact Messages',
        value: stats.messages,
        icon: 'ri-mail-line',
        color: 'from-red-500 to-red-600',
        tab: 'messages',
        hint: 'From the contact form',
      },
      {
        key: 'serviceInquiries' as const,
        label: 'Service Inquiries',
        value: stats.serviceInquiries,
        icon: 'ri-question-answer-line',
        color: 'from-indigo-500 to-indigo-600',
        tab: 'inquiries',
        hint: 'Requests for services',
      },
      {
        key: 'productInquiries' as const,
        label: 'Product Inquiries',
        value: stats.productInquiries,
        icon: 'ri-questionnaire-line',
        color: 'from-teal-500 to-teal-600',
        tab: 'product-inquiries',
        hint: 'Product-specific leads',
      },
    ],
    [stats]
  );

  const totalLeads = stats.messages + stats.serviceInquiries + stats.productInquiries;

  if (loading) {
    return (
      <div>
        <div className="mb-8 space-y-2">
          <div className="h-7 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="h-1 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-1">
            {getGreeting()} 👋
          </h2>
          <p className="text-gray-600">
            Here's a quick snapshot of your site. You have{' '}
            <span className="font-semibold text-gray-900">{totalLeads}</span>{' '}
            {totalLeads === 1 ? 'lead' : 'leads'} waiting for attention.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <i className="ri-refresh-line" aria-hidden="true"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3"
        >
          <i
            className="ri-error-warning-line text-amber-600 text-xl mt-0.5"
            aria-hidden="true"
          ></i>
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {statCards.map((card) => {
          const clickable = Boolean(onNavigate && card.tab);
          return (
            <button
              key={card.key}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onNavigate?.(card.tab)}
              className={`text-left bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all group ${
                clickable
                  ? 'hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-200 cursor-pointer'
                  : 'cursor-default'
              }`}
            >
              <div className={`h-1 bg-gradient-to-r ${card.color}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center shadow-sm`}
                  >
                    <i
                      className={`${card.icon} text-2xl text-white`}
                      aria-hidden="true"
                    ></i>
                  </div>
                  {clickable && (
                    <i
                      className="ri-arrow-right-up-line text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                      aria-hidden="true"
                    ></i>
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
                  {card.value}
                </div>
                <h3 className="text-sm font-semibold text-gray-700">{card.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{card.hint}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent activity + Quick actions */}
      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <i className="ri-history-line" aria-hidden="true"></i>
              Recent Activity
            </h3>
            {onNavigate && (
              <button
                onClick={() => onNavigate('messages')}
                className="text-sm font-medium text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                View all
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <i className="ri-inbox-line text-2xl text-gray-400" aria-hidden="true"></i>
              </div>
              <p className="text-gray-600 text-sm">No recent activity yet.</p>
              <p className="text-gray-400 text-xs mt-1">
                New inquiries and messages will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 -mx-2">
              {recent.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-2 py-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-${item.tone}-50 text-${item.tone}-600`}
                  >
                    <i className={`${item.icon} text-lg`} aria-hidden="true"></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap pt-1">
                    {relativeTime(item.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-5">
            <i className="ri-flashlight-line" aria-hidden="true"></i>
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full px-4 py-3 bg-blue-50 text-blue-900 rounded-lg hover:bg-blue-100 transition-colors text-left flex items-center gap-3 cursor-pointer text-sm font-medium"
            >
              <i className="ri-home-line text-base" aria-hidden="true"></i>
              View Website
            </button>
            <button
              onClick={() => onNavigate?.('products')}
              className="w-full px-4 py-3 bg-yellow-50 text-yellow-900 rounded-lg hover:bg-yellow-100 transition-colors text-left flex items-center gap-3 cursor-pointer text-sm font-medium"
            >
              <i className="ri-add-circle-line text-base" aria-hidden="true"></i>
              Manage Products
            </button>
            <button
              onClick={() => onNavigate?.('blogs')}
              className="w-full px-4 py-3 bg-purple-50 text-purple-900 rounded-lg hover:bg-purple-100 transition-colors text-left flex items-center gap-3 cursor-pointer text-sm font-medium"
            >
              <i className="ri-article-line text-base" aria-hidden="true"></i>
              Write a Blog Post
            </button>
            <button
              onClick={() => onNavigate?.('messages')}
              className="w-full px-4 py-3 bg-red-50 text-red-900 rounded-lg hover:bg-red-100 transition-colors text-left flex items-center gap-3 cursor-pointer text-sm font-medium"
            >
              <i className="ri-inbox-archive-line text-base" aria-hidden="true"></i>
              Review Messages
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
              <i
                className="ri-lightbulb-line text-teal-600 text-lg mt-0.5"
                aria-hidden="true"
              ></i>
              <p className="text-xs text-teal-900 leading-relaxed">
                <span className="font-semibold">Tip:</span> Responding to inquiries within
                24 hours doubles your conversion rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}