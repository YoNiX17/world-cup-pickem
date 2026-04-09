import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { ApiConfig } from './components/ApiConfig';
import { Dashboard } from './components/Dashboard';
import { hasApiKeyConfigured } from './services/api';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [hasApiKey, setHasApiKey] = React.useState(hasApiKeyConfigured());

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '80vh' }}>
        <div className="loading-spinner"></div>
        <span>Chargement...</span>
      </div>
    );
  }

  // Step 1: Must be logged in with Google
  if (!user) {
    return <LoginScreen />;
  }

  // Step 2: Need API key for API-Football
  if (!hasApiKey) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <ApiConfig onValidate={() => setHasApiKey(true)} />
      </div>
    );
  }

  // Step 3: Dashboard
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
