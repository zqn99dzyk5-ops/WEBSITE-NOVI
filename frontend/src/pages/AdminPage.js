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
  Image,
  Crown,
  Ban
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
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: '', mux_video_id: '', price: 0, is_free: false, order: 0 });
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', order: 0 });
  const [newResult, setNewResult] = useState({ image: '', text: '', order: 0 });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Wait for auth to finish loading
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
      const [statsRes, usersRes, coursesRes, faqsRes, resultsRes, messagesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/courses`),
        axios.get(`${API}/faq`),
        axios.get(`${API}/results`),
        axios.get(`${API}/admin/messages`, { headers }),
        axios.get(`${API}/settings`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setFaqs(faqsRes.data);
      setResults(resultsRes.data);
      setMessages(messagesRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  // Course handlers
  const handleCreateCourse = async () => {
    try {
      await axios.post(`${API}/courses`, newCourse, { headers });
      toast.success('Kurs kreiran!');
      setNewCourse({ title: '', description: '', thumbnail: '', mux_video_id: '', price: 0, is_free: false, order: 0 });
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
    if (!window.confirm('Da li ste sigurni?')) return;
    try {
      await axios.delete(`${API}/courses/${id}`, { headers });
      toast.success('Kurs obrisan!');
      fetchAllData();
    } catch (error) {
      toast.error('Greška pri brisanju kursa');
    }
  };

  // FAQ handlers
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

  // Result handlers
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

  // User handlers
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

  // Settings handler
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
    <div className="min-h-screen bg-black pt-24 pb-16" data-testid="admin-page">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Admin <span className="gradient-text">Panel</span>
          </h1>
          <p className="text-white/50">Upravljajte sadržajem i korisnicima</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
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
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/10 rounded-lg px-4 py-2">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/10 rounded-lg px-4 py-2">
              Korisnici
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-white/10 rounded-lg px-4 py-2">
              Kursevi
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-white/10 rounded-lg px-4 py-2">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-white/10 rounded-lg px-4 py-2">
              Rezultati
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-white/10 rounded-lg px-4 py-2">
              Poruke
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 rounded-lg px-4 py-2">
              Podešavanja
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4">Novi Korisnici</h3>
                <div className="space-y-3">
                  {stats?.recent_users?.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-white/50">{u.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
                      }`}>
                        {u.subscription_status === 'active' ? 'Premium' : 'Free'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Payments */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4">Nedavna Plaćanja</h3>
                <div className="space-y-3">
                  {stats?.recent_payments?.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="font-medium">{p.user_email}</p>
                        <p className="text-sm text-white/50">{p.plan_id}</p>
                      </div>
                      <span className="text-green-400 font-semibold">€{p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Korisnik</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Uloga</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4">{u.name}</td>
                        <td className="px-6 py-4 text-white/70">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
                          }`}>
                            {u.subscription_status === 'active' ? 'Aktivan' : 'Neaktivan'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/50'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleSubscription(u.id, u.subscription_status)}
                              className={`p-2 rounded-lg transition-colors ${
                                u.subscription_status === 'active' 
                                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' 
                                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                              }`}
                              title={u.subscription_status === 'active' ? 'Deaktiviraj' : 'Aktiviraj'}
                            >
                              {u.subscription_status === 'active' ? <Ban size={16} /> : <Crown size={16} />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {/* New Course Form */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Novi Kurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Naslov"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
                <Input
                  placeholder="Thumbnail URL"
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
                <Input
                  placeholder="Mux Video ID"
                  value={newCourse.mux_video_id}
                  onChange={(e) => setNewCourse({ ...newCourse, mux_video_id: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
                <Input
                  type="number"
                  placeholder="Cijena"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10"
                />
                <Input
                  placeholder="Opis"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="bg-white/5 border-white/10 md:col-span-2"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCourse.is_free}
                      onChange={(e) => setNewCourse({ ...newCourse, is_free: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Besplatan</span>
                  </label>
                </div>
                <Button onClick={handleCreateCourse} className="btn-gradient">
                  <Plus size={18} className="mr-2" />
                  Dodaj Kurs
                </Button>
              </div>
            </div>

            {/* Courses List */}
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="glass-card rounded-xl p-4">
                  {editingCourse === course.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={course.title}
                        onChange={(e) => setCourses(courses.map(c => c.id === course.id ? { ...c, title: e.target.value } : c))}
                        className="bg-white/5 border-white/10"
                      />
                      <Input
                        value={course.thumbnail}
                        onChange={(e) => setCourses(courses.map(c => c.id === course.id ? { ...c, thumbnail: e.target.value } : c))}
                        className="bg-white/5 border-white/10"
                      />
                      <Input
                        value={course.mux_video_id}
                        onChange={(e) => setCourses(courses.map(c => c.id === course.id ? { ...c, mux_video_id: e.target.value } : c))}
                        className="bg-white/5 border-white/10"
                      />
                      <Input
                        type="number"
                        value={course.price}
                        onChange={(e) => setCourses(courses.map(c => c.id === course.id ? { ...c, price: parseFloat(e.target.value) || 0 } : c))}
                        className="bg-white/5 border-white/10"
                      />
                      <div className="flex gap-2 md:col-span-2">
                        <Button onClick={() => handleUpdateCourse(course.id, course)} className="btn-gradient">
                          <Save size={16} className="mr-2" />
                          Sačuvaj
                        </Button>
                        <Button onClick={() => setEditingCourse(null)} variant="outline" className="btn-outline">
                          <X size={16} className="mr-2" />
                          Otkaži
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img src={course.thumbnail} alt={course.title} className="w-20 h-12 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{course.title}</h4>
                        <p className="text-sm text-white/50">€{course.price} {course.is_free && '(Besplatno)'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingCourse(course.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Novo Pitanje</h3>
              <div className="grid gap-4">
                <Input
                  placeholder="Pitanje"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
                <Input
                  placeholder="Odgovor"
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
                <Button onClick={handleCreateFaq} className="btn-gradient w-fit">
                  <Plus size={18} className="mr-2" />
                  Dodaj FAQ
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="glass-card rounded-xl p-4">
                  {editingFaq === faq.id ? (
                    <div className="space-y-4">
                      <Input
                        value={faq.question}
                        onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f))}
                        className="bg-white/5 border-white/10"
                      />
                      <Input
                        value={faq.answer}
                        onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, answer: e.target.value } : f))}
                        className="bg-white/5 border-white/10"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateFaq(faq.id, faq)} className="btn-gradient">
                          <Save size={16} className="mr-2" />
                          Sačuvaj
                        </Button>
                        <Button onClick={() => setEditingFaq(null)} variant="outline" className="btn-outline">
                          <X size={16} className="mr-2" />
                          Otkaži
                        </Button>
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
                        <button onClick={() => setEditingFaq(faq.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400">
                          <Trash2 size={16} />
                        </button>
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
                <Input
                  placeholder="Slika URL"
                  value={newResult.image}
                  onChange={(e) => setNewResult({ ...newResult, image: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
                <Input
                  placeholder="Tekst"
                  value={newResult.text}
                  onChange={(e) => setNewResult({ ...newResult, text: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
                <Button onClick={handleCreateResult} className="btn-gradient w-fit">
                  <Plus size={18} className="mr-2" />
                  Dodaj Rezultat
                </Button>
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
                        <Input
                          value={result.image}
                          onChange={(e) => setResults(results.map(r => r.id === result.id ? { ...r, image: e.target.value } : r))}
                          className="bg-white/5 border-white/10 text-sm"
                          placeholder="Slika URL"
                        />
                        <Input
                          value={result.text}
                          onChange={(e) => setResults(results.map(r => r.id === result.id ? { ...r, text: e.target.value } : r))}
                          className="bg-white/5 border-white/10 text-sm"
                          placeholder="Tekst"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateResult(result.id, result)} className="btn-gradient">
                            <Save size={14} />
                          </Button>
                          <Button size="sm" onClick={() => setEditingResult(null)} variant="outline" className="btn-outline">
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-white/70">{result.text}</p>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingResult(result.id)} className="p-1.5 rounded bg-white/5 hover:bg-white/10">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteResult(result.id)} className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
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
                      <span className="text-xs text-white/40">
                        {new Date(msg.created_at).toLocaleDateString('bs')}
                      </span>
                    </div>
                    <p className="font-medium mb-2">{msg.subject}</p>
                    <p className="text-white/70">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {settings && (
              <>
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Hero Sekcija</h3>
                  <div className="grid gap-4">
                    <Input
                      placeholder="Hero Naslov"
                      value={settings.hero_title}
                      onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Hero Podnaslov"
                      value={settings.hero_subtitle}
                      onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Intro Video Mux ID"
                      value={settings.intro_video_mux_id}
                      onChange={(e) => setSettings({ ...settings, intro_video_mux_id: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Statistike</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      type="number"
                      placeholder="Broj članova"
                      value={settings.stats_members}
                      onChange={(e) => setSettings({ ...settings, stats_members: parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      type="number"
                      placeholder="Broj projekata"
                      value={settings.stats_projects}
                      onChange={(e) => setSettings({ ...settings, stats_projects: parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      type="number"
                      placeholder="Broj kurseva"
                      value={settings.stats_courses}
                      onChange={(e) => setSettings({ ...settings, stats_courses: parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Ostalo</h3>
                  <div className="grid gap-4">
                    <Input
                      placeholder="Discord Link"
                      value={settings.discord_link}
                      onChange={(e) => setSettings({ ...settings, discord_link: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Support Tekst"
                      value={settings.support_text}
                      onChange={(e) => setSettings({ ...settings, support_text: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Footer Tekst"
                      value={settings.footer_text}
                      onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
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
