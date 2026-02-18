import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema } from '../../utils/seo';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  specs: string[];
}

export default function ProductsPage() {
  // SEO
  useSEO({
    title: 'Products - Trucks Tractors Electric Bikes Phones | Miftah Edu-Trade Hub',
    description: 'Explore our comprehensive range of quality products including Heavy Duty Trucks, Commercial Tippers, Agricultural Tractors, Electric Bikes, and Smartphones sourced from trusted manufacturers worldwide.',
    keywords: 'trucks for sale Nigeria, agricultural tractors, electric bikes, smartphones, commercial vehicles, tippers, cargo trucks, product sourcing Nigeria',
    canonical: '/products',
    schema: generateWebPageSchema(
      'Our Products - Miftah Edu-Trade Hub Ltd',
      'Quality products sourced from trusted manufacturers worldwide',
      '/products'
    )
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/products-api`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...Array.from(new Set(data.map((p: Product) => p.category)))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WhatsAppButton />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Our Products
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive range of quality products sourced from trusted manufacturers worldwide
          </p>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 1 && (
        <section className="py-8 bg-white border-b border-gray-200 sticky top-20 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-900 hover:text-blue-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!loading && filteredProducts.length > 0 && (
            <div className="mb-8">
              <p className="text-gray-600 text-center">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <i className="ri-loader-4-line animate-spin text-6xl text-blue-900"></i>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 w-full overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-blue-900 text-white text-sm font-semibold rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{product.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>

                    {product.specs && product.specs.length > 0 && (
                      <div className="space-y-2 mb-6">
                        {product.specs.slice(0, 4).map((spec, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <i className="ri-checkbox-circle-fill text-green-600"></i>
                            </div>
                            <span className="ml-2">{spec}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link
                      to={`/product/${product.id}`}
                      className="block w-full px-4 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg text-center font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
                    >
                      Inquire Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="ri-inbox-line text-6xl text-gray-400 mb-4"></i>
              <p className="text-xl text-gray-600">
                {selectedCategory === 'All' 
                  ? 'No products available at the moment' 
                  : `No products found in ${selectedCategory}`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We can source custom products based on your specific requirements
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-all whitespace-nowrap cursor-pointer inline-flex items-center"
            >
              <i className="ri-mail-line mr-2"></i>
              Contact Us
            </Link>
            <button
              onClick={() => {
                const widget = document.querySelector('#vapi-widget-floating-button') as HTMLElement;
                if (widget) widget.click();
              }}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all whitespace-nowrap cursor-pointer inline-flex items-center"
            >
              <i className="ri-customer-service-2-line mr-2"></i>
              Talk to Expert
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
