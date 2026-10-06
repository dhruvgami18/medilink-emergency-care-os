import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(0);

  // Scroll & Intersection Observer for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'FAQs', href: '#faqs' },
  ];

  const faqs = [
    { q: 'How does the matching engine select hospitals?', a: 'The engine evaluates real-time data including the Patient Requirement Profile (PRP), hospital bed availability, required specialty (e.g., trauma, cardiology), and traffic-adjusted distance to find the optimal destination.' },
    { q: 'Is MediLink free for hospitals to join?', a: 'MediLink operates on a tiered SaaS model. Basic integration for receiving incoming emergency notifications is free, ensuring no barrier to critical care. Premium tiers include full bed-management and analytics.' },
    { q: 'What happens if the internet connection drops in the ambulance?', a: 'The EMT app is offline-first. Intake forms and vital logs are drafted into encrypted Local Storage. The moment a cellular connection is restored, all data automatically syncs and streams to the dispatcher.' },
    { q: 'How is patient data secured?', a: 'All patient data and vital streams are encrypted end-to-end. Role-based access ensures that only the assigned EMTs and receiving hospital staff can view the Patient Requirement Profile (PRP).' }
  ];

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark overflow-x-hidden">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-theme-dark/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
        <div className="w-[92%] max-w-[1600px] mx-auto flex justify-between items-center">
          <div className={`text-2xl font-bold flex items-center gap-2 tracking-tight transition-colors ${isScrolled ? 'text-white' : 'text-theme-dark'}`}>
             <span className="text-xl text-theme-accentYellow">✚</span> MediLink
          </div>
          
          <div className="hidden md:flex gap-8 font-medium text-sm">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`transition-colors ${activeSection === link.href.substring(1) ? 'text-theme-accentYellow' : (isScrolled ? 'text-white/80 hover:text-white' : 'text-theme-dark/80 hover:text-theme-dark')}`}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          <div className="hidden md:block">
            <button 
              onClick={() => navigate('/auth')} 
              className="bg-theme-accentYellow text-theme-dark px-6 py-2.5 rounded-full text-sm font-bold hover:scale-[1.02] hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Emergency Login
            </button>
          </div>

          <button 
            className={`md:hidden p-2 ${isScrolled ? 'text-white' : 'text-theme-dark'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 bg-theme-dark z-40 transform transition-transform duration-300 md:hidden flex flex-col items-center justify-center gap-8 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl text-white font-medium">{link.name}</a>
         ))}
         <button onClick={() => navigate('/auth')} className="bg-theme-accentYellow text-theme-dark px-8 py-4 rounded-full text-lg font-bold mt-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Emergency Login
         </button>
      </div>

      <main className="w-[92%] max-w-[1600px] mx-auto mt-24 md:mt-28">
        
        {/* Hero Section */}
        <section id="hero" className="bg-theme-dark rounded-[2.5rem] p-6 md:p-14 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="flex-1 text-white z-10 w-full">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-medium mb-6 md:mb-8 border border-white/20">
                    <span className="text-theme-accentYellow">★</span> Rapid Emergency Response
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-medium mb-6 leading-[1.1] tracking-tight">
                  Instant access <br /> to <span className="text-white/90">critical care</span>
                </h1>
                <p className="text-white/80 max-w-lg mb-8 md:mb-10 text-base md:text-xl font-light">
                  Coordinating ambulances, hospitals, and vitals in real-time to save lives when seconds matter most.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => navigate('/report')} className="bg-theme-accentYellow text-theme-dark px-8 py-3.5 rounded-full font-bold hover:scale-[1.02] hover:shadow-lg transition-all text-center">
                      Report Emergency
                    </button>
                    <button className="bg-transparent text-white border border-white/30 px-8 py-3.5 rounded-full font-medium hover:bg-white/10 hover:scale-[1.02] transition-all text-center">
                      Track Ambulance
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full flex justify-center md:justify-end z-10 mt-8 md:mt-0">
               <div className="bg-theme-cardGrey rounded-[2rem] w-full max-w-[500px] aspect-[4/3] md:aspect-square relative overflow-hidden p-4 md:p-6 flex flex-col justify-end shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Live routing map" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-theme-dark/10"></div>
                  
                  <div className="relative z-10 bg-white p-4 md:p-5 rounded-2xl shadow-lg mb-2 w-full max-w-[95%] md:max-w-[85%]">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-xs font-bold text-theme-dark uppercase tracking-wider">Live Status</div>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                      </span>
                    </div>
                    <div className="text-sm font-medium">Nearest Ambulance: <span className="text-green-600 font-bold">2 mins away</span></div>
                  </div>
               </div>
            </div>
        </section>

        {/* Trust Bar */}
        <div className="py-8 md:py-12 flex flex-wrap justify-center md:justify-start gap-8 md:gap-16 border-b border-theme-dark/10 px-4">
          <div className="flex flex-col"><span className="text-3xl font-bold text-theme-dark">50+</span><span className="text-sm font-medium opacity-70">Hospitals Connected</span></div>
          <div className="flex flex-col"><span className="text-3xl font-bold text-theme-dark">24/7</span><span className="text-sm font-medium opacity-70">Live Dispatch</span></div>
          <div className="flex flex-col"><span className="text-3xl font-bold text-theme-dark">8 min</span><span className="text-sm font-medium opacity-70">Avg. Response Time</span></div>
        </div>

        {/* About Section */}
        <section id="about" className="bg-white rounded-[2.5rem] p-8 md:p-14 mt-12 mb-12 shadow-sm border border-theme-dark/5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12">
              <div className="flex-1">
                 <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-theme-dark">About Us</div>
                 <h2 className="text-3xl md:text-[2.75rem] font-medium leading-tight text-theme-dark tracking-tight max-w-lg">
                    Care coordination that's fast, precise, and vital.
                 </h2>
              </div>
              <div className="flex-1 text-theme-dark/70 text-base md:text-lg pt-2 md:pt-10 space-y-4 max-w-xl">
                  <p className="font-medium text-theme-dark">
                    Reducing patient handover delays by up to 40%.
                  </p>
                  <p>
                    We are a modern medical intelligence platform focused on making it seamless to get patients to the right care facility—without critical delays. Our mission is simple: connect emergency reporters with trusted dispatchers, map live bed availability, and stream patient vitals so hospitals are fully prepared before the ambulance even arrives.
                  </p>
              </div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-24 px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-theme-dark">How It Works</div>
                <h2 className="text-3xl md:text-[2.75rem] font-medium text-theme-dark leading-tight tracking-tight">
                  Emergency coordination<br/>in 3 vital steps
                </h2>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-[40%] left-10 right-10 border-t-2 border-dashed border-theme-dark/10 -z-10"></div>
              
              <motion.div variants={fadeInUp} className="bg-theme-accentBlue p-8 md:p-10 rounded-[2rem] flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
                <div>
                  <div className="text-4xl font-normal text-theme-dark mb-6 opacity-80 bg-white/30 w-16 h-16 flex items-center justify-center rounded-2xl">01</div>
                  <h3 className="text-xl font-bold text-theme-dark mb-2">Report & Profiling</h3>
                </div>
                <p className="text-theme-dark/80 text-sm font-medium leading-relaxed mt-4">Reporter or EMT submits incident details; the system builds a Patient Requirement Profile instantly.</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-theme-accentYellow p-8 md:p-10 rounded-[2rem] flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
                <div>
                  <div className="text-4xl font-normal text-theme-dark mb-6 opacity-80 bg-white/30 w-16 h-16 flex items-center justify-center rounded-2xl">02</div>
                  <h3 className="text-xl font-bold text-theme-dark mb-2">Smart Dispatch</h3>
                </div>
                <p className="text-theme-dark/80 text-sm font-medium leading-relaxed mt-4">Our matching engine finds the nearest ambulance and best-fit hospital with available beds in seconds.</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-[#e4dbe8] p-8 md:p-10 rounded-[2rem] flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
                <div>
                  <div className="text-4xl font-normal text-theme-dark mb-6 opacity-80 bg-white/40 w-16 h-16 flex items-center justify-center rounded-2xl">03</div>
                  <h3 className="text-xl font-bold text-theme-dark mb-2">Transit & Prep</h3>
                </div>
                <p className="text-theme-dark/80 text-sm font-medium leading-relaxed mt-4">Live vitals stream directly to the receiving hospital so staff and resources are ready before arrival.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Section (Upgraded to Professional Icons & Vertical Video) */}
        <section id="features" className="bg-theme-dark rounded-[2.5rem] p-6 md:p-14 lg:p-20 mt-32 mb-20 text-white">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeInUp} className="text-center mb-16 flex flex-col items-center">
            <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/20">System Features</div>
            <h2 className="text-3xl md:text-[2.75rem] font-medium mb-4 tracking-tight">Comprehensive coordination,<br/>all in one platform</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              <motion.div variants={fadeInUp} className="bg-white/5 text-white p-8 rounded-[2rem] flex-1 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300 border border-white/5">
                <div className="bg-theme-accentBlue text-theme-dark w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  {/* Clipboard Icon */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Live Patient Profiling</h3>
                <p className="text-sm opacity-70 leading-relaxed">EMTs capture symptoms on scene to instantly generate the Patient Requirement Profile (PRP).</p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="bg-white/5 text-white p-8 rounded-[2rem] flex-1 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300 border border-white/5">
                <div className="bg-theme-accentBlue text-theme-dark w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  {/* Heartbeat ECG Icon */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h4l3-9 5 18 3-9h3"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Vitals</h3>
                <p className="text-sm opacity-70 leading-relaxed">Continuous push of patient vitals during transit ensures the ER knows exactly what is coming.</p>
              </motion.div>
            </div>

            {/* Center Column: Vertical Video Tag */}
            <motion.div variants={fadeInUp} className="bg-theme-dark border border-white/10 rounded-[2rem] min-h-[400px] lg:min-h-[500px] lg:h-full relative overflow-hidden shadow-2xl flex items-center justify-center">
              
              <video 
                src="/dashboard.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
              />
              
              {/* Color overlay to match the navy theme perfectly */}
              <div className="absolute inset-0 bg-theme-accentBlue mix-blend-multiply opacity-30"></div>
              <div className="absolute inset-0 bg-theme-dark opacity-10"></div>
            </motion.div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <motion.div variants={fadeInUp} className="bg-white/5 text-white p-8 rounded-[2rem] flex-1 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300 border border-white/5">
                <div className="bg-theme-accentBlue text-theme-dark w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  {/* Map Route Icon */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Routing Engine</h3>
                <p className="text-sm opacity-70 leading-relaxed">Automatically match the patient to the nearest hospital that has the required specialists.</p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="bg-white/5 text-white p-8 rounded-[2rem] flex-1 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300 border border-white/5">
                <div className="bg-theme-accentBlue text-theme-dark w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  {/* Hospital Bed Icon */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M3 16h18M5 8h.01M5 12V6a1 1 0 011-1h3a1 1 0 011 1v6M14 8h5a1 1 0 011 1v3H14V8z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Bed Booking</h3>
                <p className="text-sm opacity-70 leading-relaxed">Hospital staff can confirm bed and resource readiness with a single click before arrival.</p>
              </motion.div>
            </div>
            
          </motion.div>
        </section>

        {/* Testimonials & FAQs */}
        <section id="faqs" className="px-4 md:px-8 mt-24 mb-32">
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-32">
            <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-theme-dark">Testimonials</div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-3xl md:text-4xl font-medium text-theme-dark tracking-tight">Trusted by Responders</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-theme-dark/50">1 of 3</span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-theme-dark/20 flex items-center justify-center hover:bg-theme-dark hover:text-white transition-colors text-theme-dark">←</button>
                  <button className="w-10 h-10 rounded-full border border-theme-dark/20 flex items-center justify-center hover:bg-theme-dark hover:text-white transition-colors text-theme-dark">→</button>
                </div>
              </div>
            </div>
            
            <div className="bg-theme-dark text-white rounded-[2rem] p-8 md:p-14 shadow-xl flex flex-col md:flex-row gap-8 md:gap-16 items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-theme-accentBlue rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold text-theme-dark shrink-0">
                SJ
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-theme-accentYellow text-xl mb-4 tracking-widest flex justify-center md:justify-start gap-1">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span className="opacity-50">★</span>
                </div>
                <p className="text-lg md:text-2xl font-light mb-6 leading-relaxed italic">
                  "MediLink completely transformed our dispatch process. We instantly know which hospital has available beds, and while the UI took a day to learn, streaming vitals ahead of time has drastically reduced our patient handover delays."
                </p>
                <p className="text-sm opacity-80 font-bold tracking-wider uppercase">Sarah Jenkins — Lead Dispatcher</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 border-t border-theme-dark/10 pt-20">
            <div>
              <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-theme-dark">FAQs</div>
              <h2 className="text-3xl md:text-4xl font-medium text-theme-dark mb-4 tracking-tight">Need Help? We've<br/>Got Answers</h2>
              <p className="text-theme-dark/70 text-sm max-w-sm leading-relaxed">Here you'll find clear, concise responses to some of the most common questions regarding platform security, offline capabilities, and integrations.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-theme-cardGrey/30 rounded-xl overflow-hidden border border-theme-dark/5">
                  <button 
                    className="w-full p-5 flex justify-between items-center font-bold text-sm text-left hover:bg-theme-cardGrey/50 transition-colors"
                    onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                  >
                    {faq.q}
                    <svg className={`w-5 h-5 transform transition-transform duration-300 shrink-0 ml-4 ${openFAQ === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${openFAQ === index ? 'max-h-48 opacity-100 p-5 pt-0' : 'max-h-0 opacity-0 px-5 pt-0 overflow-hidden'}`}>
                    <p className="text-theme-dark/70 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer (Upgraded Newsletter Input) */}
        <footer className="bg-theme-dark text-white rounded-t-[2.5rem] p-8 md:p-16 flex flex-col gap-12 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="flex flex-col gap-6">
              <div className="text-2xl font-bold flex items-center gap-2">
                <span className="text-xl text-theme-accentYellow">✚</span> MediLink
              </div>
              <p className="text-sm opacity-70 max-w-xs leading-relaxed">
                We believe emergency healthcare coordination should be instant, accurate, and completely seamless.
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:items-center">
              <div className="flex gap-4">
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-sm hover:bg-white/20 transition">In</button>
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-sm hover:bg-white/20 transition">X</button>
              </div>
              <div className="text-sm opacity-70 flex flex-col gap-2 lg:text-center">
                <p>✉ contact@medilink.com</p>
                <p>📞 1-800-EMERGENCY</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:items-end">
              <div className="flex gap-6 text-sm font-bold">
                <a href="#services" className="hover:text-theme-accentYellow transition">Services</a>
                <a href="#about" className="hover:text-theme-accentYellow transition">About</a>
                <a href="#faqs" className="hover:text-theme-accentYellow transition">FAQs</a>
              </div>
              
              <div className="w-full max-w-sm flex flex-col gap-3 lg:items-end mt-2">
                <p className="text-sm opacity-70 font-medium">Join our newsletter for platform updates.</p>
                
                {/* Fixed Newsletter Form Container */}
                <form className="relative w-full mt-1">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full bg-white/10 border border-white/20 rounded-full py-3.5 pl-6 pr-28 text-sm text-white placeholder:text-white/50 outline-none focus:border-theme-accentYellow transition-colors"
                    required
                  />
                  <button 
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-theme-accentYellow text-theme-dark px-6 rounded-full text-sm font-bold hover:scale-[1.02] shadow-sm transition-transform"
                  >
                    Send
                  </button>
                </form>

              </div>
            </div>
            
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-xs opacity-50 border-t border-white/10 pt-8 mt-4 gap-4 text-center md:text-left">
            <p>© 2026 MediLink. Built as part of Full Stack Development, Nirma University.</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:opacity-100 hover:text-theme-accentYellow transition flex items-center gap-1 font-bold">
              Scroll Top ⌃
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
}