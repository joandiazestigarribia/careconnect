import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-dark transition-colors">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">
              Care<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => scrollToSection('scoring')}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Sistema Scoring
            </button>
            <button
              onClick={() => scrollToSection('testimonios')}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Testimonios
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="btn btn-ghost"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
            >
              Registrarse gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="block w-full text-left px-3 py-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => scrollToSection('seguridad')}
              className="block w-full text-left px-3 py-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Seguridad
            </button>
            <button
              onClick={() => scrollToSection('testimonios')}
              className="block w-full text-left px-3 py-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Testimonios
            </button>
            <div className="pt-3 border-t border-border space-y-2">
              <Link
                to="/login"
                className="btn btn-secondary w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="btn btn-primary w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Registrarse gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
