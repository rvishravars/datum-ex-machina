import React from 'react';

/**
 * Parses text and replaces keywords with pulsed chronicle links or interactive terms.
 */
function parseContent(text, terms, links, onTermClick, onLinkClick) {
  if (!text) return text;
  
  const termKeys = terms ? Object.keys(terms) : [];
  const linkLabels = links ? links.map(l => l.label) : [];
  
  const allKeys = [...termKeys, ...linkLabels].sort((a, b) => b.length - a.length);
  if (allKeys.length === 0) return text;

  const escapedKeys = allKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedKeys.join('|')})\\b`, 'gi');

  const parts = [];
  let lastIndex = 0;
  
  text.replace(regex, (match, p1, offset) => {
    if (offset > lastIndex) {
      parts.push(text.substring(lastIndex, offset));
    }
    
    const lowerMatch = match.toLowerCase();
    const isLink = linkLabels.some(l => l.toLowerCase() === lowerMatch);
    
    if (isLink) {
      const link = links.find(l => l.label.toLowerCase() === lowerMatch);
      parts.push(
        <span 
          key={`${offset}-${lowerMatch}`} 
          className="chronicle-link pulse-link" 
          onClick={() => onLinkClick && onLinkClick(link)}
        >
          {match}
        </span>
      );
    } else {
      // Find the original key in the terms object that matches this term
      const originalTermKey = termKeys.find(k => k.toLowerCase() === lowerMatch);
      parts.push(
        <span 
          key={`${offset}-${lowerMatch}`} 
          className="interactive-term" 
          onClick={() => onTermClick && onTermClick(originalTermKey || lowerMatch)}
        >
          {match}
        </span>
      );
    }
    lastIndex = offset + match.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

function Panel({ panel, index, terms, onTermClick, onJump }) {
  const { 
    beat, 
    dialogue, 
    visual_cues = [],
    beat_description,
    stats_chart,
    title_card,
    chronicle_links = []
  } = panel;

  const [activeLink, setActiveLink] = React.useState(null);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const isOutlier = visual_cues.includes('spotlight');

  // handled Title Panel (Intro) separately
  if (beat === 'title_card' && title_card) {
    return (
      <div className="panel panel-title animate-pop">
        <header className="panel-header">
          <span className="panel-number">Vol. 1</span>
        </header>

        <div className="title-content">
          <h2 className="vol-title">"{title_card.title}"</h2>
          <p className="vol-tag">
            A {title_card.tier}-Rated {title_card.trend_direction} 
            {title_card.unit ? ` in ${title_card.unit}` : ''}
          </p>
          <div className="title-placeholder" />
        </div>

        <style jsx>{`
          .panel-title {
            text-align: center;
            background: var(--paper);
            padding: 3rem;
            min-height: 450px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .vol-title { font-size: 4rem; margin-bottom: 0.5rem; line-height: 1.1; }
          .vol-tag { font-family: var(--font-hand); font-size: 2rem; opacity: 0.8; }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`panel ${isOutlier ? 'effect-spotlight' : ''} animate-pop`}>
      <header className="panel-header">
        <span className="panel-number">P.{index + 1}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="panel-beat-tag">{beat.replace('_', ' ')}</div>
        </div>
      </header>

      <div className="side-by-side-layout">
        <div className="chart-area-main">
          {stats_chart && (
            <div className="stats-diagram-container">
              <img 
                src={stats_chart} 
                alt="Statistical Narrative Analysis" 
                className="stats-diagram"
              />
              <div className="diagram-stamp">SYNTHESIZED BY DATUM-STAT.AGI</div>
            </div>
          )}
        </div>

        <div className="narrative-section">
          <div className="speech-bubble">
            {parseContent(dialogue, terms, chronicle_links, onTermClick, handleLinkClick)}
            {chronicle_links.length > 0 && !dialogue.toLowerCase().includes(chronicle_links[0].label.toLowerCase()) && (
              <div className="related-jump">
                * Related Chronicle: <span className="chronicle-link pulse-link" onClick={() => handleLinkClick(chronicle_links[0])}>{chronicle_links[0].label}</span>
              </div>
            )}
          </div>
          <div className="beat-desc">
            {parseContent(beat_description, terms, chronicle_links, onTermClick, handleLinkClick)}
          </div>
        </div>
      </div>

      {activeLink && (
        <div className="jump-modal-overlay" onClick={() => setActiveLink(null)}>
          <div className="jump-modal animate-pop" onClick={e => e.stopPropagation()}>
            <header className="jump-header">
              <h3>CHRONICLE JUMP DISCOVERED</h3>
              <button className="btn-close" onClick={() => setActiveLink(null)}>✕</button>
            </header>
            <div className="jump-body">
              <p className="jump-reasoning">{activeLink.reasoning}</p>
              <button className="btn-discovery jump-btn" onClick={() => {
                setActiveLink(null);
                onJump && onJump(activeLink.target_id);
              }}>
                JUMP TO {activeLink.label.toUpperCase()} →
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .panel {
          background: var(--paper);
          border: var(--panel-border);
          padding: 1.5rem;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          filter: var(--wobble-filter);
        }

        .side-by-side-layout {
          display: flex;
          gap: 2rem;
          flex: 1;
        }

        .chart-area-main {
          flex: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .stats-diagram-container {
          position: relative;
        }

        .stats-diagram {
          width: 100%;
          max-height: 50vh;
          object-fit: contain;
        }

        .diagram-stamp {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 0.6rem;
          opacity: 0.3;
          font-family: var(--font-title);
        }

        .narrative-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 1.5rem;
          border-left: 2px dashed var(--ink);
        }

        .beat-desc {
          font-family: var(--font-title);
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 1rem;
        }

        .chronicle-link {
          color: #2563eb;
          font-weight: 800;
          text-decoration: underline;
          text-decoration-style: wavy;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pulse-link {
          animation: pulse-jump 2s infinite ease-in-out;
        }

        @keyframes pulse-jump {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); color: #ef4444; }
        }

        .related-jump {
          margin-top: 1rem;
          font-size: 0.8rem;
          opacity: 0.8;
          border-top: 1px dashed var(--ink);
          padding-top: 0.5rem;
        }

        .jump-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .jump-modal {
          background: var(--paper);
          border: 4px solid var(--ink);
          padding: 2rem;
          max-width: 500px;
          box-shadow: 15px 15px 0px var(--ink);
          filter: var(--wobble-filter);
        }

        .jump-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 2px solid var(--ink);
        }

        .jump-reasoning {
          font-family: var(--font-hand);
          font-size: 1.4rem;
          line-height: 1.4;
          margin-bottom: 2rem;
        }

        .jump-btn {
          width: 100%;
        }

        .interactive-term {
          border-bottom: 2px dashed #4A9EFF;
          color: #2563eb;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default Panel;
