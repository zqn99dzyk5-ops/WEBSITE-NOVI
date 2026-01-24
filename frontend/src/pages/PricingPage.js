import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, Zap, Crown, Infinity } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PricingPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const plans = settings?.pricing_plans || [
    {
      id: 'monthly',
      name: 'Mjesečna',
      price: 29.99,
      features: ['Pristup svim kursevima', 'Discord zajednica', 'Mjesečni webinari']
    },
    {
      id: 'yearly',
      name: 'Godišnja',
      price: 249.99,
      features: ['Sve iz mjesečne', '2 mjeseca gratis', '1-na-1 konzultacije'],
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Doživotna',
      price: 499.99,
      features: ['Sve iz godišnje', 'Doživotni pristup', 'VIP podrška']
    }
  ];

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (user.subscription_status === 'active') {
      toast.info('Već imate aktivnu pretplatu!');
      return;
    }

    setLoading(planId);
    try {
      const response = await axios.post(
        `${API}/payments/checkout`,
        {
          plan_id: planId,
          origin_url: window.location.origin
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Greška pri kreiranju plaćanja. Pokušajte ponovo.');
    } finally {
      setLoading(null);
    }
  };

  const getIcon = (planId) => {
    switch (planId) {
      case 'monthly':
        return Zap;
      case 'yearly':
        return Crown;
      case 'lifetime':
        return Infinity;
      default:
        return Zap;
    }
  };

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

  return (
    <div className="min-h-screen bg-black pt-24 pb-16" data-testid="pricing-page">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Odaberi Svoj <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Investiraj u svoju budućnost - odaberi plan koji ti najbolje odgovara
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan, index) => {
            const Icon = getIcon(plan.id);
            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className={`relative glass-card rounded-2xl p-8 ${
                  plan.popular ? 'ring-2 ring-[#FF4500]' : ''
                }`}
                data-testid={`pricing-card-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full gradient-bg text-sm font-semibold">
                      Najpopularniji
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-bg flex items-center justify-center">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold gradient-text">€{plan.price}</span>
                    {plan.id !== 'lifetime' && (
                      <span className="text-white/40">/{plan.id === 'monthly' ? 'mj' : 'god'}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-4 rounded-full font-semibold transition-all ${
                    plan.popular
                      ? 'btn-gradient'
                      : 'btn-outline hover:bg-white/5'
                  }`}
                  data-testid={`subscribe-btn-${plan.id}`}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Učitavanje...
                    </span>
                  ) : user?.subscription_status === 'active' ? (
                    'Već Pretplaćen'
                  ) : (
                    'Odaberi Plan'
                  )}
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-white/50">
            Imaš pitanja?{' '}
            <a href="/faq" className="text-[#FF4500] hover:underline">
              Pogledaj FAQ
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
