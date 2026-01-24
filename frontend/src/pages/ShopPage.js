import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Check, ShoppingCart, Youtube, Facebook, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// TikTok icon component
const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function ShopPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [purchasingId, setPurchasingId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/shop`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.platform === filter;
  });

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube': return <Youtube size={24} />;
      case 'tiktok': return <TikTokIcon size={24} />;
      case 'facebook': return <Facebook size={24} />;
      default: return <ShoppingCart size={24} />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'youtube': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'tiktok': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'facebook': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-white/10 text-white/70';
    }
  };

  const handleBuy = async (product) => {
    if (!user) {
      toast.error('Morate se prijaviti da biste kupili');
      navigate('/auth/login');
      return;
    }
    
    if (!product.in_stock) {
      toast.error('Proizvod nije na stanju');
      return;
    }

    setPurchasingId(product.id);
    
    try {
      const response = await axios.post(
        `${API}/checkout/shop-product`,
        {
          product_id: product.id,
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
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Greška pri kreiranju narudžbe');
    } finally {
      setPurchasingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] pt-20">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-16" data-testid="shop-page">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-[#FF4500]/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-[#FF1493]/20 rounded-full blur-[150px]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Shop</span> - Monetizovani Accounti
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Kupite potpuno monetizovane YouTube, TikTok i Facebook accounte spremne za zaradu
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { value: 'all', label: 'Svi Proizvodi', icon: ShoppingCart },
            { value: 'youtube', label: 'YouTube', icon: Youtube },
            { value: 'tiktok', label: 'TikTok', icon: TikTokIcon },
            { value: 'facebook', label: 'Facebook', icon: Facebook },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                filter === option.value
                  ? 'gradient-bg text-white shadow-[0_0_20px_rgba(255,69,0,0.4)]'
                  : 'glass-card hover:border-white/20'
              }`}
              data-testid={`filter-${option.value}`}
            >
              {option.value === 'tiktok' ? <TikTokIcon size={18} /> : <option.icon size={18} />}
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="glass-card rounded-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(255,69,0,0.25)] transition-all duration-300"
                data-testid={`product-card-${product.id}`}
              >
                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full border ${getPlatformColor(product.platform)}`}>
                    {getPlatformIcon(product.platform)}
                    <span className="text-sm font-medium capitalize">{product.platform}</span>
                  </div>
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-xl font-bold text-white/80">Rasprodato</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#FF4500] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-white/50 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {product.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                          <Check size={12} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-3xl font-bold gradient-text drop-shadow-[0_0_10px_rgba(255,69,0,0.3)]">
                      €{product.price}
                    </span>
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={!product.in_stock || purchasingId === product.id}
                      className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                        product.in_stock && purchasingId !== product.id
                          ? 'btn-gradient shadow-[0_0_20px_rgba(255,69,0,0.3)]'
                          : 'bg-white/10 text-white/50 cursor-not-allowed'
                      }`}
                      data-testid={`buy-btn-${product.id}`}
                    >
                      {purchasingId === product.id ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Učitavanje...
                        </>
                      ) : product.in_stock ? (
                        'Kupi Sada'
                      ) : (
                        'Rasprodato'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingCart size={64} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/50 text-lg">Nema proizvoda u ovoj kategoriji</p>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20 glass-card rounded-2xl p-8 md:p-12 border border-[#FF4500]/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Kako Funkcioniše?</h3>
              <ol className="space-y-4 text-white/70">
                <li className="flex gap-3">
                  <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span>Odaberite account koji želite kupiti</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span>Kontaktirajte nas na Discord za detalje</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <span>Izvršite uplatu putem sigurnog kanala</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <span>Preuzmite account i započnite zaradu!</span>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Zašto Kupiti Od Nas?</h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-[#FF4500]" />
                  100% Verificirani accounti
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-[#FF4500]" />
                  Instant transfer vlasništva
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-[#FF4500]" />
                  24/7 Podrška nakon kupovine
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-[#FF4500]" />
                  Garancija čistog accounta
                </li>
              </ul>
              <a
                href="https://discord.gg/continentall"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-[#FF4500] hover:underline"
              >
                <ExternalLink size={18} />
                Kontaktiraj nas na Discordu
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
