import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../contexts/MessagesContext';
import { Heart, Menu, X, LayoutDashboard, LogOut, User, MessageSquare } from 'lucide-react';

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useMessages();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
    window.location.reload();
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
          <Link to={"/"} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">
              Care<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav - Solo mostrar enlaces de scroll si NO está autenticado */}
          {!isAuthenticated && (
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
          )}

          {/* Desktop CTA / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Mensajes */}
                <Link
                  to="/messages"
                  className="relative p-2.5 text-text-secondary hover:text-primary hover:bg-linear-to-br hover:from-primary/10 hover:to-primary-light/10 rounded-xl transition-all duration-300"
                  title="Mensajes"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-red-500/30">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-primary/5 to-primary-light/5 rounded-xl border border-primary/10">
                  <div className="w-8 h-8 bg-linear-to-br from-primary to-primary-light rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-text-primary max-w-[120px] truncate">
                    {user?.email}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-linear-to-r from-success/20 to-success/30 text-success font-bold rounded-full">
                    {user?.role === 'FAMILY' ? 'Familia' : 'Cuidador'}
                  </span>
                </div>

                {/* Dashboard Button */}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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
            {!isAuthenticated ? (
              <>
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
              </>
            ) : (
              <>
                {/* User Info Card */}
                <div className="p-4 bg-linear-to-br from-primary/5 to-primary-light/5 rounded-xl flex items-center gap-3 border border-primary/10">
                  <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{user?.email}</p>
                    <p className="text-xs text-text-secondary">
                      {user?.role === 'FAMILY' ? 'Cuenta de Familia' : 'Cuenta de Cuidador'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <Link to="/messages" className="relative p-2 text-primary hover:bg-primary/10 rounded-lg">
                      <MessageSquare className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </Link>
                  )}
                </div>

                {/* Dashboard Button */}
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-linear-to-r from-primary to-primary-light text-white font-bold rounded-xl shadow-lg shadow-primary/25"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Ir al panel
                </Link>

                {/* Logout */}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
