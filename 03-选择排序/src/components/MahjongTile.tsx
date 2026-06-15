import React from 'react';
import { motion } from 'motion/react';
import { Tile } from '../types';

interface MahjongTileProps {
  tile: Tile;
  status: 'normal' | 'comparing' | 'candidate' | 'swapping';
  isSorted?: boolean;
}

export const MahjongTile: React.FC<MahjongTileProps> = ({ tile, status, isSorted, isTarget }) => {
  let borderColor = 'border-gray-200';
  let shadow = 'shadow-sm';
  let bgColor = 'bg-white';
  let yOffset = 0;
  
  if (status === 'comparing') {
    borderColor = 'border-blue-400';
    shadow = 'shadow-blue-200 shadow-md';
    bgColor = 'bg-blue-50/30';
    yOffset = -5;
  } else if (status === 'candidate') {
    borderColor = 'border-green-500';
    shadow = 'shadow-green-300 shadow-lg';
    bgColor = 'bg-green-50';
    yOffset = -10;
  } else if (status === 'swapping') {
    borderColor = 'border-orange-500';
    shadow = 'shadow-orange-300 shadow-lg';
    bgColor = 'bg-orange-50';
    yOffset = -15;
  } else if (isSorted) {
    borderColor = 'border-emerald-300';
    bgColor = 'bg-emerald-50';
  }

  // Highlight border if it is the target slot
  if (isTarget && status === 'normal') {
    borderColor = 'border-indigo-400 border-dashed';
    bgColor = 'bg-indigo-50/30';
  }

  // Red text for even values, Slate for odd, traditional mahjong-ish colors mix
  const isRed = tile.value === 1 || tile.value === 4 || tile.value === 7 || tile.value === 9;
  const numColor = isRed ? 'text-red-600' : 'text-slate-800';

  return (
    <motion.div
      layout
      layoutId={tile.id}
      initial={false}
      animate={{ y: yOffset }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative w-16 h-24 md:w-24 md:h-36 
        rounded-xl border-2 flex flex-col items-center justify-center 
        transition-colors duration-300 shrink-0
        ${borderColor} ${shadow} ${bgColor}
      `}
    >
      <span className={`text-3xl md:text-5xl font-bold font-sans ${numColor}`}>
        {tile.value}
      </span>
      <span className={`text-lg md:text-2xl mt-1 md:mt-2 font-serif ${numColor}`}>
        万
      </span>
      
      {/* Decorative inner border layer for that "tile" look */}
      <div className="absolute inset-1 border border-gray-100 rounded-lg pointer-events-none opacity-50" />

      {/* Target Slot Indicator (Top) */}
      {isTarget && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-10 whitespace-nowrap bg-indigo-500 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-indigo-500"
        >
          基准位 i
        </motion.div>
      )}

      {/* Minimum Candidate Indicator (Bottom) */}
      {status === 'candidate' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 whitespace-nowrap bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-green-500"
        >
          最小值 min
        </motion.div>
      )}

      {/* Swapping Indicator (Bottom) */}
      {status === 'swapping' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 whitespace-nowrap bg-orange-500 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-orange-500"
        >
          交换
        </motion.div>
      )}
    </motion.div>
  );
};
