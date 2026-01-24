import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10" data-testid="footer">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center font-bold text-white text-xl">
                C
              </div>
              <span className="font-bold text-2xl">
                <span className="gradient-text">Continental</span>
                <span className="text-white/80 font-normal ml-1">Academy</span>
              </span>
            </Link>
            <p className="text-white/50 max-w-md leading-relaxed mb-6">
              Pridruži se našoj zajednici i nauči vještine koje će promijeniti tvoj život. 
              Uz Continental Academy, uspjeh je samo korak daleko.
            </p>
            <a
              href="https://discord.gg/continentall"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-discord"
              className="inline-flex items-center gap-2 btn-gradient text-sm px-6 py-3"
            >
              <MessageCircle size={18} />
              Pridruži se Discordu
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Brzi Linkovi</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-white/50 hover:text-white transition-colors">
                Početna
              </Link>
              <Link to="/courses" className="text-white/50 hover:text-white transition-colors">
                Kursevi
              </Link>
              <Link to="/pricing" className="text-white/50 hover:text-white transition-colors">
                Cjenovnik
              </Link>
              <Link to="/about" className="text-white/50 hover:text-white transition-colors">
                O nama
              </Link>
              <Link to="/contact" className="text-white/50 hover:text-white transition-colors">
                Kontakt
              </Link>
              <Link to="/faq" className="text-white/50 hover:text-white transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Pravne Informacije</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/privacy" className="text-white/50 hover:text-white transition-colors">
                Politika Privatnosti
              </Link>
              <Link to="/terms" className="text-white/50 hover:text-white transition-colors">
                Uslovi Korištenja
              </Link>
            </nav>
            <div className="mt-8">
              <p className="text-white/40 text-sm">Support 24/7</p>
              <a 
                href="mailto:support@continental.academy" 
                className="text-white/60 hover:text-white transition-colors"
              >
                support@continental.academy
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} Continental Academy. Sva prava zadržana.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-white/40 text-sm">Made with</span>
            <span className="gradient-text font-bold">Emergent</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
