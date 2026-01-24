import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Play, Lock, ArrowLeft, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API}/courses/${id}`, { headers });
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-20">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const canAccess = course.can_access;

  return (
    <div className="min-h-screen bg-black pt-24 pb-16" data-testid="course-detail-page">
      <div className="container-custom">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Nazad na kurseve
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            {/* Video Player / Thumbnail */}
            <div className="relative aspect-video rounded-2xl overflow-hidden glass-card mb-8">
              {canAccess ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  {course.mux_video_id && course.mux_video_id !== 'placeholder' ? (
                    <video
                      controls
                      className="w-full h-full"
                      poster={course.thumbnail}
                    >
                      <source src={`https://stream.mux.com/${course.mux_video_id}.m3u8`} />
                    </video>
                  ) : (
                    <>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto rounded-full gradient-bg flex items-center justify-center mb-4">
                            <Play size={32} className="ml-1" />
                          </div>
                          <p className="text-white/60">Video uskoro dostupan</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover blur-sm"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <Lock size={32} className="text-white/60" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Kurs Zaključan</h3>
                      <p className="text-white/60 mb-6">
                        Potrebna je aktivna pretplata za pristup ovom kursu
                      </p>
                      <Link to="/pricing" className="btn-gradient">
                        Kupi Pretplatu
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {course.is_free && (
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                    Besplatno
                  </span>
                )}
                <span className="text-white/40 flex items-center gap-1">
                  <BookOpen size={16} />
                  Kurs
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-6" data-testid="course-title">
                {course.title}
              </h1>

              <div className="prose prose-invert max-w-none">
                <p className="text-white/70 text-lg leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card rounded-2xl p-6 sticky top-28">
              <div className="mb-6">
                <span className="text-4xl font-bold gradient-text">
                  {course.is_free ? 'Besplatno' : `€${course.price}`}
                </span>
              </div>

              {canAccess ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle size={20} />
                    <span>Imaš pristup ovom kursu</span>
                  </div>
                  <Button className="w-full btn-gradient h-14 text-lg" data-testid="watch-course-btn">
                    <Play size={20} className="mr-2" />
                    Gledaj Kurs
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!user ? (
                    <>
                      <Link to="/auth/register" className="block">
                        <Button className="w-full btn-gradient h-14 text-lg">
                          Registruj Se
                        </Button>
                      </Link>
                      <Link to="/auth/login" className="block">
                        <Button variant="outline" className="w-full h-14 text-lg btn-outline">
                          Prijavi Se
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/pricing" className="block">
                      <Button className="w-full btn-gradient h-14 text-lg" data-testid="buy-subscription-btn">
                        Kupi Pretplatu
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="font-semibold mb-4">Šta dobijaš:</h4>
                <ul className="space-y-3">
                  {[
                    'Pristup svim lekcijama',
                    'Praktični primjeri',
                    'Discord zajednica',
                    'Podrška 24/7',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-white/70">
                      <CheckCircle size={16} className="text-[#FF4500]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
