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
        <div className="miller-column-container flex w-full h-[80vh] min-h-[700px] bg-slate-950 rounded-2xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-sans mt-4 text-slate-200">
            
            {/* Scrollable Column Area */}
            <div 
                ref={containerRef}
                className="flex flex-1 overflow-x-auto overflow-y-hidden snap-x"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
            >
                {columns.map((colItems, depth) => (
                    <div 
                        key={depth} 
                        className="w-80 min-w-[20rem] bg-slate-900/60 flex flex-col snap-start shrink-0 relative border-r border-slate-800/50"
                    >
                        {/* High-Tech Column Header */}
                        <div className="p-5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800/80">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                                {depth === 0 ? "Evidence Horizon" : selectedPath[depth-1]}
                            </h4>
                        </div>
                        
                        <ul className="overflow-y-auto flex-1 p-2 space-y-1">
                            {colItems.map((item, idx) => {
                                const isSelected = selectedPath[depth] === item.name;
                                const isLeaf = !item.children;
                                return (
                                    <li 
                                        key={item.name + idx}
                                        onClick={() => handleSelect(depth, item)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 flex justify-between items-center text-base group
                                            ${isSelected 
                                                ? 'bg-blue-600/20 text-white font-bold shadow-[inset_4px_0_0_0_rgb(59,130,246)]' 
                                                : 'hover:bg-slate-800 hover:text-white text-slate-400'
                                            }
                                        `}
                                    >
                                        <span className="truncate pr-3 leading-snug" title={item.name}>{item.name}</span>
                                        {!isLeaf && (
                                            <span className={`text-xs transition-colors ${isSelected ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                                ▶
                                            </span>
                                        )}
                                        {isLeaf && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Premium Detail Pane */}
            <AnimatePresence>
                {activeLeaf && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: 50, width: 0 }}
                        className="w-96 min-w-[24rem] bg-gradient-to-b from-slate-900 to-slate-950 border-l border-slate-800 flex flex-col shrink-0 shadow-2xl z-20 relative"
                    >
                        {/* Detail Header */}
                        <div className="p-6 bg-blue-900/20 border-b border-blue-500/20 backdrop-blur-sm">
                            <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-ping"></span>
                                Selected Dataset
                            </h2>
                        </div>
                        
                        <div className="p-8 flex flex-col gap-8 overflow-y-auto h-full">
                            {/* Title Block */}
                            <div>
                                <p className="font-bold text-slate-500 text-[10px] uppercase tracking-widest mb-2">Dataset Title</p>
                                <h3 className="text-2xl font-black text-white leading-tight">{activeLeaf.name}</h3>
                            </div>

                            {/* ID Block */}
                            {activeLeaf.id && (
                                <div>
                                    <p className="font-bold text-slate-500 text-[10px] uppercase tracking-widest mb-2">System identifier</p>
                                    <p className="font-mono text-sm text-amber-300 bg-slate-950 p-3 rounded-lg border border-slate-800 break-all select-all">
                                        {activeLeaf.id}
                                    </p>
                                </div>
                            )}

                            {/* Path Block */}
                            <div>
                                <p className="font-bold text-slate-500 text-[10px] uppercase tracking-widest mb-2">Information Path</p>
                                <div className="text-xs text-slate-300 flex flex-wrap gap-2">
                                    {selectedPath.slice(0, -1).map((p, i) => (
                                        <span key={i} className="bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700 shadow-sm">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Action Block */}
                            <div className="mt-auto pt-8 border-t border-slate-800">
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                    This data node has sufficient density for narrative extraction. Synthesize a storyboard module to analyze trends.
                                </p>
                                <button 
                                    onClick={() => onLeafClick(activeLeaf)}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:translate-y-0"
                                >
                                    Initiate Synthesis
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
