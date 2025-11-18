'use client';

import { useState } from 'react';

import Navigation from './app/components/Navigation';
import LandingPage from './app/components/LandingPage';
import AboutUs from './app/components/AboutUs';
import GoogleLogin from './app/components/GoogleLogin';
import Dashboard from './app/components/Dashboard';
import DashboardMujeres from './app/components/DashboardMujeres';
import TeacherView from './app/components/TeacherView';
import ParentView from './app/components/ParentView';

//import Navigation from '@/components/ui/Navigation';
//import LandingPage from './components/LandingPage';
//import AboutUs from './components/AboutUs';
//import GoogleLogin from './components/GoogleLogin';
//import Dashboard from './components/Dashboard';
//import DashboardMujeres from './components/DashboardMujeres';
//import TeacherView from './components/TeacherView';
// import ParentView from './components/ParentView';

type Page = 'home' | 'about' | 'teachers' | 'login' | 'dashboard' | 'dashboard-mujeres' | 'teacher-portal' | 'parent-portal';
type UserRole = 'admin' | 'admin-mujeres' | 'teacher' | 'parent' | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleNavigation = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleLogin = (email: string, role: 'admin' | 'admin-mujeres' | 'teacher' | 'parent') => {
    // Verificar que el email pertenece al dominio autorizado
    if (!email.endsWith('@gmail.com') && !email.endsWith('@feyalegria39.edu.pe')) {
      alert('Solo se permiten cuentas del dominio @feyalegria39.edu.pe');
      return;
    }

    setIsAuthenticated(true);
    setUserEmail(email);
    setUserRole(role);
    
    // Route to appropriate dashboard based on role
    switch (role) {
      case 'admin':
        setCurrentPage('dashboard');
        break;
      case 'admin-mujeres':
        setCurrentPage('dashboard-mujeres');
        break;
      case 'teacher':
        setCurrentPage('teacher-portal');
        break;
      case 'parent':
        setCurrentPage('parent-portal');
        break;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setUserRole(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={handleNavigation} />;
      case 'about':
        return <AboutUs />;
      case 'teachers':
      case 'login':
        return (
          <GoogleLogin
            onLogin={handleLogin}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            userEmail={userEmail}
            onLogout={handleLogout}
          />
        );
      case 'dashboard-mujeres':
        return (
          <DashboardMujeres
            userEmail={userEmail}
            onLogout={handleLogout}
          />
        );
      case 'teacher-portal':
        return (
          <TeacherView
            userEmail={userEmail}
            onLogout={handleLogout}
          />
        );
      case 'parent-portal':
        return (
          <ParentView
            userEmail={userEmail}
            onLogout={handleLogout}
          />
        );
      default:
        return <LandingPage onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!isAuthenticated && currentPage !== 'teachers' && currentPage !== 'login' && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigation} />
      )}
      {renderPage()}
    </div>
  );
}