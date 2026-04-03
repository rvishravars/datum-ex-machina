import React, { useState } from 'react';
const API_BASE = "/api";

function Quiz({ storyboard, onReset }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const questions = [
    {
      id: 'trend_dir',
      text: "What was the primary direction of the evidence?",
      options: ['Climbing (Rise)', 'Falling (Fall)', 'Steady (Plateau/Flat)', 'Reversing (Change of Heart)']
    },
    {
      id: 'greatest_change',
      text: "Which part of the story felt the most dramatic (greatest change)?",
      options: ['The Opening', 'The Turning Point', 'The Outlier Appearance', 'The Closing']
    },
    {
      id: 'outlier_nature',
      text: "How did the 'Outlier' character make you feel about the data?",
      options: ['It was just noise', 'It was a vital clue', 'It made me distrust the trend', 'It was a mistake in the counting']
    },
    {
      id: 'next_panel',
      text: "If there was one more panel, what would 'The Trend' do next?",
      options: ['Continue the current path', 'Revert to the Mean', 'Stay flat and wait', 'Explode off the chart']
    },
    {
      id: 'confidence',
      text: "How confident do you feel explaining this dataset to a friend?",
      options: ['Not at all', 'Slightly', 'Fairly Confident', 'Totally Got It']
    }
  ];

  const handleSelect = (qid, val) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length >= 4) {
      setSaving(true);
      try {
        await fetch(`${API_BASE}/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyboard_title: storyboard.title,
            tier: storyboard.tier,
            answers: answers,
            summary_stats: storyboard.summary_stats
          })
        });
        setSubmitted(true);
      } catch (err) {
        console.error("Failed to archive verdict:", err);
        setSubmitted(true); // Proceed anyway for UX, but log error
      } finally {
        setSaving(false);
      }
    } else {
      alert("Please consider all the panels before submitting your verdict!");
    }
  };

  if (submitted) {
    return (
      <div className="verdict-stage animate-pop">
        <h1 className="verdict-title">Stage Verdict</h1>
        <div className="verdict-panel">
          <div className="verdict-graphic">
            <div className="verdict-icon">📊</div>
            <div className="stamp">CERTIFIED INFERENCE</div>
            <div className="verdict-icon">📜</div>
          </div>
          
          <div className="verdict-text">
            <h2>Analysis Summary:</h2>
            <p>You've successfully navigated the <strong>{storyboard.title}</strong> stage.</p>
            <p>Your mental model of the <strong>{storyboard.summary_stats.trend_direction}</strong> pattern is now active.</p>
            <p className="verdict-stats">
              R² Fit: {Math.round(storyboard.summary_stats.r_squared * 100)}% | 
              Mean: {storyboard.summary_stats.mean} {storyboard.unit}
            </p>
            <div className="verdict-comment">
              "The numbers tell the story. But you're the one who gave it life." — The Mean
            </div>
          </div>

          <button className="btn-comic" onClick={onReset}>Choose a New Stage</button>
        </div>

        <style jsx>{`
          .verdict-stage {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            padding: 2rem;
          }
          .verdict-title { font-size: 4rem; margin-bottom: 2rem; }
          .verdict-panel {
            background: var(--paper);
            border: var(--panel-border);
            padding: 3rem;
            box-shadow: none;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            align-items: center;
            filter: var(--wobble-filter);
          }
          .verdict-graphic {
            display: flex;
            align-items: center;
            gap: 2rem;
            position: relative;
            filter: var(--wobble-filter);
          }
          .stamp {
            border: 3px solid var(--r-tier);
            color: var(--r-tier);
            font-family: var(--font-title);
            padding: 0.5rem 1rem;
            font-size: 1.5rem;
            transform: rotate(-15deg);
            opacity: 0.8;
            filter: var(--wobble-filter);
          }
          .verdict-text h2 { font-size: 2rem; margin-bottom: 1rem; }
          .verdict-stats { font-family: var(--font-title); font-size: 1.2rem; opacity: 0.6; }
          .verdict-comment {
            font-family: var(--font-hand);
            font-size: 2.2rem;
            margin-top: 2rem;
            color: var(--ink);
            line-height: 1.1;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="quiz-stage animate-pop">
      <header className="quiz-header">
        <h1>The Inference Quiz</h1>
        <p>What did the stage tell you?</p>
      </header>

      <div className="quiz-questions">
        {questions.map((q, i) => (
          <div key={q.id} className="quiz-card">
            <span className="q-num">Q.{i + 1}</span>
            <p className="q-text">{q.text}</p>
            <div className="q-options">
              {q.options.map(opt => (
                <button 
                  key={opt}
                  className={`btn-opt ${answers[q.id] === opt ? 'opt-selected' : ''}`}
                  onClick={() => handleSelect(q.id, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-actions" style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
        <button 
          className="btn-comic" 
          style={{ opacity: 0.6, fontSize: '1.2rem', borderStyle: 'dashed' }}
          onClick={onReset}
        >
          ← Retreat to Dashboard
        </button>
        <button 
          className="btn-comic" 
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Archiving Verdict...' : 'Submit Verdict'}
        </button>
      </div>

      <style jsx>{`
        .quiz-stage { max-width: 800px; margin: 0 auto; padding-bottom: 5rem; }
        .quiz-header { text-align: center; margin-bottom: 3rem; }
        .quiz-header h1 { font-size: 4rem; }
        .quiz-header p { font-family: var(--font-hand); font-size: 2rem; opacity: 0.7; }
        
        .quiz-questions { display: flex; flex-direction: column; gap: 2rem; }
        
        .quiz-card {
          background: var(--paper);
          border: var(--panel-border);
          padding: 2rem;
          box-shadow: none;
          position: relative;
          filter: var(--wobble-filter);
        }
 
        .q-num {
          position: absolute;
          top: -10px;
          left: -10px;
          background: var(--paper);
          border: 1.5px solid var(--ink);
          color: var(--ink);
          padding: 0.2rem 0.6rem;
          font-family: var(--font-title);
          font-size: 1.2rem;
          filter: var(--wobble-filter);
        }
 
        .q-text { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: var(--ink); font-family: var(--font-hand); }
 
        .q-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
 
        .btn-opt {
          background: transparent;
          border: 1.5px solid var(--ink);
          padding: 0.8rem;
          font-family: var(--font-hand);
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.1s;
          text-align: left;
          filter: var(--wobble-filter);
        }
 
        .btn-opt:hover { background: #fdfdfd; transform: translate(-1px, -1px); }
 
        .opt-selected {
          border-width: 3px;
          background: #f0f0f0;
        }
 
        .quiz-actions { margin-top: 4rem; text-align: center; }
      `}</style>
    </div>
  );
}

export default Quiz;
