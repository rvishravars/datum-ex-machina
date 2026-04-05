import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const DiscoveryBubbleChart = ({ data, onBubbleClick }) => {
  const svgRef = useRef(null);
  const [selectedBubble, setSelectedBubble] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', height)
      .style('max-width', '100%')
      .style('height', 'auto');

    svg.selectAll('*').remove();

    // Force simulation
    const simulation = d3.forceSimulation(data)
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('collide', d3.forceCollide(d => Math.sqrt(d.value) * 15 + 5))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const node = svg.append('g')
      .selectAll('g')
      .data(data)
      .join('g')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => setSelectedBubble(d))
      .on('mouseleave', () => setSelectedBubble(null))
      .on('click', (event, d) => onBubbleClick(d));

    // Wobbly Bubble (xkcd style)
    node.append('circle')
      .attr('r', d => Math.sqrt(d.value) * 15)
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.2)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .style('filter', 'url(#wobble-filter)'); // Use our global wobble filter

    // Labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .style('font-size', d => Math.max(10, Math.sqrt(d.value) * 5) + 'px')
      .style('pointer-events', 'none')
      .text(d => d.value > 2 ? d.label : '');

    simulation.on('tick', () => {
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [data]);

  return (
    <div className="bubble-chart-container relative">
      <svg ref={svgRef}></svg>
      
      <AnimatePresence>
        {selectedBubble && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 p-4 bg-white border-2 border-slate-900 rounded-lg shadow-xl max-w-xs"
            style={{ fontFamily: '"Comic Sans MS", cursive', borderStyle: 'solid' }}
          >
            <h4 className="font-bold border-b-2 border-slate-900 pb-1 mb-2">
              {selectedBubble.label}
            </h4>
            <p className="text-sm">
              We found <span className="font-bold">{selectedBubble.value}</span> statistical stories from this {selectedBubble.group.toLowerCase()}.
            </p>
            <p className="text-xs mt-2 text-slate-500 italic">
              Click to explode this cloud...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscoveryBubbleChart;
