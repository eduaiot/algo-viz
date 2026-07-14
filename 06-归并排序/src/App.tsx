/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Pause, Info } from 'lucide-react';

// --- Types ---

interface TreeNode {
  id: string;
  values: number[];
  level: number;
  col: number;
  type: 'split' | 'base' | 'merge';
  role: 'left' | 'right' | 'result';
  parentId?: string;
  sourceIds?: string[];
  index: number; // Global reveal index
  description: string;
}

// --- Constants ---

const INITIAL_ARRAY = [7, 3, 2, 16, 24, 4, 11, 9];

// --- Helper Functions ---

function generateMergeSortSteps(arr: number[]) {
  const steps: TreeNode[] = [];
  let globalIndex = 0;

  // Level 0
  steps.push({
    id: 'n-0-0',
    values: [...arr],
    level: 0,
    col: 0,
    type: 'split',
    role: 'left', // Root is treated as left for first split
    index: globalIndex++,
    description: '初始待排序数组 (Initial unsorted array)'
  });

  // Level 1
  const mid1 = 4;
  steps.push({
    id: 'n-1-0',
    values: arr.slice(0, mid1),
    level: 1,
    col: 0,
    type: 'split',
    role: 'left',
    parentId: 'n-0-0',
    index: globalIndex++,
    description: '将左半部分拆分 (Split left half)'
  });
  steps.push({
    id: 'n-1-1',
    values: arr.slice(mid1),
    level: 1,
    col: 1,
    type: 'split',
    role: 'right',
    parentId: 'n-0-0',
    index: globalIndex++,
    description: '将右半部分拆分 (Split right half)'
  });

  // Level 2
  for (let i = 0; i < 2; i++) {
    const parentNodes = steps.filter(n => n.level === 1);
    const parent = parentNodes[i];
    const mid = 2;
    steps.push({
      id: `n-2-${i * 2}`,
      values: parent.values.slice(0, mid),
      level: 2,
      col: i * 2,
      type: 'split',
      role: 'left',
      parentId: parent.id,
      index: globalIndex++,
      description: `进一步拆分 [${parent.values.join(',')}]`
    });
    steps.push({
      id: `n-2-${i * 2 + 1}`,
      values: parent.values.slice(mid),
      level: 2,
      col: i * 2 + 1,
      type: 'split',
      role: 'right',
      parentId: parent.id,
      index: globalIndex++,
      description: `进一步拆分 [${parent.values.join(',')}]`
    });
  }

  // Level 3 (Base)
  for (let i = 0; i < 4; i++) {
    const parentNodes = steps.filter(n => n.level === 2);
    const parent = parentNodes[i];
    steps.push({
      id: `n-3-${i * 2}`,
      values: [parent.values[0]],
      level: 3,
      col: i * 2,
      type: 'base',
      role: 'left',
      parentId: parent.id,
      index: globalIndex++,
      description: '拆分到单个元素 (Split to single elements)'
    });
    steps.push({
      id: `n-3-${i * 2 + 1}`,
      values: [parent.values[1]],
      level: 3,
      col: i * 2 + 1,
      type: 'base',
      role: 'right',
      parentId: parent.id,
      index: globalIndex++,
      description: '拆分到单个元素 (Split to single elements)'
    });
  }

  // Merging Phase
  // Merge Level 4 (4 nodes)
  for (let i = 0; i < 8; i += 2) {
    const left = steps.find(s => s.id === `n-3-${i}`)!;
    const right = steps.find(s => s.id === `n-3-${i + 1}`)!;
    const merged = [...left.values, ...right.values].sort((a, b) => a - b);
    steps.push({
      id: `n-4-${i / 2}`,
      values: merged,
      level: 4,
      col: i / 2,
      type: 'merge',
      role: 'result',
      sourceIds: [left.id, right.id],
      index: globalIndex++,
      description: `合并并排序 [${left.values}] 和 [${right.values}]`
    });
  }

  // Merge Level 5 (2 nodes)
  for (let i = 0; i < 4; i += 2) {
    const left = steps.find(s => s.id === `n-4-${i}`)!;
    const right = steps.find(s => s.id === `n-4-${i + 1}`)!;
    const merged = [...left.values, ...right.values].sort((a, b) => a - b);
    steps.push({
      id: `n-5-${i / 2}`,
      values: merged,
      level: 5,
      col: i / 2,
      type: 'merge',
      role: 'result',
      sourceIds: [left.id, right.id],
      index: globalIndex++,
      description: `合并并排序 [${left.values.join(',')}] 和 [${right.values.join(',')}]`
    });
  }

  // Final Merge (1 node)
  const leftFinal = steps.find(s => s.id === 'n-5-0')!;
  const rightFinal = steps.find(s => s.id === 'n-5-1')!;
  const final = [...leftFinal.values, ...rightFinal.values].sort((a, b) => a - b);
  steps.push({
    id: 'n-6-0',
    values: final,
    level: 6,
    col: 0,
    type: 'merge',
    role: 'result',
    sourceIds: [leftFinal.id, rightFinal.id],
    index: globalIndex++,
    description: '最终合并完成，数组已排序 (Final merge, sorted!)'
  });

  return steps;
}

// --- Components ---

const ArrayBlock = ({ values, type, role, isVisible, isMostRecent }: { 
  values: number[], 
  type: TreeNode['type'], 
  role: TreeNode['role'],
  isVisible: boolean,
  isMostRecent: boolean
}) => {
  const getColors = () => {
    if (type === 'merge') {
      return {
        bg: 'bg-green-50 border-green-500/30',
        text: 'text-green-700',
        glow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]'
      };
    }
    if (role === 'left') {
      return {
        bg: 'bg-blue-50 border-blue-500/30',
        text: 'text-blue-700',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]'
      };
    }
    return {
      bg: 'bg-pink-50 border-pink-500/30',
      text: 'text-pink-700',
      glow: 'shadow-[0_0_15px_rgba(236,72,153,0.1)]'
    };
  };

  const colors = getColors();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 20,
        scale: isVisible ? 1 : 0.8,
        borderColor: isMostRecent ? '#3b82f6' : undefined,
        borderWidth: isMostRecent ? '3px' : '2px',
      }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      className={`flex rounded-lg overflow-hidden border-2 min-w-fit transition-all ${colors.bg} ${isMostRecent ? colors.glow : ''}`}
    >
      {values.map((v, i) => {
        const isLeftHalf = i < Math.ceil(values.length / 2);
        const cellColor = type === 'split' ? (isLeftHalf ? 'text-blue-600' : 'text-pink-600') : colors.text;

        return (
          <div 
            key={i} 
            className={`px-3 py-2 flex items-center justify-center border-r last:border-r-0 border-inherit font-mono font-bold ${cellColor}`}
            style={{ width: '3rem' }}
          >
            {v}
          </div>
        );
      })}
    </motion.div>
  );
};

const SVGConnections = ({ nodes, currentStep, containerRef }: { nodes: TreeNode[], currentStep: number, containerRef: React.RefObject<HTMLDivElement> }) => {
  const [lines, setLines] = useState<{id: string, x1: number, y1: number, x2: number, y2: number, isMerge: boolean}[]>([]);

  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines = [];

      for (const node of nodes) {
        if (currentStep < node.index) continue;

        if (node.parentId) {
          const parentEl = document.getElementById(`node-${node.parentId}`);
          const childEl = document.getElementById(`node-${node.id}`);
          if (parentEl && childEl) {
            const pRect = parentEl.getBoundingClientRect();
            const cRect = childEl.getBoundingClientRect();
            
            newLines.push({
              id: `${node.parentId}-${node.id}`,
              x1: pRect.left + pRect.width / 2 - containerRect.left,
              y1: pRect.bottom - containerRect.top,
              x2: cRect.left + cRect.width / 2 - containerRect.left,
              y2: cRect.top - containerRect.top,
              isMerge: false
            });
          }
        } else if (node.sourceIds) {
          for (const sourceId of node.sourceIds) {
            const sourceEl = document.getElementById(`node-${sourceId}`);
            const targetEl = document.getElementById(`node-${node.id}`);
            if (sourceEl && targetEl) {
              const sRect = sourceEl.getBoundingClientRect();
              const tRect = targetEl.getBoundingClientRect();

              newLines.push({
                id: `${sourceId}-${node.id}`,
                x1: sRect.left + sRect.width / 2 - containerRect.left,
                y1: sRect.bottom - containerRect.top,
                x2: tRect.left + tRect.width / 2 - containerRect.left,
                y2: tRect.top - containerRect.top,
                isMerge: true
              });
            }
          }
        }
      }
      setLines(newLines);
    };

    updateLines();
    window.addEventListener('resize', updateLines);
    const interval = setInterval(updateLines, 50);
    return () => {
      window.removeEventListener('resize', updateLines);
      clearInterval(interval);
    };
  }, [nodes, currentStep, containerRef]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {lines.map(line => (
        <line 
          key={line.id} 
          x1={line.x1} 
          y1={line.y1} 
          x2={line.x2} 
          y2={line.y2} 
          stroke={line.isMerge ? "rgba(34,197,94,0.4)" : "rgba(100,116,139,0.4)"} 
          strokeWidth="2" 
        />
      ))}
    </svg>
  );
};

export default function App() {
  const allNodes = useMemo(() => generateMergeSortSteps(INITIAL_ARRAY), []);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const maxSteps = allNodes.length - 1;

  // Auto-scroll to most recent activity
  useEffect(() => {
    if (scrollRef.current) {
        const activeNode = scrollRef.current.querySelector('[data-active="true"]');
        if (activeNode) {
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [currentStep]);

  useEffect(() => {
    if (isPlaying) {
      if (currentStep >= maxSteps) {
        setIsPlaying(false);
        return;
      }
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStep, maxSteps]);

  const handleNext = () => {
    if (currentStep < maxSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentDesc = allNodes[currentStep].description;
  const levels = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center overflow-x-hidden font-sans selection:bg-blue-100 pb-64">
      {/* Header - Minimalist */}
      <div className="w-full max-w-6xl flex justify-between items-end py-4 border-b border-slate-200 px-6 mb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
            归并排序 <span className="text-blue-600">Merge Sort</span>
          </h1>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Visualization v2.1</span>
        </div>
      </div>

      {/* Main Board */}
      <div ref={scrollRef} className="relative w-full max-w-7xl flex flex-col items-center gap-10 py-4 select-none">
        <SVGConnections nodes={allNodes} currentStep={currentStep} containerRef={scrollRef} />
        {levels.map(lvl => (
          <div key={lvl} className="flex flex-col items-center gap-4 w-full">
            {lvl === 4 && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: currentStep >= 15 ? 0.6 : 0 }}
                className="w-full flex items-center gap-4 mb-4 mt-8"
              >
                <div className="h-px flex-grow bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] whitespace-nowrap bg-blue-50 px-6 py-1.5 rounded-full border border-blue-200">
                  Merge Phase Started
                </span>
                <div className="h-px flex-grow bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              </motion.div>
            )}
            <div className="flex justify-center flex-wrap gap-4 md:gap-16 w-full px-4">
              {allNodes.filter(n => n.level === lvl).map(node => (
                <div key={node.id} id={`node-${node.id}`} className="relative z-10" data-active={currentStep === node.index}>
                  <ArrayBlock 
                    values={node.values}
                    type={node.type}
                    role={node.role}
                    isVisible={currentStep >= node.index}
                    isMostRecent={currentStep === node.index}
                  />
                  {lvl === 6 && currentStep === node.index && (
                    <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="absolute -bottom-24 left-1/2 -translate-x-1/2 whitespace-nowrap p-5 rounded-3xl bg-green-50 border-2 border-green-500/40 text-green-700 font-black text-xl shadow-[0_20px_60px_rgba(34,197,94,0.1)] z-10 backdrop-blur-md"
                    >
                       ✨ 归并排序全部完成 ✨
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FIXED Bottom Controller - The Master Logic Center */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-[100] px-4">
        <div className="bg-white/90 backdrop-blur-3xl border border-slate-200 rounded-[1.5rem] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] p-2 md:p-2.5 flex flex-col md:flex-row items-center gap-2 md:gap-4">
          
          {/* Progress Section */}
          <div className="flex-grow flex items-center gap-3 w-full md:w-auto">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
               <Info size={16} />
            </div>
            <div className="flex-grow min-w-0">
               <div className="flex justify-between items-center mb-0.5">
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                      Step {currentStep + 1}
                   </span>
                   <span className="text-[8px] text-slate-400 font-mono">
                      / {allNodes.length}
                   </span>
                 </div>
                 <div className="flex gap-0.5 h-1 min-w-[80px] md:min-w-[120px]">
                   {allNodes.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full rounded-full transition-all duration-300 ${
                        i === currentStep ? 'w-4 bg-blue-600 animate-pulse' : i < currentStep ? 'flex-grow bg-blue-200' : 'w-1 bg-slate-200'
                      }`} 
                    />
                   ))}
                 </div>
               </div>
               <AnimatePresence mode="wait">
                 <motion.p 
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-slate-800 text-xs md:text-sm font-bold tracking-tight truncate pr-2"
                 >
                    {currentDesc}
                 </motion.p>
               </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:block w-px h-6 bg-slate-200" />

          {/* Controls Section */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1 rounded-[1rem] border border-slate-200">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="p-1 md:p-1.5 bg-transparent hover:bg-slate-200 rounded-lg disabled:opacity-20 transition-all text-slate-600 active:scale-90 cursor-pointer"
              title="Previous Step"
            >
              <ChevronLeft size={16} />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer ${
                isPlaying ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'
              }`}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>

            <button 
              onClick={handleNext}
              disabled={currentStep === maxSteps}
              className="p-1 md:p-1.5 bg-transparent hover:bg-slate-200 rounded-lg disabled:opacity-20 transition-all text-slate-600 active:scale-90 cursor-pointer"
              title="Next Step"
            >
              <ChevronRight size={16} />
            </button>

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            <button 
              onClick={handleReset}
              className="p-1 md:p-1.5 text-slate-400 hover:text-slate-900 transition-all hover:rotate-[-45deg] cursor-pointer"
              title="Reset Visualization"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

