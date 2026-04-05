import React, { useState, useEffect } from 'react';
import DiscoveryTreemap from '../components/Discovery/DiscoveryTreemap';
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
            {/* Minimal Header */}
            <header className="mb-8 relative flex items-center justify-center">
                <button 
                    onClick={onBack}
                    className="absolute top-0 left-0 bg-slate-900 text-white p-2 text-xs font-bold hover:bg-blue-600 transition-colors z-20"
                >
                    ← BACK TO ARCHIVE
                </button>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">NEXUS DISCOVERY LAB</h1>
            </header>

            <main className="w-full flex-grow flex flex-col">
                {/* Full Width Treemap Canvas */}
                <section className="w-full h-full min-h-[70vh] bg-white border-4 border-slate-900 p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative">
                    {discoveryData?.root && (
                        <DiscoveryTreemap 
                            rootData={discoveryData.root} 
                            onLeafClick={handleLeafClick} 
                        />
                    )}
                </section>
            </main>

            <footer className="mt-12 text-center text-xs opacity-50">
                <p>&copy; {new Date().getFullYear()} - DATUM EX MACHINA - PACIFIC INFORMATION TREE</p>
            </footer>
        </div>
    );
};

export default DiscoveryLab;
