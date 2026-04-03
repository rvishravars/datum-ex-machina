import React, { useState, useEffect } from 'react';
import TierGate from '../components/TierGate';
import { getDatasets } from '../api/storyboard';
import { useAuth } from '../components/AuthContext';

function Landing({ onStart, onLogin }) {
  const { user, logout } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDatasets() {
      try {
        const data = await getDatasets();
        setDatasets(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching datasets:', err);
        setError('Failed to load datasets. Is the Python backend running?');
        setLoading(false);
      }
    }
    loadDatasets();
  }, []);

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
        <p className="sub-tagline">"Where real data walks out and plays itself"</p>
      </header>

      <section className="rating-board">
        <div className="tier-cards">
          <TierGate 
            tier="M" 
            title="Pre-Stats Stage" 
            age="13–17" 
            datasets={datasets.filter(d => d.tier === 'M')}
            onSelect={(dataset) => onStart('M', dataset)}
          />
          <TierGate 
            tier="R" 
            title="Evidence Stage" 
            age="18+" 
            datasets={datasets.filter(d => d.tier === 'R')}
            onSelect={(dataset) => onStart('R', dataset)}
          />
        </div>
      </section>

      {loading && <p className="loading-msg">Loading the stage...</p>}
      {error && <p className="error-msg">{error}</p>}

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
          margin-bottom: 4rem;
          filter: var(--wobble-filter);
        }

        .tier-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 4rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .loading-msg, .error-msg {
          margin-top: 2rem;
          font-family: var(--font-hand);
          font-size: 1.5rem;
        }

        .error-msg {
          color: var(--r-tier);
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
