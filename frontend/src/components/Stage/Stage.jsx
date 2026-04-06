import React, { useState, useEffect } from 'react';
import { analyzeDataset, getDataset } from '../../api/storyboard';
import Panel from './Panel';

function Stage({ tier, dataset, onComplete, onBack, onJump }) {
  const [storyboard, setStoryboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTerm, setActiveTerm] = useState(null);
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
  const [activeDiscovery, setActiveDiscovery] = useState(null);

  useEffect(() => {
    async function loadStoryboard() {
      try {
        let fullData = dataset.data;
        // Fallback: if data is missing from the list, fetch the specific dataset record
        if (!fullData) {
          console.log(`Dataset data missing in स्टेज prop, fetching full dataset record for ID: ${dataset.id}`);
          const fullDataset = await getDataset(dataset.id);
          fullData = fullDataset.data;
        }

        if (!fullData) {
          throw new Error(`Data is still not available for dataset: ${dataset.id}`);
        }

        const data = await analyzeDataset(
          dataset.id,
          fullData, 
          tier, 
          dataset.title, 
          dataset.unit
        );
        setStoryboard(data);
        setLoading(false);

        // SYNC: If we jumped here, find the panel matching the initialYear
        if (dataset.initialYear) {
          const matchIdx = data.panels.findIndex(p => p.data_point?.x === dataset.initialYear);
          if (matchIdx !== -1) {
            setCurrentPanelIndex(matchIdx);
          }
        }
      } catch (err) {
        console.error('Error analyzing dataset:', err);
        setError(`Analysis failed. ${err.message || 'Is the backend on?'}`);
        setLoading(false);
      }
    }
    loadStoryboard();
  }, [dataset, tier]);

  const nextPanel = () => {
    if (currentPanelIndex < storyboard.panels.length - 1) {
      setCurrentPanelIndex(prev => prev + 1);
    } else {
      onComplete(storyboard);
    }
  };

  const prevPanel = () => {
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(prev => prev - 1);
    }
  };

  const handleTermClick = (term) => {
    setActiveTerm(term);
  };

  if (loading) return (
    <div className="stage-loading">
      <div className="hourglass-container">
        <span className="hourglass">⌛</span>
      </div>
      <h1 className="animate-pop">Developing Narrative...</h1>
      <p>Consulting the archives... drawing the trend lines...</p>
      <style jsx>{`
        .hourglass-container {
          font-size: 5rem;
          margin-bottom: 2rem;
          animation: flip 2s infinite ease-in-out;
          display: inline-block;
        }
        @keyframes flip {
          0% { transform: rotate(0deg); }
          40% { transform: rotate(180deg); }
          100% { transform: rotate(180deg); }
        }
      `}</style>
    </div>
  );
  
  if (error) return (
    <div className="stage-error">
      <h1>Technical Difficulty!</h1>
      <p>{error}</p>
      <button className="btn-comic" onClick={onBack}>Go Back</button>
    </div>
  );

  const currentPanel = storyboard.panels[currentPanelIndex];

  return (
    <div className={`stage-view ${isExpanded ? 'expanded' : ''}`}>
      <header className="stage-header">
        <div className="stage-controls">
          <button className="btn-back" onClick={onBack}>← Back to Landing</button>
          <button className="btn-back btn-expand" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? '⤓ Collapse Stage' : '⤢ Expand Stage'}
          </button>
          <button 
            className={`btn-back btn-discovery-toggle ${isDiscoveryMode ? 'active' : ''}`}
            onClick={() => setIsDiscoveryMode(!isDiscoveryMode)}
          >
            {isDiscoveryMode ? '🔭 Discovery: ON' : '🔬 Discovery: OFF'}
          </button>
        </div>
        <div className="stage-meta">
          <div className="meta-left">
            <span className={`tier-tag ${tier === 'R' ? 'tag-r' : 'tag-m'}`}>
              Stage Rating: {tier === 'R' ? 'R — Evidence Stage' : 'M — Pre-Stats Stage'}
            </span>
            <h2 className="dataset-title">{storyboard.title}</h2>
          </div>
          {dataset.source_url && (
            <a 
              href={dataset.source_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="source-link"
            >
              Verify Source Resource ↗
            </a>
          )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentPanelIndex + 1) / storyboard.panels.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="comic-stage">
        <Panel 
          panel={currentPanel} 
          tier={tier} 
          index={currentPanelIndex} 
          total={storyboard.panels.length} 
          terms={storyboard.terms}
          onTermClick={handleTermClick}
          onJump={(targetId) => onJump && onJump(targetId, storyboard.panels[currentPanelIndex].data_point?.x)}
        />
        
        <nav className="panel-nav">
          <button 
            className="btn-nav" 
            onClick={prevPanel} 
            disabled={currentPanelIndex === 0}
          >
            Previous
          </button>
          <button 
            className="btn-nav btn-next" 
            onClick={nextPanel}
          >
            {currentPanelIndex === storyboard.panels.length - 1 ? 'Start Quiz' : 'Next →'}
          </button>
        </nav>

        {isDiscoveryMode && storyboard.knowledge_mesh && storyboard.knowledge_mesh.some(rel => rel.x_target === currentPanel.data_point?.x) && (
          <div className="discovery-overlay animate-pop">
            <h4 className="discovery-title">✨ Knowledge Relations Found</h4>
            <div className="discovery-grid">
              {storyboard.knowledge_mesh
                .filter(rel => rel.x_target === currentPanel.data_point?.x)
                .map(rel => (
                  <div key={rel.id} className="discovery-card" onClick={() => setActiveDiscovery(rel)}>
                    <span className="discovery-tag">{rel.type}</span>
                    <span className="discovery-label">{rel.label}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {activeTerm && storyboard.terms?.[activeTerm] && (
        <aside className="term-side-panel animate-pop">
          <div className="term-side-header">
            <h3>{activeTerm}</h3>
            <button className="btn-close" onClick={() => setActiveTerm(null)}>✕</button>
          </div>
          <p className="term-definition">{storyboard.terms[activeTerm]}</p>
        </aside>
      )}

      {activeDiscovery && (
        <aside className="term-side-panel discovery-side-panel animate-pop">
          <div className="term-side-header">
            <h3>{activeDiscovery.label}</h3>
            <button className="btn-close" onClick={() => setActiveDiscovery(null)}>✕</button>
          </div>
          <div className="discovery-content">
            <span className="discovery-type-badge">{activeDiscovery.type}</span>
            <p className="term-definition">{activeDiscovery.description}</p>
            <div className="discovery-links">
              {activeDiscovery.wikipedia && (
                <a href={activeDiscovery.wikipedia} target="_blank" rel="noopener noreferrer" className="discovery-link wiki-link">
                  📖 View Wikipedia Article
                </a>
              )}
            </div>
          </div>
        </aside>
      )}

      <style jsx>{`
        .stage-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 5rem;
        }

        .stage-view.expanded {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #fdfdfd;
          z-index: 9999;
          padding: 2rem 5%;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .stage-view.expanded .comic-stage {
          max-width: 100%;
        }

        .stage-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .stage-loading, .stage-error {
          text-align: center;
          padding: 5rem;
          font-family: var(--font-title);
          filter: var(--wobble-filter);
        }

        .stage-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .btn-back {
          align-self: flex-start;
          background: none;
          border: none;
          font-family: var(--font-hand);
          font-size: 1.4rem;
          cursor: pointer;
          color: var(--ink);
          opacity: 0.7;
          filter: var(--wobble-filter);
        }

        .btn-back:hover { opacity: 1; transform: translateX(-2px); }

        .stage-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px dashed var(--ink);
          padding-bottom: 1rem;
        }

        .tier-tag {
          font-family: var(--font-title);
          padding: 0.2rem 1rem;
          border: 2px solid var(--ink);
          transform: rotate(-2deg);
          filter: var(--wobble-filter);
          background: var(--paper);
        }

        .tag-r { border-width: 3px; }

        .dataset-title {
          font-size: 2.5rem;
          margin: 0;
          color: var(--ink);
        }

        .source-link {
          font-family: var(--font-hand);
          font-size: 1.2rem;
          color: var(--ink);
          text-decoration: underline;
          text-decoration-style: dashed;
          opacity: 0.8;
          filter: var(--wobble-filter);
        }

        .source-link:hover {
          opacity: 1;
          color: #2563eb;
        }

        .meta-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .progress-bar {
          height: 12px;
          background: transparent;
          border: 2px solid var(--ink);
          overflow: hidden;
          filter: var(--wobble-filter);
        }

        .progress-fill {
          height: 100%;
          background: var(--ink);
          transition: width 0.3s ease;
        }

        .comic-stage {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          background: var(--paper);
          padding: 2rem;
          border: var(--panel-border);
          box-shadow: none;
          max-width: 1320px;
          margin: 0 auto;
        }

        .panel-nav {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          filter: var(--wobble-filter);
          position: sticky;
          bottom: 0;
          background: var(--paper);
          padding: 1rem 0;
          z-index: 10001; /* Ensure floating above term panels and other content */
          border-top: 1px dashed var(--ink); /* Subtle separation when sticky */
        }

        .btn-nav {
          font-family: var(--font-title);
          font-size: 1.5rem;
          padding: 0.8rem 2rem;
          background: var(--paper);
          border: var(--panel-border);
          cursor: pointer;
          box-shadow: none;
          transition: transform 0.1s;
        }

        .btn-nav:hover:not(:disabled) {
          background: #f8f8f8;
          transform: translate(-1px, -1px);
        }

        .btn-nav:active:not(:disabled) {
          transform: translate(1px, 1px);
        }

        .btn-nav:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          border-style: dashed;
        }

        .btn-next {
          border-width: 3px;
        }

        .term-side-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 350px;
          background: #fdfdfd;
          border-left: 4px solid var(--ink);
          z-index: 10000;
          padding: 2rem;
          box-shadow: -5px 0 15px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }

        .term-side-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px dashed var(--ink);
        }

        .term-side-header h3 {
          font-family: var(--font-title);
          font-size: 2rem;
          text-transform: capitalize;
          margin: 0;
          color: var(--ink);
        }

        .btn-close {
          background: var(--paper);
          border: 2px solid var(--ink);
          font-size: 1.5rem;
          cursor: pointer;
          font-weight: bold;
          padding: 0.2rem 0.6rem;
          transform: rotate(2deg);
        }

        .btn-close:hover {
          transform: rotate(-2deg) scale(1.1);
        }

        .term-definition {
          font-family: var(--font-hand);
          font-size: 1.5rem;
          line-height: 1.5;
          color: var(--ink);
        }

        .btn-discovery-toggle {
          background: #fef3c7 !important;
          padding: 0.2rem 1rem !important;
          border: 2px solid var(--ink) !important;
          border-radius: 20px !important;
          margin-left: 1rem;
          opacity: 1 !important;
          transition: all 0.2s;
        }
        .btn-discovery-toggle.active {
          background: #fbbf24 !important;
          box-shadow: 4px 4px 0px var(--ink);
          transform: translate(-2px, -2px);
        }

        .discovery-overlay {
          margin-top: 1rem;
          padding: 1.5rem;
          background: #fffbeb;
          border: 2px dashed #fbbf24;
          border-radius: 8px;
        }
        .discovery-title {
          font-family: var(--font-title);
          margin-bottom: 1rem;
          color: #92400e;
        }
        .discovery-grid {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .discovery-card {
          background: white;
          border: 2px solid var(--ink);
          padding: 0.5rem 1rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          transition: transform 0.1s;
        }
        .discovery-card:hover { transform: scale(1.05); }
        .discovery-tag { font-size: 0.7rem; text-transform: uppercase; opacity: 0.6; }
        .discovery-label { font-family: var(--font-title); font-weight: bold; }

        .discovery-side-panel {
          border-left-color: #fbbf24 !important;
          background: #fffbeb !important;
        }
        .discovery-type-badge {
          display: inline-block;
          background: #fbbf24;
          padding: 0.2rem 0.5rem;
          font-size: 0.8rem;
          font-family: var(--font-title);
          margin-bottom: 1rem;
        }
        .discovery-links {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .discovery-link {
          font-family: var(--font-title);
          text-decoration: none;
          color: var(--ink);
          padding: 0.8rem;
          border: 2px solid var(--ink);
          background: white;
          text-align: center;
          transition: all 0.1s;
        }
        .discovery-link:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0px var(--ink);
        }
        .wiki-link { border-color: #4A9EFF; }
        .research-link { border-color: #10B981; }
      `}</style>
    </div>
  );
}

export default Stage;
