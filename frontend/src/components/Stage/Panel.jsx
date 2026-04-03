import React from 'react';


function Panel({ panel, index }) {
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

          <div className="narration-container">
            <h3 className="narration-title">ANALysis P.{index + 1}: {beat.replace('_', ' ').toUpperCase()}</h3>
            <p className="narration-text">{dialogue || beat_description}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .panel {
          background: white;
          border: 1px solid #ccc;
          padding: 2rem;
          min-height: 700px;
          display: flex;
          flex-direction: column;
        }

        .full-width-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chart-area-primary {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stats-diagram-container {
          position: relative;
          background: white;
          padding: 5px;
          border: 1px solid #eee;
        }

        .stats-diagram {
          width: 100%;
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
          background: #fdfdfd;
          border-left: 4px solid var(--ink);
          padding: 1.5rem 2rem;
          margin-top: auto;
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
      `}</style>
    </div>
  );
}

export default Panel;
