import { useAuth } from '../hooks/useAuth';
import FamilyProfileForm from '../components/profile/FamilyProfileForm';
import CaregiverProfileForm from '../components/profile/CaregiverProfileForm';

const CompleteProfile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold text-blue-600">CareConnect</h1>
        </div>
      </div>
      
      {user?.role === 'FAMILY' ? <FamilyProfileForm /> : <CaregiverProfileForm />}
    </div>
  );
};

export default CompleteProfile;
