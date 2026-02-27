<section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=stunning%20cinematic%20aerial%20view%20of%20modern%20international%20cargo%20port%20at%20golden%20hour%20with%20massive%20container%20ships%20colorful%20shipping%20containers%20in%20organized%20rows%20giant%20industrial%20cranes%20silhouetted%20against%20dramatic%20orange%20sunset%20sky%20with%20purple%20and%20pink%20clouds%20reflecting%20on%20calm%20ocean%20water%20professional%20photography%20showing%20global%20trade%20and%20logistics%20scale%20warm%20lighting%20atmospheric%20perspective&width=1920&height=1080&seq=hero-main-2025&orientation=landscape')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/30"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-300/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <div className="text-left">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span className="text-yellow-400 text-sm font-semibold tracking-wider uppercase">Your Global Partner</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1]">
                  Connecting You to
                  <span className="block mt-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    Global Opportunities
                  </span>
                </h1>

                {/* Service Tags */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Import–Export', 'Education Abroad', 'Currency Exchange', 'Visa Services', 'Travel Solutions'].map((tag, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white/90 text-sm font-medium hover:bg-white/10 hover:border-yellow-400/30 transition-all cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-lg text-white/80 mb-10 max-w-xl leading-relaxed">
                  Your trusted partner for comprehensive international trade, education consulting, and travel services. We make global connections seamless and accessible.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/30 hover:scale-105 transition-all whitespace-nowrap cursor-pointer"
                  >
                    Get Started
                    <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                  </Link>
                  <Link
                    to="/services"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 hover:border-white/50 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-play-circle-line text-xl"></i>
                    Explore Services
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <i className="ri-user-star-line text-2xl text-yellow-400"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">5000+</div>
                      <div className="text-sm text-white/60">Happy Clients</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <i className="ri-global-line text-2xl text-yellow-400"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-sm text-white/60">Countries</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <i className="ri-award-line text-2xl text-yellow-400"></i>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">15+</div>
                      <div className="text-sm text-white/60">Years Experience</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Floating Cards */}
              <div className="hidden lg:block relative">
                <div className="relative h-[600px]">
                  
                  {/* Main Feature Card */}
                  <div className="absolute top-0 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 cursor-default">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                        <i className="ri-ship-line text-2xl text-slate-900"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Import & Export</h3>
                        <p className="text-sm text-slate-500">Global Trade Solutions</p>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      Seamless international trade services with customs clearance and logistics support.
                    </p>
                    <div className="flex items-center gap-2 text-yellow-600 font-semibold text-sm">
                      <i className="ri-check-line"></i>
                      <span>Trusted by 500+ businesses</span>
                    </div>
                  </div>

                  {/* Education Card */}
                  <div className="absolute top-40 left-0 w-72 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 cursor-default" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                        <i className="ri-graduation-cap-line text-xl text-white"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Study Abroad</h3>
                        <p className="text-xs text-slate-500">Education Consulting</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-4 text-sm">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs">🇺🇸</div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs">🇬🇧</div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs">🇨🇦</div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs">🇦🇺</div>
                      </div>
                      <span className="text-slate-600">50+ Universities</span>
                    </div>
                  </div>

                  {/* Currency Exchange Card */}
                  <div className="absolute bottom-32 right-10 w-64 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 cursor-default">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/60 text-sm">Currency Exchange</span>
                      <i className="ri-exchange-dollar-line text-yellow-400 text-xl"></i>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-white">Best</span>
                      <span className="text-yellow-400 font-semibold">Rates</span>
                    </div>
                    <p className="text-white/50 text-xs">Competitive rates with zero hidden fees</p>
                  </div>

                  {/* Visa Success Card */}
                  <div className="absolute bottom-0 left-10 w-56 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 cursor-default">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-check-double-line text-green-600 text-lg"></i>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">98%</div>
                        <div className="text-xs text-slate-500">Visa Success Rate</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-20 left-20 w-20 h-20 border-2 border-yellow-400/30 rounded-full"></div>
                  <div className="absolute bottom-40 right-40 w-16 h-16 border-2 border-white/20 rounded-lg rotate-45"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/50 text-sm">Scroll to explore</span>
            <i className="ri-arrow-down-line text-white/50 text-xl"></i>
          </div>
        </div>
      </section>