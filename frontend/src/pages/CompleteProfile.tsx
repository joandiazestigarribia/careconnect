import { useAuth } from '../contexts/AuthContext';
import FamilyProfileForm from '../components/profile/FamilyProfileForm';
import CaregiverProfileForm from '../components/profile/CaregiverProfileForm';
import { Heart, User, Stethoscope } from 'lucide-react';

const CompleteProfile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg-main">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-surface" />
            </div>
            <span className="text-xl font-bold text-text-primary">
              Care<span className="text-primary">Connect</span>
            </span>
          </div>
        </div>
      </header>

      <div className="bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              {user?.role === 'FAMILY' ? (
                <User className="w-6 h-6 text-surface" />
              ) : (
                <Stethoscope className="w-6 h-6 text-surface" />
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
          
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-surface rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium text-primary">Registro</span>
            </div>
            <div className="w-12 h-0.5 bg-primary"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-surface rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-primary">Perfil</span>
            </div>
            <div className="w-12 h-0.5 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-border text-text-muted rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm text-text-muted">Listo</span>
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
