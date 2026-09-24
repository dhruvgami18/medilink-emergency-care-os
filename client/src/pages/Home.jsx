import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark pb-6">
      
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-4 py-6 w-[96%] max-w-[1600px] mx-auto">
        <div className="text-2xl font-bold flex items-center gap-2 tracking-tight">
           <span className="text-xl">✚</span>
           MediLink
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 font-medium text-sm">
          <a href="#services" className="hover:opacity-70 transition">Services</a>
          <a href="#hospitals" className="hover:opacity-70 transition">Hospitals</a>
          <a href="#ambulances" className="hover:opacity-70 transition">Ambulances</a>
          <a href="#faqs" className="hover:opacity-70 transition">FAQs</a>
        </div>
        
        <button onClick={() => window.location.href='/auth'} className="bg-theme-dark text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-opacity-90 transition shadow-sm">
            Emergency Login
        </button>
      </nav>

      {/* Main Container */}
      <main className="w-[96%] max-w-[1600px] mx-auto mt-2">
        
        {/* 1. Main Hero Section */}
        <div className="bg-theme-dark rounded-[2.5rem] p-8 md:p-14 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            {/* Left Column: Text & CTA */}
            <div className="flex-1 text-white z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border border-white/20">
                    <span className="text-theme-accentYellow">★</span> Rapid Emergency Response
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium mb-6 leading-[1.05] tracking-tight">
                  Instant access <br />
                  to <span className="text-white/90">critical care</span>
                </h1>
                
                <p className="text-white/80 max-w-lg mb-10 text-lg md:text-xl font-light">
                  Coordinating ambulances, hospitals, and vitals in real-time to save lives when seconds matter most.
                </p>

                <div className="flex flex-wrap gap-4">
                    <button className="bg-theme-accentYellow text-theme-dark px-8 py-3.5 rounded-full font-medium hover:bg-opacity-90 transition">
                      Report Emergency
                    </button>
                    <button className="bg-transparent text-white border border-white/30 px-8 py-3.5 rounded-full font-medium hover:bg-white/10 transition">
                      Track Ambulance
                    </button>
                </div>
            </div>

            {/* Right Column: Imagery / Graphic */}
            <div className="flex-1 w-full flex justify-end z-10 h-full">
               <div className="bg-theme-bg rounded-[2rem] w-full max-w-[500px] aspect-[4/3] md:aspect-square relative overflow-hidden p-6 flex flex-col justify-end">
                  <div className="absolute inset-0 bg-[#d8dbd1]"></div>
                  
                  {/* Live Status Overlay */}
                  <div className="relative z-10 bg-white p-5 rounded-2xl shadow-sm mb-2 w-full max-w-[85%]">
                    <div className="text-xs font-bold text-theme-dark uppercase mb-1 tracking-wider">Live Status</div>
                    <div className="text-sm font-medium">Nearest Ambulance: <span className="text-green-600">2 mins away</span></div>
                  </div>
               </div>
            </div>
        </div>

        {/* 2. Sub-hero Text Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mt-20 px-4 md:px-8 mb-24">
            <div className="flex-1">
               <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-theme-dark">About Us</div>
               <h2 className="text-4xl md:text-[2.75rem] font-medium leading-tight text-theme-dark tracking-tight max-w-lg">
                  Care coordination that's fast, precise, and vital.
               </h2>
            </div>
            <div className="flex-1 text-theme-dark/70 text-lg pt-4 md:pt-10 space-y-4 max-w-xl">
                <p>
                  We are a modern medical intelligence platform focused on making it seamless to get patients to the right care facility—without critical delays.
                </p>
                <p>
                  Our mission is simple: connect emergency reporters with trusted dispatchers, map live bed availability, and stream patient vitals so hospitals are fully prepared before the ambulance even arrives.
                </p>
            </div>
        </div>

        {/* 3. How It Works Section */}
        <section className="mt-24 px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-theme-dark">How It Works</div>
              <h2 className="text-4xl md:text-[2.75rem] font-medium text-theme-dark leading-tight tracking-tight">
                Emergency coordination<br/>in 3 vital steps
              </h2>
            </div>
            <button className="bg-theme-dark text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-opacity-90 transition">
              Start Live Tracking
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 01 - Blue */}
            <div className="bg-theme-accentBlue p-8 md:p-10 rounded-[2rem] min-h-[280px] flex flex-col justify-between">
              <div>
                <div className="text-4xl font-normal text-theme-dark mb-6 opacity-80">01</div>
                <h3 className="text-xl font-medium text-theme-dark mb-3">Report & Profiling</h3>
              </div>
              <p className="text-theme-dark/80 text-sm leading-relaxed">
                Log the incident and initial symptoms. The system instantly generates a comprehensive Patient Requirement Profile (PRP).
              </p>
            </div>

            {/* Card 02 - Yellow */}
            <div className="bg-theme-accentYellow p-8 md:p-10 rounded-[2rem] min-h-[280px] flex flex-col justify-between">
              <div>
                <div className="text-4xl font-normal text-theme-dark mb-6 opacity-80">02</div>
                <h3 className="text-xl font-medium text-theme-dark mb-3">Smart Dispatch</h3>
              </div>
              <p className="text-theme-dark/80 text-sm leading-relaxed">
                Our matching engine evaluates live hospital bed availability, blood stock, and nearest ambulances for perfect, rapid routing.
              </p>
            </div>

            {/* Card 03 - Grey */}
            <div className="bg-theme-cardGrey p-8 md:p-10 rounded-[2rem] min-h-[280px] flex flex-col justify-between">
              <div>
                <div className="text-4xl font-normal text-theme-dark mb-6 opacity-80">03</div>
                <h3 className="text-xl font-medium text-theme-dark mb-3">Transit & Prep</h3>
              </div>
              <p className="text-theme-dark/80 text-sm leading-relaxed">
                EMTs stream live patient vitals during transit, allowing hospital staff to prepare exact resources and staff before arrival.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Comprehensive Services Grid */}
        <section className="bg-theme-dark rounded-[2.5rem] p-8 md:p-14 lg:p-20 mt-32 mb-20 text-white">
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/20">
              System Features
            </div>
            <h2 className="text-4xl md:text-[2.75rem] font-medium mb-4 tracking-tight">
              Comprehensive coordination,<br/>all in one platform
            </h2>
            <p className="text-white/70 max-w-xl text-sm leading-relaxed">
              MediLink connects field EMTs, dispatchers, and receiving hospitals through a unified intelligence system to reduce critical delays.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-6">
              <div className="bg-theme-bg text-theme-dark p-8 rounded-[2rem] flex-1">
                <div className="bg-theme-dark text-white w-10 h-10 rounded-xl flex items-center justify-center mb-6">📋</div>
                <h3 className="text-xl font-medium mb-3">Live Patient Profiling</h3>
                <p className="text-sm opacity-80 leading-relaxed">EMTs capture symptoms and history on scene to instantly generate the Patient Requirement Profile (PRP).</p>
              </div>
              <div className="bg-theme-bg text-theme-dark p-8 rounded-[2rem] flex-1">
                <div className="bg-theme-dark text-white w-10 h-10 rounded-xl flex items-center justify-center mb-6">❤️</div>
                <h3 className="text-xl font-medium mb-3">Real-Time Vitals</h3>
                <p className="text-sm opacity-80 leading-relaxed">Continuous push of patient vitals during transit ensures the ER knows exactly what is coming.</p>
              </div>
            </div>

            <div className="bg-theme-cardGrey rounded-[2rem] min-h-[350px] lg:min-h-full relative overflow-hidden flex items-center justify-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition duration-300">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-theme-dark border-b-[10px] border-b-transparent ml-1"></div>
              </div>
              <div className="absolute inset-0 bg-[#9fbab9] opacity-50"></div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-theme-bg text-theme-dark p-8 rounded-[2rem] flex-1">
                <div className="bg-theme-dark text-white w-10 h-10 rounded-xl flex items-center justify-center mb-6">🗺️</div>
                <h3 className="text-xl font-medium mb-3">Smart Routing Engine</h3>
                <p className="text-sm opacity-80 leading-relaxed">Automatically match the patient to the nearest hospital that has the required specialists and equipment.</p>
              </div>
              <div className="bg-theme-bg text-theme-dark p-8 rounded-[2rem] flex-1">
                <div className="bg-theme-dark text-white w-10 h-10 rounded-xl flex items-center justify-center mb-6">🛏️</div>
                <h3 className="text-xl font-medium mb-3">Instant Bed Booking</h3>
                <p className="text-sm opacity-80 leading-relaxed">Hospital staff can confirm bed and resource readiness with a single click before the ambulance arrives.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Testimonials & FAQs Section */}
        <section className="px-4 md:px-8 mt-24 mb-32">
          {/* Testimonial */}
          <div className="mb-24">
            <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-theme-dark">Testimonial</div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl md:text-4xl font-medium text-theme-dark tracking-tight">Trusted by First Responders</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-theme-dark/20 flex items-center justify-center hover:bg-theme-dark/5 text-theme-dark">←</button>
                <button className="w-10 h-10 rounded-full border border-theme-dark/20 flex items-center justify-center hover:bg-theme-dark/5 text-theme-dark">→</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-theme-cardGrey rounded-[2rem] h-[300px] w-full"></div>
              <div className="bg-theme-dark text-white rounded-[2rem] p-10 flex flex-col justify-center">
                <div className="text-theme-accentYellow text-xl mb-6 tracking-widest">★★★★★</div>
                <p className="text-lg md:text-xl font-light mb-8 leading-relaxed">
                  "MediLink completely transformed our dispatch process. We instantly know which hospital has available beds, and streaming vitals ahead of time has drastically reduced our patient handover delays."
                </p>
                <p className="text-sm opacity-80 font-medium">Sarah Jenkins, Lead Dispatcher</p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 border-t border-theme-dark/10 pt-20">
            <div>
              <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-theme-dark">FAQs</div>
              <h2 className="text-3xl md:text-4xl font-medium text-theme-dark mb-4 tracking-tight">Need Help? We've<br/>Got Answers</h2>
              <p className="text-theme-dark/70 text-sm max-w-sm">Have questions? We've got answers. Here you'll find clear, concise responses to some of the most common questions about our platform.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-[#e9eae1] p-5 rounded-xl flex justify-between items-center cursor-pointer font-medium text-sm">
                1. How does the matching engine select hospitals?
                <span className="text-xl">▾</span>
              </div>
              <div className="bg-[#e9eae1] p-5 rounded-xl flex justify-between items-center cursor-pointer font-medium text-sm">
                2. Can EMTs use the app offline?
                <span className="text-xl">▾</span>
              </div>
              <div className="bg-[#dcdfd3] p-5 rounded-xl flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center font-medium cursor-pointer">
                  3. How is patient data secured?
                  <span className="text-xl">▴</span>
                </div>
                <p className="text-theme-dark/70 leading-relaxed mt-2">
                  Yes, all patient data and vital streams are encrypted end-to-end. Role-based access ensures that only the assigned EMTs and receiving hospital staff can view the Patient Requirement Profile (PRP).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Footer */}
        <footer className="bg-theme-dark text-white rounded-t-[2.5rem] p-10 md:p-16 flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="flex flex-col gap-6">
              <div className="text-2xl font-bold flex items-center gap-2">
                <span className="text-xl text-theme-accentYellow">✚</span> MediLink
              </div>
              <p className="text-sm opacity-70 max-w-xs leading-relaxed">
                We believe emergency healthcare coordination should be instant, accurate, and seamless.
              </p>
            </div>

            <div className="flex flex-col gap-6 md:items-center">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-sm cursor-pointer hover:bg-white/20 transition">In</div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-sm cursor-pointer hover:bg-white/20 transition">X</div>
              </div>
              <div className="text-sm opacity-70 flex flex-col gap-2 md:text-center">
                <p>✉ contact@medilink.com</p>
                <p>📞 1-800-EMERGENCY</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 md:items-end">
              <div className="flex gap-6 text-sm font-medium">
                <a href="#services" className="hover:opacity-70 transition">Services</a>
                <a href="#hospitals" className="hover:opacity-70 transition">Hospitals</a>
                <a href="#faqs" className="hover:opacity-70 transition">FAQs</a>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-3 md:items-end">
                <p className="text-sm opacity-70">Join our newsletter for platform updates.</p>
                <div className="flex w-full bg-white/10 rounded-full p-1 border border-white/20">
                  <input type="email" placeholder="Your email address" className="bg-transparent flex-1 px-4 text-sm outline-none text-white placeholder:text-white/50" />
                  <button className="bg-theme-accentYellow text-theme-dark px-6 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition">Send</button>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="flex justify-between items-center text-xs opacity-50 border-t border-white/10 pt-8 mt-4">
            <p>© 2026, MediLink Systems. All rights reserved.</p>
            <button className="hover:opacity-100 transition flex items-center gap-1">Scroll Top ⌃</button>
          </div>
        </footer>

      </main>
    </div>
  );
}