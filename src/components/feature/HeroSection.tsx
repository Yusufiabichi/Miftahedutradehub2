import React, { useState, useEffect } from 'react';

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);


    const slides = [
    {
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80",
        title: "Study Abroad Made Simple",
        description: "Get expert guidance on university admissions, visa processing, and international student support. We help you unlock global education opportunities with confidence.",
        cta: "Start Your Application"
    },
    {
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80",
        title: "Global Trade & Equipment Sourcing",
        description: "Import trucks, tractors, tippers, phones, and more with trusted sourcing and transparent processes. We connect your business to reliable international markets.",
        cta: "Explore Products"
    },
    {
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1400&q=80",
        title: "Visa & Travel Advisory Services",
        description: "Professional visa guidance and travel consultation for students, entrepreneurs, and business professionals. Move forward with clarity and proper documentation.",
        cta: "Get Consultation"
    }
];

    useEffect(() => {
        const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);
  return (

      <section className="relative pt-20 pb-0 overflow-hidden h-screen">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <div className="w-full h-full">
                <img 
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/60 via-[#1e3a8a]/50 to-black/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto w-full">
                <div className="max-w-3xl">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed animate-fade-in-delay">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
                    <button className="px-8 py-4 text-base font-semibold text-[#1e3a8a] bg-[#fbbf24] rounded-lg hover:bg-[#f59e0b] transition-all shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer">
                      {slide.cta}
                    </button>
                    <button className="px-8 py-4 text-base font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white rounded-lg hover:bg-white/20 transition-all whitespace-nowrap cursor-pointer">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                index === currentSlide 
                  ? 'bg-[#fbbf24] w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
          aria-label="Previous slide"
        >
          <i className="ri-arrow-left-s-line text-2xl text-white"></i>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
          aria-label="Next slide"
        >
          <i className="ri-arrow-right-s-line text-2xl text-white"></i>
        </button>
      </section>
  )
}

export default HeroSection