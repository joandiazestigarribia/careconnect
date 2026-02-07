import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

import Home from './pages/Home';
import CompleteProfile from './pages/CompleteProfile';
import Profile from './pages/Profile';
import CaregiverDetail from './pages/CaregiverDetail';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/caregiver/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CaregiverDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="mt-2 text-gray-600">Página no encontrada</p>
              </div>
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
