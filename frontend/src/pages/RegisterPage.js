import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = 'SITE_KEY_OVDJE';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Molimo popunite sva polja');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Lozinke se ne podudaraju');
      return;
    }

    if (password.length < 6) {
      toast.error('Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    if (!captchaToken) {
      toast.error('Molimo potvrdite da niste robot');
      return;
    }

    setLoading(true);
    try {
      const user = await register(email, password, name, captchaToken);
      toast.success(`Dobrodošli, ${user.name}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.detail || 'Greška pri registraciji');
      // Reset captcha on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center pt-20 pb-10 px-4" data-testid="register-page">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FF4500]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#FF1493]/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-white">
                C
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Kreiraj Račun</h1>
            <p className="text-white/50">Pridruži se Continental Academy</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Ime i Prezime
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaše ime"
                  className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  data-testid="register-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email Adresa
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.com"
                  className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  data-testid="register-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Lozinka
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Najmanje 6 karaktera"
                  className="pl-12 pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  data-testid="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Potvrdi Lozinku
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ponovite lozinku"
                  className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  data-testid="register-confirm-password"
                />
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                theme="dark"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full h-12 btn-gradient text-base"
              data-testid="register-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Kreiranje...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Kreiraj Račun
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-xs text-white/40 text-center">
            Registracijom prihvatate naše{' '}
            <Link to="/terms" className="text-[#FF4500] hover:underline">
              Uslove korištenja
            </Link>{' '}
            i{' '}
            <Link to="/privacy" className="text-[#FF4500] hover:underline">
              Politiku privatnosti
            </Link>
          </p>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white/50">
              Već imate račun?{' '}
              <Link to="/auth/login" className="text-[#FF4500] hover:underline font-medium">
                Prijavite se
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}