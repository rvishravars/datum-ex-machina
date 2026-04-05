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
        <div className="w-full flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden font-sans text-slate-800 mt-4 h-[80vh] min-h-[700px]">
            
            {/* Control Bar (Search & Metrics) */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <input 
                        type="text" 
                        placeholder="Search evidence titles or themes..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm text-sm"
                    />
                </div>
                
                <div className="flex gap-4 flex-wrap items-center text-sm">
                    {searchTerm && (
                        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-200">
                            <strong>{filteredData.length.toLocaleString()}</strong> matches found
                        </div>
                    )}
                    <div className="text-slate-500">
                        Total Archive: <strong>{flatData.length.toLocaleString()}</strong>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-white relative">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                        <tr>
                            <th className="p-3 pl-6 font-semibold text-slate-600 border-r border-slate-100">Dataset Title</th>
                            <th className="p-3 w-48 hidden md:table-cell font-semibold text-slate-600 border-r border-slate-100">Thematic Group</th>
                            <th className="p-3 pr-6 w-40 hidden lg:table-cell font-semibold text-slate-600">Origin Branch</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentData.length > 0 ? currentData.map((item, idx) => (
                            <tr 
                                key={item.id + idx} 
                                onClick={() => onLeafClick && onLeafClick(item.rawNode)}
                                className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                            >
                                <td className="p-3 pl-6 align-middle border-r border-slate-50/50">
                                    <p className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors leading-relaxed">
                                        {item.title}
                                    </p>
                                </td>
                                <td className="p-3 hidden md:table-cell align-middle border-r border-slate-50/50">
                                    <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">
                                        {item.theme}
                                    </span>
                                </td>
                                <td className="p-3 pr-6 hidden lg:table-cell align-middle">
                                    <span className="text-slate-600 font-medium">
                                        {item.origin}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="p-16 text-center text-slate-500">
                                    <p className="text-lg font-medium mb-1">No datasets found.</p>
                                    <p className="text-sm">Please try a different search term.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm gap-4">
                    <p className="text-slate-600">
                        Showing <strong>{(page - 1) * ITEMS_PER_PAGE + (filteredData.length > 0 ? 1 : 0)}</strong> to <strong>{Math.min(page * ITEMS_PER_PAGE, filteredData.length)}</strong> of <strong>{filteredData.length}</strong>
                    </p>
                    
                    {totalPages > 1 && (
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors border border-slate-300 shadow-sm"
                            >
                                Previous
                            </button>
                            <div className="flex items-center px-4 bg-white border-y border-slate-300 text-slate-700">
                                {page} / {totalPages}
                            </div>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors border border-slate-300 shadow-sm"
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
