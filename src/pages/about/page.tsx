import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema, generateOrganizationSchema } from '../../utils/seo';

export default function About() {
  // SEO
  useSEO({
    title: 'About Us - Miftah Edu-Trade Hub Ltd | International Trade & Education Services Kano',
    description: 'Learn about Miftah Edu-Trade Hub Ltd, your trusted partner for global opportunities in trade, education, and travel. Over 15 years of experience serving clients in Kano, Nigeria with comprehensive international services.',
    keywords: 'about Miftah Edu-Trade Hub, international trade company Kano, education consulting Nigeria, company history, our team, mission vision',
    canonical: '/about',
    schema: generateWebPageSchema(
      'About Miftah Edu-Trade Hub Ltd',
      'Your trusted partner for global opportunities in trade, education, and travel',
      '/about'
    )
  });

  const values = [
    {
      icon: 'ri-shield-check-line',
      title: 'Integrity',
      description: 'We operate with complete transparency and honesty in all our dealings, building trust with every interaction.'
    },
    {
      icon: 'ri-customer-service-2-line',
      title: 'Customer Focus',
      description: 'Your success is our priority. We provide personalized solutions tailored to your unique needs and goals.'
    },
    {
      icon: 'ri-lightbulb-line',
      title: 'Innovation',
      description: 'We continuously evolve our services to meet the changing demands of global markets and technologies.'
    },
    {
      icon: 'ri-team-line',
      title: 'Excellence',
      description: 'We strive for the highest standards in service delivery, ensuring exceptional results every time.'
    }
  ];

  const team = [
    {
      name: 'Mohammad Ali',
      role: 'CEO & Founder',
      image: 'https://readdy.ai/api/search-image?query=professional%20bangladeshi%20senior%20businessman%20ceo%20wearing%20formal%20dark%20suit%20confident%20leadership%20pose%20modern%20corporate%20office%20background%20executive%20portrait%20clean%20professional%20lighting&width=400&height=500&seq=team1&orientation=portrait',
      description: 'Over 20 years of experience in international trade and business development.'
    },
    {
      name: 'Ayesha Begum',
      role: 'Director of Education Services',
      image: 'https://readdy.ai/api/search-image?query=professional%20bangladeshi%20businesswoman%20wearing%20hijab%20formal%20business%20attire%20confident%20smile%20modern%20office%20setting%20executive%20portrait%20clean%20background%20professional%20photography&width=400&height=500&seq=team2&orientation=portrait',
      description: 'Expert in international education consulting with partnerships across 30+ countries.'
    },
    {
      name: 'Rashid Khan',
      role: 'Head of Trade Operations',
      image: 'https://readdy.ai/api/search-image?query=professional%20bangladeshi%20businessman%20formal%20suit%20experienced%20manager%20modern%20corporate%20environment%20confident%20professional%20portrait%20clean%20background%20high%20quality%20photography&width=400&height=500&seq=team3&orientation=portrait',
      description: 'Specialist in import-export logistics and international supply chain management.'
    },
    {
      name: 'Nadia Rahman',
      role: 'Travel & Visa Consultant',
      image: 'https://readdy.ai/api/search-image?query=professional%20bangladeshi%20female%20consultant%20business%20formal%20attire%20friendly%20approachable%20smile%20modern%20office%20background%20professional%20portrait%20clean%20lighting&width=400&height=500&seq=team4&orientation=portrait',
      description: 'Certified travel consultant with expertise in visa processing and travel advisory.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <WhatsAppButton />

      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20corporate%20office%20building%20glass%20facade%20professional%20business%20environment%20international%20company%20headquarters%20blue%20sky%20background%20clean%20architectural%20photography&width=1920&height=600&seq=about1&orientation=landscape')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 to-blue-900/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About Us</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Your trusted partner for global opportunities in trade, education, and travel
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Our Story</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6"></div>
              <p className="text-gray-700 leading-relaxed mb-6">
                Founded with a vision to bridge global opportunities, Miftah Edu-Trade Hub Ltd has grown into a trusted name in international trade, education consulting, and travel services. Our journey began with a simple mission: to make global opportunities accessible to everyone.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Over the years, we have built strong partnerships across continents, helping thousands of clients achieve their dreams of studying abroad, expanding their businesses internationally, and traveling the world with confidence.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, we stand as a comprehensive solution provider, offering everything from import-export services to visa processing, all under one roof. Our commitment to excellence and customer satisfaction drives everything we do.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://readdy.ai/api/search-image?query=diverse%20international%20business%20team%20meeting%20modern%20conference%20room%20professionals%20collaborating%20global%20trade%20discussion%20laptops%20documents%20world%20map%20background%20professional%20corporate%20photography&width=800&height=600&seq=about2&orientation=landscape"
                alt="Our Team"
                className="rounded-xl shadow-2xl object-cover w-full h-96"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://readdy.ai/api/search-image?query=business%20vision%20mission%20concept%20professional%20corporate%20strategy%20planning%20modern%20office%20environment%20team%20collaboration%20global%20network%20connections%20clean%20professional%20photography&width=800&height=600&seq=about3&orientation=landscape"
                alt="Our Vision"
                className="rounded-xl shadow-2xl object-cover w-full h-96"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Our Mission & Vision</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6"></div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                  <i className="ri-eye-line text-yellow-500 mr-3"></i>
                  Vision
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To be the leading global service provider, connecting people and businesses to international opportunities through innovative solutions, exceptional service, and unwavering commitment to excellence.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                  <i className="ri-compass-line text-yellow-500 mr-3"></i>
                  Mission
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To empower individuals and businesses by providing comprehensive, reliable, and customer-focused services in international trade, education, travel, and financial solutions, while maintaining the highest standards of integrity and professionalism.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              The principles that guide our work and define who we are
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border-2 border-blue-100 hover:border-yellow-400 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center mb-6">
                  <i className={`${value.icon} text-3xl text-yellow-400`}></i>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Meet Our Team</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Experienced professionals dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-80 object-cover object-top"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{member.name}</h3>
                  <p className="text-yellow-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">15+</div>
              <p className="text-blue-100 text-lg">Years of Excellence</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">50+</div>
              <p className="text-blue-100 text-lg">Countries Worldwide</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">5000+</div>
              <p className="text-blue-100 text-lg">Satisfied Clients</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">98%</div>
              <p className="text-blue-100 text-lg">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
