import React, { useState, useEffect } from 'react';
import DiscoveryTree from '../components/Discovery/DiscoveryTree';
import { motion } from 'framer-motion';

const DiscoveryLab = ({ onBack }) => {
    const [discoveryData, setDiscoveryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDiscoveryTree = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/discovery/tree`);
                if (!response.ok) throw new Error("Metadata Index not reachable. Did you run the crawler?");
                const data = await response.json();
                setDiscoveryData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscoveryTree();
    }, []);

    const formatSyncDate = (dateStr) => {
        if (!dateStr) return "NEVER";
        try {
            const cleanDate = dateStr.split('.')[0] + 'Z'; 
            const date = new Date(cleanDate);
            return isNaN(date.getTime()) ? "CLOCK ERROR" : date.toLocaleString();
        } catch (e) {
            return "SYNC ERROR";
        }
    };

    const handleLeafClick = (leaf) => {
        console.log("Deep Dive into:", leaf.name);
        alert(`You've reached the edge of the known universe for ${leaf.name} (ID: ${leaf.id}).\n\nNext Step: Initiate automated storyboard generation for this dataset?`);
    };

    if (loading) return (
        <div className="discovery-lab-loading h-screen flex flex-col items-center justify-center p-10 bg-slate-50">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-24 h-24 border-8 border-dashed border-slate-900 rounded-full"
            />
            <h2 className="mt-8 font-bold text-xl tracking-widest text-slate-900">MAPPING THE EVIDENCE FRACTAL...</h2>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center">
            <h2 className="text-red-500 font-bold mb-4">CRITICAL INDEX FAILURE</h2>
            <p className="bg-red-50 p-4 border-2 border-red-500 inline-block">{error}</p>
        </div>
    );

    return (
        <div className="discovery-lab-container min-h-screen bg-slate-50 p-6 md:p-12 font-mono">
            {/* Header / HUD */}
            <header className="mb-12 border-b-4 border-slate-900 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end relative">
                <button 
                    onClick={onBack}
                    className="absolute -top-4 -left-4 bg-slate-900 text-white p-2 text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                    ← BACK TO ARCHIVE
                </button>
                <div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter italic mt-8 md:mt-0">NEXUS DISCOVERY LAB</h1>
                    <p className="text-sm border-l-4 border-slate-900 pl-4 py-1">
                        Climbing through <span className="font-bold underline decoration-blue-500">{discoveryData?.total_datasets}</span> Statistical Branches
                    </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Sync Horizon</p>
                    <p className="font-bold">{formatSyncDate(discoveryData?.last_updated)}</p>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Legend/Controls */}
                <aside className="lg:col-span-1 space-y-8 order-2 lg:order-1">
                    <section className="bg-white border-2 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-bold mb-4 border-b-2 border-slate-900">HIEARCHY HUD</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-slate-900 bg-blue-100 italic flex items-center justify-center text-[8px] font-bold">L1</div>
                                <span className="text-[10px] font-bold">Theme / Agency</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-slate-900 bg-blue-300 italic flex items-center justify-center text-[8px] font-bold">L2</div>
                                <span className="text-[10px] font-bold">Subject / Group</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-slate-900 bg-blue-500 italic flex items-center justify-center text-[8px] font-bold">L3</div>
                                <span className="text-[10px] font-bold">Dataset / Leaf</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-slate-900 text-white p-6 shadow-[8px_8px_0px_0px_rgba(74,158,255,1)]">
                        <h3 className="font-bold mb-2 uppercase text-xs tracking-widest">Recursive Discovery</h3>
                        <p className="text-[10px] leading-relaxed text-slate-300 antialiased italic">
                            Stats NZ and Data.govt are now connected via a unified Recursive Fractal. 
                            Click on a theme to explode its sub-subjects. Navigate deep into the leaves to find individual evidence tables.
                        </p>
                    </section>
                </aside>

                {/* Center: The Big Picture (Zoomable Tree) */}
                <section className="lg:col-span-3 bg-white border-4 border-slate-900 p-4 min-h-[600px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] order-1 lg:order-2 flex flex-col justify-center overflow-hidden">
                    {discoveryData?.root && (
                        <DiscoveryTree 
                            rootData={discoveryData.root} 
                            onLeafClick={handleLeafClick} 
                        />
                    )}
                </section>
            </main>

            <footer className="mt-16 text-center text-xs opacity-50">
                <p>&copy; {new Date().getFullYear()} - DATUM EX MACHINA - PACIFIC INFORMATION TREE</p>
            </footer>
        </div>
    );
};

export default DiscoveryLab;
