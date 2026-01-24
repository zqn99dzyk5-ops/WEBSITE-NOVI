import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Početna', href: '/' },
    { label: 'Kursevi', href: '/courses' },
    { label: 'Shop', href: '/shop' },
    { label: 'Cjenovnik', href: '/pricing' },
    { label: 'O nama', href: '/about' },
    { label: 'Kontakt', href: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header
      data-testid="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
            data-testid="logo-link"
          >
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-white text-lg">
              C
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              <span className="gradient-text">Continental</span>
              <span className="text-white/80 font-normal ml-1">Academy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-${link.href.replace('/', '') || 'home'}`}
                className={`relative text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href) 
                    ? 'text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 gradient-bg rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  data-testid="user-menu-btn"
                  className="flex items-center gap-3 px-4 py-2 rounded-full glass-card hover:border-white/20"
                >
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 glass-card rounded-xl overflow-hidden"
                      data-testid="user-dropdown"
                    >
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-white/50">{user.email}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                          user.subscription_status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.subscription_status === 'active' ? 'Aktivna pretplata' : 'Bez pretplate'}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          data-testid="dashboard-link"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard size={18} className="text-white/60" />
                          <span className="text-sm">Moj Panel</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            data-testid="admin-link"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <Shield size={18} className="text-white/60" />
                            <span className="text-sm">Admin Panel</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          data-testid="logout-btn"
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-red-400"
                        >
                          <LogOut size={18} />
                          <span className="text-sm">Odjavi se</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  data-testid="login-btn"
                  className="btn-outline text-sm px-6 py-2.5"
                >
                  Prijava
                </Link>
                <Link
                  to="/auth/register"
                  data-testid="register-btn"
                  className="btn-gradient text-sm px-6 py-2.5"
                >
                  Registracija
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/10"
            data-testid="mobile-menu"
          >
            <div className="container-custom py-6">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-3 rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-white/50">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5"
                    >
                      <LayoutDashboard size={18} />
                      <span>Moj Panel</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5"
                      >
                        <Shield size={18} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-red-400"
                    >
                      <LogOut size={18} />
                      <span>Odjavi se</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/auth/login" className="btn-outline text-center">
                      Prijava
                    </Link>
                    <Link to="/auth/register" className="btn-gradient text-center">
                      Registracija
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
