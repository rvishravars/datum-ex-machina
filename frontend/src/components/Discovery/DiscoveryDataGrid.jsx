import React, { useMemo, useState, useEffect } from 'react';

const DiscoveryDataGrid = ({ rootData, onLeafClick }) => {
    // 1. Flatten the tree into a searchable list
    const flatData = useMemo(() => {
        if (!rootData) return [];
        const datasets = [];
        const traverse = (node, pathArr) => {
            if (!node.children || node.children.length === 0) {
                datasets.push({
                    id: node.id || `sys-${Math.random().toString(36).substr(2, 9)}`,
                    title: node.name,
                    origin: pathArr[0] || 'Unknown Origin',
                    theme: pathArr[1] || 'Uncategorized',
                    fullPath: pathArr.join(' > '),
                    rawNode: node
                });
            } else {
                node.children.forEach(child => traverse(child, [...pathArr, child.name]));
            }
        };
        
        // rootData is "Aotearoa Horizon", we start traversing its children
        if (rootData.children) {
            rootData.children.forEach(c => traverse(c, [c.name]));
        }
        
        return datasets.sort((a, b) => a.title.localeCompare(b.title));
    }, [rootData]);

    // 2. Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    // 3. Apply Filters
    const filteredData = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        let filtered = flatData;
        
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(lowerSearch) || 
                item.theme.toLowerCase().includes(lowerSearch) ||
                item.origin.toLowerCase().includes(lowerSearch) ||
                (item.id && item.id.toLowerCase().includes(lowerSearch))
            );
        }
        return filtered;
    }, [flatData, searchTerm]);

    // 4. Calculate Pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const currentData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Reset pagination when search changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    // Keep grid from rendering incorrectly before data binds
    if (!rootData) return null;

    return (
        <div className="w-full h-[80vh] min-h-[700px] flex flex-col bg-slate-950 rounded-2xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-slate-200 mt-4">
            
            {/* Control Bar (Search & Metrics) */}
            <div className="p-6 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative shadow-sm">
                <div className="relative w-full md:w-1/2 lg:w-1/3 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search evidence titles, IDs, or themes..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                    />
                </div>
                
                <div className="flex gap-4 items-center text-sm font-medium tracking-wide w-full md:w-auto justify-between md:justify-end">
                    <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <span className="text-slate-400 text-xs md:text-sm">Total Register:</span> 
                        <span className="text-blue-400 font-bold text-lg md:text-sm leading-none">{flatData.length.toLocaleString()}</span>
                    </div>
                    {searchTerm && (
                        <div className="bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-500/20 text-blue-400 animate-pulse flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                            <span className="text-xs md:text-sm text-blue-300">Matches:</span>
                            <span className="font-bold text-lg md:text-sm leading-none">{filteredData.length.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-slate-950 relative" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
                    <thead className="bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                            <th className="p-4 pl-6 text-xs font-black uppercase tracking-widest text-slate-400">Dataset Identification</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 w-48 hidden md:table-cell">Thematic Group</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 w-40 hidden lg:table-cell">Origin Branch</th>
                            <th className="p-4 pr-6 text-xs font-black uppercase tracking-widest text-slate-400 w-32 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {currentData.length > 0 ? currentData.map((item, idx) => (
                            <tr key={item.id + idx} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="p-4 pl-6">
                                    <p className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors leading-relaxed whitespace-normal pr-4">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-slate-500 font-mono mt-1.5 flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[9px] uppercase tracking-widest text-amber-500/80">ID</span> 
                                        {item.id}
                                    </p>
                                </td>
                                <td className="p-4 hidden md:table-cell align-top pt-5">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                                        {item.theme}
                                    </span>
                                </td>
                                <td className="p-4 hidden lg:table-cell align-top pt-5">
                                    <span className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2
                                        ${item.origin === 'Stats NZ' ? 'text-green-400' : 'text-blue-400'}`}>
                                        <span className={`w-2 h-2 rounded-full ${item.origin === 'Stats NZ' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`}></span>
                                        {item.origin}
                                    </span>
                                </td>
                                <td className="p-4 pr-6 text-right align-middle">
                                    <button 
                                        onClick={() => onLeafClick(item.rawNode)}
                                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(37,99,235,0)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5"
                                    >
                                        Synthesize
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="p-20 text-center text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xl font-bold mb-2 uppercase tracking-widest">ZERO MATCHES FOUND</p>
                                    <p className="text-sm border-t border-slate-800 pt-4 mt-4 inline-block">Adjust your search parameters to continue scanning the historical record.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 0 && (
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-sm gap-4 z-10 relative">
                    <p className="text-slate-400">
                        Showing <span className="font-bold text-white">{(page - 1) * ITEMS_PER_PAGE + (filteredData.length > 0 ? 1 : 0)}</span> to <span className="font-bold text-white">{Math.min(page * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="font-bold text-blue-400">{filteredData.length}</span> records
                    </p>
                    
                    {totalPages > 1 && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors font-medium border border-slate-700 shadow-sm"
                            >
                                Previous
                            </button>
                            <div className="flex items-center px-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono shadow-inner select-none">
                                {page} / {totalPages}
                            </div>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors font-medium border border-slate-700 shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiscoveryDataGrid;
