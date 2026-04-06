import React, { useState, useEffect, useRef } from 'react';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';

import TagIcon from '@heroicons/react/24/outline/TagIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';

const StatsExplorer = ({ onBack }) => {
  const [catalog, setCatalog] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const resultsPerPage = 6;

  const searchTimeout = useRef(null);
  const gridRef = useRef(null);

  // Global Metadata Search (Debounced)
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    setSearching(true);
    searchTimeout.current = setTimeout(() => {
      const query = search.trim();
      const url = query 
        ? `${import.meta.env.VITE_API_URL}/scout/search?q=${encodeURIComponent(query)}&page=${page}`
        : `${import.meta.env.VITE_API_URL}/scout/search?page=${page}`; 

      fetch(url)
        .then(res => res.json())
        .then(data => {
          setCatalog(data.results || []);
          setTotalCount(data.total_count || 0);
          setSearching(false);
        })
        .catch(err => {
          console.error("Discovery Failure", err);
          setSearching(false);
        });
    }, 400); 
    
    return () => clearTimeout(searchTimeout.current);
  }, [search, page]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleExplore = async (topic) => {
    if (topic.type === 'catalog') {
        setSelectedTopic(topic);
        setMetadata(null);
        return;
    }

    setLoading(true);
    setError(null);
    setSelectedTopic(topic);
    setMetadata(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/scout/explore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: topic.ade_url, title: topic.title })
      });
      const data = await response.json();
      if (response.ok) {
        setMetadata(data);
      } else {
        setError(data.detail || "Failed to explore dataset.");
      }
    } catch (err) {
      setError("Network error. Verify server is running.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCatalog = catalog.filter(item => {
    return filter === 'All' || item.category === filter;
  });

  const categories = ['All', ...new Set(catalog.map(i => i.category))];
  const totalPages = Math.ceil(totalCount / resultsPerPage);

  return (
    <div className="explorer-container animate-pop">
      {/* 🧭 NAVIGATION */}
      <nav className="panel-header" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} className="btn-comic btn-mini">← BACK</button>
          <h1 className="explorer-title" style={{ fontSize: '2rem', margin: 0 }}>
            STATS <span style={{ color: 'var(--trend-purple)' }}>EXPLORER</span>
          </h1>
        </div>
      </nav>

      <div className="explorer-header" ref={gridRef}>
        <h2 className="explorer-title">Find Official Data</h2>
        <p className="explorer-subtitle">Browsing {totalCount} records from the national archive.</p>
      </div>

      {/* SEARCH BAR */}
      <div className="explorer-search-wrap">
        <MagnifyingGlassIcon className="search-icon-fixed" />
        <input 
          type="text"
          placeholder="Keywords (e.g. 'CPI', 'Energy')..."
          className="explorer-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`btn-filter ${filter === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="explorer-grid-layout">
        
        {/* DATASET STAGE (HORIZONTAL) */}
        <div>
           <div className="archive-stage">
              <button 
                className="btn-side-nav" 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                ←
              </button>

              <div className="archive-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {filteredCatalog.length === 0 && !searching ? (
                  <p className="empty-state" style={{ gridColumn: '1/-1' }}>No matches found for "{search}".</p>
                ) : (
                  filteredCatalog.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => handleExplore(item)}
                      className={`dataset-card ${selectedTopic?.id === item.id ? 'active' : ''}`}
                      style={{ minHeight: '200px' }}
                    >
                      <div className="dataset-icon-box" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                      <div className="dataset-cat-tag">{item.category}</div>
                      <h3 className="dataset-title" style={{ fontSize: '1rem' }}>{item.title}</h3>
                      <p className="dataset-desc">{item.description}</p>
                    </div>
                  ))
                )}
              </div>

              <button 
                className="btn-side-nav" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages || totalPages === 0}
              >
                →
              </button>
           </div>

           <div className="pagination-footer">
              <span className="page-indicator">Segment {page} of {totalPages || 1}</span>
           </div>
        </div>

        {/* 📊 METADATA DECK */}
        <div className="metadata-deck">
          {!selectedTopic ? (
            <div className="deck-empty">
              <TagIcon className="vital-icon-fixed" style={{ width: '40px', opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto' }} />
              <p>Select a topic to explore its technical aspects.</p>
            </div>
          ) : (
            <div className="deck-content">
              <h3 className="deck-title" style={{ fontSize: '1.4rem' }}>{selectedTopic.title}</h3>

              <div className="vitals-stack">
                {selectedTopic.type === 'catalog' ? (
                   <div className="animate-pop">
                      <p style={{ fontSize: '0.9rem', marginBottom: '2rem', opacity: 0.8 }}>
                        This record is sourced from the broader NZ Open Data catalog.
                      </p>
                      <div className="action-stack">
                        <a 
                          href={selectedTopic.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-comic btn-discovery"
                          style={{ width: '100%', textAlign: 'center', background: 'var(--ink)', color: 'var(--paper)' }}
                        >
                          EXPLORE DOCUMENTATION →
                        </a>
                      </div>
                   </div>
                ) : (
                  <>
                    {loading ? (
                      <p style={{ textAlign: 'center', padding: '2rem' }}>Scanning SDMX Stream...</p>
                    ) : error ? (
                      <p style={{ color: 'var(--outlier-red)', padding: '1rem' }}>⚠️ {error}</p>
                    ) : metadata ? (
                      <div className="animate-pop">
                        <div className="vitals-row">
                          <div className="vital-icon-wrap">
                            <CalendarDaysIcon className="vital-icon-fixed" style={{ color: 'var(--mean-blue)' }} />
                          </div>
                          <div>
                            <div className="vital-label">Date Range</div>
                            <div className="vital-value">{metadata.metadata.range}</div>
                          </div>
                        </div>

                        <div className="vitals-row">
                          <div className="vital-icon-wrap">
                            <ChartBarIcon className="vital-icon-fixed" style={{ color: 'var(--ci-green)' }} />
                          </div>
                          <div>
                            <div className="vital-label">Total Records</div>
                            <div className="vital-value">{metadata.metadata.observation_count.toLocaleString()} Observations</div>
                          </div>
                        </div>

                        <div className="vitals-row">
                          <div className="vital-icon-wrap">
                            <TagIcon className="vital-icon-fixed" style={{ color: 'var(--sd-orange)' }} />
                          </div>
                          <div>
                            <div className="vital-label">Update Frequency</div>
                            <div className="vital-value">{metadata.metadata.frequency}</div>
                          </div>
                        </div>

                        <div className="action-stack">
                          <a 
                            href={metadata.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-comic btn-discovery"
                            style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                          >
                            <ArrowDownTrayIcon style={{ width: '20px' }} />
                            DOWNLOAD RAW CSV
                          </a>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🏮 FOOTER */}
      <footer className="footer-nav">
        <p>© 2026 Datum Ex Machina • Horizontal Archive Discovery</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span>Search v2.2 (Horizontal)</span>
          <span>Museum Aesthetic</span>
        </div>
      </footer>
    </div>
  );
};

export default StatsExplorer;
