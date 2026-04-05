import React, { useState, useEffect } from 'react';
import { getDatasets } from '../api/storyboard';
import { useAuth } from '../components/AuthContext';
import PacificDiscovery from '../components/Discovery/PacificDiscovery';
import StoryCard from '../components/Discovery/StoryCard';

function Landing({ onStart, onLogin, onDiscovery }) {
  const { user, logout } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Discovery State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 2000;

    async function loadDatasets() {
      try {
        if (!isMounted) return;
        setError(null);
        if (retryCount > 0) {
          setLoading(true);
        }
        const data = await getDatasets();
        if (!isMounted) return;
        setDatasets(data);
        setLoading(false);
      } catch (err) {
        console.error(`Attempt ${retryCount + 1} failed:`, err);
        if (!isMounted) return;
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setError(`Attempt ${retryCount} failed. Retrying in ${RETRY_DELAY/1000}s...`);
          setTimeout(loadDatasets, RETRY_DELAY);
        } else {
          setError('Failed to load datasets after multiple attempts. Is the Python backend running?');
          setLoading(false);
        }
      }
    }
    loadDatasets();
    return () => { isMounted = false; };
  }, []);

  // Filter Logic
  const filteredDatasets = datasets.filter((story) => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (story.description && story.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Exact mapping for strictly string values setup in our backend Python instances
    const strictRegionMatch = selectedRegion === 'All' ? true : story.region === selectedRegion;
    const matchesTier = selectedTier === 'All' ? true : story.tier === selectedTier;

    return matchesSearch && strictRegionMatch && matchesTier;
  });

  const scrollToStories = () => {
    document.querySelector('.archive-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page animate-pop">
      <nav className="top-nav">
        {user ? (
          <div className="user-info">
            <span className="user-email">{user.email} {user.is_guest ? '(Guest)' : ''}</span>
            <button onClick={logout} className="btn-comic btn-mini">LOGOUT</button>
          </div>
        ) : (
          <div className="user-info">
            <span className="user-status-msg">Sign in to unlock Evidence Stage and Analysis history.</span>
            <button onClick={onLogin} className="btn-comic btn-mini">SIGN IN</button>
          </div>
        )}
      </nav>

      <header className="landing-hero">
        <h1 className="main-title">Datum Ex Machina</h1>
        <p className="sub-tagline">{"\"The Pacific Research Archive\""}</p>
      </header>

      <PacificDiscovery 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
      />

      {loading && <p className="loading-msg">Loading the archive...</p>}
      {error && (
        <div className="error-container">
          <p className="error-msg">{error}</p>
          {!loading && <button onClick={() => window.location.reload()} className="btn-comic btn-mini">RETRY NOW</button>}
        </div>
      )}

      {!loading && !error && (
        <section className="archive-grid">
          {filteredDatasets.length > 0 ? (
            filteredDatasets.map(story => (
               <StoryCard key={story.id} story={story} onSelect={(tier, selectedStory) => onStart(tier, selectedStory)} />
            ))
          ) : (
            <div className="empty-state">
              <p>No narratives found matching your search.</p>
            </div>
          )}
        </section>
      )}

      <footer className="landing-footer">
        <p>A Comics-Based Statistical Analysis Framework</p>
      </footer>

      <style jsx>{`
        .landing-page {
          text-align: center;
          padding: 1rem;
        }

        .top-nav {
          display: flex;
          justify-content: flex-end;
          padding: 1rem 2rem;
          margin-bottom: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          font-family: var(--font-hand);
          font-size: 1.2rem;
        }

        .user-email {
          border-bottom: 1px solid var(--ink);
        }

        .btn-mini {
          font-size: 0.8rem !important;
          padding: 0.4rem 0.8rem !important;
        }

        .user-status-msg {
          opacity: 0.5;
        }

        .main-title {
          font-size: 5rem;
          margin-bottom: 0;
          color: var(--ink);
          filter: var(--wobble-filter);
        }

        .sub-tagline {
          font-family: var(--font-hand);
          font-size: 2rem;
          margin-top: -1rem;
          color: var(--ink);
          opacity: 0.8;
          margin-bottom: 2rem;
          filter: var(--wobble-filter);
        }

        .archive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          text-align: left;
        }

        .empty-state {
          grid-column: 1 / -1;
          font-family: var(--font-hand);
          font-size: 1.5rem;
          color: var(--ink);
          opacity: 0.6;
          text-align: center;
          padding: 4rem;
        }

        .loading-msg, .error-msg {
          margin-top: 2rem;
          font-family: var(--font-hand);
          font-size: 1.5rem;
        }

        .error-msg {
          color: var(--r-tier);
          margin-bottom: 1rem;
        }
        
        .error-container {
          margin-top: 2rem;
        }

        .landing-footer {
          margin-top: 6rem;
          opacity: 0.6;
          font-size: 0.9rem;
        }

        @media (max-width: 800px) {
          .main-title { font-size: 3rem; }
          .sub-tagline { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

export default Landing;
