import { useState, useEffect } from 'react';

interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  category: string;
}

export default function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const galleryItems: GalleryItem[] = [
    {
      id: 1,
      type: 'image',
      url: 'https://readdy.ai/api/search-image?query=modern%20cargo%20truck%20on%20highway%20professional%20commercial%20photography%20blue%20sky%20background%20high%20quality%20detailed%20vehicle&width=1200&height=800&seq=gallery1&orientation=landscape',
      title: 'Heavy Duty Cargo Truck',
      description: 'Latest model cargo truck for international shipping',
      category: 'Vehicles'
    },
    {
      id: 2,
      type: 'image',
      url: 'https://readdy.ai/api/search-image?query=university%20campus%20students%20studying%20modern%20architecture%20bright%20daylight%20educational%20environment%20diverse%20students&width=1200&height=800&seq=gallery2&orientation=landscape',
      title: 'International Students',
      description: 'Students at partner universities abroad',
      category: 'Education'
    },
    {
      id: 3,
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://readdy.ai/api/search-image?query=currency%20exchange%20money%20transfer%20financial%20services%20professional%20office%20modern%20banking&width=1200&height=800&seq=gallery3&orientation=landscape',
      title: 'Currency Exchange Process',
      description: 'How our currency exchange service works',
      category: 'Finance'
    },
    {
      id: 4,
      type: 'image',
      url: 'https://readdy.ai/api/search-image?query=agricultural%20tractor%20working%20in%20field%20farming%20equipment%20green%20landscape%20professional%20machinery&width=1200&height=800&seq=gallery4&orientation=landscape',
      title: 'Agricultural Equipment',
      description: 'Modern tractors for farming operations',
      category: 'Vehicles'
    },
    {
      id: 5,
      type: 'image',
      url: 'https://readdy.ai/api/search-image?query=visa%20passport%20travel%20documents%20airport%20international%20travel%20professional%20photography&width=1200&height=800&seq=gallery5&orientation=landscape',
      title: 'Visa Processing',
      description: 'Successful visa applications and travel documents',
      category: 'Travel'
    },
    {
      id: 6,
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://readdy.ai/api/search-image?query=electric%20bike%20city%20street%20modern%20transportation%20eco%20friendly%20urban%20environment&width=1200&height=800&seq=gallery6&orientation=landscape',
      title: 'Electric Bikes Demo',
      description: 'Features and benefits of our electric bikes',
      category: 'Products'
    },
    {
      id: 7,
      type: 'image',
      url: 'https://readdy.ai/api/search-image?query=smartphone%20modern%20technology%20mobile%20phone%20sleek%20design%20professional%20product%20photography&width=1200&height=800&seq=gallery7&orientation=landscape',
      title: 'Latest Smartphones',
      description: 'Premium smartphones with advanced features',
      category: 'Products'
    },
    {
      id: 8,
      type: 'image',
      url: 'https://readdy.ai/api/search-image?query=tipper%20truck%20construction%20site%20heavy%20machinery%20industrial%20equipment%20professional%20photography&width=1200&height=800&seq=gallery8&orientation=landscape',
      title: 'Commercial Tipper Trucks',
      description: 'Heavy-duty tipper trucks for construction',
      category: 'Vehicles'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, galleryItems.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentItem = galleryItems[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Gallery</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our collection of products, services, and success stories
          </p>
        </div>

        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-[600px]">
            {currentItem.type === 'image' ? (
              <img
                key={currentItem.id}
                src={currentItem.url}
                alt={currentItem.title}
                className="w-full h-full object-cover object-top animate-fadeIn"
              />
            ) : (
              <div key={currentItem.id} className="relative w-full h-full animate-fadeIn">
                <iframe
                  src={currentItem.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="absolute top-4 right-4">
              <span className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-full shadow-lg">
                {currentItem.category}
              </span>
            </div>

            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-blue-900 text-2xl shadow-lg transition-all cursor-pointer hover:scale-110"
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-blue-900 text-2xl shadow-lg transition-all cursor-pointer hover:scale-110"
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8">
              <div className="max-w-4xl">
                <h3 className="text-3xl font-bold text-white mb-2">{currentItem.title}</h3>
                <p className="text-lg text-gray-200">{currentItem.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-white px-8 py-6 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700">
                {currentIndex + 1} / {galleryItems.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {galleryItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all cursor-pointer ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-yellow-500 rounded-full'
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-blue-900 transition-colors cursor-pointer"
            >
              <i className={`${isAutoPlaying ? 'ri-pause-line' : 'ri-play-line'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
