import React from 'react';
import { motion } from 'motion/react';
import { TreeNodeData } from '../types';

export const TreeNodeView: React.FC<{ node: TreeNodeData, activeNodeId: string }> = ({ node, activeNodeId }) => {
  const isActive = node.id === activeNodeId;
  
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500 text-white border-blue-600 shadow-blue-200';
      case 'waiting': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'done': return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200';
      default: return 'bg-white';
    }
  };

  return (
    <motion.div layout className="flex flex-col items-center">
      <motion.div
        layout
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative z-10 px-6 py-3 rounded-2xl border-2 font-mono text-lg font-bold shadow-lg transition-all duration-300 ${getStatusColors(node.status)} ${isActive ? 'ring-4 ring-amber-400 ring-offset-2 scale-110 shadow-xl z-20' : ''}`}
        data-id={node.id}
      >
        {node.label}
        {node.result !== null && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-2 inline-block"
          >
            = {node.result}
          </motion.span>
        )}
      </motion.div>

      {node.children.length > 0 && (
        <motion.div layout className="flex gap-6 md:gap-16 mt-16 relative">
          {node.children.map(c => (
            <TreeNodeView key={c.id} node={c} activeNodeId={activeNodeId} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
