import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import MuxPlayer from '@mux/mux-player-react';
import { 
  Play, 
  ArrowRight, 
  Users, 
  BookOpen, 
  Trophy, 
  MessageCircle,
  ChevronDown,
  Sparkles,
  Target,
  Clock,
  Shield,
  Youtube,
  Facebook
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// TikTok icon component
const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [courses, setCourses] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, coursesRes, faqsRes, resultsRes] = await Promise.all([
          axios.get(`${API}/settings`),
          axios.get(`${API}/courses`),
          axios.get(`${API}/faq`),
          axios.get(`${API}/results`)
        ]);
        setSettings(settingsRes.data);
        setCourses(coursesRes.data.slice(0, 6));
        setFaqs(faqsRes.data);
        setResults(resultsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin shadow-[0_0_30px_rgba(255,69,0,0.5)]" />
      </div>
    );
  }

  const whyUsPoints = settings?.why_us_points || [
    'Provjerene metode zarade',
    'Podrška 24/7',
    'Zajednica od 1500+ članova',
    'Praktični kursevi sa primjerima'
  ];

  const getPlatformIcon = (title) => {
    if (title.toLowerCase().includes('tiktok')) return <TikTokIcon size={20} />;
    if (title.toLowerCase().includes('youtube')) return <Youtube size={20} />;
    if (title.toLowerCase().includes('facebook') || title.toLowerCase().includes('instagram')) return <Facebook size={20} />;
    return <BookOpen size={20} />;
  };

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="home-page">
      {/* Global Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#FF4500]/20 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#FF1493]/20 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[500px] bg-[#FF6B35]/15 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF1493]/15 rounded-full blur-[150px]" />
      </div>

      {/* ==================== HERO IMAGE SECTION - JUST THE IMAGE ==================== */}
      <section className="pt-20 relative" data-testid="hero-image-section">
        <div className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh] relative overflow-hidden">
          {settings?.hero_image ? (
            <img 
              src={settings.hero_image} 
              alt="Hero"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF4500]/30 to-[#FF1493]/30" />
          )}
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
          {/* Glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF4500]/10 via-transparent to-[#050505]" />
        </div>
      </section>

      {/* ==================== TEXT & BUTTONS SECTION - BELOW IMAGE ==================== */}
      <section className="relative z-10 -mt-16" data-testid="hero-content-section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4500]/20 border border-[#FF4500]/40 text-sm mb-8 shadow-[0_0_30px_rgba(255,69,0,0.3)]">
                <Sparkles size={16} className="text-[#FF4500]" />
                <span className="text-white/90">Nova platforma za učenje</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6"
              data-testid="hero-title"
            >
              <span className="gradient-text drop-shadow-[0_0_40px_rgba(255,69,0,0.6)]">{settings?.hero_title || 'Zaradi Sa Nama'}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10"
            >
              {settings?.hero_subtitle || 'Nauči vještine koje će promijeniti tvoj život i finansijsku budućnost'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/courses" 
                className="group relative px-10 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
                data-testid="hero-cta"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF4500] to-[#FF1493] rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF4500] to-[#FF1493] rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Započni Odmah
                  <ArrowRight size={20} />
                </span>
              </Link>
              <Link 
                to="/shop" 
                className="group relative px-10 py-4 rounded-full font-semibold text-white border-2 border-[#FF4500]/50 hover:border-[#FF4500] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,69,0,0.4)]"
              >
                Kupi Account
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== INTRO VIDEO SECTION ==================== */}
      {settings?.intro_video_mux_id && (
        <section className="py-20 relative z-10" data-testid="intro-video-section">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
                Pogledaj <span className="gradient-text">Intro Video</span>
              </h2>
              <div className="relative rounded-2xl overflow-hidden border border-[#FF4500]/30 shadow-[0_0_60px_rgba(255,69,0,0.3)]">
                <MuxPlayer
                  playbackId={settings.intro_video_mux_id}
                  metadata={{
                    video_title: "Continental Academy Intro",
                    viewer_user_id: "anonymous"
                  }}
                  accentColor="#FF4500"
                  primaryColor="#FFFFFF"
                  secondaryColor="#050505"
                  style={{ aspectRatio: '16/9', width: '100%' }}
                  streamType="on-demand"
                />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ==================== WHY US SECTION ==================== */}
      <section className="py-24 md:py-32 relative z-10" data-testid="why-us-section">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#FF1493]/20 rounded-full blur-[180px]" />
        
        <div className="container-custom relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              {settings?.why_us_title || 'Zašto Baš Continental Academy?'}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-white/50 max-w-2xl mx-auto">
              Nudimo više od običnih kurseva - nudimo put ka finansijskoj slobodi
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Target, title: 'Provjerene Metode', desc: whyUsPoints[0] || 'Metode koje zaista funkcionišu' },
              { icon: Clock, title: '24/7 Podrška', desc: whyUsPoints[1] || 'Uvijek tu za vas' },
              { icon: Users, title: '1500+ Članova', desc: whyUsPoints[2] || 'Aktivna zajednica' },
              { icon: Shield, title: 'Praktični Kursevi', desc: whyUsPoints[3] || 'Učenje kroz praksu' },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/20 to-[#FF1493]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative glass-card rounded-2xl p-8 text-center border border-white/10 hover:border-[#FF4500]/50 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#FF4500] to-[#FF1493] flex items-center justify-center shadow-[0_0_30px_rgba(255,69,0,0.5)] group-hover:shadow-[0_0_50px_rgba(255,69,0,0.7)] transition-shadow">
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== COURSES SECTION ==================== */}
      <section className="py-24 md:py-32 relative z-10" data-testid="courses-section">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FF4500]/20 rounded-full blur-[200px]" />
        
        <div className="container-custom relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16"
          >
            <div>
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Naši <span className="gradient-text">Kursevi</span>
              </motion.h2>
              <motion.p variants={itemVariants} className="text-white/50">
                TikTok, YouTube, Facebook - Mjesečna pretplata
              </motion.p>
            </div>
            <motion.div variants={itemVariants}>
              <Link 
                to="/courses" 
                className="group relative px-8 py-3 rounded-full font-semibold text-white border-2 border-[#FF4500]/50 hover:border-[#FF4500] transition-all flex items-center gap-2 hover:shadow-[0_0_25px_rgba(255,69,0,0.4)]"
              >
                Svi Kursevi
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {courses.map((course, index) => (
              <motion.div key={course.id} variants={itemVariants}>
                <Link to={`/courses/${course.id}`} className="block group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/30 to-[#FF1493]/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF4500]/50 transition-all duration-300">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-[#FF4500]/30">
                        {getPlatformIcon(course.title)}
                        <span className="text-sm font-medium">Mjesečno</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF4500] to-[#FF1493] flex items-center justify-center shadow-[0_0_40px_rgba(255,69,0,0.6)]">
                          <Play size={24} className="ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-[#FF4500] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-white/50 text-sm line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold gradient-text drop-shadow-[0_0_15px_rgba(255,69,0,0.4)]">
                          €{course.price}/mj
                        </span>
                        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF4500] to-[#FF1493] text-sm font-medium shadow-[0_0_20px_rgba(255,69,0,0.4)]">
                          Kupi
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section className="py-24 md:py-32 relative z-10" data-testid="faq-section">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#FF1493]/15 rounded-full blur-[180px]" />
        
        <div className="container-custom relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Česta <span className="gradient-text">Pitanja</span>
              </h2>
              <p className="text-white/50">
                Pronađite odgovore na najčešća pitanja
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="glass-card rounded-xl px-6 border border-white/10 hover:border-[#FF4500]/30 transition-colors"
                  >
                    <AccordionTrigger className="text-left text-lg font-medium py-6 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/60 pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mt-10">
              <Link to="/faq" className="text-[#FF4500] hover:text-[#FF6B35] transition-colors">
                Pogledaj sva pitanja →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== RESULTS SECTION ==================== */}
      {results.length > 0 && (
        <section className="py-24 md:py-32 relative z-10" data-testid="results-section">
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-[#FF4500]/20 rounded-full blur-[180px]" />
          
          <div className="container-custom relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Rezultati <span className="gradient-text">Polaznika</span>
              </motion.h2>
              <motion.p variants={itemVariants} className="text-white/50">
                Uspješne priče naših članova
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/20 to-[#FF1493]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF4500]/40 transition-all">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={result.image}
                        alt={result.text}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-white/80">{result.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ==================== STATS SECTION ==================== */}
      <section className="py-24 md:py-32 relative z-10" data-testid="stats-section">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-[#FF4500]/25 to-[#FF1493]/25 rounded-full blur-[200px]" />
        </div>
        
        <div className="container-custom relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { value: settings?.stats_members || 1500, label: 'Članova', suffix: '+' },
              { value: settings?.stats_projects || 350, label: 'Projekata', suffix: '+' },
              { value: settings?.stats_courses || 12, label: 'Kurseva', suffix: '' },
              { value: 24, label: 'Sati Podrške', suffix: '/7' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center glass-card rounded-2xl p-8 border border-white/10 hover:border-[#FF4500]/40 transition-all hover:shadow-[0_0_40px_rgba(255,69,0,0.2)]"
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-2 drop-shadow-[0_0_30px_rgba(255,69,0,0.5)]">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-white/50 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== DISCORD SECTION ==================== */}
      <section className="py-24 md:py-32 relative z-10 overflow-hidden" data-testid="discord-section">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#5865F2]/30 rounded-full blur-[200px]" />
        </div>

        <div className="container-custom relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-[#5865F2] flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(88,101,242,0.6)]">
                <MessageCircle size={48} />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Pridruži Se <span className="text-[#5865F2]">Discord</span> Zajednici
              </h2>
              <p className="text-white/50 text-lg">
                Povezi se sa drugim članovima, dijeli uspjehe i uči od najboljih
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <a
                href={settings?.discord_link || 'https://discord.gg/continentall'}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="discord-cta"
                className="inline-flex items-center gap-3 px-12 py-5 rounded-full bg-[#5865F2] hover:bg-[#4752C4] transition-all text-lg font-semibold shadow-[0_0_40px_rgba(88,101,242,0.5)] hover:shadow-[0_0_60px_rgba(88,101,242,0.7)]"
              >
                <MessageCircle size={24} />
                discord.gg/continentall
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== SUPPORT BANNER ==================== */}
      <section className="py-16 relative z-10 overflow-hidden" data-testid="support-section">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF4500] to-[#FF1493]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="container-custom relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{settings?.support_text || 'Support nam je 24/7'}</h3>
                <p className="text-white/80">Uvijek smo tu da ti pomognemo</p>
              </div>
            </div>
            <Link 
              to="/contact" 
              className="px-8 py-3 rounded-full bg-white/20 border border-white/40 hover:bg-white/30 transition-all font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Kontaktiraj Nas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
