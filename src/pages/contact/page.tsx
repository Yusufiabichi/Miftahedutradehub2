import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema } from '../../utils/seo';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export default function ContactPage() {
  // SEO
  useSEO({
    title: 'Contact Us - Get In Touch | Miftah Edu-Trade Hub Ltd Kano Nigeria',
    description: 'Contact Miftah Edu-Trade Hub Ltd for international trade, education, and travel services. Visit our office in Kano, Nigeria or reach us by phone, email, or WhatsApp. We are here to help you achieve your global goals.',
    keywords: 'contact Miftah Edu-Trade Hub, Kano office address, international trade contact, education consulting inquiry, visa processing contact Nigeria',
    canonical: '/contact',
    schema: generateWebPageSchema(
      'Contact Us - Miftah Edu-Trade Hub Ltd',
      'Get in touch with us for international trade, education, and travel services',
      '/contact'
    )
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const contactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/contact-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      const result = await response.json();
      console.log('Contact form response:', result);

      if (response.ok && !result.error) {
        setSubmitStatus('success');
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        console.error('Contact form error:', result.error || 'Unknown error');
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: 'ri-map-pin-line',
      title: 'Visit Us',
      details: ['123 Trade Center Road', 'Dhaka 1215, Bangladesh'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: 'ri-phone-line',
      title: 'Call Us',
      details: ['+880 1234-567890', '+880 1987-654321'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: 'ri-mail-line',
      title: 'Email Us',
      details: ['info@miftahedutrade.com', 'support@miftahedutrade.com'],
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: 'ri-time-line',
      title: 'Working Hours',
      details: ['Monday - Saturday: 9:00 AM - 6:00 PM', 'Sunday: Closed'],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const services = [
    'Import & Export Solutions',
    'Global Education & Scholarships',
    'Currency Exchange & Remittance',
    'Goods & Services Sourcing',
    'Flights & Hotel Bookings',
    'Visa Processing & Travel Advisory'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <WhatsAppButton />

      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get In Touch</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Have questions about our services? We're here to help you achieve your global goals. Reach out to us today!
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white border-2 border-gray-100 rounded-xl p-8 hover:border-yellow-400 hover:shadow-xl transition-all text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <i className={`${info.icon} text-3xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 leading-relaxed">
                    {detail}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Send Us a Message</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Fill out the form below and our team will get back to you within 24 hours. We're committed to providing you with the best service and support for all your international needs.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                      placeholder="+234 803 456 7890"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
                    placeholder="Tell us more about your inquiry..."
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum 500 characters</p>
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                    <i className="ri-checkbox-circle-fill text-green-600 text-xl"></i>
                    <div>
                      <h4 className="font-semibold text-green-900">Message Sent Successfully!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <i className="ri-error-warning-fill text-red-600 text-xl"></i>
                    <div>
                      <h4 className="font-semibold text-red-900">Submission Failed</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Something went wrong. Please try again or contact us directly.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill mr-2"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Find Us Here</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Visit our office to discuss your requirements in person. Our team is ready to assist you with all your international trade, education, and travel needs.
              </p>

              <div className="rounded-xl overflow-hidden shadow-xl mb-8 h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9084346729845!2d90.39225631498145!3d23.750891084588697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka%2C%20Bangladesh!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Miftah Edu-Trade Hub Location"
                ></iframe>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Connect With Us</h3>
                <p className="text-gray-700 mb-6">
                  Follow us on social media for the latest updates, tips, and insights on international trade, education opportunities, and travel information.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                    aria-label="Facebook"
                  >
                    <i className="ri-facebook-fill text-xl"></i>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors cursor-pointer"
                    aria-label="Twitter"
                  >
                    <i className="ri-twitter-fill text-xl"></i>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer"
                    aria-label="LinkedIn"
                  >
                    <i className="ri-linkedin-fill text-xl"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all cursor-pointer"
                    aria-label="Instagram"
                  >
                    <i className="ri-instagram-fill text-xl"></i>
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
                    aria-label="YouTube"
                  >
                    <i className="ri-youtube-fill text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Need Immediate Assistance?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our customer support team is available to help you with urgent inquiries
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+8801234567890"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-phone-line mr-2"></i>
              Call Now
            </a>
            <a
              href="https://wa.me/8801234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-green-600 transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-whatsapp-line mr-2"></i>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
