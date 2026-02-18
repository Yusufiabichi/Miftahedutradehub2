import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateFAQSchema } from '../../utils/seo';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'What services does Miftah Edu-Trade Hub provide?',
      answer: 'We offer comprehensive services including Import/Export consultation, Product Sourcing from international markets, Education Counseling and Scholarship Guidance, Visa Processing assistance, and Trade Documentation support. Our experienced team helps businesses and individuals navigate international trade and education opportunities.',
      category: 'General'
    },
    {
      id: 2,
      question: 'How long does the import process typically take?',
      answer: 'The import timeline varies depending on the product type, origin country, and customs procedures. Generally, it takes 4-8 weeks from order placement to delivery. This includes manufacturing time, shipping, customs clearance, and local delivery. We provide detailed timelines for each specific case and keep you updated throughout the process.',
      category: 'Import/Export'
    },
    {
      id: 3,
      question: 'Do you help with scholarship applications?',
      answer: 'Yes! We provide comprehensive scholarship guidance including identifying suitable scholarships, preparing application documents, writing compelling essays, and interview preparation. Our counselors have helped hundreds of students secure scholarships to universities worldwide. We work with you from start to finish to maximize your chances of success.',
      category: 'Education'
    },
    {
      id: 4,
      question: 'What countries do you source products from?',
      answer: 'We have established networks in China, India, Turkey, Thailand, Vietnam, and several other countries. Our sourcing team can find quality suppliers for almost any product category. We conduct thorough supplier verification, quality control, and negotiate the best prices on your behalf.',
      category: 'Sourcing'
    },
    {
      id: 5,
      question: 'How much do your services cost?',
      answer: 'Our pricing varies based on the service type and complexity. We offer competitive rates and transparent pricing with no hidden fees. For Import/Export consultation, we charge based on shipment value. Education counseling packages start from affordable rates. Contact us for a detailed quote tailored to your specific needs.',
      category: 'General'
    },
    {
      id: 6,
      question: 'What is the visa approval success rate?',
      answer: 'We maintain a 98% visa approval success rate across all visa categories. Our experienced team ensures all documentation is complete and accurate, prepares you thoroughly for interviews, and follows up with embassies when needed. We handle student visas, tourist visas, business visas, and work permits.',
      category: 'Visa Processing'
    },
    {
      id: 7,
      question: 'Can you help with customs clearance?',
      answer: 'Absolutely! We provide complete customs clearance services including documentation preparation, duty calculation, customs liaison, and delivery coordination. Our team is well-versed in Bangladesh customs regulations and ensures smooth clearance of your shipments with minimal delays.',
      category: 'Import/Export'
    },
    {
      id: 8,
      question: 'Which universities do you have partnerships with?',
      answer: 'We work with over 200 universities across USA, Canada, UK, Australia, Europe, and Asia. Our partnerships include top-ranked institutions offering various programs from undergraduate to doctoral levels. We help you find the best fit based on your academic profile, budget, and career goals.',
      category: 'Education'
    },
    {
      id: 9,
      question: 'Do you provide quality control for sourced products?',
      answer: 'Yes, quality control is a crucial part of our sourcing service. We conduct pre-shipment inspections, verify product specifications, check packaging, and ensure compliance with your requirements. We can arrange third-party inspection services if needed and provide detailed quality reports.',
      category: 'Sourcing'
    },
    {
      id: 10,
      question: 'How do I get started with your services?',
      answer: 'Getting started is easy! Simply contact us through our website, phone, or visit our office. We will schedule a free consultation to understand your needs, explain our services, and provide a customized solution. You can also fill out our online inquiry form and we will get back to you within 24 hours.',
      category: 'General'
    },
    {
      id: 11,
      question: 'What documents are needed for import?',
      answer: 'Required documents typically include Commercial Invoice, Packing List, Bill of Lading/Airway Bill, Certificate of Origin, Import License (if applicable), and product-specific certificates. We provide a complete checklist based on your product category and guide you through the documentation process.',
      category: 'Import/Export'
    },
    {
      id: 12,
      question: 'Can you help with IELTS/TOEFL preparation?',
      answer: 'While we do not directly provide test preparation courses, we guide you to reputable test prep centers and provide tips for achieving required scores. We also help you understand score requirements for different universities and can recommend institutions with lower language requirements or pathway programs.',
      category: 'Education'
    },
    {
      id: 13,
      question: 'What is your minimum order quantity for sourcing?',
      answer: 'There is no strict minimum order quantity. We work with businesses of all sizes, from startups to large enterprises. However, for cost-effectiveness, we recommend orders that justify international shipping costs. We can help you determine the optimal order quantity based on your budget and market demand.',
      category: 'Sourcing'
    },
    {
      id: 14,
      question: 'How long does visa processing take?',
      answer: 'Visa processing time varies by country and visa type. Student visas typically take 4-8 weeks, tourist visas 2-4 weeks, and business visas 3-6 weeks. We expedite the process by ensuring complete documentation and proper application submission. We keep you informed of progress at every stage.',
      category: 'Visa Processing'
    },
    {
      id: 15,
      question: 'Do you offer after-sales support?',
      answer: 'Yes, we provide comprehensive after-sales support for all our services. For imports, we assist with any customs issues or delivery problems. For education services, we offer pre-departure briefings and ongoing support. For sourcing, we handle supplier communication and resolve any quality issues. Your satisfaction is our priority.',
      category: 'General'
    },
    {
      id: 16,
      question: 'Can you handle bulk shipments?',
      answer: 'Yes, we specialize in handling bulk shipments of all sizes. We have experience with container loads (FCL) and less than container loads (LCL). Our logistics team coordinates with shipping lines, freight forwarders, and customs to ensure timely and cost-effective delivery of your bulk orders.',
      category: 'Import/Export'
    },
    {
      id: 17,
      question: 'What is the application deadline for universities?',
      answer: 'Application deadlines vary by university and intake period. Most universities have 2-3 intakes per year (Fall, Spring, Summer). Deadlines are typically 6-12 months before the intake. We help you plan your application timeline, meet all deadlines, and apply to multiple universities to maximize admission chances.',
      category: 'Education'
    },
    {
      id: 18,
      question: 'Do you verify supplier credentials?',
      answer: 'Absolutely! We conduct thorough supplier verification including business license verification, factory audits, financial stability checks, and reference checks. We only work with reliable suppliers who have proven track records. This protects you from fraud and ensures you receive quality products.',
      category: 'Sourcing'
    }
  ];

  // SEO with FAQ Schema
  useSEO({
    title: 'FAQs - Frequently Asked Questions | Miftah Edu-Trade Hub Ltd',
    description: 'Find answers to common questions about our international trade, education, visa processing, and travel services. Learn about import-export procedures, scholarship applications, visa requirements, and more.',
    keywords: 'FAQ international trade, visa processing questions, education consulting FAQ, import export help, scholarship application questions Nigeria',
    canonical: '/faqs',
    schema: generateFAQSchema(faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer
    })))
  });

  const categories = ['all', 'General', 'Import/Export', 'Education', 'Sourcing', 'Visa Processing'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <Header />
      <WhatsAppButton />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-6 py-2 rounded-full text-sm font-semibold mb-6">
              <i className="ri-question-answer-line text-lg"></i>
              <span>Frequently Asked Questions</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Find answers to common questions about our services, processes, and how we can help you achieve your goals.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 text-base border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                  <i className="ri-search-line text-xl text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-y border-gray-100 sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Questions' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-blue-200 transition-all"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <i className="ri-question-line text-xl text-white"></i>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-blue-900 mb-1">
                              {faq.question}
                            </h3>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {faq.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 flex items-center justify-center">
                        <i
                          className={`ri-arrow-down-s-line text-2xl text-gray-400 transition-transform ${
                            openFAQ === faq.id ? 'rotate-180' : ''
                          }`}
                        ></i>
                      </div>
                    </button>
                    {openFAQ === faq.id && (
                      <div className="px-8 pb-6 pt-2">
                        <div className="pl-14">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-search-line text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Results Found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter to find what you are looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-customer-service-2-line text-4xl text-white"></i>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Our friendly team is here to help. Get in touch and we will get back to you as soon as possible.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
              >
                Contact Us
              </a>
              <a
                href="tel:+8801234567890"
                className="px-8 py-4 bg-blue-700/50 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-all whitespace-nowrap cursor-pointer border-2 border-white/30 flex items-center space-x-2"
              >
                <i className="ri-phone-line text-xl"></i>
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
