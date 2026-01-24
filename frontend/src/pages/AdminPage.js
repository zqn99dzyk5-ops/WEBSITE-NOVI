import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  MessageSquare,
  HelpCircle,
  Crown,
  Ban,
  ShoppingBag,
  Video,
  GraduationCap,
  Package
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lessons state
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: '', mux_video_id: '', order: 0 });
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Assign course state
  const [selectedUserForAssign, setSelectedUserForAssign] = useState(null);
  const [userAssignedCourses, setUserAssignedCourses] = useState([]);
  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState('');

  // Form states
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [editingShopProduct, setEditingShopProduct] = useState(null);
  const [newCourse, setNewCourse] = useState({ 
    title: '', description: '', thumbnail: '', mux_video_id: '', 
    price: 0, is_free: false, order: 0, course_type: 'single', included_courses: [] 
  });
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', order: 0 });
  const [newResult, setNewResult] = useState({ image: '', text: '', order: 0 });
  const [newShopProduct, setNewShopProduct] = useState({ 
    title: '', description: '', thumbnail: '', platform: 'youtube', 
    price: 0, features: [], in_stock: true, order: 0 
  });
  const [newFeature, setNewFeature] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAllData();
  }, [user, token, navigate, authLoading]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, coursesRes, faqsRes, resultsRes, messagesRes, settingsRes, shopRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/courses`),
        axios.get(`${API}/faq`),
        axios.get(`${API}/results`),
        axios.get(`${API}/admin/messages`, { headers }),
        axios.get(`${API}/settings`),
        axios.get(`${API}/shop`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setFaqs(faqsRes.data);
      setResults(resultsRes.data);
      setMessages(messagesRes.data);
      setSettings(settingsRes.data);
      setShopProducts(shopRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  // ============= LESSON HANDLERS =============
  const fetchLessons = async (courseId) => {
    try {
      const res = await axios.get(`${API}/courses/${courseId}/lessons`, { headers });
      setLessons(res.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    }
  };

  const handleSelectCourseForLessons = async (course) => {
    setSelectedCourseForLessons(course);
    await fetchLessons(course.id);
  };

  const handleCreateLesson = async () => {
    if (!selectedCourseForLessons) return;
    try {
      await axios.post(`${API}/courses/${selectedCourseForLessons.id}/lessons`, newLesson, { headers });
      toast.success('Lekcija kreirana!');
      setNewLesson({ title: '', mux_video_id: '', order: 0 });
      fetchLessons(selectedCourseForLessons.id);
    } catch (error) {
      toast.error('Greška pri kreiranju lekcije');
    }
  };

  const handleUpdateLesson = async (lessonId, data) => {
    try {
      await axios.put(`${API}/lessons/${lessonId}`, data, { headers });
      toast.success('Lekcija ažurirana!');
      setEditingLesson(null);
      fetchLessons(selectedCourseForLessons.id);
    } catch (error) {
      toast.error('Greška pri ažuriranju lekcije');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Da li ste sigurni?')) return;
    try {
      await axios.delete(`${API}/lessons/${lessonId}`, { headers });
      toast.success('Lekcija obrisana!');
      fetchLessons(selectedCourseForLessons.id);
    } catch (error) {
      toast.error('Greška pri brisanju lekcije');
    }
  };

  // ============= ASSIGN COURSE HANDLERS =============
  const handleSelectUserForAssign = async (userItem) => {
    setSelectedUserForAssign(userItem);
    try {
      const res = await axios.get(`${API}/admin/user-courses/${userItem.id}`, { headers });
      setUserAssignedCourses(res.data);
    } catch (error) {
      setUserAssignedCourses([]);
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedUserForAssign || !selectedCourseToAssign) return;
    try {
      await axios.post(`${API}/admin/assign-course`, {
        user_id: selectedUserForAssign.id,
        course_id: selectedCourseToAssign
      }, { headers });
      toast.success('Kurs dodijeljen!');
      setSelectedCourseToAssign('');
      const res = await axios.get(`${API}/admin/user-courses/${selectedUserForAssign.id}`, { headers });
      setUserAssignedCourses(res.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Greška pri dodjeli kursa');
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!selectedUserForAssign) return;
    try {
      await axios.delete(`${API}/admin/remove-course/${selectedUserForAssign.id}/${courseId}`, { headers });
      toast.success('Kurs uklonjen!');
      const res = await axios.get(`${API}/admin/user-courses/${selectedUserForAssign.id}`, { headers });
      setUserAssignedCourses(res.data);
    } catch (error) {
      toast.error('Greška pri uklanjanju kursa');
    }
  };

  // ============= COURSE HANDLERS =============
  const handleCreateCourse = async () => {
    try {
      await axios.post(`${API}/courses`, newCourse, { headers });
      toast.success('Kurs kreiran!');
      setNewCourse({ 
        title: '', description: '', thumbnail: '', mux_video_id: '', 
        price: 0, is_free: false, order: 0, course_type: 'single', included_courses: [] 
      });
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri kreiranju kursa');
    }
  };

  const handleUpdateCourse = async (id, data) => {
    try {
      await axios.put(`${API}/courses/${id}`, data, { headers });
      toast.success('Kurs ažuriran!');
      setEditingCourse(null);
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri ažuriranju kursa');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Da li ste sigurni? Sve lekcije će također biti obrisane.')) return;
    try {
      await axios.delete(`${API}/courses/${id}`, { headers });
      toast.success('Kurs obrisan!');
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri brisanju kursa');
    }
  };

  // ============= FAQ HANDLERS =============
  const handleCreateFaq = async () => {
    try {
      await axios.post(`${API}/faq`, newFaq, { headers });
      toast.success('FAQ kreiran!');
      setNewFaq({ question: '', answer: '', order: 0 });
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri kreiranju FAQ-a');
    }
  };

  const handleUpdateFaq = async (id, data) => {
    try {
      await axios.put(`${API}/faq/${id}`, data, { headers });
      toast.success('FAQ ažuriran!');
      setEditingFaq(null);
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri ažuriranju FAQ-a');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Da li ste sigurni?')) return;
    try {
      await axios.delete(`${API}/faq/${id}`, { headers });
      toast.success('FAQ obrisan!');
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri brisanju FAQ-a');
    }
  };

  // ============= RESULT HANDLERS =============
  const handleCreateResult = async () => {
    try {
      await axios.post(`${API}/results`, newResult, { headers });
      toast.success('Rezultat kreiran!');
      setNewResult({ image: '', text: '', order: 0 });
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri kreiranju rezultata');
    }
  };

  const handleUpdateResult = async (id, data) => {
    try {
      await axios.put(`${API}/results/${id}`, data, { headers });
      toast.success('Rezultat ažuriran!');
      setEditingResult(null);
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri ažuriranju rezultata');
    }
  };

  const handleDeleteResult = async (id) => {
    if (!window.confirm('Da li ste sigurni?')) return;
    try {
      await axios.delete(`${API}/results/${id}`, { headers });
      toast.success('Rezultat obrisan!');
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri brisanju rezultata');
    }
  };

  // ============= USER HANDLERS =============
  const handleToggleSubscription = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${API}/admin/users/${userId}/subscription?status=${newStatus}`, {}, { headers });
      toast.success(`Pretplata ${newStatus === 'active' ? 'aktivirana' : 'deaktivirana'}!`);
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri promjeni statusa');
    }
  };

  // ============= SHOP HANDLERS =============
  const handleCreateShopProduct = async () => {
    try {
      await axios.post(`${API}/shop`, newShopProduct, { headers });
      toast.success('Proizvod kreiran!');
      setNewShopProduct({ 
        title: '', description: '', thumbnail: '', platform: 'youtube', 
        price: 0, features: [], in_stock: true, order: 0 
      });
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri kreiranju proizvoda');
    }
  };

  const handleDeleteShopProduct = async (id) => {
    if (!window.confirm('Da li ste sigurni?')) return;
    try {
      await axios.delete(`${API}/shop/${id}`, { headers });
      toast.success('Proizvod obrisan!');
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri brisanju proizvoda');
    }
  };

  const addFeatureToProduct = () => {
    if (newFeature.trim()) {
      setNewShopProduct({ ...newShopProduct, features: [...newShopProduct.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  // ============= SETTINGS HANDLER =============
  const handleUpdateSettings = async () => {
    try {
      await axios.put(`${API}/settings`, settings, { headers });
      toast.success('Podešavanja sačuvana!');
    } catch (error) {
      toast.error('Greška pri čuvanju podešavanja');
    }
  };

  if (!user || user.role !== 'admin') return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-20">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-16" data-testid="admin-page">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Admin <span className="gradient-text">Panel</span>
          </h1>
          <p className="text-white/50">Upravljajte sadržajem i korisnicima</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: 'Korisnika', value: stats.total_users, color: 'text-blue-400' },
              { icon: Crown, label: 'Aktivnih', value: stats.active_subscriptions, color: 'text-green-400' },
              { icon: BookOpen, label: 'Kurseva', value: stats.total_courses, color: 'text-purple-400' },
              { icon: CreditCard, label: 'Plaćanja', value: stats.total_payments, color: 'text-yellow-400' },
            ].map((stat, index) => (
              <div key={index} className="glass-card rounded-xl p-6">
                <stat.icon size={24} className={`${stat.color} mb-3`} />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl flex flex-wrap gap-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">Korisnici</TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">Kursevi</TabsTrigger>
            <TabsTrigger value="lessons" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">Lekcije</TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">FAQ</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">Rezultati</TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">Shop</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">Poruke</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 rounded-lg px-3 py-2 text-sm">Podešavanja</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4">Novi Korisnici</h3>
                <div className="space-y-3">
                  {stats?.recent_users?.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-white/50">{u.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                        {u.subscription_status === 'active' ? 'Premium' : 'Free'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4">Nedavna Plaćanja</h3>
                <div className="space-y-3">
                  {stats?.recent_payments?.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="font-medium">{p.user_email}</p>
                        <p className="text-sm text-white/50">{p.plan_id || p.type}</p>
                      </div>
                      <span className="text-green-400 font-semibold">€{p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab with Assign Course */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users List */}
              <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Korisnik</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-white/70">Akcije</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u.id} className={selectedUserForAssign?.id === u.id ? 'bg-[#FF4500]/10' : ''}>
                          <td className="px-4 py-3">
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-white/50">{u.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                              {u.subscription_status === 'active' ? 'Aktivan' : 'Neaktivan'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {u.role !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => handleToggleSubscription(u.id, u.subscription_status)}
                                    className={`p-2 rounded-lg transition-colors ${u.subscription_status === 'active' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'}`}
                                    title={u.subscription_status === 'active' ? 'Deaktiviraj' : 'Aktiviraj'}
                                  >
                                    {u.subscription_status === 'active' ? <Ban size={16} /> : <Crown size={16} />}
                                  </button>
                                  <button
                                    onClick={() => handleSelectUserForAssign(u)}
                                    className="p-2 rounded-lg bg-[#FF4500]/10 hover:bg-[#FF4500]/20 text-[#FF4500]"
                                    title="Dodijeli kurs"
                                  >
                                    <GraduationCap size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assign Course Panel */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-[#FF4500]" />
                  Dodijeli Kurs
                </h3>
                {selectedUserForAssign ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="font-medium">{selectedUserForAssign.name}</p>
                      <p className="text-sm text-white/50">{selectedUserForAssign.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Odaberi Kurs</label>
                      <select
                        value={selectedCourseToAssign}
                        onChange={(e) => setSelectedCourseToAssign(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                      >
                        <option value="">-- Odaberi --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    
                    <Button onClick={handleAssignCourse} className="btn-gradient w-full" disabled={!selectedCourseToAssign}>
                      <Plus size={16} className="mr-2" />
                      Dodijeli
                    </Button>
                    
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-sm text-white/50 mb-2">Dodijeljeni kursevi:</p>
                      {userAssignedCourses.length > 0 ? (
                        <div className="space-y-2">
                          {userAssignedCourses.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                              <span className="text-sm">{c.title}</span>
                              <button onClick={() => handleRemoveCourse(c.id)} className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-white/30">Nema dodijeljenih kurseva</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">Kliknite na ikonu <GraduationCap size={14} className="inline" /> pored korisnika</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Novi Kurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Naslov" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="bg-white/5 border-white/10" />
                <Input placeholder="Thumbnail URL" value={newCourse.thumbnail} onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })} className="bg-white/5 border-white/10" />
                <Input placeholder="Mux Video ID (za preview)" value={newCourse.mux_video_id} onChange={(e) => setNewCourse({ ...newCourse, mux_video_id: e.target.value })} className="bg-white/5 border-white/10" />
                <Input type="number" placeholder="Cijena" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
                <Input placeholder="Opis" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} className="bg-white/5 border-white/10 md:col-span-2" />
                <div className="flex items-center gap-4">
                  <select value={newCourse.course_type} onChange={(e) => setNewCourse({ ...newCourse, course_type: e.target.value })} className="h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white">
                    <option value="single">Pojedinačni</option>
                    <option value="bundle">Bundle</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newCourse.is_free} onChange={(e) => setNewCourse({ ...newCourse, is_free: e.target.checked })} className="w-4 h-4" />
                    <span>Besplatan</span>
                  </label>
                </div>
                {newCourse.course_type === 'bundle' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-white/70 mb-2">Uključeni kursevi (drži Ctrl za više)</label>
                    <select multiple value={newCourse.included_courses} onChange={(e) => setNewCourse({ ...newCourse, included_courses: Array.from(e.target.selectedOptions, o => o.value) })} className="w-full h-24 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white">
                      {courses.filter(c => c.course_type !== 'bundle').map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                )}
                <Button onClick={handleCreateCourse} className="btn-gradient">
                  <Plus size={18} className="mr-2" />
                  Dodaj Kurs
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="glass-card rounded-xl p-4">
                  {editingCourse === course.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input value={course.title} onChange={(e) => setCourses(courses.map(c => c.id === course.id ? { ...c, title: e.target.value } : c))} className="bg-white/5 border-white/10" placeholder="Naslov" />
                        <Input type="number" value={course.price} onChange={(e) => setCourses(courses.map(c => c.id === course.id ? { ...c, price: parseFloat(e.target.value) || 0 } : c))} className="bg-white/5 border-white/10" placeholder="Cijena" />
                      </div>
                      <Input value={course.thumbnail} onChange={(e) => setCourses(courses.map(c => c.id === course.id ? { ...c, thumbnail: e.target.value } : c))} className="bg-white/5 border-white/10" placeholder="Thumbnail URL" />
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => handleUpdateCourse(course.id, course)} className="btn-gradient"><Save size={16} className="mr-2" />Sačuvaj</Button>
                        <Button onClick={() => setEditingCourse(null)} variant="outline" className="border-white/20"><X size={16} className="mr-2" />Otkaži</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img src={course.thumbnail} alt={course.title} className="w-20 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold truncate">{course.title}</h4>
                          {course.course_type === 'bundle' && <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">Bundle</span>}
                        </div>
                        <p className="text-sm text-white/50">€{course.price} {course.is_free && '(Besplatno)'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingCourse(course.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Selection */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-[#FF4500]" />
                  Odaberi Kurs
                </h3>
                <div className="space-y-2">
                  {courses.filter(c => c.course_type !== 'bundle').map(course => (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourseForLessons(course)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${selectedCourseForLessons?.id === course.id ? 'bg-[#FF4500]/20 border border-[#FF4500]/40' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-white/50">{lessons.length} lekcija</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lessons Management */}
              <div className="lg:col-span-2 space-y-6">
                {selectedCourseForLessons ? (
                  <>
                    {/* New Lesson Form */}
                    <div className="glass-card rounded-xl p-6">
                      <h3 className="font-semibold mb-4">Nova Lekcija za: {selectedCourseForLessons.title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input placeholder="Naslov lekcije" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} className="bg-white/5 border-white/10" />
                        <Input placeholder="Mux Video ID" value={newLesson.mux_video_id} onChange={(e) => setNewLesson({ ...newLesson, mux_video_id: e.target.value })} className="bg-white/5 border-white/10" />
                        <Input type="number" placeholder="Redoslijed" value={newLesson.order} onChange={(e) => setNewLesson({ ...newLesson, order: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
                      </div>
                      <Button onClick={handleCreateLesson} className="btn-gradient mt-4">
                        <Plus size={18} className="mr-2" />
                        Dodaj Lekciju
                      </Button>
                    </div>

                    {/* Lessons List */}
                    <div className="glass-card rounded-xl p-6">
                      <h3 className="font-semibold mb-4">Lekcije ({lessons.length})</h3>
                      {lessons.length > 0 ? (
                        <div className="space-y-3">
                          {lessons.map((lesson, index) => (
                            <div key={lesson.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              {editingLesson === lesson.id ? (
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Input value={lesson.title} onChange={(e) => setLessons(lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l))} className="bg-white/5 border-white/10" />
                                  <Input value={lesson.mux_video_id} onChange={(e) => setLessons(lessons.map(l => l.id === lesson.id ? { ...l, mux_video_id: e.target.value } : l))} className="bg-white/5 border-white/10" />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleUpdateLesson(lesson.id, lesson)} className="btn-gradient"><Save size={14} /></Button>
                                    <Button size="sm" onClick={() => setEditingLesson(null)} variant="outline"><X size={14} /></Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex-1">
                                    <p className="font-medium">{lesson.title}</p>
                                    <p className="text-xs text-white/50 flex items-center gap-1">
                                      <Video size={12} />
                                      {lesson.mux_video_id}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => setEditingLesson(lesson.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"><Trash2 size={14} /></button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Video size={48} className="mx-auto mb-4 text-white/20" />
                          <p className="text-white/50">Nema lekcija za ovaj kurs</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <BookOpen size={48} className="mx-auto mb-4 text-white/20" />
                    <p className="text-white/50">Odaberite kurs sa lijeve strane</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Novo Pitanje</h3>
              <div className="grid gap-4">
                <Input placeholder="Pitanje" value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} className="bg-white/5 border-white/10" />
                <Input placeholder="Odgovor" value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} className="bg-white/5 border-white/10" />
                <Button onClick={handleCreateFaq} className="btn-gradient w-fit"><Plus size={18} className="mr-2" />Dodaj FAQ</Button>
              </div>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="glass-card rounded-xl p-4">
                  {editingFaq === faq.id ? (
                    <div className="space-y-4">
                      <Input value={faq.question} onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f))} className="bg-white/5 border-white/10" />
                      <Input value={faq.answer} onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, answer: e.target.value } : f))} className="bg-white/5 border-white/10" />
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateFaq(faq.id, faq)} className="btn-gradient"><Save size={16} className="mr-2" />Sačuvaj</Button>
                        <Button onClick={() => setEditingFaq(null)} variant="outline" className="btn-outline"><X size={16} className="mr-2" />Otkaži</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <HelpCircle size={20} className="text-[#FF4500] mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{faq.question}</h4>
                        <p className="text-sm text-white/50">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingFaq(faq.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Novi Rezultat</h3>
              <div className="grid gap-4">
                <Input placeholder="Slika URL" value={newResult.image} onChange={(e) => setNewResult({ ...newResult, image: e.target.value })} className="bg-white/5 border-white/10" />
                <Input placeholder="Tekst" value={newResult.text} onChange={(e) => setNewResult({ ...newResult, text: e.target.value })} className="bg-white/5 border-white/10" />
                <Button onClick={handleCreateResult} className="btn-gradient w-fit"><Plus size={18} className="mr-2" />Dodaj Rezultat</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <div key={result.id} className="glass-card rounded-xl overflow-hidden">
                  <div className="aspect-[4/3]">
                    <img src={result.image} alt={result.text} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    {editingResult === result.id ? (
                      <div className="space-y-3">
                        <Input value={result.image} onChange={(e) => setResults(results.map(r => r.id === result.id ? { ...r, image: e.target.value } : r))} className="bg-white/5 border-white/10 text-sm" placeholder="Slika URL" />
                        <Input value={result.text} onChange={(e) => setResults(results.map(r => r.id === result.id ? { ...r, text: e.target.value } : r))} className="bg-white/5 border-white/10 text-sm" placeholder="Tekst" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateResult(result.id, result)} className="btn-gradient"><Save size={14} /></Button>
                          <Button size="sm" onClick={() => setEditingResult(null)} variant="outline" className="btn-outline"><X size={14} /></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-white/70">{result.text}</p>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingResult(result.id)} className="p-1.5 rounded bg-white/5 hover:bg-white/10"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteResult(result.id)} className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Novi Proizvod</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Naslov" value={newShopProduct.title} onChange={(e) => setNewShopProduct({ ...newShopProduct, title: e.target.value })} className="bg-white/5 border-white/10" />
                <Input placeholder="Thumbnail URL" value={newShopProduct.thumbnail} onChange={(e) => setNewShopProduct({ ...newShopProduct, thumbnail: e.target.value })} className="bg-white/5 border-white/10" />
                <select value={newShopProduct.platform} onChange={(e) => setNewShopProduct({ ...newShopProduct, platform: e.target.value })} className="h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white">
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                </select>
                <Input type="number" placeholder="Cijena" value={newShopProduct.price} onChange={(e) => setNewShopProduct({ ...newShopProduct, price: parseFloat(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
                <Input placeholder="Opis" value={newShopProduct.description} onChange={(e) => setNewShopProduct({ ...newShopProduct, description: e.target.value })} className="bg-white/5 border-white/10 md:col-span-2" />
                <div className="md:col-span-2">
                  <div className="flex gap-2 mb-2">
                    <Input placeholder="Dodaj feature..." value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="bg-white/5 border-white/10" onKeyPress={(e) => e.key === 'Enter' && addFeatureToProduct()} />
                    <Button onClick={addFeatureToProduct} variant="outline" className="btn-outline"><Plus size={16} /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newShopProduct.features.map((f, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-sm flex items-center gap-2">
                        {f}
                        <button onClick={() => setNewShopProduct({ ...newShopProduct, features: newShopProduct.features.filter((_, idx) => idx !== i) })}><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newShopProduct.in_stock} onChange={(e) => setNewShopProduct({ ...newShopProduct, in_stock: e.target.checked })} className="w-4 h-4" />
                    <span>Na stanju</span>
                  </label>
                </div>
                <Button onClick={handleCreateShopProduct} className="btn-gradient"><Plus size={18} className="mr-2" />Dodaj Proizvod</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopProducts.map((product) => (
                <div key={product.id} className="glass-card rounded-xl overflow-hidden">
                  <div className="aspect-video relative">
                    <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs ${product.platform === 'youtube' ? 'bg-red-500/80' : product.platform === 'tiktok' ? 'bg-pink-500/80' : 'bg-blue-500/80'}`}>
                      {product.platform}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">{product.title}</h4>
                    <p className="text-lg font-bold text-[#FF4500] mb-2">€{product.price}</p>
                    <p className="text-sm text-white/50 mb-3">{product.in_stock ? 'Na stanju' : 'Rasprodato'}</p>
                    <button onClick={() => handleDeleteShopProduct(product.id)} className="w-full p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm">
                      <Trash2 size={14} className="inline mr-1" /> Obriši
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 text-white/20" />
                  <p className="text-white/50">Nema poruka</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="glass-card rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{msg.name}</h4>
                        <p className="text-sm text-white/50">{msg.email}</p>
                      </div>
                      <span className="text-xs text-white/40">{new Date(msg.created_at).toLocaleDateString('bs')}</span>
                    </div>
                    <p className="font-medium mb-2">{msg.subject}</p>
                    <p className="text-white/70">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab - FIXED LAYOUT */}
          <TabsContent value="settings" className="space-y-6">
            {settings && (
              <>
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Hero Sekcija</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Hero Naslov</label>
                      <Input value={settings.hero_title || ''} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="bg-white/5 border-white/10" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Hero Podnaslov</label>
                      <Input value={settings.hero_subtitle || ''} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} className="bg-white/5 border-white/10" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Hero Slika URL</label>
                      <Input value={settings.hero_image || ''} onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })} className="bg-white/5 border-white/10" />
                      {settings.hero_image && (
                        <div className="mt-2 rounded-lg overflow-hidden h-32">
                          <img src={settings.hero_image} alt="Hero preview" className="w-full h-full object-cover opacity-70" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Intro Video Mux Playback ID</label>
                      <Input value={settings.intro_video_mux_id || ''} onChange={(e) => setSettings({ ...settings, intro_video_mux_id: e.target.value })} className="bg-white/5 border-white/10" placeholder="npr. DS00Spx1CV902MCtPj5WknGlR102V5HFkDe" />
                      <p className="text-xs text-white/40 mt-1">Unesite Mux Playback ID za intro video na početnoj stranici</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Statistike</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Broj članova</label>
                      <Input type="number" value={settings.stats_members || 0} onChange={(e) => setSettings({ ...settings, stats_members: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Broj projekata</label>
                      <Input type="number" value={settings.stats_projects || 0} onChange={(e) => setSettings({ ...settings, stats_projects: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Broj kurseva</label>
                      <Input type="number" value={settings.stats_courses || 0} onChange={(e) => setSettings({ ...settings, stats_courses: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Ostala Podešavanja</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Discord Link</label>
                      <Input value={settings.discord_link || ''} onChange={(e) => setSettings({ ...settings, discord_link: e.target.value })} className="bg-white/5 border-white/10" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Support Tekst</label>
                      <Input value={settings.support_text || ''} onChange={(e) => setSettings({ ...settings, support_text: e.target.value })} className="bg-white/5 border-white/10" />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Footer Tekst</label>
                      <Input value={settings.footer_text || ''} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} className="bg-white/5 border-white/10" />
                    </div>
                  </div>
                </div>

                <Button onClick={handleUpdateSettings} className="btn-gradient">
                  <Save size={18} className="mr-2" />
                  Sačuvaj Podešavanja
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
