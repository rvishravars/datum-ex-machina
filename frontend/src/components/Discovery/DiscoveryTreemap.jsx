import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const DiscoveryTreemap = ({ rootData, onLeafClick }) => {
  const [currentPath, setCurrentPath] = useState([]);
  
  // 1. Create a stable hierarchy root
  const root = useMemo(() => {
    if (!rootData) return null;
    return d3.hierarchy(rootData)
      .sum(d => d.value ? d.value : (d.children ? 0 : 1))
      .sort((a, b) => b.value - a.value);
  }, [rootData]);

  // 2. Resolve the current node based on breadcrumb path
  const currentNode = useMemo(() => {
    if (!root) return null;
    let node = root;
    for (let p of currentPath) {
      const child = node.children?.find(c => c.data.name === p);
      if (child) node = child;
      else break;
    }
    return node;
  }, [root, currentPath]);

  // 3. Generate treemap layout just for the current view
  const layoutNodes = useMemo(() => {
    if (!currentNode) return [];
    
    const width = 800;
    const height = 500;
    
    // Copy the current node so d3.treemap doesn't mutate the global tree
    const tempRoot = currentNode.copy();
    tempRoot.sum(d => d.value ? d.value : (d.children ? 0 : 1))
            .sort((a, b) => b.value - a.value);
    
    d3.treemap()
      .size([width, height])
      .paddingTop(26) // Leave room for category headers
      .paddingInner(3)
      .paddingOuter(3)
      .round(true)(tempRoot);
      
    // Include node itself (depth=0, but we filter to 0 to act as background/headers)
    // and its children (depth=1) and grandchildren (depth=2)
    return tempRoot.descendants().filter(d => d.depth <= 2);
  }, [currentNode]);

  const handleNodeClick = (nodeName, isLeaf, originalData) => {
    if (isLeaf) {
      onLeafClick(originalData);
    } else {
      setCurrentPath(prev => [...prev, nodeName]);
    }
  };

  const handleBreadcrumbClick = (idx) => {
    if (idx === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, idx + 1));
    }
  };

  if (!root) return null;

  const colorScale = d3.scaleOrdinal([...d3.schemePastel1, ...d3.schemePastel2]);

  return (
    <div className="discovery-treemap flex flex-col w-full h-full">
      {/* Interactive Breadcrumb Nav */}
      <nav className="flex flex-wrap items-center bg-slate-100 p-3 border-b-4 border-slate-900 overflow-x-auto text-sm md:text-base font-bold font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 mb-4">
        <span 
          className="cursor-pointer hover:underline text-blue-600 px-2 py-1 bg-white border-2 border-slate-900 hover:bg-blue-50 ml-1 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
          onClick={() => handleBreadcrumbClick(-1)}
        >
          Aotearoa Horizon
        </span>
        {currentPath.map((p, i) => (
          <React.Fragment key={i}>
            <span className="mx-2 text-slate-400">▶</span>
            <span 
              className="cursor-pointer hover:underline text-blue-600 px-2 py-1 bg-white border-2 border-slate-900 hover:bg-blue-50 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none"
              onClick={() => handleBreadcrumbClick(i)}
            >
              {p}
            </span>
          </React.Fragment>
        ))}
      </nav>

      <div className="treemap-container border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative">
        <svg 
          width="100%" 
          height="auto" 
          viewBox="0 0 800 500" 
          style={{ fontFamily: '"Comic Sans MS", cursive', display: 'block' }}
        >
          <defs>
            <filter id="xkcd-treemap-wobble" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            
            <clipPath id="treemap-clip">
              <rect x="0" y="0" width="800" height="500" />
            </clipPath>
          </defs>

          <g clipPath="url(#treemap-clip)">
            <AnimatePresence mode="popLayout">
              {layoutNodes.map((node) => {
                const isRoot = node.depth === 0;
                const isLeaf = !node.children;
                const width = Math.max(0, node.x1 - node.x0);
                const height = Math.max(0, node.y1 - node.y0);
                
                // Determine layout group key so animations fire correctly on path changes
                const animKey = node.data.name + "_" + currentPath.length + "_" + node.depth;

                // Don't render the root rect itself as it covers everything, but keep it for layout logic
                if (isRoot) return null;

                return (
                  <motion.g
                    key={animKey}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1, x: node.x0, y: node.y0 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLeaf) {
                        handleNodeClick(node.data.name, isLeaf, node.data);
                      } else {
                        // Calculate full relative path from current view
                        const pathNames = node.ancestors().reverse().slice(1).map(d => d.data.name);
                        setCurrentPath(prev => [...prev, ...pathNames]);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      width={width}
                      height={height}
                      fill={isLeaf ? "#f8fafc" : colorScale(node.data.name)}
                      stroke="#0f172a"
                      strokeWidth={node.depth === 1 ? 2 : 1}
                      rx={3}
                      style={{ filter: isLeaf ? 'none' : 'url(#xkcd-treemap-wobble)' }}
                      className="hover:stroke-[4px] hover:brightness-110 transition-all"
                    />
                    
                    {/* Header specific style if it's a category */}
                    {!isLeaf && height > 20 && width > 40 && (
                      <rect 
                        width={width} 
                        height={24} 
                        fill="rgba(255,255,255,0.4)" 
                        stroke="none"
                        rx={3}
                      />
                    )}

                    <text
                      x={6}
                      y={16}
                      fontSize={isLeaf ? "11px" : "13px"}
                      fontWeight={isLeaf ? "normal" : "bold"}
                      fill="#0f172a"
                      pointerEvents="none"
                      style={{ opacity: width > 50 && height > 16 ? 1 : 0 }}
                    >
                      {width > 80 ? (node.data.name.length > (width / 7) ? node.data.name.slice(0, Math.floor(width / 7)) + '...' : node.data.name) : '...'}
                    </text>
                    
                    {/* Draw deeper dataset count if it's a folder */}
                    {!isLeaf && width > 100 && height > 40 && (
                       <text
                         x={width - 6}
                         y={16}
                         fontSize="10px"
                         fill="#0f172a"
                         opacity="0.6"
                         textAnchor="end"
                         pointerEvents="none"
                       >
                         {node.value} sets
                       </text>
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </g>
        </svg>
      </div>
      
      <div className="mt-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 italic text-center">
        Left-click blocks to drill down into the hierarchy. Use the breadcrumb trail above to reverse.
      </div>
    </div>
  );
};

export default DiscoveryTreemap;
