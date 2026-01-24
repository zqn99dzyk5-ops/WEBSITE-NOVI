import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Play, BookOpen, Search, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, free, premium

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'free' && course.is_free) ||
                          (filter === 'premium' && !course.is_free);
    return matchesSearch && matchesFilter;
  });

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
      <div className="min-h-screen flex items-center justify-center bg-black pt-20">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-16" data-testid="courses-page">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Naši <span className="gradient-text">Kursevi</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Odaberi kurs koji najbolje odgovara tvojim ciljevima i počni učiti već danas
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-12"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <Input
              type="text"
              placeholder="Pretraži kurseve..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              data-testid="course-search"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Svi' },
              { value: 'free', label: 'Besplatni' },
              { value: 'premium', label: 'Premium' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-6 py-3 rounded-full transition-all ${
                  filter === option.value
                    ? 'gradient-bg text-white'
                    : 'glass-card hover:border-white/20'
                }`}
                data-testid={`filter-${option.value}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCourses.map((course) => (
              <motion.div key={course.id} variants={itemVariants}>
                <Link
                  to={`/courses/${course.id}`}
                  className="block glass-card rounded-2xl overflow-hidden group"
                  data-testid={`course-card-${course.id}`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {course.is_free && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                        Besplatno
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
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
                      <span className="text-2xl font-bold gradient-text">
                        {course.is_free ? 'Besplatno' : `€${course.price}`}
                      </span>
                      <span className="text-white/40 text-sm flex items-center gap-1">
                        <BookOpen size={16} />
                        Kurs
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/50 text-lg">Nema pronađenih kurseva</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
