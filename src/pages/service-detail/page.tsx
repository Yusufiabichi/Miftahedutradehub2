import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { servicesData } from '../../mocks/servicesData';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import ServiceInquiryForm from './components/ServiceInquiryForm';
import BackToTop from '../../components/BackToTop';

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'process' | 'faqs'>('overview');

  const service = servicesData.find(s => s.id === serviceId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceId]);

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <i className="ri-error-warning-line text-6xl text-gray-400 mb-6"></i>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Service Not Found</h1>
            <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
            <Link
              to="/services"
              className="inline-flex items-center px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Services
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WhatsAppButton />
      <BackToTop />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <Link
              to="/services"
              className="text-blue-200 hover:text-white transition-colors flex items-center whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              All Services
            </Link>
            <span className="text-blue-300">/</span>
            <span className="text-blue-100">{service.title}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6">
                <i className={`${service.icon} text-3xl text-blue-900`}></i>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {service.title}
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {service.shortDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#inquiry-form"
                  className="px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-all whitespace-nowrap cursor-pointer"
                >
                  Get Started Now
                </a>
                <button
                  onClick={() => document.querySelector('#vapi-widget-floating-button')?.click()}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-customer-service-2-line mr-2"></i>
                  Talk to Expert
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-blue-400/20 rounded-3xl blur-2xl"></div>
              <img
                src={service.image}
                alt={service.title}
                className="relative rounded-3xl shadow-2xl w-full h-96 object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-600 hover:text-blue-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`py-4 px-2 border-b-2 font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'process'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-600 hover:text-blue-900'
              }`}
            >
              Our Process
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-4 px-2 border-b-2 font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'faqs'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-600 hover:text-blue-900'
              }`}
            >
              FAQs
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-16">
              {/* Description */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Service</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {service.fullDescription}
                </p>
              </div>

              {/* Features & Benefits */}
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h3>
                  <ul className="space-y-4">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-check-line text-blue-900 text-sm"></i>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits</h3>
                  <ul className="space-y-4">
                    {service.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-star-fill text-yellow-600 text-sm"></i>
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Process Tab */}
          {activeTab === 'process' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {service.process.map((step, index) => (
                  <div key={index} className="relative">
                    {index < service.process.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-900 to-blue-300 -ml-4"></div>
                    )}
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                        <span className="text-2xl font-bold text-white">{step.step}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                      <p className="text-gray-600 text-center text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
              <div className="max-w-4xl mx-auto space-y-6">
                {service.faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-start">
                      <i className="ri-question-line text-blue-900 mr-3 mt-1"></i>
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed ml-9">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry-form" className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and our team will contact you within 24 hours
            </p>
          </div>
          <ServiceInquiryForm serviceName={service.title} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Immediate Assistance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our team is available to answer your questions and provide personalized guidance
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+8801234567890"
              className="px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-all whitespace-nowrap cursor-pointer inline-flex items-center"
            >
              <i className="ri-phone-line mr-2"></i>
              <a href="tel:+2348162411941">
                Call Us Now
              </a>
            </a>
            <button
              onClick={() => {
                const whatsappBtn = document.querySelector('.fixed.bottom-6.right-6') as HTMLElement;
                whatsappBtn?.click();
              }}
              className="px-8 py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all whitespace-nowrap cursor-pointer inline-flex items-center"
            >
              <i className="ri-whatsapp-line mr-2"></i>
              <a href="https://wa.me/2348162411941">
              WhatsApp Chat
              </a>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
