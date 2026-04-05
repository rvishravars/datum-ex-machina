import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const DiscoveryTree = ({ rootData, onLeafClick }) => {
  const svgRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    if (!rootData) return;

    const width = 800;
    const height = 800;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', height)
      .style('max-width', '100%')
      .style('height', 'auto')
      .style('cursor', 'pointer');

    svg.selectAll('*').remove();

    const root = d3.hierarchy(rootData)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value);

    const pack = d3.pack()
      .size([width, height])
      .padding(5);

    const nodes = pack(root).descendants();
    let focus = root;
    let view;

    const g = svg.append('g');

    const circle = g.selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('fill', d => d.children ? '#f8fafc' : '#4A9EFF')
      .attr('fill-opacity', d => d.children ? 0.1 : 0.4)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', d => d.depth === 0 ? 4 : 2)
      .style('filter', 'url(#xkcd-wobble)')
      .on('mouseover', (event, d) => {
          if (d.depth > 0) setHoveredNode(d.data);
          d3.select(event.currentTarget).attr('stroke-width', 4);
      })
      .on('mouseout', (event, d) => {
          setHoveredNode(null);
          d3.select(event.currentTarget).attr('stroke-width', d.depth === 0 ? 4 : 2);
      })
      .on('click', (event, d) => {
        if (d.children) {
          zoom(event, d);
        } else {
          onLeafClick(d.data);
        }
        event.stopPropagation();
      });

    const label = g.selectAll('text')
      .data(nodes)
      .join('text')
      .style('fill-opacity', d => d.parent === root ? 1 : 0)
      .style('display', d => d.parent === root ? 'inline' : 'none')
      .attr('text-anchor', 'middle')
      .attr('font-family', '"Comic Sans MS", cursive')
      .style('font-size', d => d.depth === 1 ? '18px' : '12px')
      .style('pointer-events', 'none')
      .text(d => d.data.name);

    svg.on('click', (event) => zoom(event, root));

    zoomTo([root.x, root.y, root.r * 2]);

    function zoomTo(v) {
      const k = width / v[2];
      view = v;
      label.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      circle.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      circle.attr('r', d => d.r * k);
    }

    function zoom(event, d) {
      focus = d;

      const transition = svg.transition()
        .duration(750)
        .tween('zoom', d => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });

      label.filter(function(d) { return d.parent === focus || this.style.display === 'inline'; })
        .transition(transition)
          .style('fill-opacity', d => d.parent === focus ? 1 : 0)
          .on('start', function(d) { if (d.parent === focus) this.style.display = 'inline'; })
          .on('end', function(d) { if (d.parent !== focus) this.style.display = 'none'; });
    }

  }, [rootData]);

  return (
    <div className="discovery-tree-container relative w-full overflow-hidden">
      <svg ref={svgRef}></svg>
      
      <AnimatePresence>
        {hoveredNode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 p-4 bg-slate-900 text-white border-2 border-white rounded-lg shadow-2xl max-w-sm pointer-events-none"
          >
            <h4 className="font-bold border-b border-white/20 pb-1 mb-2 text-blue-400">
              {hoveredNode.name}
            </h4>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-1">
              Path: {hoveredNode.type || 'Branch'}
            </p>
            {hoveredNode.id && <p className="text-[10px] opacity-40">ID: {hoveredNode.id}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 bg-white/80 p-2 text-[10px] border border-slate-900 italic">
        * CLICK BUBBLES TO DRILL DOWN. CLICK BACKGROUND TO GO UP.
      </div>
    </div>
  );
};

export default DiscoveryTree;
