import { useEffect } from 'react';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://miftahedutrade.com';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  schema?: object;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  schema
}: SEOProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    if (canonical) {
      updateMetaTag('og:url', `${SITE_URL}${canonical}`, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', `${SITE_URL}${canonical}`);
    }

    // Schema.org JSON-LD
    if (schema) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]');
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(schema);
    }

    // Update last-modified
    const today = new Date().toISOString().split('T')[0];
    updateMetaTag('last-modified', today);
  }, [title, description, keywords, canonical, ogType, schema]);
};

// Schema.org generators
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Miftah Edu-Trade Hub Ltd',
  url: SITE_URL,
  logo: `${SITE_URL}/vite.svg`,
  description: 'Comprehensive international trade, global education consulting, visa processing, currency exchange, and travel services in Kano, Nigeria',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Trade Center Road',
    addressLocality: 'Kano',
    addressRegion: 'Kano State',
    postalCode: '1215',
    addressCountry: 'NG'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '12.0022',
    longitude: '8.5919'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+880-1234-567890',
    contactType: 'customer service',
    areaServed: 'NG',
    availableLanguage: ['en', 'ha']
  },
  sameAs: [
    'https://facebook.com/miftahedutrade',
    'https://twitter.com/miftahedutrade',
    'https://linkedin.com/company/miftahedutrade'
  ]
});

export const generateWebPageSchema = (name: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  description,
  url: `${SITE_URL}${url}`,
  publisher: {
    '@type': 'Organization',
    name: 'Miftah Edu-Trade Hub Ltd',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/vite.svg`
    }
  }
});

export const generateServiceSchema = (service: {
  name: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.description,
  provider: {
    '@type': 'Organization',
    name: 'Miftah Edu-Trade Hub Ltd',
    url: SITE_URL
  },
  areaServed: {
    '@type': 'Country',
    name: 'Nigeria'
  },
  url: `${SITE_URL}${service.url}`
});

export const generateProductSchema = (product: {
  name: string;
  description: string;
  image: string;
  category: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  category: product.category,
  brand: {
    '@type': 'Brand',
    name: 'Miftah Edu-Trade Hub Ltd'
  },
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    priceCurrency: 'NGN'
  }
});

export const generateBlogPostSchema = (post: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  image: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  image: post.image,
  author: {
    '@type': 'Person',
    name: post.author
  },
  publisher: {
    '@type': 'Organization',
    name: 'Miftah Edu-Trade Hub Ltd',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/vite.svg`
    }
  },
  datePublished: post.datePublished,
  url: `${SITE_URL}${post.url}`
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.url}`
  }))
});
