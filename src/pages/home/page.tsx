import { Link } from 'react-router-dom';
import { useState, useEffect, type FormEvent } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import GallerySection from '../../components/feature/GallerySection';
import { useSEO, generateOrganizationSchema, generateWebPageSchema } from '../../utils/seo';
import BackToTop from '../../components/BackToTop';
import HeroSection from '../../components/feature/HeroSection';

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

export default function Home() {
  useSEO({
    title: 'Miftah Edu-Trade - Import Export Travel Nigeria',
    description:
      'Miftah Edu-Trade Hub Ltd offers comprehensive international trade, global education consulting, visa processing, currency exchange, and travel services in Nigeria. Your trusted partner for import-export solutions, study abroad programs, and worldwide business opportunities in Nigeria.',
    keywords:
      'import export Nigeria, Nigeria trade services, study abroad Nigeria, visa processing Kano, currency exchange, international trade Nigeria, education consulting, travel services Kano',
    canonical: '/',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        generateWebPageSchema(
          'Miftah Edu-Trade - Import Export Travel Nigeria',
          'Comprehensive international trade, global education consulting, visa processing, currency exchange, and travel services in Nigeria',
          '/'
        ),
      ],
    },
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  useEffect(() => {
    fetchData();
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (!response.ok) throw new Error('Failed to fetch blogs');

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

      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');

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

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newsletterEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter a valid email address.');
      return;
    }
    setNewsletterStatus('loading');
    try {
      // Replace with your real endpoint when available
      await new Promise((res) => setTimeout(res, 600));
      setNewsletterStatus('success');
      setNewsletterMessage('You are subscribed. Watch your inbox for updates!');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage('Something went wrong. Please try again.');
    }
  };

  const services = [
    {
      icon: 'ri-ship-line',
      title: 'Import & Export Solutions',
      description:
        'Seamless international trade services connecting businesses across borders with reliable logistics and customs support.',
      path: '/services/import-export',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: 'ri-graduation-cap-line',
      title: 'Global Education & Scholarships',
      description:
        'Expert guidance for studying abroad, scholarship applications, and university admissions worldwide.',
      path: '/services/education',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: 'ri-exchange-dollar-line',
      title: 'Currency Exchange & Remittance',
      description:
        'Competitive rates for currency exchange and secure international money transfer services.',
      path: '/services/currency-exchange',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: 'ri-shopping-bag-line',
      title: 'Goods & Services Sourcing',
      description:
        'Professional sourcing solutions for quality products and services from global markets.',
      path: '/services/sourcing',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: 'ri-flight-takeoff-line',
      title: 'Flights & Hotel Bookings',
      description:
        'Best deals on international flights and hotel reservations for business and leisure travel.',
      path: '/services/travel',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: 'ri-passport-line',
      title: 'Visa Processing & Travel Advisory',
      description:
        'Complete visa assistance and travel consultation for hassle-free international journeys.',
      path: '/services/visa',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const features = [
    {
      icon: 'ri-shield-check-line',
      title: 'Trusted & Reliable',
      description:
        'Years of experience delivering exceptional service with complete transparency and integrity.',
    },
    {
      icon: 'ri-global-line',
      title: 'Global Network',
      description:
        'Extensive partnerships worldwide ensuring seamless service delivery across continents.',
    },
    {
      icon: 'ri-customer-service-line',
      title: 'Expert Support',
      description:
        'Dedicated team of professionals providing personalized assistance every step of the way.',
    },
    {
      icon: 'ri-price-tag-3-line',
      title: 'Competitive Pricing',
      description: 'Best value services with transparent pricing and no hidden charges.',
    },
  ];

  const processSteps = [
    {
      icon: 'ri-chat-3-line',
      step: '01',
      title: 'Free Consultation',
      description:
        'Talk to our experts about your goals. We listen, assess, and recommend the best path forward — no obligation.',
    },
    {
      icon: 'ri-file-list-3-line',
      step: '02',
      title: 'Tailored Plan',
      description:
        'We design a clear, actionable plan with timelines, costs, and requirements so you always know what to expect.',
    },
    {
      icon: 'ri-settings-5-line',
      step: '03',
      title: 'We Handle the Details',
      description:
        'Documentation, logistics, applications, and follow-ups — our team manages the process end to end.',
    },
    {
      icon: 'ri-checkbox-circle-line',
      step: '04',
      title: 'Delivery & Support',
      description:
        'You get results plus ongoing support. We stay with you long after the paperwork is done.',
    },
  ];

  const trustSignals = [
    { icon: 'ri-verified-badge-line', label: 'CAC Registered' },
    { icon: 'ri-secure-payment-line', label: 'Secure Transactions' },
    { icon: 'ri-time-line', label: 'Fast Turnaround' },
    { icon: 'ri-customer-service-2-line', label: '24/7 Support' },
  ];

  const testimonials = [
    {
      name: 'Ismail Yunus',
      role: 'Business Owner',
      text: 'Miftah Edu-Trade Hub made our import process incredibly smooth. Their expertise in international trade is unmatched.',
      rating: 5,
    },
    {
      name: 'Fatima Sulaiman',
      role: 'Student',
      text: 'Thanks to their scholarship guidance, I am now studying at my dream university in Canada. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Abdulkarim Hassan',
      role: 'Entrepreneur',
      text: 'Their sourcing services helped us find quality suppliers at competitive prices. Excellent service and support.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'What services does Miftah Edu-Trade Hub provide?',
      answer:
        'We offer comprehensive international services including Import & Export solutions, Global Education & Scholarship guidance, Currency Exchange & Remittance, Goods & Services Sourcing, Flight & Hotel Bookings, and Visa Processing & Travel Advisory.',
    },
    {
      question: 'How can I apply for scholarships through your service?',
      answer:
        'Our education consultants will guide you through the entire scholarship application process, from identifying suitable opportunities to preparing application materials and submitting them to universities worldwide. Contact us to schedule a consultation.',
    },
    {
      question: 'What countries do you provide visa processing services for?',
      answer:
        'We provide visa processing assistance for over 50 countries including USA, Canada, UK, Australia, European nations, and many more. Our team stays updated with the latest visa requirements and procedures for each country.',
    },
    {
      question: 'How competitive are your currency exchange rates?',
      answer:
        'We offer highly competitive exchange rates with transparent pricing and no hidden fees. Our rates are updated in real-time to ensure you get the best value for your money transfers and currency exchanges.',
    },
    {
      question: 'Do you provide customs clearance for import/export?',
      answer:
        'Yes, we provide complete customs clearance services including documentation, compliance checking, duty calculation, and coordination with customs authorities to ensure smooth clearance of your shipments.',
    },
    {
      question: 'What is your customer support availability?',
      answer:
        'Our customer support team is available Monday to Saturday from 9:00 AM to 6:00 PM. For urgent matters, you can reach us through our WhatsApp support or email, and we will respond as quickly as possible.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <WhatsAppButton />
      <BackToTop />

      <HeroSection />

      {/* Trust Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="flex items-center justify-center gap-2 text-blue-900">
                <i className={`${signal.icon} text-xl text-yellow-500`} aria-hidden="true"></i>
                <span className="text-sm font-medium">{signal.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
                Who We Are
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6 leading-tight">
                Your Trusted Partner for Global Opportunities
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Miftah Edu-Trade Hub Ltd is a leading provider of comprehensive international
                trade, education, and travel services. With years of experience and a global
                network of partners, we help individuals and businesses achieve their
                international goals with confidence and ease.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                From sourcing products across borders to securing scholarships at top
                universities, we deliver results with transparency, integrity, and genuine care
                for every client we serve.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                  Learn More About Us
                  <i className="ri-arrow-right-line ml-2" aria-hidden="true"></i>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                >
                  Talk to an Expert
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '5+', label: 'Years of Experience', icon: 'ri-award-line' },
                { value: '5+', label: 'Countries Served', icon: 'ri-earth-line' },
                { value: '500+', label: 'Happy Clients', icon: 'ri-emotion-happy-line' },
                { value: '98%', label: 'Success Rate', icon: 'ri-line-chart-line' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
                    <i className={`${stat.icon} text-2xl text-blue-900`} aria-hidden="true"></i>
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border border-transparent hover:border-yellow-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center mb-6">
                  <i className={`${feature.icon} text-3xl text-yellow-400`} aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white" data-product-shop>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              What We Do
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Comprehensive solutions for all your international business, education, and travel
              needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.title}
                to={service.path}
                className="group bg-white border-2 shadow-xl border-gray-100 rounded-xl p-8 hover:border-yellow-400 hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <i className={`${service.icon} text-3xl text-white`} aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <span className="inline-flex items-center text-blue-900 font-semibold group-hover:text-yellow-600 transition-colors whitespace-nowrap">
                  Learn More
                  <i
                    className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  ></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Simple, Transparent Process
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Four clear steps from your first question to a successful outcome
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {processSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className={`${step.icon} text-2xl text-yellow-400`} aria-hidden="true"></i>
                    </div>
                    <span className="text-4xl font-bold text-gray-200">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              Start Your Free Consultation
              <i className="ri-arrow-right-line ml-2" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white" data-product-shop>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Shop
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Featured Products
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Quality products sourced from trusted manufacturers worldwide
            </p>
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
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
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {!loading && productsError && (
              <div className="col-span-full text-center text-red-600 py-6">{productsError}</div>
            )}
            {!loading && !productsError && filteredProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-600 py-6">
                No products available.
              </div>
            )}
            {filteredProducts.slice(0, 8).map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative w-full h-56 bg-gray-50 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-400 text-blue-900 text-xs font-semibold rounded-full shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2 flex-grow">
                    {product.description}
                  </p>
                  {product.specs.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {product.specs.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-block text-xs bg-blue-50 text-blue-900 px-2 py-1 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
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

          {filteredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all whitespace-nowrap cursor-pointer inline-block text-center"
              >
                View All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      <GallerySection />

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-300 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Results You Can Count On
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Numbers that reflect our commitment to every client, every time
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '15+', label: 'Years Experience' },
              { value: '50+', label: 'Countries Served' },
              { value: '5000+', label: 'Happy Clients' },
              { value: '98%', label: 'Success Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl font-bold text-yellow-400 mb-2">{stat.value}</div>
                <p className="text-blue-100 text-base md:text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-white text-blue-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
                Testimonials
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
                Loved by Clients Worldwide
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-700">
                Real stories from people and businesses we have helped
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 flex flex-col"
                >
                  <i
                    className="ri-double-quotes-l text-4xl text-yellow-400 mb-4"
                    aria-hidden="true"
                  ></i>
                  <p className="text-gray-700 leading-relaxed italic mb-6 flex-grow">
                    {testimonial.text}
                  </p>
                  <div className="flex mb-6" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i
                        key={i}
                        className="ri-star-fill text-yellow-400"
                        aria-hidden="true"
                      ></i>
                    ))}
                  </div>
                  <div className="flex items-center pt-4 border-t border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Insights
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Latest News & Insights
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700">
              Stay updated with the latest trends and tips in international trade, education, and
              travel
            </p>
          </div>

          {blogPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {blogPosts.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group border border-gray-100 hover:-translate-y-1 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-50">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="ri-article-line text-4xl" aria-hidden="true"></i>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-yellow-400 text-blue-900 text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <i className="ri-calendar-line mr-1" aria-hidden="true"></i>
                        <span>
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center text-blue-900 font-semibold text-sm group-hover:text-yellow-600 transition-colors whitespace-nowrap">
                        Read More
                        <i
                          className="ri-arrow-right-line ml-1 group-hover:translate-x-1 transition-transform"
                          aria-hidden="true"
                        ></i>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Link
                  to="/blog"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  View All Articles
                  <i className="ri-arrow-right-line ml-2" aria-hidden="true"></i>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-article-line text-4xl text-blue-900" aria-hidden="true"></i>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">Blog Posts Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                We are preparing insightful articles on international trade, education abroad, and
                travel tips. Stay tuned!
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
              >
                Visit Our Blog
                <i className="ri-arrow-right-line ml-2" aria-hidden="true"></i>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
                Stay Ahead with Expert Insights
              </h3>
              <p className="text-blue-900/80 leading-relaxed">
                Get monthly tips on international trade, scholarships, visa updates, and travel
                deals straight to your inbox. No spam, ever.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus !== 'idle') {
                      setNewsletterStatus('idle');
                      setNewsletterMessage('');
                    }
                  }}
                  placeholder="Your email address"
                  disabled={newsletterStatus === 'loading'}
                  required
                  className="flex-1 px-5 py-3 rounded-lg bg-white border-2 border-transparent focus:border-blue-900 focus:outline-none text-blue-900 placeholder-blue-900/40 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {newsletterMessage && (
                <p
                  role="status"
                  className={`mt-3 text-sm font-medium ${
                    newsletterStatus === 'success' ? 'text-blue-900' : 'text-red-800'
                  }`}
                >
                  {newsletterMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-white text-blue-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Support
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700">
              Find answers to common questions about our services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base md:text-lg font-bold text-blue-900 pr-4">
                    {faq.question}
                  </h3>
                  <i
                    className="ri-arrow-down-s-line text-2xl text-blue-900 group-open:rotate-180 transition-transform flex-shrink-0"
                    aria-hidden="true"
                  ></i>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center bg-white rounded-2xl p-8 shadow-sm">
            <p className="text-lg font-semibold text-blue-900 mb-2">Still have questions?</p>
            <p className="text-gray-600 mb-6">
              Our team is ready to help. Reach out and we will respond within one business day.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
              >
                Contact Us
                <i className="ri-arrow-right-line ml-2" aria-hidden="true"></i>
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-all whitespace-nowrap cursor-pointer"
              >
                View Full FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Global Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let us help you achieve your international goals with our expert services and global
            network
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
            >
              Contact Us Today
            </Link>
            <Link
              to="/services"
              className="inline-block px-8 py-4 bg-white/10 text-white border-2 border-white/40 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all whitespace-nowrap cursor-pointer"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}