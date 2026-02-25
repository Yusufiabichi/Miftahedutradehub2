import { useState, useEffect } from 'react';
import { getAccessToken, ensureValidSession } from '../../../utils/auth';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface Stats {
  // services: number;
  products: number;
  blogs: number;
  // testimonials: number;
  messages: number;
  serviceInquiries: number;
  productInquiries: number;
  // galleryImages: number;
}


export default function OverviewTab() {
  const [stats, setStats] = useState<Stats>({
    // services: 0,
    products: 0,
    blogs: 0,
    // testimonials: 0,
    messages: 0,
    serviceInquiries: 0,
    productInquiries: 0,
    // galleryImages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const isValid = await ensureValidSession();
    if (!isValid) return;

    try {
      const token = getAccessToken();
      
      // Fetch all data in parallel
      const [
        // servicesRes,
        productsRes,
        blogsRes,
        // testimonialsRes,
        messagesRes,
        serviceInquiriesRes,
        productInquiriesRes,
        // galleryRes,
      ] = await Promise.all([
        fetch(`${SUPABASE_URL}/functions/v1/products-api`, {
          headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
        }),
        fetch(`${SUPABASE_URL}/functions/v1/blogs-api`, {
          headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
        }),
        fetch(`${SUPABASE_URL}/functions/v1/contact-api`, {
          headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
        }),
        fetch(`${SUPABASE_URL}/functions/v1/service-inquiries-api`, {
          headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
        }),
        fetch(`${SUPABASE_URL}/functions/v1/product-inquiries-api`, {
          headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
        }),
      ]);

      const [
        // services,
        products,
        blogs,
        // testimonials,
        messages,
        serviceInquiries,
        productInquiries,
        // gallery,
      ] = await Promise.all([
        // servicesRes.ok ? servicesRes.json() : [],
        productsRes.ok ? productsRes.json() : [],
        blogsRes.ok ? blogsRes.json() : [],
        // testimonialsRes.ok ? testimonialsRes.json() : [],
        messagesRes.ok ? messagesRes.json() : [],
        serviceInquiriesRes.ok ? serviceInquiriesRes.json() : [],
        productInquiriesRes.ok ? productInquiriesRes.json() : [],
        // galleryRes.ok ? galleryRes.json() : [],
      ]);

      setStats({
        // services: services.length || 0,
        products: products.length || 0,
        blogs: blogs.length || 0,
        // testimonials: testimonials.length || 0,
        messages: messages.length || 0,
        serviceInquiries: serviceInquiries.length || 0,
        productInquiries: productInquiries.length || 0,
        // galleryImages: gallery.length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    // { label: 'Services', value: stats.services, icon: 'ri-service-line', color: 'from-blue-500 to-blue-600' },
    { label: 'Products', value: stats.products, icon: 'ri-shopping-bag-line', color: 'from-yellow-500 to-yellow-600' },
    { label: 'Blog Posts', value: stats.blogs, icon: 'ri-article-line', color: 'from-purple-500 to-purple-600' },
    // { label: 'Testimonials', value: stats.testimonials, icon: 'ri-chat-quote-line', color: 'from-green-500 to-green-600' },
    { label: 'Contact Messages', value: stats.messages, icon: 'ri-mail-line', color: 'from-red-500 to-red-600' },
    { label: 'Service Inquiries', value: stats.serviceInquiries, icon: 'ri-question-answer-line', color: 'from-indigo-500 to-indigo-600' },
    { label: 'Product Inquiries', value: stats.productInquiries, icon: 'ri-questionnaire-line', color: 'from-teal-500 to-teal-600' },
    // { label: 'Gallery Images', value: stats.galleryImages, icon: 'ri-gallery-line', color: 'from-pink-500 to-pink-600' },
  ];


  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-yellow-500 animate-spin"></i>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to your admin dashboard. Here's a quick summary of your content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
          >
            <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${card.icon} text-2xl text-white`}></i>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{card.label}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <i className="ri-information-line mr-2"></i>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-3 bg-blue-50 text-blue-900 rounded-lg hover:bg-blue-100 transition-colors text-left flex items-center whitespace-nowrap cursor-pointer"
            >
              <i className="ri-home-line mr-3"></i>
              View Website
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-yellow-50 text-yellow-900 rounded-lg hover:bg-yellow-100 transition-colors text-left flex items-center whitespace-nowrap cursor-pointer"
            >
              <i className="ri-refresh-line mr-3"></i>
              Refresh Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <i className="ri-lightbulb-line mr-2"></i>
            Tips
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <i className="ri-check-line text-green-600 mr-2 mt-1"></i>
              <span>Keep your content updated regularly for better engagement</span>
            </li>
            <li className="flex items-start">
              <i className="ri-check-line text-green-600 mr-2 mt-1"></i>
              <span>Respond to inquiries promptly to improve customer satisfaction</span>
            </li>
            <li className="flex items-start">
              <i className="ri-check-line text-green-600 mr-2 mt-1"></i>
              <span>Add high-quality images to showcase your products and services</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
