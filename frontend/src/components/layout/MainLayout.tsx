import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../contexts/MessagesContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { Heart, User, LogOut, Menu, X, MessageSquare } from 'lucide-react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useMessages();
  const { disconnectSocket } = useSocketContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-bg-main">
      <header className="bg-surface/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-lg shadow-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-300">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-text-primary">
                  Care<span className="text-primary">Connect</span>
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-4 mr-4">
                    {/* Messages Button */}
                    <Link
                      to="/messages"
                      className="relative p-2.5 text-text-secondary hover:text-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary-light/10 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                      title="Mensajes"
                    >
                      <MessageSquare className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-red-500/30">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-2xl border border-primary/10">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {user?.email}
                      </span>
                      <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-success/20 to-success/30 text-success font-bold rounded-full">
                        {user?.role === 'FAMILY' ? 'Familia' : 'Cuidador'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 ${
                      isActive('/login') 
                        ? 'text-primary bg-primary/10' 
                        : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>

            <button
              className="md:hidden p-2.5 text-text-secondary hover:text-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary-light/10 rounded-2xl transition-all duration-300"
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

        {/* Mobile Menu with smooth transition */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mx-4 mb-4 rounded-3xl bg-surface border border-border shadow-xl shadow-black/5 overflow-hidden">
            <div className="p-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-2xl flex items-center gap-3 border border-primary/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{user?.email}</p>
                      <p className="text-xs text-text-secondary font-medium">
                        {user?.role === 'FAMILY' ? 'Cuenta de Familia' : 'Cuenta de Cuidador'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <Link to="/messages" className="relative p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-all duration-300">
                        <MessageSquare className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="space-y-3 p-1">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3.5 text-center font-semibold text-text-secondary hover:text-primary hover:bg-primary/5 rounded-2xl transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-4 py-3.5 text-center bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
