import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Crown, 
  Play, 
  Clock, 
  CheckCircle,
  Lock,
  User,
  Mail,
  Calendar
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user, token, navigate]);

  if (!user) return null;

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

  const isActive = user.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-black pt-24 pb-16" data-testid="dashboard-page">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Dobrodošli, <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-white/50">Upravljajte svojim učenjem i pretplatom</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`glass-card rounded-2xl p-6 ${isActive ? 'border-green-500/30' : 'border-yellow-500/30'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-green-500/20' : 'bg-yellow-500/20'
                  }`}>
                    {isActive ? (
                      <Crown size={28} className="text-green-400" />
                    ) : (
                      <Lock size={28} className="text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {isActive ? 'Aktivna Pretplata' : 'Bez Aktivne Pretplate'}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {isActive 
                        ? 'Imate pristup svim premium kursevima' 
                        : 'Kupite pretplatu za pristup svim kursevima'}
                    </p>
                  </div>
                </div>
                {!isActive && (
                  <Link to="/pricing" className="btn-gradient text-sm px-6 py-2.5">
                    Kupi Pretplatu
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Moji Kursevi</h2>
                <Link to="/courses" className="text-[#FF4500] hover:underline text-sm">
                  Svi kursevi →
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin" />
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {courses.slice(0, 4).map((course) => {
                    const canAccess = course.is_free || isActive;
                    return (
                      <motion.div key={course.id} variants={itemVariants}>
                        <Link
                          to={`/courses/${course.id}`}
                          className="block glass-card rounded-xl overflow-hidden group"
                        >
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className={`w-full h-full object-cover ${!canAccess && 'blur-sm'}`}
                            />
                            {!canAccess && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Lock size={24} className="text-white/60" />
                              </div>
                            )}
                            {canAccess && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                                  <Play size={20} className="ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-[#FF4500] transition-colors">
                              {course.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${canAccess ? 'text-green-400' : 'text-yellow-400'}`}>
                                {canAccess ? 'Dostupno' : 'Zaključano'}
                              </span>
                              {course.is_free && (
                                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                                  Besplatno
                                </span>
                              )}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
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
                      {isActive ? 'Premium' : 'Besplatni'}
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
                  <BookOpen size={24} className="mx-auto mb-2 text-[#FF4500]" />
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-xs text-white/40">Kurseva</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <CheckCircle size={24} className="mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold">
                    {courses.filter(c => c.is_free || isActive).length}
                  </p>
                  <p className="text-xs text-white/40">Dostupno</p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Potrebna Pomoć?</h3>
              <p className="text-white/50 text-sm mb-4">
                Naš tim je tu za vas 24/7
              </p>
              <Link to="/contact" className="btn-outline w-full text-sm text-center block py-3">
                Kontaktiraj Podršku
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
