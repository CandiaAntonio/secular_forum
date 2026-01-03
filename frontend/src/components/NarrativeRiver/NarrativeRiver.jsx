import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { linkHorizontal } from 'd3-shape';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- MOCK DATA ---
// --- MOCK DATA ---
// Removed RAW_DATA in favor of API fetch


const CONFIG = {
  nodeWidth: 120,
  nodeHeight: 40,
  colGap: 100,
  rowGap: 24,
  padding: 60,
};

/**
 * NarrativeRiver Component
 */
const NarrativeRiver = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredTheme, setHoveredTheme] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/narrative-river');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 1. Process Data Area
  const processedData = useMemo(() => {
    if (loading || error) return { years: [], nodes: [], links: [] };

    // Group by Year
    const nodesByYear = new Map();
    data.forEach(d => {
        if (!nodesByYear.has(d.year)) {
            nodesByYear.set(d.year, []);
        }
        nodesByYear.get(d.year).push(d);
    });
    
    const years = Array.from(nodesByYear.keys()).sort((a, b) => a - b);
    
    // Assign Coordinates
    const nodes = [];
    years.forEach((year, colIndex) => {
      const yearNodes = nodesByYear.get(year) || [];
      // Sort by Rank
      yearNodes.sort((a, b) => a.rank - b.rank);

      yearNodes.forEach((node, rowIndex) => {
        nodes.push({
          ...node,
          x: CONFIG.padding + colIndex * (CONFIG.nodeWidth + CONFIG.colGap),
          y: CONFIG.padding + rowIndex * (CONFIG.nodeHeight + CONFIG.rowGap),
          colIndex,
          rowIndex
        });
      });
    });

    // Generate Links
    const links = [];
    const linkGen = linkHorizontal()
      .x(d => d.x)
      .y(d => d.y);

    // Iterate years to find connections
    for (let i = 0; i < years.length - 1; i++) {
      const currentYear = years[i];
      const nextYear = years[i+1];
      
      const currentNodes = nodesByYear.get(currentYear) || [];
      const nextNodes = nodesByYear.get(nextYear) || [];

      currentNodes.forEach(source => {
        let target = null;

        // Logic 1: Always link 'base' to 'base' (The Narrative Spine)
        if (source.type === 'base') {
           target = nextNodes.find(n => n.type === 'base');
        } 
        
        // Logic 2: Link regular themes by Name (Persistence)
        if (!target) {
           target = nextNodes.find(n => n.name === source.name && n.type !== 'base');
        }

        if (target) {
          links.push({
            id: `${source.id}-${target.id}`,
            source,
            target,
            themeName: source.name, // Store for hover logic
            path: linkGen({
              source: { x: source.x + CONFIG.nodeWidth, y: source.y + CONFIG.nodeHeight/2 },
              target: { x: target.x, y: target.y + CONFIG.nodeHeight/2 }
            }) || ""
          });
        }
      });
    }

    return { years, nodes, links };
  }, [data, loading, error]);

  const { nodes, years, links } = processedData;

  // Calculate container dimensions
  const width = CONFIG.padding * 2 + (years.length - 1) * (CONFIG.nodeWidth + CONFIG.colGap) + CONFIG.nodeWidth;
  // Re-calculate group sizes for height since we don't have d3.group available here easily or it's inside memo
  // We can just iterate processed nodes if we want, or better:
  const maxRows = Math.max(0, ...Array.from(new Set(data.map(d => d.year))).map(year => data.filter(d => d.year === year).length));
  const height = CONFIG.padding * 2 + (maxRows - 1) * (CONFIG.nodeHeight + CONFIG.rowGap) + CONFIG.nodeHeight;

  if (loading) return <div className="p-8">Loading narrative visualization...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading data: {error}</div>;

  return (
    <div className="w-full h-screen bg-slate-50 p-8 overflow-hidden flex flex-col relative">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">The Narrative Arc (2020–2023)</h1>
        <p className="text-slate-500 max-w-2xl">
          Tracing the evolution of consensus themes. Click a node to explore details.
        </p>
      </header>

      <div className="flex-1 relative border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex">
        {/* Visualization Area */}
        <div className="flex-1 relative overflow-auto" onClick={() => setSelectedNode(null)}>
            <div className="relative min-w-full min-h-full" style={{ width: Math.max(width, 1000), height: Math.max(height, 500) }}>
              
              {/* Link Layer (The River) */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                {links.map(link => {
                  const isDimmed = (hoveredTheme && link.themeName !== hoveredTheme) || (selectedNode && link.themeName !== selectedNode.name);
                  const isHighlighted = (hoveredTheme && link.themeName === hoveredTheme) || (selectedNode && link.themeName === selectedNode.name);
                  
                  return (
                    <motion.path
                      key={link.id}
                      d={link.path}
                      fill="none"
                      stroke={link.source.type === 'base' ? "#1e293b" : "#64748b"}
                      strokeWidth={link.source.type === 'base' ? 24 : 12}
                      strokeOpacity={isDimmed ? 0.05 : (link.source.type === 'base' ? 0.1 : 0.25)}
                      strokeLinecap="round"
                      animate={{ 
                        stroke: isHighlighted ? "#3b82f6" : (link.source.type === 'base' ? "#1e293b" : "#64748b"),
                        strokeOpacity: isHighlighted ? 0.6 : (isDimmed ? 0.05 : (link.source.type === 'base' ? 0.1 : 0.25))
                      }}
                      transition={{ duration: 0.3 }}
                      className="transition-colors duration-300"
                    />
                  )
                })}
              </svg>

              {/* Nodes Layer */}
              {nodes.map(node => {
                const isDimmed = (hoveredTheme && node.name !== hoveredTheme) || (selectedNode && node.name !== selectedNode.name);
                const isHighlighted = (hoveredTheme && node.name === hoveredTheme) || (selectedNode && node.name === selectedNode.name);
                const isSelected = selectedNode && node.id === selectedNode.id;

                return (
                  <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: isDimmed ? 0.3 : 1, 
                        scale: isSelected ? 1.15 : (isHighlighted ? 1.05 : 1),
                        borderColor: isSelected ? '#2563eb' : (isHighlighted ? '#3b82f6' : (node.type === 'base' ? '#0f172a' : '#e2e8f0')),
                        boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
                      }}
                      transition={{ duration: 0.3 }}
                      onMouseEnter={() => setHoveredTheme(node.name)}
                      onMouseLeave={() => setHoveredTheme(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                      }}
                      className={cn(
                        "absolute flex items-center justify-center text-xs font-bold rounded-full border transition-all cursor-pointer z-10",
                        node.type === 'base' 
                          ? "bg-slate-800 text-white shadow-md" 
                          : (isHighlighted ? "bg-blue-50 text-blue-700 shadow-md" : "bg-white text-slate-600 hover:shadow-md")
                      )}
                      style={{
                        width: CONFIG.nodeWidth,
                        height: CONFIG.nodeHeight,
                        left: node.x,
                        top: node.y,
                      }}
                  >
                      {node.name}
                  </motion.div>
                )
              })}
              
              {/* Year Labels */}
              {years.map((year, i) => (
                  <div 
                    key={year}
                    className="absolute text-sm font-semibold text-slate-400 pointer-events-none"
                    style={{
                      left: CONFIG.padding + i * (CONFIG.nodeWidth + CONFIG.colGap),
                      top: 20,
                      width: CONFIG.nodeWidth,
                      textAlign: 'center'
                    }}
                  >
                    {year}
                  </div>
              ))}
            </div>
        </div>

        {/* Detail Sidebar */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-xl p-6 z-20 flex flex-col"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{selectedNode.year} Theme</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedNode.name}</h2>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                  <p className="text-sm text-slate-600 leading-relaxed font-serif italic">
                    "This theme dominated the narrative in {selectedNode.year}, ranking #{selectedNode.rank} in global importance. 
                    Investment banks highlighted this as a critical pivot point for markets."
                  </p>
                </div>
                
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Key Insights</h3>
                <ul className="space-y-3">
                  <li className="text-sm text-slate-600 pl-4 border-l-2 border-blue-200">
                    Consensus shifted heavily towards <strong>{selectedNode.name}</strong> during Q1 {selectedNode.year}.
                  </li>
                  <li className="text-sm text-slate-600 pl-4 border-l-2 border-blue-200">
                    Impact on asset allocation was primarily defensive.
                  </li>
                  <li className="text-sm text-slate-600 pl-4 border-l-2 border-blue-200">
                    Volatility remained elevated as market participants priced in these risks.
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-400">
                Source: Aggregated Outlooks {selectedNode.year}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default NarrativeRiver;
