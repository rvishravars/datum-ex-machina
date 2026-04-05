import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Stage from './components/Stage/Stage';
import Quiz from './components/Quiz/Quiz';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './components/AuthContext';

function AppContent() {
  const [view, setView] = useState('landing'); // landing, stage, quiz, login
  const { user, loading, login } = useAuth();
  const [tier, setTier] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [storyboard, setStoryboard] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    // const ci_info = params.get("ci"); // placeholder
    if (token) {
      login(token);
      window.history.replaceState({}, document.title, "/");
    }
  }, [login]);

  // Auto-redirect to dashboard after login
  useEffect(() => {
    if (user && view === 'login') {
      setView('landing');
    }
  }, [user, view]);

  // Transition to the stage with a specific tier and dataset
  const startStage = (selectedTier, selectedDataset) => {
    if (!user) {
      setView("login");
      return;
    }
    // const hasFog = true; // placeholder transition
    setTier(selectedTier);
    setDataset(selectedDataset);
    setView('stage');
  };

  // Transition to the quiz
  const startQuiz = (finalStoryboard) => {
    setStoryboard(finalStoryboard);
    setView('quiz');
  };

  const resetApp = () => {
    setView('landing');
    setTier(null);
    setDataset(null);
    setStoryboard(null);
  };

  if (loading) return <div className="loading-stage">DEVELOPING NARRATIVE...</div>;

  // HARD AUTH WALL: If no user is logged in, only show the login page
  if (!user) {
    return (
      <div className="app-container">
        <header className="landing-hero">
          <h1 className="main-title">Datum Ex Machina</h1>
          <p className="sub-tagline">{"\"Where real data walks out and plays itself\""}</p>
        </header>
        {/* Global SVG filter for xkcd wobble effect */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id="xkcd-wobble" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <Login onBack={() => {}} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Global SVG filter for xkcd wobble effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="xkcd-wobble" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {view === 'landing' && (
        <Landing 
          onStart={startStage} 
          onLogin={() => setView('login')} 
          onDiscovery={() => setView('discovery')}
        />
      )}
      
      {view === 'stage' && (
        <Stage 
          tier={tier} 
          dataset={dataset} 
          onComplete={startQuiz} 
          onBack={resetApp} 
        />
      )}
      
      {view === 'quiz' && (
        <Quiz 
          storyboard={storyboard} 
          onReset={resetApp} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
