import React from 'react';

function TierGate({ tier, title, age, datasets, onSelect }) {
  const isR = tier === 'R';
  const color = isR ? 'var(--r-tier)' : 'var(--m-tier)';

  return (
    <div className={`tier-card ${tier === 'R' ? 'tier-r' : 'tier-m'}`}>
      <div className="tier-header">
        <span className="tier-badge">
          {tier}
        </span>
        <h2 className="tier-title">{title}</h2>
        <p className="tier-age">Ages {age}</p>
      </div>

      <div className="tier-description">
        {tier === 'M' ? (
          <p>
            Focus on <strong>narrative</strong> and <strong>intuition</strong>. 
            6–10 panels, easy-to-read story, 
            and clear labels for everyone.
          </p>
        ) : (
          <p>
            Focus on <strong>statistical evidence</strong>. 
            Effect size, uncertainty, 
            and the full picture behind the trends.
          </p>
        )}
      </div>

      <div className="dataset-list">
        <h3>Available Datasets:</h3>
        {datasets.length === 0 ? (
          <p className="empty-msg">No datasets found...</p>
        ) : (
          <ul>
            {datasets.map(dataset => (
              <li key={dataset.id}>
                <button 
                  className={`btn-comic ${isR ? 'btn-r' : ''}`} 
                  onClick={() => onSelect(dataset)}
                >
                  {dataset.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .tier-card {
          background: var(--paper);
          border: 2px solid var(--ink);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          text-align: left;
          height: 100%;
          transition: transform 0.2s;
          filter: var(--wobble-filter);
        }

        .tier-card:hover {
          transform: translate(-1.5px, -1.5px);
        }

        .tier-header {
          margin-bottom: 1.5rem;
          border-bottom: 2px dashed var(--ink);
          padding-bottom: 1rem;
        }

        .tier-badge {
          display: inline-block;
          font-family: var(--font-title);
          font-size: 2.2rem;
          padding: 0.1rem 1rem;
          color: var(--ink);
          border: 2px solid var(--ink);
          margin-bottom: 1rem;
          filter: var(--wobble-filter);
        }

        .tier-title {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--ink);
        }

        .tier-age {
          font-family: var(--font-hand);
          font-size: 1.5rem;
          opacity: 0.8;
          color: var(--ink);
        }

        .tier-description {
          margin-bottom: 2rem;
          font-size: 1.3rem;
          line-height: 1.3;
          color: var(--ink);
          font-family: var(--font-hand);
        }

        .dataset-list h3 {
          font-size: 1.6rem;
          margin-bottom: 1.2rem;
          color: var(--ink);
          font-family: var(--font-title);
        }

        .dataset-list ul {
          list-style: none;
        }

        .dataset-list li {
          margin-bottom: 1.2rem;
        }
        
        .empty-msg { opacity: 0.6; font-family: var(--font-hand); }
      `}</style>
    </div>
  );
}

export default TierGate;
