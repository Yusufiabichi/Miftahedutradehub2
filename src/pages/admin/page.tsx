import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OverviewTab from './components/OverviewTab';
// import ServicesManager from './components/ServicesManager';
import BlogsManager from './components/BlogsManager';
import MessagesManager from './components/MessagesManager';
// import GalleryManager from './components/GalleryManager';
import ProductsManager from './components/ProductsManager';
import ServiceInquiriesManager from './components/ServiceInquiriesManager';
import ProductInquiriesManager from './components/ProductInquiriesManager';
// import TestimonialsManager from './components/TestimonialsManager';
import { logout, getUser, ensureValidSession, startSessionRefresh, stopSessionRefresh } from '../../utils/auth';

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    
    // Start automatic session refresh
    startSessionRefresh();
    
    // Cleanup on unmount
    return () => {
      stopSessionRefresh();
    };
  }, []);

  // Ensure valid session when switching tabs
  const handleTabChange = async (tab: string) => {
    const isValid = await ensureValidSession();
    if (isValid) {
      setActiveTab(tab);
    }
  };

  const handleLogout = async () => {
    stopSessionRefresh();
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-logout-box-line"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
                // { id: 'services', label: 'Services', icon: 'ri-service-line' },
                { id: 'products', label: 'Products', icon: 'ri-shopping-bag-line' },
                // { id: 'gallery', label: 'Gallery', icon: 'ri-gallery-line' },
                { id: 'blogs', label: 'Blogs', icon: 'ri-article-line' },
                // { id: 'testimonials', label: 'Testimonials', icon: 'ri-chat-quote-line' },
                { id: 'messages', label: 'Messages', icon: 'ri-mail-line' },
                { id: 'inquiries', label: 'Service Inquiries', icon: 'ri-question-answer-line' },
                { id: 'product-inquiries', label: 'Product Inquiries', icon: 'ri-questionnaire-line' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {/* {activeTab === 'services' && <ServicesManager />} */}
            {activeTab === 'products' && <ProductsManager />}
            {/* {activeTab === 'gallery' && <GalleryManager />} */}
            {activeTab === 'blogs' && <BlogsManager />}
            {/* {activeTab === 'testimonials' && <TestimonialsManager />} */}
            {activeTab === 'messages' && <MessagesManager />}
            {activeTab === 'inquiries' && <ServiceInquiriesManager />}
            {activeTab === 'product-inquiries' && <ProductInquiriesManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
