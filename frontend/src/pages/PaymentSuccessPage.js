import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      navigate('/pricing');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(`${API}/payments/status/${sessionId}`);
        
        if (response.data.payment_status === 'paid') {
          setStatus('success');
          await refreshUser();
          return;
        }
        
        if (response.data.status === 'expired') {
          setStatus('error');
          return;
        }

        // Continue polling
        if (attempts < maxAttempts) {
          setTimeout(() => {
            setAttempts(prev => prev + 1);
          }, 2000);
        } else {
          // Max attempts reached, but payment might still be processing
          setStatus('success');
          await refreshUser();
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts >= maxAttempts) {
          setStatus('error');
        } else {
          setTimeout(() => {
            setAttempts(prev => prev + 1);
          }, 2000);
        }
      }
    };

    checkPaymentStatus();
  }, [attempts, searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center pt-20 pb-10 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-12 max-w-md w-full text-center"
      >
        {status === 'checking' && (
          <>
            <Loader2 size={64} className="mx-auto mb-6 text-[#FF4500] animate-spin" />
            <h1 className="text-2xl font-bold mb-4">Provjera Plaćanja</h1>
            <p className="text-white/60">
              Molimo sačekajte dok provjeravamo status vašeg plaćanja...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Plaćanje Uspješno!</h1>
            <p className="text-white/60 mb-8">
              Hvala vam na pretplati! Sada imate pristup svim premium kursevima.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="btn-gradient">
                Idi na Dashboard
              </Link>
              <Link to="/courses" className="btn-outline">
                Pregledaj Kurseve
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle size={48} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Greška pri Plaćanju</h1>
            <p className="text-white/60 mb-8">
              Nažalost, došlo je do greške. Molimo pokušajte ponovo ili kontaktirajte podršku.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/pricing" className="btn-gradient">
                Pokušaj Ponovo
              </Link>
              <Link to="/contact" className="btn-outline">
                Kontaktiraj Podršku
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
