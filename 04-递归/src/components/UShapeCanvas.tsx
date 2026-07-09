import React from 'react';
import { motion } from 'motion/react';
import { UShapeData } from '../types';

export const UShapeCanvas: React.FC<{ data: UShapeData, activeNodeId: string }> = ({ data, activeNodeId }) => {
  const nodeHeight = 52;
  const colSpacing = 110; // Brought closer to center
  const rowSpacing = 140; // Increased height
  
  return (
    <div className="flex-1 overflow-auto relative p-8 flex justify-center items-start min-h-[600px]">
      <div className="relative mt-16" style={{ width: 0, height: 0 }}>
         
         <svg className="absolute overflow-visible pointer-events-none z-0" style={{ top: 0, left: 0, width: 1, height: 1 }}>
           <defs>
             <marker id="arrowhead" viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="6" markerHeight="6" orient="auto">
               <path d="M 0 -5 L 10 0 L 0 5 z" fill="#94a3b8" />
             </marker>
           </defs>
           
           {data.arrows.map(arrow => {
             const fromNode = data.nodes.find(n => n.id === arrow.fromId);
             const toNode = data.nodes.find(n => n.id === arrow.toId);
             if (!fromNode || !toNode) return null;
             
             const isUpward = toNode.row < fromNode.row;
             
             const startX = fromNode.col * colSpacing;
             const startY = fromNode.row * rowSpacing + (isUpward ? 0 : nodeHeight);
             const endX = toNode.col * colSpacing;
             const endY = toNode.row * rowSpacing + (isUpward ? nodeHeight : 0);
             
             return (
               <g key={arrow.id}>
                 <line 
                   x1={startX} 
                   y1={startY} 
                   x2={endX} 
                   y2={endY} 
                   stroke="#cbd5e1" 
                   strokeWidth="2"
                   markerEnd="url(#arrowhead)" 
                 />
                 {arrow.label && (
                   <text 
                     x={(startX + endX) / 2 + 25} 
                     y={(startY + endY) / 2} 
                     fill="#94a3b8" 
                     fontSize="13"
                     className="font-medium"
                   >
                     {arrow.label}
                   </text>
                 )}
               </g>
             );
           })}
         </svg>
         
         {data.nodes.map(node => {
           const isActive = node.id === activeNodeId;
           
           let colors = "bg-white border-slate-200 text-slate-700";
           if (node.type === 'call') colors = "bg-blue-50 border-blue-200 text-blue-800";
           if (node.type === 'base') colors = "bg-emerald-50 border-emerald-200 text-emerald-800";
           if (node.type === 'return') colors = "bg-amber-50 border-amber-200 text-amber-800";
           
           if (isActive) {
             colors = "bg-white border-blue-500 ring-4 ring-blue-100 text-slate-900 shadow-xl z-20 scale-110";
             if (node.type === 'return') colors = "bg-white border-amber-500 ring-4 ring-amber-100 text-slate-900 shadow-xl z-20 scale-110";
             if (node.type === 'base') colors = "bg-white border-emerald-500 ring-4 ring-emerald-100 text-slate-900 shadow-xl z-20 scale-110";
           }

           return (
             <motion.div
               key={node.id}
               layoutId={node.id}
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`absolute transform -translate-x-1/2 flex flex-col justify-center items-center rounded-xl border-2 font-mono text-sm md:text-base transition-all duration-300 min-w-[160px] px-4 py-2 ${colors}`}
               style={{ 
                 left: node.col * colSpacing, 
                 top: node.row * rowSpacing,
                 height: nodeHeight
               }}
             >
               <span className="font-bold">{node.text}</span>
               {node.subText && (
                 <span className="absolute -bottom-6 text-xs font-sans text-slate-500 whitespace-nowrap">
                   {node.subText}
                 </span>
               )}
             </motion.div>
           );
         })}
      </div>
    </div>
  );
};

