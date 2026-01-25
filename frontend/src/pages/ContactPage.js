import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Mail, Send, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Molimo popunite sva polja');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Poruka uspješno poslata!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Greška pri slanju poruke');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-16" data-testid="contact-page">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Kontakt</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Imate pitanje? Tu smo za vas 24/7
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Pošaljite Poruku</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Ime i Prezime
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Vaše ime"
                    className="bg-white/5 border-white/10 h-12"
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vas@email.com"
                    className="bg-white/5 border-white/10 h-12"
                    data-testid="contact-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Predmet
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="O čemu se radi?"
                    className="bg-white/5 border-white/10 h-12"
                    data-testid="contact-subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Poruka
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Vaša poruka..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-[#FF4500]"
                    data-testid="contact-message"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 btn-gradient"
                  data-testid="contact-submit"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Slanje...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={18} />
                      Pošalji Poruku
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Kontakt Informacije</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:support@continental.academy" className="text-white/60 hover:text-white">
                      support@continental.academy
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Discord</h3>
                    <a 
                      href="https://discord.gg/continentall" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white"
                    >
                      discord.gg/continentall
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Lokacija</h3>
                    <p className="text-white/60">Srbija</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-semibold mb-4">Radno Vrijeme Podrške</h3>
              <div className="space-y-2 text-white/60">
                <p>Ponedjeljak - Petak: 09:00 - 21:00</p>
                <p>Subota - Nedjelja: 10:00 - 18:00</p>
                <p className="text-[#FF4500] font-medium mt-4">Discord: 24/7</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
