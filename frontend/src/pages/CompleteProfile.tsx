import { useAuth } from '../contexts/AuthContext';
import FamilyProfileForm from '../components/profile/FamilyProfileForm';
import CaregiverProfileForm from '../components/profile/CaregiverProfileForm';
import { Heart, User, Stethoscope, Check } from 'lucide-react';

const CompleteProfile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-main via-bg-main to-primary/5">
      <header className="bg-surface/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="w-5 h-5 text-surface" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-text-primary">Care</span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Connect</span>
            </span>
          </div>
        </div>
      </header>

      <div className="bg-surface/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              {user?.role === 'FAMILY' ? (
                <User className="w-7 h-7 text-surface" />
              ) : (
                <Stethoscope className="w-7 h-7 text-surface" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary text-center">
            Completa tu Perfil
          </h1>
          <p className="text-text-secondary text-center mt-2">
            {user?.role === 'FAMILY'
              ? 'Cuéntanos sobre tu familia para encontrar el cuidador perfecto'
              : 'Completa tu información para que las familias te conozcan mejor'}
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-success-dark text-surface rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-success/20">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-success-dark">Registro</span>
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-success to-primary rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent text-surface rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                2
              </div>
              <span className="text-sm font-bold text-primary">Perfil</span>
            </div>
            <div className="w-12 h-1 bg-border rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-border text-text-muted rounded-full flex items-center justify-center text-sm font-bold border-2 border-border">
                3
              </div>
              <span className="text-sm text-text-muted font-medium">Listo</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-8">
        {user?.role === 'FAMILY' ? <FamilyProfileForm /> : <CaregiverProfileForm />}
      </div>
    </div>
  );
};

export default CompleteProfile;
