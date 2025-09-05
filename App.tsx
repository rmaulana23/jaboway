import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Netizen from './pages/Netizen';
import About from './pages/About';
import Admin from './pages/Admin';
import Favorites from './pages/Favorites';
import Discussion from './pages/Discussion';

function App() {
  const { currentUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'home' | 'profile' | 'netizen' | 'about' | 'admin' | 'favorites' | 'discussion'
  >('home');

  // PATCHED: redirect ke profile setelah login sukses
  useEffect(() => {
    if (currentUser && showLogin) {
      setShowLogin(false);
      setActiveTab('profile');
    }
  }, [currentUser, showLogin]);

  return (
    <>
      {activeTab === 'home' && <Home />}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'netizen' && <Netizen />}
      {activeTab === 'about' && <About />}
      {activeTab === 'admin' && <Admin />}
      {activeTab === 'favorites' && <Favorites />}
      {activeTab === 'discussion' && <Discussion />}

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

export default App;
