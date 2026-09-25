import { Link } from 'react-router-dom';
import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema } from '../../utils/seo';
import BackToTop from '../../components/BackToTop';

export default function ServicesPage() {
  useSEO({
    title: 'Our Services - Import Export Education Visa Travel | Miftah Edu-Trade Hub Kano',
    description:
      'Comprehensive international services including Import & Export solutions, Global Education & Scholarships, Currency Exchange, Goods Sourcing, Flight & Hotel Bookings, and Visa Processing in Kano, Nigeria.',
    keywords:
      'import export services Nigeria, education consulting Kano, visa processing, currency exchange, international trade services, study abroad assistance, travel booking Nigeria',
    canonical: '/services',
    schema: generateWebPageSchema(
      'Our Services - Miftah Edu-Trade Hub Ltd',
      'Comprehensive solutions for all your international business, education, and travel needs',
      '/services'
    ),
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'trade' | 'education' | 'finance' | 'travel'>('all');

  const services = [
    {
      id: 'import-export',
      title: 'Import & Export Solutions',
      description:
        'Comprehensive trade solutions connecting global markets with seamless import and export services.',
      icon: 'ri-ship-line',
      category: 'trade',
      tagline: 'Global trade made simple',
      image:
        'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Complete documentation and customs clearance',
        'Global logistics coordination',
        'Compliance and regulatory support',
        'Quality inspection services',
      ],
    },
    {
      id: 'education',
      title: 'Global Education & Scholarships',
      description:
        'Expert guidance for international education opportunities and scholarship applications worldwide.',
      icon: 'ri-graduation-cap-line',
      category: 'education',
      tagline: 'Study anywhere, succeed everywhere',
      image:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      features: [
        'University selection and application support',
        'Scholarship search and application assistance',
        'Document preparation and review',
        'Visa application guidance',
      ],
    },
    {
      id: 'currency-exchange',
      title: 'Currency Exchange & Remittance',
      description:
        'Secure and competitive currency exchange with fast international money transfer services.',
      icon: 'ri-exchange-dollar-line',
      category: 'finance',
      tagline: 'Fast, secure, transparent rates',
      image:
        'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Competitive exchange rates',
        'Low transaction fees',
        'Multiple transfer methods',
        'Real-time rate updates',
      ],
    },
    {
      id: 'sourcing',
      title: 'Goods & Services Sourcing',
      description:
        'Professional sourcing services connecting you with quality suppliers and manufacturers globally.',
      icon: 'ri-shopping-bag-line',
      category: 'trade',
      tagline: 'Right suppliers, right price',
      image:
        'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Supplier identification and verification',
        'Quality inspection and testing',
        'Price negotiation support',
        'Sample procurement',
      ],
    },
    {
      id: 'travel',
      title: 'Flights & Hotel Bookings',
      description:
        'Convenient travel booking services for flights, hotels, and complete travel packages worldwide.',
      icon: 'ri-flight-takeoff-line',
      category: 'travel',
      tagline: 'Travel with confidence',
      image:
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Flight booking for all airlines',
        'Hotel reservations worldwide',
        'Travel package customization',
        'Visa assistance',
      ],
    },
    {
      id: 'visa',
      title: 'Visa Processing & Travel Advisory',
      description:
        'Expert visa processing assistance and comprehensive travel advisory for hassle-free international travel.',
      icon: 'ri-passport-line',
      category: 'travel',
      tagline: 'Your journey starts here',
      image:
        'https://images.unsplash.com/photo-1544098485-2a2ed6da40ba?auto=format&fit=crop&w=1200&q=80',
      features: [
        'Tourist visa processing',
        'Business visa assistance',
        'Student visa support',
        'Work permit applications',
      ],
    },
  ];

  const filters = [
    { key: 'all', label: 'All Services', icon: 'ri-apps-2-line' },
    { key: 'trade', label: 'Trade & Sourcing', icon: 'ri-ship-line' },
    { key: 'education', label: 'Education', icon: 'ri-graduation-cap-line' },
    { key: 'finance', label: 'Finance', icon: 'ri-exchange-dollar-line' },
    { key: 'travel', label: 'Travel & Visa', icon: 'ri-flight-takeoff-line' },
  ] as const;

  const filteredServices =
    activeFilter === 'all' ? services : services.filter((s) => s.category === activeFilter);

  const benefits = [
    {
      icon: 'ri-shield-check-line',
      title: 'Trusted & Reliable',
      description: 'Years of experience with a proven track record across 500+ clients.',
    },
    {
      icon: 'ri-customer-service-2-line',
      title: '24/7 Support',
      description: 'Round-the-clock assistance by real people — not bots.',
    },
    {
      icon: 'ri-global-line',
      title: 'Global Network',
      description: 'Verified partnerships across 50+ countries worldwide.',
    },
    {
      icon: 'ri-price-tag-3-line',
      title: 'Transparent Pricing',
      description: 'Competitive rates with no hidden fees, ever.',
    },
  ];

  const processSteps = [
    {
      icon: 'ri-chat-3-line',
      step: '01',
      title: 'Free Consultation',
      description: 'Share your goals. We listen and recommend the right service path.',
    },
    {
      icon: 'ri-file-list-3-line',
      step: '02',
      title: 'Custom Plan',
      description: 'Get a clear quote, timeline, and requirements upfront.',
    },
    {
      icon: 'ri-settings-5-line',
      step: '03',
      title: 'We Execute',
      description: 'Our specialists handle documentation, logistics, and follow-ups.',
    },
    {
      icon: 'ri-checkbox-circle-line',
      step: '04',
      title: 'Delivery & Support',
      description: 'You get results — plus ongoing support after completion.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WhatsAppButton />
      <BackToTop />

      {/* Hero */}
      <section className="relative h-[28rem] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=professional%20business%20services%20concept%20with%20global%20network%20connections%20modern%20office%20environment%20international%20trade%20education%20travel%20icons%20floating%20in%20space%20blue%20and%20gold%20color%20scheme%20clean%20minimalist%20design%20high%20quality%20commercial%20photography&width=1920&height=600&seq=serviceshero&orientation=landscape')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/90 to-blue-950/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-blue-200">
              <li>
                <Link to="/" className="hover:text-yellow-400 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <i className="ri-arrow-right-s-line"></i>
              </li>
              <li className="text-yellow-400 font-medium">Services</li>
            </ol>
          </nav>

          <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-300 text-xs font-semibold rounded-full mb-6 tracking-wide uppercase">
            What We Offer
          </span>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Services Built for Global Success
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            From international trade to study abroad, currency exchange to visa processing — we
            handle the complexity so you can focus on the outcome.
          </p>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'ri-verified-badge-line', label: 'CAC Registered Business' },
              { icon: 'ri-secure-payment-line', label: 'Secure & Insured' },
              { icon: 'ri-time-line', label: 'Fast Turnaround' },
              { icon: 'ri-customer-service-2-line', label: 'Dedicated Account Manager' },
            ].map((signal) => (
              <div
                key={signal.label}
                className="flex items-center justify-center gap-2 text-blue-900"
              >
                <i className={`${signal.icon} text-xl text-yellow-500`} aria-hidden="true"></i>
                <span className="text-sm font-medium">{signal.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Nav + Services List */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Browse
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">
              Find the Right Service for You
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  aria-pressed={activeFilter === filter.key}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === filter.key
                      ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg'
                      : 'bg-white text-blue-900 border-2 border-gray-200 hover:border-blue-900 hover:shadow-md'
                  }`}
                >
                  <i className={filter.icon} aria-hidden="true"></i>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-24">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`flex flex-col lg:flex-row gap-12 items-center ${
                  index % 2 === 0 ? '' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="lg:w-1/2 w-full">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-blue-900/20 to-yellow-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                      <img
                        src={service.image}
                        alt={service.title}
                        loading="lazy"
                        className="w-full h-80 object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-3 py-1.5 bg-yellow-400 text-blue-900 text-xs font-semibold rounded-full shadow-lg">
                          {service.tagline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/2 w-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <i className={`${service.icon} text-3xl text-yellow-400`} aria-hidden="true"></i>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mb-8">
                    <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4">
                      What's included
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i
                              className="ri-check-line text-blue-900 text-sm"
                              aria-hidden="true"
                            ></i>
                          </div>
                          <span className="text-gray-700 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={`/services/${service.id}`}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
                    >
                      Get Started
                      <i className="ri-arrow-right-line ml-2" aria-hidden="true"></i>
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center px-8 py-4 bg-white text-blue-900 border-2 border-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-all whitespace-nowrap cursor-pointer"
                    >
                      Ask a Question
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
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
              From first conversation to final delivery — you always know what's happening next.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 h-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`${step.icon} text-2xl text-yellow-400`} aria-hidden="true"></i>
                  </div>
                  <span className="text-4xl font-bold text-gray-200">{step.step}</span>
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-300 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Miftah Advantage
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Service quality that speaks for itself — backed by real numbers and real people.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-6">
                  <i className={`${benefit.icon} text-4xl text-yellow-400`} aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10">
            {[
              { value: '15+', label: 'Years Experience' },
              { value: '50+', label: 'Countries Served' },
              { value: '5000+', label: 'Happy Clients' },
              { value: '98%', label: 'Success Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                  {stat.value}
                </div>
                <p className="text-blue-100 text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-white text-blue-800 text-xs font-semibold rounded-full mb-6 tracking-wide uppercase">
            Let's Get Started
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Ready to Move Forward?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Book a free, no-obligation consultation. We will assess your needs and show you exactly
            how we can help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
            >
              Contact Us Now
            </Link>
            <Link
              to="/products"
              className="inline-block px-8 py-4 bg-white text-blue-900 border-2 border-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-100 transition-all whitespace-nowrap cursor-pointer"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}