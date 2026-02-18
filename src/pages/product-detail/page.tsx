import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  specs: string[];
  created_at?: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      // Fetch the specific product
      const response = await fetch(`${SUPABASE_URL}/functions/v1/products-api?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setProduct(data[0]);
          
          // Fetch related products from the same category
          fetchRelatedProducts(data[0].category);
        } else {
          // Product not found
          navigate('/products');
        }
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/products-api`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const related = data
          .filter((p: Product) => p.id !== parseInt(id || '0') && p.category === category)
          .slice(0, 3);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const inquiryData = {
      product_name: product?.name,
      customer_name: formData.get('full_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message')
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/product-inquiries-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inquiryData)
      });

      const result = await response.json();

      if (response.ok && !result.error) {
        setMessage({ type: 'success', text: 'Your inquiry has been submitted successfully! We will contact you soon.' });
        form.reset();
        setQuantity(1);
        
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit inquiry. Please try again.' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#inquiry-form') {
      setTimeout(() => {
        const element = document.getElementById('inquiry-form');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <i className="ri-loader-4-line animate-spin text-6xl text-blue-900"></i>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <WhatsAppButton />

      <div className="pt-24 pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/products" className="inline-flex items-center text-blue-900 hover:text-yellow-600 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Products
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl mb-4 w-full h-[500px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                          <i class="ri-image-line text-6xl text-gray-400"></i>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="px-4 py-2 bg-yellow-400 text-blue-900 text-sm font-semibold rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">{product.name}</h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">{product.description}</p>

              {product.specs && product.specs.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Specifications</h3>
                  <ul className="space-y-3">
                    {product.specs.map((spec, index) => (
                      <li key={index} className="flex items-start">
                        <i className="ri-checkbox-circle-fill text-yellow-600 text-xl mr-3 flex-shrink-0 mt-0.5"></i>
                        <span className="text-gray-700">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <label className="text-gray-700 font-semibold">Quantity:</label>
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-subtract-line"></i>
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href="#inquiry-form"
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg text-center font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  Inquire Now
                </a>
                <Link
                  to="/contact"
                  className="px-8 py-4 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold hover:bg-blue-900 hover:text-white transition-all whitespace-nowrap cursor-pointer"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          <div id="inquiry-form" className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 md:p-12 mb-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Request Product Information</h2>
              <p className="text-blue-100 text-center mb-8">Fill out the form below and our team will get back to you within 24 hours</p>
              
              {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none"
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Product</label>
                    <input
                      type="text"
                      value={product.name}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg bg-blue-100 text-blue-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Your Message *</label>
                  <textarea
                    name="message"
                    required
                    maxLength={500}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none resize-none"
                    placeholder="Tell us about your requirements, delivery location, and any specific questions..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center">Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  >
                    <div className="relative w-full h-64 bg-gray-50 overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                                <i class="ri-image-line text-6xl text-gray-400"></i>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-yellow-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{relatedProduct.description}</p>
                      <span className="text-blue-900 font-semibold whitespace-nowrap">
                        View Details
                        <i className="ri-arrow-right-line ml-2"></i>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
