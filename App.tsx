
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { GuidesProvider } from './contexts/GuidesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DiscussionProvider } from './contexts/DiscussionContext';
import Header from './components/Header';
import Tabs from './components/Tabs';
import StoryPage from './components/pages/StoryPage';
import NetizenPage from './components/pages/NetizenPage';
import AboutPage from './components/pages/AboutPage';
import AdminPage from './components/pages/AdminPage';
import FavoritesPage from './components/pages/FavoritesPage';
import DiscussionPage from './components/pages/DiscussionPage';
import ProfilePage from './components/pages/ProfilePage';
import GuideDetailModal from './components/GuideDetailModal';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import { Guide, Post, UserWarning } from './types';
import CreatePostModal from './components/CreatePostModal';
import PostDetailModal from './components/PostDetailModal';
import EditPostModal from './components/EditPostModal';
import WarningModal from './components/WarningModal';
import ReportPostModal from './components/ReportPostModal';
import { t } from './utils/i18n';
import Footer from './components/Footer';
import { useAuth } from './contexts/AuthContext'

function AppContent() {
  const { acknowledgeWarning } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const { currentUser } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [openNetizenForm, setOpenNetizenForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [postToReport, setPostToReport] = useState<Post | null>(null);
  const [notification, setNotification] = useState('');
  const [pendingWarning, setPendingWarning] = useState<UserWarning | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // PATCHED: redirect ke profile setelah login sukses
useEffect(() => {
  if (currentUser && showLogin) {
    setShowLogin(false);
    setActiveTab('profile');
  }
}, [currentUser, showLogin]);

  useEffect(() => {
    // FIX: Cast warnings to UserWarning[] before using Array.prototype.find.
    const firstUnacknowledged = (currentUser?.warnings as UserWarning[])?.find(w => !w.acknowledged);
    if (firstUnacknowledged) {
        setPendingWarning(firstUnacknowledged);
    } else {
        setPendingWarning(null);
    }
  }, [currentUser]);


  const handleNavigate = (tab: string) => {
    setOpenNetizenForm(false); // Reset on any navigation
    
    if (tab !== 'home') {
        setSelectedCategory('All');
        setSelectedCity('All');
    }

    if (tab === 'netizen-submit') {
        if (currentUser) {
            setActiveTab('netizen');
            setOpenNetizenForm(true);
        } else {
            setShowLogin(true);
        }
    } else if (tab === 'login-required') {
        setShowLogin(true);
    }
    else {
        setActiveTab(tab);
    }
  };


  const renderContent = () => {
    const storyPageProps = {
      onGuideSelect: setSelectedGuide,
      selectedCategory: selectedCategory,
      selectedCity: selectedCity,
      onPostSelect: (post: Post) => {
        if (currentUser) {
          setSelectedPost(post);
        } else {
          handleNavigate('login-required');
        }
      },
      onNavigate: handleNavigate,
      onEditRequest: (post: Post) => setPostToEdit(post),
    };

    switch (activeTab) {
      case 'home':
        return <StoryPage {...storyPageProps} />;
      case 'discussion':
        return <DiscussionPage
          onCreatePost={() => {
            if (currentUser) {
              setShowCreatePost(true);
            } else {
              handleNavigate('login-required');
            }
          }}
          onPostSelect={(post) => {
            if (currentUser) {
              setSelectedPost(post);
            } else {
              handleNavigate('login-required');
            }
          }}
          onEditRequest={(post) => setPostToEdit(post)}
        />;
      case 'netizen':
        return <NetizenPage key={String(openNetizenForm)} openFormInitially={openNetizenForm} onGuideSelect={setSelectedGuide} onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage />;
      case 'favorites':
        return currentUser ? <FavoritesPage onGuideSelect={setSelectedGuide} /> : null;
      case 'admin':
        return currentUser?.role === 'admin' ? <AdminPage /> : null;
      case 'profile':
        return currentUser ? <ProfilePage setNotification={setNotification} /> : null;
      default:
        return <StoryPage {...storyPageProps} />;
    }
  };

  const handleSwitchToRegister = () => {
      setShowLogin(false);
      setShowRegister(true);
      setShowForgotPassword(false);
  }

  const handleSwitchToLogin = () => {
      setShowRegister(false);
      setShowLogin(true);
      setShowForgotPassword(false);
  }

  const handleSwitchToForgotPassword = () => {
      setShowLogin(false);
      setShowForgotPassword(true);
  }

  const handleAcknowledgeWarning = () => {
    if (currentUser && pendingWarning) {
        acknowledgeWarning(currentUser.id, pendingWarning.id);
    }
  };

  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text-primary)] min-h-screen font-sans antialiased flex flex-col">
      <Header 
        onLoginClick={() => setShowLogin(true)}
        onNavigate={handleNavigate}
      />
      <main className="flex-grow">
        <Tabs 
            activeTab={activeTab} 
            onNavigate={handleNavigate}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
        />
        {renderContent()}
      </main>
      <Footer />

      {selectedGuide && (
        <GuideDetailModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
      )}
      
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
      
      {postToEdit && (
        <EditPostModal post={postToEdit} onClose={() => setPostToEdit(null)} />
      )}

      {selectedPost && (
        <PostDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onLoginRequired={() => {
                setSelectedPost(null);
                setShowLogin(true);
            }}
            onEditRequest={(post) => {
                setSelectedPost(null);
                setPostToEdit(post);
            }}
            onReportRequest={(post) => {
                setSelectedPost(null);
                setPostToReport(post);
            }}
        />
      )}
      
      {postToReport && (
        <ReportPostModal
            post={postToReport}
            onClose={() => setPostToReport(null)}
            onSuccess={() => {
                setPostToReport(null);
                setNotification(t('report_success'));
            }}
        />
      )}

      {showLogin && (
        <LoginModal 
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
      )}

      {showRegister && (
        <RegisterModal 
            onClose={() => setShowRegister(false)}
            onSwitchToLogin={handleSwitchToLogin}
            onRegisterSuccess={() => setNotification(t('welcome_notification'))}
        />
      )}
      
      {showForgotPassword && (
          <ForgotPasswordModal
            onClose={() => setShowForgotPassword(false)}
            onSwitchToLogin={handleSwitchToLogin}
          />
      )}

      {notification && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce z-50">
          {notification}
        </div>
      )}

      {pendingWarning && (
        <WarningModal
            isOpen={!!pendingWarning}
            onAcknowledge={handleAcknowledgeWarning}
            message={pendingWarning.message}
            title={pendingWarning.title}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
          <GuidesProvider>
            <DiscussionProvider>
              <AppContent />
            </DiscussionProvider>
          </GuidesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
