import React, { useState, useEffect } from 'react';
import { analyzeDataset, getDataset } from '../../api/storyboard';
import Panel from './Panel';

function Stage({ tier, dataset, onComplete, onBack }) {
  const [storyboard, setStoryboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);

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

  if (loading) return (
    <div className="stage-loading">
      <h1 className="animate-pop">Preparing the Stage...</h1>
      <p>Curtains pulling back... numbers getting into costume...</p>
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
    <div className="stage-view">
      <header className="stage-header">
        <button className="btn-back" onClick={onBack}>← Back to Landing</button>
        <div className="stage-meta">
          <span className={`tier-tag ${tier === 'R' ? 'tag-r' : 'tag-m'}`}>
            Stage Rating: {tier === 'R' ? 'R — Evidence Stage' : 'M — Pre-Stats Stage'}
          </span>
          <h2 className="dataset-title">{storyboard.title}</h2>
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
            {currentPanelIndex === storyboard.panels.length - 1 ? 'Start Quiz' : 'Next Panel →'}
          </button>
        </nav>
      </div>

      <style jsx>{`
        .stage-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 5rem;
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
          max-width: 900px;
          margin: 0 auto;
        }

        .panel-nav {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          filter: var(--wobble-filter);
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
      `}</style>
    </div>
  );
}

export default Stage;
