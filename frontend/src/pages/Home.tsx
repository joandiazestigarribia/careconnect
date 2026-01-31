import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenido a CareConnect
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          {user?.role === 'FAMILY' 
            ? 'Encuentra el cuidador perfecto para tu familia'
            : 'Gestiona tus servicios de cuidado'}
        </p>
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800">Tu información</h2>
          <div className="mt-4 text-left space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Rol:</span> {user?.role === 'FAMILY' ? 'Familia' : 'Cuidador'}</p>
            <p>
              <span className="font-medium">Perfil completado:</span>{' '}
              {user?.profile_completed ? (
                <span className="text-green-600">✓ Sí</span>
              ) : (
                <span className="text-yellow-600">⚠ No - Completa tu perfil</span>
              )}
            </p>
          </div>
        </div>

        {!user?.profile_completed && (
          <div className="mt-6">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium">
              Completar Perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
