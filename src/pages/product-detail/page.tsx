import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiProduct {
  id: number;
  product_name: string;
  category: string;
  description: string;
  key_features: string | null;
  specifications: string | null;
  images: string[] | null;
}

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  images: string[];
  features: string[];
  specs: string[];
}

const parseTextList = (value: string | null | undefined): string[] => {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapApiProduct = (item: ApiProduct): Product => ({
  id: item.id,
  name: item.product_name,
  category: item.category,
  description: item.description || '',
  images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
  features: parseTextList(item.key_features),
  specs: parseTextList(item.specifications),
});

export default function ProductDetail() {
  const { id } = useParams();
  const productId = Number(id);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      if (!Number.isFinite(productId) || productId <= 0) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [productRes, allRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch("/api/products"),
        ]);

        if (!productRes.ok) {
          if (productRes.status === 404) {
            setProduct(null);
            setError('Product not found');
            return;
          }
          throw new Error('Failed to fetch product details');
        }

        const productData: ApiProduct = await productRes.json();
        setProduct(mapApiProduct(productData));

        if (allRes.ok) {
          const allData: ApiProduct[] = await allRes.json();
          setAllProducts(allData.map(mapApiProduct));
        } else {
          setAllProducts([]);
        }
      } catch (fetchError) {
        console.error('Error fetching product details:', fetchError);
        setError('Unable to load product details right now.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

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

  const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    const form = e.currentTarget;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(form);
    const inquiryData = {
      product_id: product.id,
      product_name: product.name,
      // category: product.category,
      customer_name: (formData.get('customer_name') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      company: (formData.get('company') as string) || '',
      quantity: Number(formData.get('quantity') || quantity || 1),
      message: (formData.get('message') as string) || '',
    };

    try {
      const response = await fetch("/api/enquiries/product", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      setSubmitStatus('success');
      form.reset();
      setQuantity(1);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (submitError) {
      console.error('Error submitting product inquiry:', submitError);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 3);
  }, [allProducts, product]);

  const activeImage = product?.images[selectedImage] || product?.images[0] || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <WhatsAppButton />
        <div className="pt-32 pb-20 text-center text-gray-600">Loading product details...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <WhatsAppButton />
        <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">{error || 'Product not found'}</h1>
          <Link to="/products" className="inline-flex items-center text-blue-900 hover:text-yellow-600 transition-colors">
            <i className="ri-arrow-left-line mr-2"></i>
            Back to Products
          </Link>
        </div>
        <Footer />
      </div>
    );
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
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer w-full h-32 ${
                        selectedImage === index ? 'ring-4 ring-yellow-400' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4">
                <span className="px-4 py-2 bg-yellow-400 text-blue-900 text-sm font-semibold rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">{product.name}</h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">{product.description}</p>

              {product.features.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Key Features</h3>
                  <ul className="space-y-3">
                    {product.features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <i className="ri-checkbox-circle-fill text-yellow-600 text-xl mr-3 flex-shrink-0 mt-0.5"></i>
                        <span className="text-gray-700">{feature}</span>
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
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold text-center hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-blue-900 mb-6">Specifications</h2>
              <div className="space-y-4">
                {product.specs.length > 0 ? (
                  product.specs.map((spec, index) => (
                    <div key={`${spec}-${index}`} className="flex items-center py-3 border-b border-gray-200">
                      <i className="ri-checkbox-circle-fill text-green-600 mr-3"></i>
                      <span className="text-gray-700">{spec}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No specifications available.</p>
                )}
              </div>
            </div>
          </div>

          <div id="inquiry-form" className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 md:p-12 mb-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Request Product Information</h2>
              <p className="text-blue-100 text-center mb-8">Fill out the form below and our team will get back to you within 24 hours</p>

              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Full Name *</label>
                    <input type="text" name="customer_name" required className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none" placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Email Address *</label>
                    <input type="email" name="email" required className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none" placeholder="your@email.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Phone Number *</label>
                    <input type="tel" name="phone" required className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none" placeholder="+880 1XXX-XXXXXX" />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Company (Optional)</label>
                    <input type="text" name="company" className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none" placeholder="Your company name" />
                  </div>
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

                <div>
                  <label className="block text-white font-semibold mb-2">Quantity Needed</label>
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    name="message"
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-yellow-400 focus:outline-none resize-none"
                    placeholder="Tell us about your requirements, delivery location, and any specific questions..."
                  ></textarea>
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-900">
                    Inquiry submitted successfully. Our team will contact you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    Failed to submit inquiry. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
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
                      {relatedProduct.images[0] ? (
                        <img
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-yellow-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{relatedProduct.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-900">{relatedProduct.category}</span>
                        <span className="text-blue-900 font-semibold whitespace-nowrap">
                          View Details
                          <i className="ri-arrow-right-line ml-2"></i>
                        </span>
                      </div>
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

