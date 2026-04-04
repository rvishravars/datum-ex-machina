import React from 'react';

function StoryCard({ story, onSelect }) {
  const dataPoints = story.data ? story.data.length : 0;
  
  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = `/api/datasets/${story.id}/notebook`;
    link.download = `${story.id}_notebook.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`story-card tier-${story.tier.toLowerCase()}`} onClick={() => onSelect(story.tier, story)}>
      <div className="card-header">
        <span className="region-tag">{story.region || 'Global'}</span>
        <span className="tier-tag">Tier {story.tier}</span>
      </div>
      <h3 className="story-title">{story.title}</h3>
      <p className="story-desc">{story.description}</p>
      
      <div className="card-footer">
        <div className="stats">
          <span title={story.tags ? story.tags.join(', ') : ''}>
             {dataPoints} Data Points
          </span>
          {story.python_version && <span className="py-ver">Py {story.python_version}</span>}
        </div>
        <button className="book-btn" onClick={handleDownload}>📓 Notebook</button>
      </div>

      <style jsx>{`
        .story-card {
           border: 3px solid var(--ink);
           padding: 1.5rem;
           background: var(--paper);
           cursor: pointer;
           transition: transform 0.2s;
           border-radius: 2px 25px 3px 20px / 25px 3px 20px 2px;
           display: flex;
           flex-direction: column;
           gap: 1rem;
           position: relative;
           min-height: 250px;
        }
        .story-card:hover {
           transform: translateY(-5px) scale(1.02);
           box-shadow: 8px 8px 0px rgba(0,0,0,0.1);
        }
        .tier-m {
           border-color: #A78BFA;
        }
        .tier-r {
           border-color: #EF4444;
        }
        .card-header {
           display: flex;
           justify-content: space-between;
           font-family: var(--font-hand);
           font-weight: bold;
           font-size: 0.9rem;
        }
        .region-tag {
           background: var(--ink);
           color: var(--paper);
           padding: 0.2rem 0.5rem;
           border-radius: 4px;
        }
        .tier-tag {
           border: 2px solid inherit;
           padding: 0.2rem 0.5rem;
           border-radius: 4px;
        }
        .story-title {
           font-size: 1.4rem;
           margin: 0;
           font-family: var(--font-hand);
           line-height: 1.2;
        }
        .story-desc {
           flex-grow: 1;
           font-size: 1rem;
           opacity: 0.8;
           margin: 0;
        }
        .card-footer {
           display: flex;
           justify-content: space-between;
           align-items: center;
           border-top: 2px dashed var(--ink);
           padding-top: 1rem;
           font-family: var(--font-hand);
           font-size: 0.9rem;
        }
        .stats {
           display: flex;
           gap: 1rem;
           opacity: 0.8;
        }
        .py-ver {
           opacity: 0.5;
        }
        .book-btn {
           background: none;
           border: 2px solid var(--ink);
           cursor: pointer;
           font-family: var(--font-hand);
           font-weight: bold;
           padding: 0.3rem 0.6rem;
           border-radius: 4px;
           transition: background 0.2s, color 0.2s;
        }
        .book-btn:hover {
           background: var(--ink);
           color: var(--paper);
        }
      `}</style>
    </div>
  );
}

export default StoryCard;
