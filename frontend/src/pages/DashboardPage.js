import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import MuxPlayer from '@mux/mux-player-react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Crown, 
  Play, 
  Lock,
  User,
  Mail,
  ShoppingBag,
  Video,
  ChevronRight,
  X
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [userLessons, setUserLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [allCoursesRes, purchasedRes, lessonsRes] = await Promise.all([
          axios.get(`${API}/courses`),
          axios.get(`${API}/user/courses`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/user/lessons`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);
        setAllCourses(allCoursesRes.data);
        setPurchasedCourses(purchasedRes.data);
        setUserLessons(lessonsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token, navigate]);

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const isActive = user.subscription_status === 'active';
  const purchasedIds = purchasedCourses.map(c => c.id);

  const canAccessCourse = (course) => {
    return purchasedIds.includes(course.id) || course.is_free || isActive;
  };

  // Get total lessons count
  const totalLessons = userLessons.reduce((acc, item) => acc + item.lessons.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-16" data-testid="dashboard-page">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 right-20 w-[400px] h-[400px] bg-[#FF4500]/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-40 left-20 w-[400px] h-[400px] bg-[#FF1493]/15 rounded-full blur-[150px]" />
      </div>

      {/* Video Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-5xl"
          >
            <button 
              onClick={() => setSelectedLesson(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="rounded-2xl overflow-hidden border border-[#FF4500]/30 shadow-[0_0_60px_rgba(255,69,0,0.3)]">
              <div className="bg-black/50 p-4">
                <h3 className="font-semibold text-lg">{selectedLesson.title}</h3>
              </div>
              <MuxPlayer
                playbackId={selectedLesson.mux_video_id}
                metadata={{
                  video_title: selectedLesson.title,
                  viewer_user_id: user.id
                }}
                accentColor="#FF4500"
                primaryColor="#FFFFFF"
                secondaryColor="#050505"
                style={{ aspectRatio: '16/9', width: '100%' }}
                streamType="on-demand"
                autoPlay
              />
            </div>
          </motion.div>
        </div>
      )}

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Dobrodošli, <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-white/50">Vaši kursevi i lekcije</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* My Lessons Section */}
            {userLessons.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Video className="text-[#FF4500]" />
                    Moje Lekcije
                  </h2>
                  <span className="text-white/50 text-sm">{totalLessons} lekcija</span>
                </div>

                <div className="space-y-4">
                  {userLessons.map((item) => (
                    <div key={item.course.id} className="glass-card rounded-xl overflow-hidden">
                      {/* Course Header */}
                      <button
                        onClick={() => setExpandedCourse(expandedCourse === item.course.id ? null : item.course.id)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                      >
                        <img 
                          src={item.course.thumbnail} 
                          alt={item.course.title}
                          className="w-16 h-10 object-cover rounded-lg"
                        />
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold">{item.course.title}</h3>
                          <p className="text-sm text-white/50">{item.lessons.length} lekcija</p>
                        </div>
                        <ChevronRight 
                          size={20} 
                          className={`text-white/50 transition-transform ${expandedCourse === item.course.id ? 'rotate-90' : ''}`}
                        />
                      </button>

                      {/* Lessons List */}
                      {expandedCourse === item.course.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-4 space-y-2">
                            {item.lessons.map((lesson, index) => (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson(lesson)}
                                className="w-full flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                                data-testid={`lesson-${lesson.id}`}
                              >
                                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:shadow-[0_0_20px_rgba(255,69,0,0.5)] transition-shadow">
                                  {index + 1}
                                </div>
                                <span className="flex-1 text-left">{lesson.title}</span>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#FF4500] group-hover:to-[#FF1493] transition-all">
                                  <Play size={16} className="ml-0.5" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Purchased Courses Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShoppingBag className="text-[#FF4500]" />
                  Moji Kupljeni Kursevi
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin" />
                </div>
              ) : purchasedCourses.length > 0 ? (
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {purchasedCourses.map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
                      <Link
                        to={`/courses/${course.id}`}
                        className="block glass-card rounded-xl overflow-hidden group hover:shadow-[0_0_30px_rgba(255,69,0,0.2)]"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center shadow-[0_0_20px_rgba(255,69,0,0.5)]">
                              <Play size={20} className="ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute top-2 right-2 px-2 py-1 rounded bg-green-500/80 text-xs font-medium">Kupljeno</span>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-[#FF4500] transition-colors">{course.title}</h4>
                          <p className="text-xs text-green-400 mt-1">Pristup aktivan</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="glass-card rounded-xl p-8 text-center">
                  <ShoppingBag size={48} className="mx-auto mb-4 text-white/20" />
                  <p className="text-white/50 mb-4">Nemate kupljenih kurseva</p>
                  <Link to="/courses" className="btn-gradient inline-flex px-6 py-2">Pregledaj Kurseve</Link>
                </div>
              )}
            </motion.div>

            {/* All Available Courses */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Svi Kursevi</h2>
                <Link to="/courses" className="text-[#FF4500] hover:underline text-sm">Pogledaj sve →</Link>
              </div>

              {!loading && (
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {allCourses.slice(0, 4).map((course) => {
                    const hasAccess = canAccessCourse(course);
                    const isPurchased = purchasedIds.includes(course.id);
                    
                    return (
                      <motion.div key={course.id} variants={itemVariants}>
                        <Link to={`/courses/${course.id}`} className="block glass-card rounded-xl overflow-hidden group">
                          <div className="aspect-video relative overflow-hidden">
                            <img src={course.thumbnail} alt={course.title} className={`w-full h-full object-cover ${!hasAccess && 'blur-[2px]'}`} />
                            {!hasAccess && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Lock size={24} className="text-white/60" />
                              </div>
                            )}
                            {hasAccess && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                                  <Play size={20} className="ml-0.5" />
                                </div>
                              </div>
                            )}
                            {isPurchased && <span className="absolute top-2 right-2 px-2 py-1 rounded bg-green-500/80 text-xs">Kupljeno</span>}
                            {course.is_free && !isPurchased && <span className="absolute top-2 right-2 px-2 py-1 rounded bg-blue-500/80 text-xs">Besplatno</span>}
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-[#FF4500] transition-colors">{course.title}</h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${hasAccess ? 'text-green-400' : 'text-yellow-400'}`}>
                                {hasAccess ? 'Dostupno' : `€${course.price}/mj`}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
            {/* Profile Card */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-6">Profil</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <User size={18} className="text-white/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Ime</p>
                    <p className="text-sm">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Mail size={18} className="text-white/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Email</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Crown size={18} className="text-white/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Status</p>
                    <p className={`text-sm ${isActive ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isActive ? 'Premium Član' : 'Pojedinačni Kursevi'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-6">Statistike</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <ShoppingBag size={24} className="mx-auto mb-2 text-[#FF4500]" />
                  <p className="text-2xl font-bold">{purchasedCourses.length}</p>
                  <p className="text-xs text-white/40">Kupljeno</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <Video size={24} className="mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold">{totalLessons}</p>
                  <p className="text-xs text-white/40">Lekcija</p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Potrebna Pomoć?</h3>
              <p className="text-white/50 text-sm mb-4">Naš tim je tu za vas 24/7</p>
              <Link to="/contact" className="btn-outline w-full text-sm text-center block py-3">Kontaktiraj Podršku</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
