import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema } from '../../utils/seo';
import BackToTop from '../../components/BackToTop';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface ApiBlogRow {
  id: number | string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  created_at: string;
  read_time?: number | string | null;
  author?: string;
  status?: 'Draft' | 'Published' | 'Archived';
}

export default function Blog() {
  useSEO({
    title: 'Blog - International Trade Education Travel Tips | Miftah Edu-Trade Hub',
    description:
      'Stay updated with expert advice, industry trends, and practical tips for international trade, education, and travel. Read articles about scholarships, visa applications, import-export regulations, and more.',
    keywords:
      'international trade blog, education abroad tips, visa application guide, scholarship opportunities, import export articles, travel advice Nigeria',
    canonical: '/blog',
    ogType: 'blog',
    schema: generateWebPageSchema(
      'Blog - News & Insights',
      'Expert advice, industry trends, and practical tips for international trade, education, and travel',
      '/blog',
    ),
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [blogPosts, setBlogPosts] = useState<ApiBlogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/blogs`);
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        const mapped: ApiBlogRow[] = (Array.isArray(data) ? data : [])
          .filter((item) => !item.status || item.status === 'Published')
          .map((item) => ({
            id: item.id,
            title: item.title || '',
            excerpt: item.excerpt || '',
            image: item.image || '',
            category: item.category || 'General',
            created_at: item.created_at || new Date().toISOString(),
            read_time: item.read_time ?? null,
            author: item.author || 'Miftah Team',
            status: item.status,
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setBlogPosts(mapped);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(blogPosts.map((post) => post.category))).filter(Boolean)],
    [blogPosts],
  );

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <WhatsAppButton />
      <BackToTop />

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

      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        {new Date(featuredPost.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
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
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                          {(featuredPost.author || 'M')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">{featuredPost.author || 'Miftah Team'}</p>
                          <p className="text-sm text-gray-500">
                            {featuredPost.read_time ? `${featuredPost.read_time} min read` : 'Quick read'}
                          </p>
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

          {loading ? (
            <div className="text-center py-20">
              <i className="ri-loader-4-line text-6xl text-gray-300 mb-4 animate-spin"></i>
              <p className="text-xl text-gray-500">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <i className="ri-file-search-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-500">No articles found matching your search.</p>
            </div>
          ) : (
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
                      <span>
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="mx-2">|</span>
                      <i className="ri-time-line mr-2"></i>
                      <span>{post.read_time ? `${post.read_time} min read` : 'Quick read'}</span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-yellow-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">
                          {(post.author || 'M')[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{post.author || 'Miftah Team'}</span>
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
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <i className="ri-mail-line text-6xl mb-6"></i>
          <h2 className="text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest articles, tips, and insights delivered directly to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
