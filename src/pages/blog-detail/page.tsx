import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import BackToTop from '../../components/BackToTop';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BlogPost {
  id: number | string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author?: string;
  read_time?: number | string | null;
  created_at: string;
  status?: 'Draft' | 'Published' | 'Archived';
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setNotFound(false);

        const [blogResponse, listResponse] = await Promise.all([
          fetch(`/api/blogs/${id}`),
          fetch("/api/blogs"),
        ]);

        if (blogResponse.status === 404) {
          setNotFound(true);
          setBlog(null);
        } else if (!blogResponse.ok) {
          throw new Error('Failed to fetch blog');
        } else {
          const blogData = await blogResponse.json();
          setBlog({
            id: blogData.id,
            title: blogData.title || '',
            excerpt: blogData.excerpt || '',
            content: blogData.content || '',
            image: blogData.image || '',
            category: blogData.category || 'General',
            author: blogData.author || 'Miftah Team',
            read_time: blogData.read_time ?? null,
            created_at: blogData.created_at || new Date().toISOString(),
            status: blogData.status,
          });
        }

        if (listResponse.ok) {
          const listData = await listResponse.json();
          const mapped = (Array.isArray(listData) ? listData : [])
            .filter((item) => !item.status || item.status === 'Published')
            .map((item) => ({
              id: item.id,
              title: item.title || '',
              excerpt: item.excerpt || '',
              content: item.content || '',
              image: item.image || '',
              category: item.category || 'General',
              author: item.author || 'Miftah Team',
              read_time: item.read_time ?? null,
              created_at: item.created_at || new Date().toISOString(),
              status: item.status,
            }))
            .sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
          setAllPosts(mapped);
        } else {
          setAllPosts([]);
        }
      } catch (error) {
        console.error('Error fetching blog details:', error);
        setNotFound(true);
        setBlog(null);
        setAllPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const relatedPosts = useMemo(() => {
    if (!blog) return [];

    const sameCategory = allPosts
      .filter((post) => String(post.id) !== String(blog.id) && post.category === blog.category)
      .slice(0, 2);

    if (sameCategory.length === 2) return sameCategory;

    const more = allPosts
      .filter((post) => String(post.id) !== String(blog.id) && post.category !== blog.category)
      .slice(0, 2 - sameCategory.length);

    return [...sameCategory, ...more];
  }, [allPosts, blog]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || '';

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <i className="ri-loader-4-line text-6xl text-gray-400 mb-6 animate-spin"></i>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Blog Post...</h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <i className="ri-file-search-line text-6xl text-gray-400 mb-6"></i>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WhatsAppButton />
      <BackToTop />

      <section className="pt-32 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-900 hover:text-blue-700 mb-8 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back to Blog
          </Link>

          <div className="mb-6">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold mb-4">
              {blog.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <i className="ri-user-line"></i>
                <span className="text-sm">{blog.author || 'Miftah Team'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-calendar-line"></i>
                <span className="text-sm">
                  {new Date(blog.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-time-line"></i>
                <span className="text-sm">{blog.read_time ? `${blog.read_time} min read` : 'Quick read'}</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden mb-12">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-96 object-cover object-top"
            />
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-900 mb-3">Share this article:</p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                aria-label="Share on Facebook"
              >
                <i className="ri-facebook-fill"></i>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors cursor-pointer"
                aria-label="Share on Twitter"
              >
                <i className="ri-twitter-x-fill"></i>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer"
                aria-label="Share on LinkedIn"
              >
                <i className="ri-linkedin-fill"></i>
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer"
                aria-label="Share on WhatsApp"
              >
                <i className="ri-whatsapp-fill"></i>
              </button>
            </div>
          </div>

          <article className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{blog.content}</div>
          </article>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedPosts.map((post) => (
                <article key={post.id} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-900 rounded-full text-xs font-semibold">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <i className="ri-calendar-line mr-1"></i>
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center">
                        <i className="ri-time-line mr-1"></i>
                        {post.read_time ? `${post.read_time} min read` : 'Quick read'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <Link
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center text-blue-900 font-semibold hover:text-yellow-600 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Read More
                      <i className="ri-arrow-right-line ml-2"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Have Questions About Our Services?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our team is ready to help you with personalized guidance
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-all whitespace-nowrap cursor-pointer inline-flex items-center"
            >
              <i className="ri-customer-service-2-line mr-2"></i>
              Contact Us
            </Link>
            <Link
              to="/services"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all whitespace-nowrap cursor-pointer inline-flex items-center"
            >
              <i className="ri-service-line mr-2"></i>
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

