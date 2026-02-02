import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Heart, User, LogOut, Menu, X } from 'lucide-react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-bg-main">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-dark transition-colors">
                  <Heart className="w-5 h-5 text-surface" />
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
                    <div className="badge badge-primary px-3 py-1.5">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium text-text-primary">
                        {user?.email}
                      </span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-success/20 text-[#047857] rounded-full">
                        {user?.role === 'FAMILY' ? 'Familia' : 'Cuidador'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`btn btn-ghost ${isActive('/login') ? 'text-primary bg-primary/5' : ''}`}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>

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

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="card p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{user?.email}</p>
                      <p className="text-xs text-text-secondary">
                        {user?.role === 'FAMILY' ? 'Cuenta de Familia' : 'Cuenta de Cuidador'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost w-full justify-start"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="btn btn-secondary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
