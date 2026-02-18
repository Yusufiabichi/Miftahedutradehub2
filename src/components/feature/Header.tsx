
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/services', label: 'Services' },
    { path: '/testimonials', label: 'Testimonials' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/95'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <i className="ri-global-line text-2xl text-yellow-400"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-900">Miftah Edu-Trade Hub</span>
              <span className="text-xs text-gray-600">Global Opportunities</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              About
            </Link>
            <Link
              to="/services"
              className="text-gray-700 hover:text-blue-900 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              Services
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-900 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              Products
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 hover:text-blue-900 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              Blog
            </Link>
            <Link to="/testimonials" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              Testimonials
            </Link>
            <Link to="/faqs" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              FAQs
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              Contact Us
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className={`${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl text-blue-900`}></i>
          </button>
        </div>
      </div>

      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg font-medium transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg font-medium transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/services"
            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors font-medium whitespace-nowrap cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            to="/products"
            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors font-medium whitespace-nowrap cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/blog"
            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors font-medium whitespace-nowrap cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            to="/testimonials"
            className="block px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg font-medium transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Testimonials
          </Link>
          <Link
            to="/faqs"
            className="block px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 rounded-lg font-medium transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            FAQs
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </header>
  );
}
