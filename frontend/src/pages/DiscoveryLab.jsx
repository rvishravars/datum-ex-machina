import React, { useState, useEffect } from 'react';
import DiscoveryBubbleChart from '../components/Discovery/DiscoveryBubbleChart';
import { motion } from 'framer-motion';

const DiscoveryLab = () => {
    const [discoveryData, setDiscoveryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDiscoveryStats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/discovery/stats`);
                if (!response.ok) throw new Error("Metadata Index not reachable. Did you run the crawler?");
                const data = await response.json();
                setDiscoveryData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscoveryStats();
    }, []);

    const handleBubbleClick = (bubble) => {
        console.log("Zooming into:", bubble.label);
        // This is where we'd navigate to a filtered search or auto-story generator
        alert(`Deep exploration of ${bubble.label} is coming next. We have ${bubble.value} datasets indexed here.`);
    };

    if (loading) return (
        <div className="discovery-lab-loading h-screen flex flex-col items-center justify-center p-10 bg-slate-50">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-24 h-24 border-8 border-dashed border-slate-900 rounded-full"
            />
            <h2 className="mt-8 font-bold text-xl tracking-widest text-slate-900">SCANNING THE AOTEAROA EVIDENCE HORIZON...</h2>
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
            <header className="mb-12 border-b-4 border-slate-900 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter italic">NEXUS DISCOVERY LAB</h1>
                    <p className="text-sm border-l-4 border-slate-900 pl-4 py-1">
                        Analyzing <span className="font-bold underline decoration-blue-500">{discoveryData?.total_datasets}</span> Potential Narrative Pathways
                    </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Last System Sync</p>
                    <p className="font-bold">{new Date(discoveryData?.last_updated).toLocaleString()}</p>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Legend/Controls */}
                <aside className="lg:col-span-1 space-y-8 order-2 lg:order-1">
                    <section className="bg-white border-2 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-bold mb-4 border-b-2 border-slate-900">SYSTEM LEGEND</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-slate-900" style={{ backgroundColor: 'rgba(74, 158, 255, 0.2)' }}></div>
                                <span className="text-xs font-bold">Government Data.Govt Index</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-slate-900" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}></div>
                                <span className="text-xs font-bold">Stats NZ Aotearoa Data Explorer</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-slate-900 text-white p-6 shadow-[8px_8px_0px_0px_rgba(74,158,255,1)]">
                        <h3 className="font-bold mb-2">NEURAL SCANNER</h3>
                        <p className="text-[10px] leading-relaxed text-slate-300 antialiased italic">
                            The collective weight of New Zealand's official evidence is being clustered into autonomous "Evidence Clouds." 
                            Higher mass indicates a greater historical record. Choose a cloud to initiate narrative synthesis.
                        </p>
                    </section>
                </aside>

                {/* Center: The Big Picture (Bubble Chart) */}
                <section className="lg:col-span-3 bg-white border-4 border-slate-900 p-4 min-h-[600px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] order-1 lg:order-2">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold rounded-full">ACTIVE SCAN: LIVE</span>
                        <span className="text-xs italic">Hover to audit. Click to zoom.</span>
                    </div>
                    
                    {discoveryData && (
                        <DiscoveryBubbleChart 
                            data={discoveryData.bubbles} 
                            onBubbleClick={handleBubbleClick} 
                        />
                    )}
                </section>
            </main>

            <footer className="mt-16 text-center text-xs opacity-50">
                <p>&copy; {new Date().getFullYear()} - DATUM EX MACHINA - PACIFIC ARCHIVE PROJECT</p>
            </footer>
        </div>
    );
};

export default DiscoveryLab;
