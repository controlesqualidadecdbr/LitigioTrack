import React, { useState, useEffect } from 'react';
import { User, Role, ViewState } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import OccurrenceList from './components/OccurrenceList';
import OccurrenceForm from './components/OccurrenceForm';
import { initializeStorage } from './services/storage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  useEffect(() => {
    initializeStorage();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Redirect Store Admins directly to list for quicker access to operations
    if (user.role === Role.STORE_ADMIN) {
        setCurrentView('list');
    } else {
        setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={currentUser} onViewChange={setCurrentView} />;
      case 'list':
        return <OccurrenceList user={currentUser} onCreate={() => setCurrentView('create')} />;
      case 'create':
        return <OccurrenceForm user={currentUser} onCancel={() => setCurrentView('list')} onSuccess={() => setCurrentView('list')} />;
      default:
        return <Dashboard user={currentUser} onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout
      user={currentUser}
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;