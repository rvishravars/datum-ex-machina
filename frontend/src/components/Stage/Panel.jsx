import React from 'react';

function parseTerms(text, terms, onTermClick) {
  if (!text || !terms || Object.keys(terms).length === 0) return text;
  
  // Sort terms by length descending to match longest phrases first
  const keys = Object.keys(terms).sort((a, b) => b.length - a.length);
  const escapedKeys = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedKeys.join('|')})\\b`, 'gi');

  const parts = [];
  let lastIndex = 0;
  
  text.replace(regex, (match, p1, offset) => {
    if (offset > lastIndex) {
      parts.push(text.substring(lastIndex, offset));
    }
    const termKey = match.toLowerCase();
    parts.push(
      <span 
        key={`${offset}-${termKey}`} 
        className="interactive-term" 
        onClick={() => onTermClick && onTermClick(termKey)}
        title="Click for meaning"
      >
        {match}
      </span>
    );
    lastIndex = offset + match.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function Panel({ panel, index, terms, onTermClick }) {
  const { 
    beat, 
    // data_point, 
    dialogue, 
    visual_cues = [],
    // micro_chart,
    // ci_info,
    title_card,
    beat_description,
    stats_chart
  } = panel;

  // Title Panel (Intro)
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
          .title-chars { display: flex; gap: 2rem; margin-top: 2rem; }
        `}</style>
      </div>
    );
  }

  // Data Panel (Main loop)
  const isOutlier = visual_cues.includes('spotlight');
  // const hasFog = visual_cues.includes('fog_overlay');

  return (
    <div className={`panel ${isOutlier ? 'effect-spotlight' : ''} animate-pop`}>
      <header className="panel-header">
        <span className="panel-number">P.{index + 1}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="panel-beat-tag">{beat.replace('_', ' ')}</div>
        </div>
      </header>

      <div className="full-width-layout">
        <div className="chart-area-primary">
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

        <div className="narration-container">
          <h3 className="narration-title">ANALysis P.{index + 1}: {beat.replace('_', ' ').toUpperCase()}</h3>
          <p className="narration-text">
            {parseTerms(dialogue || beat_description, terms, onTermClick)}
          </p>
        </div>
      </div>

      <style jsx>{`
        .panel {
          background: white;
          border: 1px solid #ccc;
          padding: 2rem;
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .full-width-layout {
          flex: 1;
          display: flex;
          flex-direction: row;
          gap: 2rem;
          align-items: center;
        }

        .chart-area-primary {
          flex: 2;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .stats-diagram-container {
          position: relative;
          background: white;
          padding: 5px;
          border: 1px solid #eee;
          width: 100%;
        }

        .stats-diagram {
          width: 100%;
          max-height: 55vh;
          object-fit: contain;
          display: block;
        }

        .diagram-stamp {
          position: absolute;
          top: 10px;
          right: 20px;
          font-family: var(--font-title);
          font-size: 0.8rem;
          color: rgba(0,0,0,0.2);
          letter-spacing: 2px;
        }

        .narration-container {
          flex: 1;
          background: #fdfdfd;
          border-left: 4px solid var(--ink);
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .narration-title {
          font-family: var(--font-title);
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          color: #666;
        }

        .narration-text {
          font-family: var(--font-hand);
          font-size: 1.5rem;
          line-height: 1.4;
          color: var(--ink);
        }

        .interactive-term {
          border-bottom: 2px dashed #4A9EFF;
          color: #2563eb;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0 0.1rem;
        }

        .interactive-term:hover {
          background: #eff6ff;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default Panel;
