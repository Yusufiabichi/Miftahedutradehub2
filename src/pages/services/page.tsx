import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema } from '../../utils/seo';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  image: string;
  features: string[];
  category: string;
}

export default function ServicesPage() {
  // SEO
  useSEO({
    title: 'Our Services - Import Export Education Visa Travel | Miftah Edu-Trade Hub Kano',
    description: 'Comprehensive international services including Import & Export solutions, Global Education & Scholarships, Currency Exchange, Goods Sourcing, Flight & Hotel Bookings, and Visa Processing in Kano, Nigeria.',
    keywords: 'import export services Nigeria, education consulting Kano, visa processing, currency exchange, international trade services, study abroad assistance, travel booking Nigeria',
    canonical: '/services',
    schema: generateWebPageSchema(
      'Our Services - Miftah Edu-Trade Hub Ltd',
      'Comprehensive solutions for all your international business, education, and travel needs',
      '/services'
    )
  });

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/services-api`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: 'ri-shield-check-line',
      title: 'Trusted & Reliable',
      description: 'Years of experience with proven track record'
    },
    {
      icon: 'ri-customer-service-2-line',
      title: '24/7 Support',
      description: 'Round-the-clock assistance for all your needs'
    },
    {
      icon: 'ri-global-line',
      title: 'Global Network',
      description: 'Partnerships across 50+ countries worldwide'
    },
    {
      icon: 'ri-price-tag-3-line',
      title: 'Best Pricing',
      description: 'Competitive rates with transparent pricing'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WhatsAppButton />

      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=professional%20business%20services%20concept%20with%20global%20network%20connections%20modern%20office%20environment%20international%20trade%20education%20travel%20icons%20floating%20in%20space%20blue%20and%20gold%20color%20scheme%20clean%20minimalist%20design%20high%20quality%20commercial%20photography&width=1920&height=600&seq=serviceshero&orientation=landscape')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/90 to-blue-950/95"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive solutions for all your international business, education, and travel needs
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <i className="ri-loader-4-line animate-spin text-6xl text-blue-900"></i>
            </div>
          ) : services.length > 0 ? (
            services.map((service, index) => (
              <div
                key={service.id}
                className={`mb-20 last:mb-0 ${
                  index % 2 === 0 ? '' : 'lg:flex-row-reverse'
                } flex flex-col lg:flex-row gap-12 items-center`}
              >
                <div className="lg:w-1/2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-yellow-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="relative rounded-3xl shadow-2xl w-full h-80 object-cover object-top"
                    />
                  </div>
                </div>

                <div className="lg:w-1/2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
                    <i className={`${service.icon} text-3xl text-yellow-400`}></i>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-check-line text-blue-900 text-sm"></i>
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    to={`/service-detail/${service.id}`}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
                  >
                    Get Started
                    <i className="ri-arrow-right-line ml-2"></i>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <i className="ri-service-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-500">No services available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Our Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-6">
                  <i className={`${benefit.icon} text-4xl text-yellow-400`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-blue-100">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Contact us today to discuss how we can help you achieve your international goals
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
          >
            Contact Us Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
