import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Play, Lock, ArrowLeft, BookOpen, CheckCircle, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [courseRes] = await Promise.all([
          axios.get(`${API}/courses/${id}`, { headers })
        ]);
        setCourse(courseRes.data);

        // Check if user has purchased this course
        if (token) {
          try {
            const purchasedRes = await axios.get(`${API}/user/courses`, { headers });
            const purchasedIds = purchasedRes.data.map(c => c.id);
            setIsPurchased(purchasedIds.includes(id));
          } catch (e) {
            console.error('Error checking purchases:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token, navigate]);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    setPurchasing(true);
    try {
      const response = await axios.post(
        `${API}/payments/course`,
        {
          course_id: id,
          origin_url: window.location.origin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error purchasing course:', error);
      if (error.response?.data?.detail === 'Već ste kupili ovaj kurs') {
        toast.info('Već ste kupili ovaj kurs!');
        setIsPurchased(true);
      } else {
        toast.error('Greška pri kupovini. Pokušajte ponovo.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] pt-20">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const canAccess = course.can_access || isPurchased || course.is_free;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-16" data-testid="course-detail-page">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 right-20 w-[400px] h-[400px] bg-[#FF4500]/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-40 left-20 w-[400px] h-[400px] bg-[#FF1493]/15 rounded-full blur-[150px]" />
      </div>

      <div className="container-custom relative z-10">
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
                          <div className="w-20 h-20 mx-auto rounded-full gradient-bg flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,69,0,0.5)]">
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
                        Kupite ovaj kurs da dobijete pristup
                      </p>
                      <Button 
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className="btn-gradient shadow-[0_0_20px_rgba(255,69,0,0.4)]"
                      >
                        {purchasing ? 'Učitavanje...' : `Kupi za €${course.price}/mj`}
                      </Button>
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
                {isPurchased && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                    Kupljeno
                  </span>
                )}
                <span className="text-white/40 flex items-center gap-1">
                  <BookOpen size={16} />
                  Mjesečni Kurs
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
                <span className="text-4xl font-bold gradient-text drop-shadow-[0_0_15px_rgba(255,69,0,0.4)]">
                  {course.is_free ? 'Besplatno' : `€${course.price}`}
                </span>
                {!course.is_free && <span className="text-white/50 ml-1">/mjesečno</span>}
              </div>

              {canAccess ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle size={20} />
                    <span>{isPurchased ? 'Kurs kupljen!' : 'Imate pristup'}</span>
                  </div>
                  <Button className="w-full btn-gradient h-14 text-lg shadow-[0_0_20px_rgba(255,69,0,0.3)]" data-testid="watch-course-btn">
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
                    <Button 
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full btn-gradient h-14 text-lg shadow-[0_0_20px_rgba(255,69,0,0.4)]" 
                      data-testid="buy-course-btn"
                    >
                      {purchasing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Učitavanje...
                        </span>
                      ) : (
                        <>
                          <ShoppingCart size={20} className="mr-2" />
                          Kupi Kurs - €{course.price}/mj
                        </>
                      )}
                    </Button>
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
                    'Mjesečna ažuriranja'
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
