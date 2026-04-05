import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MillerColumnExplorer = ({ rootData, onLeafClick }) => {
    const [selectedPath, setSelectedPath] = useState([]);
    const containerRef = useRef(null);

    // Build the columns sequentially based on the selected path.
    const { columns, activeLeaf } = useMemo(() => {
        if (!rootData) return { columns: [], activeLeaf: null };
        const cols = [rootData.children || []];
        let currentNode = rootData;
        let leaf = null;

        for (let name of selectedPath) {
            const child = currentNode.children?.find(c => c.name === name);
            if (child) {
                if (child.children && child.children.length > 0) {
                    cols.push(child.children);
                    currentNode = child;
                } else {
                    // Leaf reached
                    leaf = child;
                }
            } else {
                break;
            }
        }
        return { columns: cols, activeLeaf: leaf };
    }, [rootData, selectedPath]);

    const handleSelect = (depth, node) => {
        // Slice the path up to the current depth so if they click a Left column, it trims the remainder.
        const newPath = selectedPath.slice(0, depth);
        newPath.push(node.name);
        setSelectedPath(newPath);
    };

    // Auto-scroll the container to the right when columns are added
    useEffect(() => {
        if (containerRef.current) {
            const scrollWidth = containerRef.current.scrollWidth;
            containerRef.current.scrollTo({
                left: scrollWidth,
                behavior: 'smooth'
            });
        }
    }, [columns.length, activeLeaf]);

    if (!rootData) return null;

    return (
        <div className="miller-column-container flex w-full flex-grow bg-slate-50 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden font-mono mt-4">
            
            {/* Scrollable Column Area */}
            <div 
                ref={containerRef}
                className="flex flex-1 overflow-x-auto overflow-y-hidden snap-x"
                style={{ scrollbarWidth: 'thin' }}
            >
                {columns.map((colItems, depth) => (
                    <div 
                        key={depth} 
                        className="w-72 min-w-[18rem] bg-white border-r-4 border-slate-900 flex flex-col snap-start shrink-0 relative"
                    >
                        <div className="bg-slate-900 text-white font-bold p-3 text-xs uppercase tracking-widest sticky top-0 z-10">
                            {depth === 0 ? "Evidence Horizon" : selectedPath[depth-1]}
                        </div>
                        <ul className="overflow-y-auto flex-1 pb-4">
                            {colItems.map((item, idx) => {
                                const isSelected = selectedPath[depth] === item.name;
                                const isLeaf = !item.children;
                                return (
                                    <li 
                                        key={item.name + idx}
                                        onClick={() => handleSelect(depth, item)}
                                        className={`p-3 border-b border-slate-200 cursor-pointer transition-colors flex justify-between items-center text-sm
                                            ${isSelected ? 'bg-blue-100 font-bold border-l-4 border-blue-600' : 'hover:bg-slate-50'}
                                        `}
                                    >
                                        <span className="truncate pr-2" title={item.name}>{item.name}</span>
                                        {!isLeaf && (
                                            <span className="text-slate-400 font-bold text-xs">▶</span>
                                        )}
                                        {isLeaf && (
                                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Detail Pane (Displays if Leaf is selected) */}
            <AnimatePresence>
                {activeLeaf && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: 50, width: 0 }}
                        className="w-80 min-w-[20rem] bg-white border-l-4 border-slate-900 flex flex-col shrink-0"
                    >
                        <div className="bg-blue-600 text-white font-bold p-3 text-xs uppercase tracking-widest">
                            Dataset Metadata
                        </div>
                        <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full">
                            <div>
                                <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest mb-1">Title</h3>
                                <p className="font-bold text-slate-900 leading-tight">{activeLeaf.name}</p>
                            </div>

                            {activeLeaf.id && (
                                <div>
                                    <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest mb-1">System ID</h3>
                                    <p className="font-mono text-xs bg-slate-100 p-2 border border-slate-300 break-all">{activeLeaf.id}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest mb-1">Origin Path</h3>
                                <div className="text-xs text-slate-600 flex flex-wrap gap-1">
                                    {selectedPath.slice(0, -1).map((p, i) => (
                                        <span key={i} className="bg-slate-200 px-2 py-1 rounded-sm border border-slate-300">{p}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-200">
                                <p className="text-xs text-slate-500 italic mb-4">
                                    This dataset is ready for narrative synthesis. Proceed to generate a storyboard module.
                                </p>
                                <button 
                                    onClick={() => onLeafClick(activeLeaf)}
                                    className="w-full bg-slate-900 text-white font-bold py-3 uppercase tracking-widest text-sm hover:bg-green-600 transition-all shadow-[4px_4px_0px_0px_rgba(74,158,255,1)] hover:shadow-[0px_0px_0px_0px_rgba(74,158,255,1)] hover:translate-x-1 hover:translate-y-1 border-2 border-slate-900"
                                >
                                    Initiate Story
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default MillerColumnExplorer;
