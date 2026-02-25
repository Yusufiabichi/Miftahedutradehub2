import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import GallerySection from '../../components/feature/GallerySection';
import { useSEO, generateOrganizationSchema, generateWebPageSchema } from '../../utils/seo';
import BackToTop from '../../components/BackToTop';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Service {
  id: number;
  title: string;
  short_description: string;
  icon: string;
  category: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  specs: string[];
}

interface ApiProduct {
  id: number;
  product_name: string;
  category: string;
  description: string;
  key_features: string | null;
  specifications: string | null;
  images: string[] | null;
}

interface BlogPost {
  id: number | string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  created_at: string;
}

// interface Testimonial {
//   id: number;
//   name: string;
//   role: string;
//   text: string;
//   rating: number;
//   image: string;
// }

export default function Home() {
  // SEO
  useSEO({
    title: 'Miftah Edu-Trade - Import Export Travel Nigeria',
    description: 'Miftah Edu-Trade Hub Ltd offers comprehensive international trade, global education consulting, visa processing, currency exchange, and travel services in Nigeria. Your trusted partner for import-export solutions, study abroad programs, and worldwide business opportunities in Nigeria.',
    keywords: 'import export Nigeria, Nigeria trade services, study abroad Nigeria, visa processing Kano, currency exchange, international trade Nigeria, education consulting, travel services Kano',
    canonical: '/',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        generateWebPageSchema(
          'Miftah Edu-Trade - Import Export Travel Nigeria',
          'Comprehensive international trade, global education consulting, visa processing, currency exchange, and travel services in Nigeria',
          '/'
        )
      ]
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchData();
    fetchBlogPosts();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs`);
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data = await response.json();
      const blogList = Array.isArray(data) ? data : [];
      const mappedBlogs: BlogPost[] = blogList
        .filter((item) => !item.status || item.status === 'Published')
        .map((item) => ({
          id: item.id,
          title: item.title || '',
          excerpt: item.excerpt || '',
          image: item.image || '',
          category: item.category || 'General',
          created_at: item.created_at || new Date().toISOString(),
        }));

      setBlogPosts(mappedBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogPosts([]);
    }
  };

  const parseTextList = (value: string | null | undefined): string[] => {
    if (!value) return [];
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setProductsError('');

      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ApiProduct[] = await response.json();
      const mappedProducts: Product[] = data.map((item) => ({
        id: item.id,
        name: item.product_name,
        category: item.category,
        description: item.description || '',
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '',
        specs: parseTextList(item.specifications).slice(0, 3),
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductsError('Unable to load products right now.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };


  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);


  const services = [
    {
      icon: 'ri-ship-line',
      title: 'Import & Export Solutions',
      description: 'Seamless international trade services connecting businesses across borders with reliable logistics and customs support.',
      path: '/services/import-export',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: 'ri-graduation-cap-line',
      title: 'Global Education & Scholarships',
      description: 'Expert guidance for studying abroad, scholarship applications, and university admissions worldwide.',
      path: '/services/education',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: 'ri-exchange-dollar-line',
      title: 'Currency Exchange & Remittance',
      description: 'Competitive rates for currency exchange and secure international money transfer services.',
      path: '/services/currency-exchange',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: 'ri-shopping-bag-line',
      title: 'Goods & Services Sourcing',
      description: 'Professional sourcing solutions for quality products and services from global markets.',
      path: '/services/sourcing',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: 'ri-flight-takeoff-line',
      title: 'Flights & Hotel Bookings',
      description: 'Best deals on international flights and hotel reservations for business and leisure travel.',
      path: '/services/travel',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: 'ri-passport-line',
      title: 'Visa Processing & Travel Advisory',
      description: 'Complete visa assistance and travel consultation for hassle-free international journeys.',
      path: '/services/visa',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const features = [
    {
      icon: 'ri-shield-check-line',
      title: 'Trusted & Reliable',
      description: 'Years of experience delivering exceptional service with complete transparency and integrity.'
    },
    {
      icon: 'ri-global-line',
      title: 'Global Network',
      description: 'Extensive partnerships worldwide ensuring seamless service delivery across continents.'
    },
    {
      icon: 'ri-customer-service-line',
      title: 'Expert Support',
      description: 'Dedicated team of professionals providing personalized assistance every step of the way.'
    },
    {
      icon: 'ri-price-tag-3-line',
      title: 'Competitive Pricing',
      description: 'Best value services with transparent pricing and no hidden charges.'
    }
  ];

  const testimonials = [
    {
      name: 'Ismail Yunus',
      role: 'Business Owner',
      image: '',
      text: 'Miftah Edu-Trade Hub made our import process incredibly smooth. Their expertise in international trade is unmatched.',
      rating: 5
    },
    {
      name: 'Fatima Sulaiman',
      role: 'Student',
      image: '',
      text: 'Thanks to their scholarship guidance, I am now studying at my dream university in Canada. Highly recommended!',
      rating: 5
    },
    {
      name: 'Abdulkarim Hassan',
      role: 'Entrepreneur',
      image: '',
      text: 'Their sourcing services helped us find quality suppliers at competitive prices. Excellent service and support.',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: 'What services does Miftah Edu-Trade Hub provide?',
      answer: 'We offer comprehensive international services including Import & Export solutions, Global Education & Scholarship guidance, Currency Exchange & Remittance, Goods & Services Sourcing, Flight & Hotel Bookings, and Visa Processing & Travel Advisory.'
    },
    {
      question: 'How can I apply for scholarships through your service?',
      answer: 'Our education consultants will guide you through the entire scholarship application process, from identifying suitable opportunities to preparing application materials and submitting them to universities worldwide. Contact us to schedule a consultation.'
    },
    {
      question: 'What countries do you provide visa processing services for?',
      answer: 'We provide visa processing assistance for over 50 countries including USA, Canada, UK, Australia, European nations, and many more. Our team stays updated with the latest visa requirements and procedures for each country.'
    },
    {
      question: 'How competitive are your currency exchange rates?',
      answer: 'We offer highly competitive exchange rates with transparent pricing and no hidden fees. Our rates are updated in real-time to ensure you get the best value for your money transfers and currency exchanges.'
    },
    {
      question: 'Do you provide customs clearance for import/export?',
      answer: 'Yes, we provide complete customs clearance services including documentation, compliance checking, duty calculation, and coordination with customs authorities to ensure smooth clearance of your shipments.'
    },
    {
      question: 'What is your customer support availability?',
      answer: 'Our customer support team is available Monday to Saturday from 9:00 AM to 6:00 PM. For urgent matters, you can reach us through our WhatsApp support or email, and we will respond as quickly as possible.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <WhatsAppButton />
      <BackToTop />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=stunning%20cinematic%20aerial%20view%20of%20modern%20international%20cargo%20port%20at%20golden%20hour%20with%20massive%20container%20ships%20colorful%20shipping%20containers%20in%20organized%20rows%20giant%20industrial%20cranes%20silhouetted%20against%20dramatic%20orange%20sunset%20sky%20with%20purple%20and%20pink%20clouds%20reflecting%20on%20calm%20ocean%20water%20professional%20photography%20showing%20global%20trade%20and%20logistics%20scale%20warm%20lighting%20atmospheric%20perspective&width=1920&height=1080&seq=hero-main-2025&orientation=landscape')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/30"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-300/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <div className="text-left">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span className="text-yellow-400 text-sm font-semibold tracking-wider uppercase">Your Global Partner</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1]">
                  Connecting You to
                  <span className="block mt-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    Global Opportunities
                  </span>
                </h1>

                {/* Service Tags */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Import–Export', 'Education Abroad', 'Currency Exchange', 'Visa Services', 'Travel Solutions'].map((tag, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white/90 text-sm font-medium hover:bg-white/10 hover:border-yellow-400/30 transition-all cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-lg text-white/80 mb-10 max-w-xl leading-relaxed">
                  Your trusted partner for comprehensive international trade, education consulting, and travel services. We make global connections seamless and accessible.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/30 hover:scale-105 transition-all whitespace-nowrap cursor-pointer"
                  >
                    Get Started
                    <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                  </Link>
                  <Link
                    to="/services"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 hover:border-white/50 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-play-circle-line text-xl"></i>
                    Explore Services
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <i className="ri-user-star-line text-2xl text-yellow-400"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">5000+</div>
                      <div className="text-sm text-white/60">Happy Clients</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <i className="ri-global-line text-2xl text-yellow-400"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-sm text-white/60">Countries</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <i className="ri-award-line text-2xl text-yellow-400"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">15+</div>
                      <div className="text-sm text-white/60">Years Experience</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Floating Cards */}
              <div className="hidden lg:block relative">
                <div className="relative h-[600px]">
                  
                  {/* Main Feature Card */}
                  <div className="absolute top-0 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 cursor-default">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                        <i className="ri-ship-line text-2xl text-slate-900"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Import & Export</h3>
                        <p className="text-sm text-slate-500">Global Trade Solutions</p>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      Seamless international trade services with customs clearance and logistics support.
                    </p>
                    <div className="flex items-center gap-2 text-yellow-600 font-semibold text-sm">
                      <i className="ri-check-line"></i>
                      <span>Trusted by 500+ businesses</span>
                    </div>
                  </div>

                  {/* Education Card */}
                  <div className="absolute top-40 left-0 w-72 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 cursor-default" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                        <i className="ri-graduation-cap-line text-xl text-white"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Study Abroad</h3>
                        <p className="text-xs text-slate-500">Education Consulting</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-4 text-sm">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs">🇺🇸</div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs">🇬🇧</div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs">🇨🇦</div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs">🇦🇺</div>
                      </div>
                      <span className="text-slate-600">50+ Universities</span>
                    </div>
                  </div>

                  {/* Currency Exchange Card */}
                  <div className="absolute bottom-32 right-10 w-64 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 cursor-default">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/60 text-sm">Currency Exchange</span>
                      <i className="ri-exchange-dollar-line text-yellow-400 text-xl"></i>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-white">Best</span>
                      <span className="text-yellow-400 font-semibold">Rates</span>
                    </div>
                    <p className="text-white/50 text-xs">Competitive rates with zero hidden fees</p>
                  </div>

                  {/* Visa Success Card */}
                  <div className="absolute bottom-0 left-10 w-56 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 cursor-default">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-check-double-line text-green-600 text-lg"></i>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">98%</div>
                        <div className="text-xs text-slate-500">Visa Success Rate</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-20 left-20 w-20 h-20 border-2 border-yellow-400/30 rounded-full"></div>
                  <div className="absolute bottom-40 right-40 w-16 h-16 border-2 border-white/20 rounded-lg rotate-45"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/50 text-sm">Scroll to explore</span>
            <i className="ri-arrow-down-line text-white/50 text-xl"></i>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">About Miftah Edu-Trade Hub</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              We are a leading provider of comprehensive international trade, education, and travel services. With years of experience and a global network of partners, we help individuals and businesses achieve their international goals with confidence and ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center mb-6">
                  <i className={`${feature.icon} text-3xl text-yellow-400`}></i>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" data-product-shop>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Comprehensive solutions for all your international business, education, and travel needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group bg-white border-2 shadow-xl border-gray-100 rounded-xl p-8 hover:border-yellow-400 hover:shadow-2xl transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`${service.icon} text-3xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <Link
                  to={service.path}
                  className="inline-flex items-center text-blue-900 font-semibold hover:text-yellow-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Learn More
                  <i className="ri-arrow-right-line ml-2"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-blue-50 to-white" data-product-shop>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Featured Products</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Quality products sourced from trusted manufacturers worldwide
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg'
                    : 'bg-white text-blue-900 border-2 border-gray-200 hover:border-blue-900 hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {!loading && productsError && (
              <div className="col-span-full text-center text-red-600 py-6">{productsError}</div>
            )}
            {!loading && !productsError && filteredProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-600 py-6">No products available.</div>
            )}
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                <div className="relative w-full h-64 bg-gray-50 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-400 text-blue-900 text-xs font-semibold rounded-full">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-yellow-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mb-4">
                    {product.specs.map((spec, index) => (
                      <span key={index} className="inline-block text-xs bg-blue-50 text-blue-900 px-2 py-1 rounded mr-2 mb-2">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/product/${product.id}#inquiry-form`}
                    className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
                  >
                    Inquire Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all whitespace-nowrap cursor-pointer inline-block text-center"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <GallerySection />

      <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-400 mb-2">15+</div>
              <p className="text-blue-100 text-lg">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-400 mb-2">50+</div>
              <p className="text-blue-100 text-lg">Countries Served</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-400 mb-2">5000+</div>
              <p className="text-blue-100 text-lg">Happy Clients</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-400 mb-2">98%</div>
              <p className="text-blue-100 text-lg">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Client Testimonials</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-700">What our clients say about us</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-blue-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="ri-star-fill text-yellow-400"></i>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Latest News & Insights</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700">Stay updated with the latest trends and tips in international trade, education, and travel</p>
          </div>

          {blogPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {blogPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-yellow-400 text-blue-900 text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <i className="ri-calendar-line mr-1"></i>
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                      <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center text-blue-900 font-semibold text-sm hover:text-yellow-600 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Read More
                        <i className="ri-arrow-right-line ml-1"></i>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              <div className="text-center">
                <Link
                  to="/blog"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  View All Articles
                  <i className="ri-arrow-right-line ml-2"></i>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-article-line text-4xl text-blue-900"></i>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">Blog Posts Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                We&apos;re preparing insightful articles on international trade, education abroad, and travel tips. Stay tuned!
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
              >
                Visit Our Blog
                <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700">Find answers to common questions about our services</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-blue-50 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-lg font-bold text-blue-900 pr-4">{faq.question}</h3>
                  <i className="ri-arrow-down-s-line text-2xl text-blue-900 group-open:rotate-180 transition-transform flex-shrink-0"></i>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-700 mb-4">Still have questions?</p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
            >
              Contact Us
              <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Global Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Let us help you achieve your international goals with our expert services and global network
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
          >
            Contact Us Today
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
