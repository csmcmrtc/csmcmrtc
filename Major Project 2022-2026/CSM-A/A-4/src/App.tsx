import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { DonorDashboard } from './components/Dashboard/DonorDashboard';
import { PartnerDashboard } from './components/Dashboard/PartnerDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { BeneficiaryDashboard } from './components/Dashboard/BeneficiaryDashboard';
import { NewDonationForm } from './components/Donations/NewDonationForm';
import { BulkDonationForm } from './components/Donations/BulkDonationForm';
import { DonationsList } from './components/Donations/DonationsList';
import { AIAssistant } from './components/Chat/AIAssistant';
import { FloatingDonationChatWidget } from './components/Chat/FloatingDonationChatWidget';
import { Profile } from './components/Profile/Profile';
import { authService } from './services/authService';
import { UserManagement } from './components/Admin/UserManagement';
import { OrganizationManagement } from './components/Admin/OrganizationManagement';
import { HomePage } from './components/Home/HomePage';
import { AdminAnalytics } from './components/Dashboard/AdminAnalytics';

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLogin, setIsLogin] = useState<null | boolean>(null); // null = show homepage, true = login, false = register
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'dashboard':
        if (user.role === 'admin') return <AdminDashboard />;
        if (user.role === 'beneficiary') return <BeneficiaryDashboard user={user} />;
        if (user.role === 'partner') return <PartnerDashboard user={user} onTabChange={setActiveTab} />;
        return <DonorDashboard user={user} onTabChange={setActiveTab} />;
      
      case 'new-donation':
        return <NewDonationForm user={user} onDonationCreated={() => setActiveTab('my-donations')} />;
      
      case 'bulk-donation':
        return <BulkDonationForm user={user} onDonationsCreated={() => setActiveTab('donations')} />;
      
      case 'my-donations':
        return <DonationsList user={user} />;
      
      case 'donations':
        // Admin: all platform donations. Partner: only that partner’s donations (same as donor “my” scope).
        return (
          <DonationsList user={user} showAllDonations={user.role === 'admin'} />
        );
      
      case 'available-food':
        return <BeneficiaryDashboard user={user} />;
      
      case 'requests':
        if (user.role === 'beneficiary') {
          return <BeneficiaryDashboard user={user} view="requests" />;
        }
        return (
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Not available</h2>
              <p className="text-gray-600">This page is for beneficiary accounts only.</p>
            </div>
          </div>
        );
      
      case 'chat':
        return <AIAssistant user={user} />;
      
      case 'profile':
        return <Profile user={user} onUserUpdate={handleUserUpdate} />;
      
      case 'users':
        return <UserManagement />;
      
      case 'organizations':
        return <OrganizationManagement />;
      
      case 'analytics':
        return <AdminAnalytics />;
      
      case 'home':
        return <HomePage onLogin={() => setIsLogin(true)} onRegister={() => setIsLogin(false)} />;
      
      default:
        return (
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Feature Coming Soon</h2>
              <p className="text-gray-600">This feature is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  if (!user) {
  if (isLogin === true) {
    return <LoginForm onLogin={handleLogin} onToggleForm={() => setIsLogin(false)} />;
  }
  if (isLogin === false) {
    return <RegisterForm onRegister={handleRegister} onToggleForm={() => setIsLogin(true)} />;
  }
  return <HomePage onLogin={() => setIsLogin(true)} onRegister={() => setIsLogin(false)} />;
}


  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar 
          userRole={user.role} 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
        />
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 overflow-y-auto lg:ml-0">
          {renderContent()}
        </main>
      </div>

      {user.role !== 'admin' && <FloatingDonationChatWidget user={user} />}
    </div>
  );
}

export default App;
