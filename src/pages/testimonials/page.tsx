import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema } from '../../utils/seo';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  text: string;
  rating: number;
  image: string;
  created_at: string;
  service: string;
}

export default function TestimonialsPage() {
  // SEO
  useSEO({
    title: 'Client Testimonials & Reviews - Miftah Edu-Trade Hub Ltd Success Stories',
    description: 'Read real success stories from our satisfied clients. Discover how Miftah Edu-Trade Hub Ltd has helped businesses and individuals achieve their international trade, education, and travel goals with 98% success rate.',
    keywords: 'client testimonials Nigeria, customer reviews Kano, success stories, import export reviews, education consulting testimonials, visa processing feedback',
    canonical: '/testimonials',
    schema: generateWebPageSchema(
      'Client Testimonials - Miftah Edu-Trade Hub Ltd',
      'Real experiences from clients who have trusted us with their business, education, and travel needs',
      '/testimonials'
    )
  });

  const [filter, setFilter] = useState('all');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/testimonials-api`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const services = ['all', ...Array.from(new Set(testimonials.map(t => t.service)))];

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.service === filter);

  const stats = [
    { number: '500+', label: 'Happy Clients', icon: 'ri-user-smile-line' },
    { number: '98%', label: 'Success Rate', icon: 'ri-trophy-line' },
    { number: '15+', label: 'Years Experience', icon: 'ri-time-line' },
    { number: '4.9/5', label: 'Average Rating', icon: 'ri-star-line' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <Header />
      <WhatsAppButton />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-pink-600/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-6 py-2 rounded-full text-sm font-semibold mb-6">
              <i className="ri-chat-quote-line text-lg"></i>
              <span>Client Success Stories</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
              What Our Clients Say
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Real experiences from real people who have trusted us with their business, education, and travel needs. Read their success stories and see why we are the preferred choice.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <i className={`${stat.icon} text-3xl text-white`}></i>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-purple-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      {services.length > 1 && (
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => setFilter(service)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    filter === service
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {service === 'all' ? 'All Services' : service}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <i className="ri-loader-4-line animate-spin text-6xl text-purple-600"></i>
            </div>
          ) : filteredTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-4 border-purple-100">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-purple-600 font-semibold">{testimonial.company}</p>
                    </div>
                  </div>

                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 flex items-center justify-center">
                        <i
                          className={`${
                            i < testimonial.rating
                              ? 'ri-star-fill text-yellow-400'
                              : 'ri-star-line text-gray-300'
                          } text-lg`}
                        ></i>
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4 italic">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {new Date(testimonial.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {testimonial.service}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <i className="ri-chat-quote-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-500">No testimonials available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Join hundreds of satisfied clients who have achieved their goals with our expert guidance and support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
              >
                Get Started Today
              </a>
              <a
                href="/services"
                className="px-8 py-4 bg-purple-700/50 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-all whitespace-nowrap cursor-pointer border-2 border-white/30"
              >
                View Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
