import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OverviewTab from './components/OverviewTab';
import BlogsManager from './components/BlogsManager';
import MessagesManager from './components/MessagesManager';
import ProductsManager from './components/ProductsManager';
import ServiceInquiriesManager from './components/ServiceInquiriesManager';
import ProductInquiriesManager from './components/ProductInquiriesManager';
import { logout, getUser, ensureValidSession } from '../../utils/auth';

type TabId =
  | 'overview'
  | 'products'
  | 'blogs'
  | 'messages'
  | 'inquiries'
  | 'product-inquiries';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'products', label: 'Products', icon: 'ri-shopping-bag-line' },
  { id: 'blogs', label: 'Blogs', icon: 'ri-article-line' },
  { id: 'messages', label: 'Messages', icon: 'ri-mail-line' },
  { id: 'inquiries', label: 'Service Inquiries', icon: 'ri-question-answer-line' },
  { id: 'product-inquiries', label: 'Product Inquiries', icon: 'ri-questionnaire-line' },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleTabChange = useCallback(
    async (tab: TabId) => {
      if (tab === activeTab || switching) return;
      setSwitching(true);
      try {
        const isValid = await ensureValidSession();
        if (isValid) {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } finally {
        setSwitching(false);
      }
    },
    [activeTab, switching]
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || user?.email || 'Admin';
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            {/* Brand + title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <i className="ri-shield-user-line text-xl text-white" aria-hidden="true"></i>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Manage content, inquiries, and clients in one place
                </p>
              </div>
            </div>

            {/* User + actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <i className="ri-external-link-line" aria-hidden="true"></i>
                View Site
              </a>

              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l sm:border-gray-200">
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  {initials || 'AD'}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-500">Signed in</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              >
                <i className="ri-logout-box-r-line" aria-hidden="true"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50/50">
            <nav
              className="flex overflow-x-auto scrollbar-thin"
              role="tablist"
              aria-label="Admin sections"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDisabled = switching && !isActive;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    disabled={isDisabled}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center gap-2 px-5 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                      isActive
                        ? 'border-teal-600 text-teal-700 bg-white'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/70'
                    } ${isDisabled ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    <i className={`${tab.icon} text-base`} aria-hidden="true"></i>
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-teal-600" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'overview' && <OverviewTab onNavigate={handleTabChange} />}
            {activeTab === 'products' && <ProductsManager />}
            {activeTab === 'blogs' && <BlogsManager />}
            {activeTab === 'messages' && <MessagesManager />}
            {activeTab === 'inquiries' && <ServiceInquiriesManager />}
            {activeTab === 'product-inquiries' && <ProductInquiriesManager />}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Miftah Edu-Trade Hub Ltd &middot; Admin Console
        </p>
      </main>
    </div>
  );
}