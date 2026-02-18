import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema } from '../../utils/seo';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  author_image: string;
  created_at: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // SEO
  useSEO({
    title: 'Blog - International Trade Education Travel Tips | Miftah Edu-Trade Hub',
    description: 'Stay updated with expert advice, industry trends, and practical tips for international trade, education, and travel. Read articles about scholarships, visa applications, import-export regulations, and more.',
    keywords: 'international trade blog, education abroad tips, visa application guide, scholarship opportunities, import export articles, travel advice Nigeria',
    canonical: '/blog',
    ogType: 'blog',
    schema: generateWebPageSchema(
      'Blog - News & Insights',
      'Expert advice, industry trends, and practical tips for international trade, education, and travel',
      '/blog'
    )
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/blogs-api`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://readdy.ai/api/form/d5mfe8f72m0gvhnvdmdg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (response.ok) {
        setSubmitStatus('success');
        form.reset();
        setTimeout(() => {
          setShowNewsletter(false);
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <Header />
        <WhatsAppButton />

        <section className="relative py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">News &amp; Insights</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Stay informed with expert advice, industry trends, and practical tips for international trade, education, and travel
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-blue-200 focus:outline-none focus:border-yellow-400 transition-all text-base"
                />
                <i className="ri-search-line absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-blue-200"></i>
              </div>
            </div>
          </div>
        </section>

        {categories.length > 1 && (
          <section className="py-12 bg-white sticky top-0 z-40 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-20">
                <i className="ri-loader-4-line animate-spin text-6xl text-blue-900"></i>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <i className="ri-file-search-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-xl text-gray-500">No articles found matching your search.</p>
              </div>
            ) : (
              <>
                {featuredPost && (
                  <div className="mb-16">
                    <h2 className="text-3xl font-bold text-blue-900 mb-8">Featured Article</h2>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all group">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        <div className="relative h-96 lg:h-auto overflow-hidden">
                          <img
                            src={featuredPost.image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-6 left-6">
                            <span className="px-4 py-2 bg-yellow-400 text-blue-900 text-sm font-bold rounded-full">
                              Featured
                            </span>
                          </div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-900 text-sm font-semibold rounded-full">
                              {featuredPost.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <h3 className="text-3xl font-bold text-blue-900 mb-4 group-hover:text-yellow-600 transition-colors">
                            {featuredPost.title}
                          </h3>
                          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                            {featuredPost.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={featuredPost.author_image}
                                alt={featuredPost.author}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-semibold text-blue-900">{featuredPost.author}</p>
                              </div>
                            </div>
                            <Link
                              to={`/blog/${featuredPost.id}`}
                              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
                            >
                              Read Article
                              <i className="ri-arrow-right-line ml-2"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-blue-900">
                    {selectedCategory === 'All' ? 'All Articles' : `${selectedCategory} Articles`}
                    <span className="text-gray-500 text-xl ml-3">({filteredPosts.length})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-yellow-400 text-blue-900 text-sm font-semibold rounded-full">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <i className="ri-calendar-line mr-2"></i>
                          <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-yellow-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.author_image}
                              alt={post.author}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm font-semibold text-gray-700">{post.author}</span>
                          </div>
                          <Link
                            to={`/blog/${post.id}`}
                            className="inline-flex items-center text-blue-900 font-semibold hover:text-yellow-600 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Read
                            <i className="ri-arrow-right-line ml-1"></i>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-mail-line text-3xl text-blue-900"></i>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-xl text-blue-100 mb-8">Subscribe to our newsletter for the latest stonework tips, design inspiration, and exclusive offers delivered to your inbox.</p>
            <button 
              onClick={() => setShowNewsletter(true)}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
            >
              Subscribe
            </button>
          </div>
        </section>

        <Footer />
      </div>

      {/* Newsletter Modal */}
      {showNewsletter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button 
              onClick={() => {
                setShowNewsletter(false);
                setSubmitStatus('idle');
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-mail-line text-3xl text-blue-900"></i>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-gray-600 text-center mb-6">Get the latest updates, tips, and exclusive offers delivered to your inbox.</p>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <i className="ri-checkbox-circle-fill text-green-500 text-xl"></i>
                <p className="text-green-700 font-medium">Successfully subscribed! Thank you.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <i className="ri-error-warning-fill text-red-500 text-xl"></i>
                <p className="text-red-700 font-medium">Subscription failed. Please try again.</p>
              </div>
            )}

            <form 
              id="newsletter-form"
              data-readdy-form
              onSubmit={handleNewsletterSubmit}
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="interests"
                    value="Design Tips"
                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
                  />
                  <span className="text-sm text-gray-700">Design Tips & Inspiration</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="interests"
                    value="Special Offers"
                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
                  />
                  <span className="text-sm text-gray-700">Special Offers & Promotions</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitStatus === 'success'}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitStatus === 'success' ? 'Subscribed!' : 'Subscribe Now'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      )}
    </>
  );
}
