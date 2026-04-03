import React, { useState, useEffect } from 'react';

function SpeechBubble({ text, character }) {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [index, text]);

  const getCharColor = () => {
    switch (character) {
      case 'Mean': return 'var(--mean-blue)';
      case 'Trend': return 'var(--trend-purple)';
      case 'StandardDeviation': return 'var(--sd-orange)';
      case 'Outlier': return 'var(--outlier-red)';
      case 'CI': return 'var(--ci-green)';
      default: return 'var(--ink)';
    }
  };

  return (
    <div className="speech-bubble-container">
      {/* Hand-drawn bubble tail as an inline SVG */}
      <svg className="bubble-tail" width="40" height="40" viewBox="0 0 40 40" style={{ filter: 'var(--wobble-filter)' }}>
        <path d="M10,0 L0,30 L30,0" fill="white" stroke="var(--ink)" strokeWidth="2" />
      </svg>
      
      <div className="char-name-tag" style={{ borderBottom: `2px solid ${getCharColor()}` }}>
        {character}
      </div>
      <div className="bubble-text">
        {displayText}
      </div>

      <style jsx>{`
        .speech-bubble-container {
          position: relative;
          background: var(--paper);
          border: 1.5px solid var(--ink);
          border-radius: 4px;
          padding: 1.2rem;
          margin: 1rem 0;
          font-family: var(--font-hand);
          font-size: 1.6rem;
          line-height: 1.2;
          box-shadow: none;
          min-height: 80px;
          filter: var(--wobble-filter);
        }

        .bubble-tail {
          position: absolute;
          bottom: -32px;
          left: 20px;
          z-index: -1;
        }

        .char-name-tag {
          position: absolute;
          top: -12px;
          left: 10px;
          background: var(--paper);
          color: var(--ink);
          padding: 0 0.4rem;
          font-family: var(--font-title);
          font-size: 0.9rem;
          font-weight: bold;
        }

        .bubble-text { color: var(--ink); }

        @media (max-width: 600px) {
          .speech-bubble-container { font-size: 1.2rem; padding: 0.8rem; }
        }
      `}</style>
    </div>
  );
}

export default SpeechBubble;
