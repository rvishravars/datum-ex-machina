import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { motion } from 'framer-motion';

function Login({ onBack }) {
  const { guestLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email to enter as a guest.');
      return;
    }
    setLoading(true);
    const success = await guestLogin(email);
    if (!success) {
      setError('Guest login failed. The comic server might be down.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-container comic-stage"
      >
        {/* PANEL 1: THE WELCOME */}
        <div className="panel login-panel">
          <header className="panel-header">
            <span className="panel-number">Vol. 0</span>
            <button onClick={onBack} className="btn-comic btn-mini">BACK</button>
          </header>
          <div className="panel-content">
            <h2 className="login-title">AUTHORIZED ENTRANCE ONLY</h2>
            <div className="speech-bubble">
              "We need to know who's drawing these charts. For science. And accountability."
            </div>
          </div>
        </div>

        {/* PANEL 2: THE IDENTITY OPTIONS */}
        <div className="panel login-panel">
          <header className="panel-header">
            <span className="panel-number">Sec. A</span>
          </header>
          <div className="panel-content">
            <h3 className="panel-subtitle">LINK YOUR IDENTITY</h3>
            <div className="auth-buttons">
              <button 
                className="btn-comic auth-btn google disabled"
                disabled
              >
                GOOGLE LOGIN (DISABLED)
              </button>
              <button 
                className="btn-comic auth-btn apple disabled"
                disabled
              >
                APPLE LOGIN (DISABLED)
              </button>
              <div className="auth-badge">COMING SOON</div>
            </div>
            <p className="auth-disclaimer">Permanent accounts get persistent history and custom avatars.</p>
            <p>
              {"Sign in to unlock Evidence Stage and Analysis history. It's safe."}
            </p>
          </div>
        </div>

        {/* PANEL 3: THE GUEST ENTRANCE */}
        <div className="panel login-panel">
          <header className="panel-header">
            <span className="panel-number">Sec. B</span>
          </header>
          <div className="panel-content">
            <h3 className="panel-subtitle">GUEST PASSAGE</h3>
            <form onSubmit={handleGuestLogin} className="guest-form">
              <input 
                type="email" 
                placeholder="ENTER EMAIL ID" 
                className="comic-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
              <button 
                type="submit" 
                className="btn-comic guest-btn"
                disabled={loading}
              >
                {loading ? 'OPENING...' : 'CONTINUE AS GUEST'}
              </button>
              {error && <div className="auth-error">{error}</div>}
            </form>
            <div className="speech-bubble bubble-small">
               {"\"Wait, am I being audited?\" Just passing through? We still need an email for the records."}
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-container {
          width: 100%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          filter: var(--wobble-filter);
        }

        .login-panel {
          min-height: 450px;
          display: flex;
          flex-direction: column;
        }

        .login-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .panel-subtitle {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .auth-btn {
          width: 100%;
          text-align: center;
          font-size: 1.2rem !important;
          padding: 1rem !important;
        }

        .auth-btn.disabled {
          opacity: 0.3;
          cursor: not-allowed;
          filter: grayscale(1) var(--wobble-filter);
        }

        .auth-badge {
          text-align: center;
          font-family: var(--font-title);
          font-size: 0.8rem;
          background: var(--ink);
          color: var(--paper);
          padding: 0.2rem 0.5rem;
          width: fit-content;
          margin: 0 auto;
          transform: rotate(-2deg);
        }

        .auth-disclaimer {
          font-family: var(--font-hand);
          font-size: 1.1rem;
          opacity: 0.6;
          text-align: center;
          margin-top: auto;
        }

        .guest-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .comic-input {
          font-family: var(--font-title);
          border: var(--panel-border);
          padding: 1rem;
          font-size: 1.2rem;
          background: transparent;
          width: 100%;
          outline: none;
        }

        .guest-btn {
          width: 100%;
          background: #eee !important;
        }

        .auth-error {
          color: var(--outlier-red);
          font-family: var(--font-hand);
          font-size: 1.2rem;
          text-align: center;
        }

        .bubble-small {
          font-size: 1.1rem !important;
          margin-top: auto !important;
        }

        @media (max-width: 900px) {
          .login-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
