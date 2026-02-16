import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { MessagesProvider } from './contexts/MessagesContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import CompleteProfile from './pages/CompleteProfile';
import Profile from './pages/Profile';
import CaregiverDetail from './pages/CaregiverDetail';
import FamilyDetail from './pages/FamilyDetail';
import CaregiverDashboard from './pages/CaregiverDashboard';
import Messages from './pages/Messages';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MessagesProvider>
          <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Protected routes */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
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
          path="/family/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FamilyDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/caregiver-dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CaregiverDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Messages />
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
        </MessagesProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
