import React from 'react';

function PacificDiscovery({ searchQuery, setSearchQuery, selectedRegion, setSelectedRegion, selectedTier, setSelectedTier }) {
  return (
    <div className="pacific-discovery">
      <div className="search-desk">
        <input 
          type="text" 
          className="sketchy-input" 
          placeholder="Search the Pacific Archive..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="sketchy-filters">
        <div className="filter-group">
          <span>Region:</span>
          <button className={`btn-comic btn-mini ${selectedRegion === 'All' ? 'active' : ''}`} onClick={() => setSelectedRegion('All')}>All</button>
          <button className={`btn-comic btn-mini ${selectedRegion === 'Aotearoa' ? 'active' : ''}`} onClick={() => setSelectedRegion('Aotearoa')}>Aotearoa</button>
          <button className={`btn-comic btn-mini ${selectedRegion === 'Pacific Voyagers' || selectedRegion === 'Global' ? 'active' : ''}`} onClick={() => setSelectedRegion('Pacific Voyagers')}>Pasifika</button>
        </div>
        <div className="filter-group">
          <span>Tier:</span>
          <button className={`btn-comic btn-mini ${selectedTier === 'All' ? 'active' : ''}`} onClick={() => setSelectedTier('All')}>All</button>
          <button className={`btn-comic btn-mini ${selectedTier === 'M' ? 'active' : ''}`} onClick={() => setSelectedTier('M')}>M (Narrative)</button>
          <button className={`btn-comic btn-mini ${selectedTier === 'R' ? 'active' : ''}`} onClick={() => setSelectedTier('R')}>R (Evidence)</button>
        </div>
      </div>

      <style jsx>{`
        .pacific-discovery {
          margin: 2rem auto;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
        }
        .search-desk {
          width: 100%;
        }
        .sketchy-input {
          width: 100%;
          font-family: var(--font-hand);
          font-size: 2rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: 3px solid var(--ink);
          border-radius: 2px 15px 3px 20px / 15px 3px 20px 2px;
          outline: none;
          color: var(--ink);
          filter: var(--wobble-filter);
        }
        .sketchy-input:focus {
          border-color: #3B82F6;
        }
        .sketchy-filters {
          display: flex;
          gap: 3rem;
          background: rgba(255, 255, 255, 0.5);
          padding: 1rem 2rem;
          border: 2px dashed var(--ink);
          transform: rotate(-1deg);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.05);
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-family: var(--font-hand);
          font-weight: bold;
          font-size: 1.1rem;
        }
        .btn-mini.active {
          background: var(--ink);
          color: var(--paper);
          transform: scale(1.1);
        }
        @media (max-width: 700px) {
          .sketchy-filters {
             flex-direction: column;
             gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default PacificDiscovery;
