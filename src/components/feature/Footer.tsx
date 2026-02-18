
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/services', label: 'Services' },
    { path: '/testimonials', label: 'Testimonials' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
  ];

  const services = [
    { path: '/services/import-export', label: 'Import & Export' },
    { path: '/services/education', label: 'Global Education' },
    { path: '/services/currency-exchange', label: 'Currency Exchange' },
    { path: '/services/sourcing', label: 'Goods Sourcing' },
    { path: '/services/travel', label: 'Flights & Hotels' },
    { path: '/services/visa', label: 'Visa Processing' },
  ];

  return (
    <footer className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <i className="ri-global-line text-2xl text-blue-900"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">Miftah Edu-Trade Hub</span>
                <span className="text-xs text-blue-200">Global Opportunities</span>
              </div>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Connecting you to global opportunities in trade, education, travel, and professional services worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-all cursor-pointer">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-all cursor-pointer">
                <i className="ri-twitter-x-fill text-xl"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-all cursor-pointer">
                <i className="ri-linkedin-fill text-xl"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-all cursor-pointer">
                <i className="ri-instagram-fill text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-yellow-400">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-blue-100 hover:text-yellow-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/admin" className="text-blue-100 hover:text-yellow-400 transition-colors text-sm">
                  Manage
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-yellow-400">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.path}>
                  <Link to={service.path} className="text-blue-100 hover:text-yellow-400 transition-colors text-sm">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-yellow-400">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <i className="ri-map-pin-line text-yellow-400 text-lg mt-1"></i>
                <span className="text-blue-100 text-sm">123 Ahmadu Bello Way, Kano 700001, Nigeria</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-phone-line text-yellow-400 text-lg"></i>
                <span className="text-blue-100 text-sm">+234 803 456 7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-mail-line text-yellow-400 text-lg"></i>
                <span className="text-blue-100 text-sm">info@miftahedutrade.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-time-line text-yellow-400 text-lg"></i>
                <span className="text-blue-100 text-sm">Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-200 text-sm">
              © {currentYear} Miftah Edu-Trade Hub Ltd. All rights reserved.
            </p>
            <a 
              href="https://readdy.ai/?origin=logo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-yellow-400 text-sm transition-colors"
            >
              Powered by Readdy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
