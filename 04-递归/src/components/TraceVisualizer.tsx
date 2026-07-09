import React, { useEffect, useRef, useState } from 'react';
import { TraceStep } from '../types';
import { TreeNodeView } from './TreeNodeView';
import { UShapeCanvas } from './UShapeCanvas';
import { QueueCanvas } from './QueueCanvas';
import { ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Code2, Layers, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CODE_MAP = {
  queue: [
    `def get_position(n):`,
    `    if n == 1:`,
    `        return 1`,
    `    else:`,
    `        return get_position(n - 1) + 1`
  ],
  fibonacci: [
    `def fib(n):`,
    `    if n <= 1:`,
    `        return n`,
    `    else:`,
    `        return fib(n - 1) + fib(n - 2)`
  ],
  factorial: [
    `def fact(n):`,
    `    if n == 1:`,
    `        return 1`,
    `    else:`,
    `        return n * fact(n - 1)`
  ]
};

export const TraceVisualizer: React.FC<{ trace: TraceStep[], algo: 'queue'|'fibonacci'|'factorial', onReset: () => void, nValue?: number }> = ({ trace, algo, onReset, nValue }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ id: string, x1: number, y1: number, x2: number, y2: number }[]>([]);

  const currentStep = trace[stepIndex];
  const codeLines = CODE_MAP[algo];

  useEffect(() => {
    let frameId: number;
    let startTime = Date.now();

    const draw = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: any[] = [];

      const traverse = (node: any) => {
        node.children.forEach((c: any) => {
          const pEl = containerRef.current?.querySelector(`[data-id="${node.id}"]`);
          const cEl = containerRef.current?.querySelector(`[data-id="${c.id}"]`);
          if (pEl && cEl) {
            const pRect = pEl.getBoundingClientRect();
            const cRect = cEl.getBoundingClientRect();
            newLines.push({
              id: `${node.id}-${c.id}`,
              x1: pRect.left + pRect.width / 2 - containerRect.left,
              y1: pRect.bottom - containerRect.top,
              x2: cRect.left + cRect.width / 2 - containerRect.left,
              y2: cRect.top - containerRect.top,
            });
          }
          traverse(c);
        });
      };
      
      if (currentStep) {
        traverse(currentStep.tree);
      }
      setLines(newLines);

      if (Date.now() - startTime < 600) {
        frameId = requestAnimationFrame(draw);
      }
    };

    draw();
    window.addEventListener('resize', draw);
    return () => {
      window.removeEventListener('resize', draw);
      cancelAnimationFrame(frameId);
    };
  }, [currentStep]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && stepIndex < trace.length - 1) {
      timer = setTimeout(() => {
        setStepIndex(s => s + 1);
      }, 1500); // Slower for reading
    } else if (isPlaying && stepIndex === trace.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, trace.length]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="flex-none pt-8 pb-4 px-6 bg-white">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-start mb-4">
            <a
              href="../index.html"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
            >
              <ChevronLeft size={18} />
              <span>返回首页</span>
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center text-slate-900">
            {algo === 'queue' ? `递归演示 — 排队买东西 (询问位置)` : `递归演示 — 阶乘 fact(${nValue ?? 4})`}
          </h1>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
      
      {/* Left Panel: Tree & Visuals */}
      <div className="flex-1 relative flex flex-col h-full bg-white overflow-hidden">
        
        {/* Explanation Message Banner */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30 max-w-full px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-slate-900 text-white shadow-2xl px-6 py-3 rounded-2xl border border-slate-700 text-center font-medium shadow-[0_16px_40px_rgba(0,0,0,0.2)] whitespace-nowrap text-sm"
            >
              {currentStep?.message}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tree Canvas, UShape Canvas or Queue Canvas */}
        {algo === 'queue' ? (
          <QueueCanvas activeNodeId={currentStep.activeNodeId} />
        ) : currentStep?.uShape ? (
          <UShapeCanvas data={currentStep.uShape} activeNodeId={currentStep.activeNodeId} />
        ) : (
          <div className="flex-1 overflow-auto relative p-12 pt-32 pb-48 flex justify-center items-start" ref={containerRef}>
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {lines.map(line => (
                <motion.line
                  key={line.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#cbd5e1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {currentStep && (
               <TreeNodeView node={currentStep.tree} activeNodeId={currentStep.activeNodeId} />
            )}
          </div>
        )}

        {/* Floating Controls (Fixed inside Left Panel) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 md:gap-4 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-3 rounded-full border border-slate-100 whitespace-nowrap">
          <button
            onClick={onReset}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            title="重新开始 (Reset)"
          >
            <RotateCcw size={20} />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button
            onClick={() => { setIsPlaying(false); setStepIndex(s => Math.max(0, s - 1)); }}
            disabled={stepIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-700 whitespace-nowrap"
          >
            <ArrowLeft size={16} />
            上一步
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-full font-medium transition-colors text-white whitespace-nowrap ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? '暂停' : '自动播放'}
          </button>

          <button
            onClick={() => { setIsPlaying(false); setStepIndex(s => Math.min(trace.length - 1, s + 1)); }}
            disabled={stepIndex === trace.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-full bg-slate-900 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 whitespace-nowrap"
          >
            下一步
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 z-50">
           <div 
             className="h-full bg-blue-500 transition-all duration-300"
             style={{ width: `${(stepIndex / (trace.length - 1)) * 100}%` }}
           ></div>
        </div>

      </div>

      {/* Right Panel: Context (Code & Stack) */}
      <div className="w-[320px] md:w-[400px] shrink-0 bg-white border-l border-slate-200 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20">
        
        {/* Code Block */}
        <div className="p-6 border-b border-slate-100 bg-slate-800 text-slate-100">
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Code2 size={16} /> 执行代码
          </h3>
          <div className="font-mono text-sm leading-loose">
            {codeLines.map((line, idx) => {
              const isTargetLine = currentStep?.codeLine === idx;
              return (
                <div key={idx} className={`px-2 py-1 rounded transition-colors whitespace-pre ${isTargetLine ? 'bg-blue-500/30 border-l-2 border-blue-400 -ml-[2px]' : 'border-l-2 border-transparent'}`}>
                   {line}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Call Stack / Memory */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col bg-slate-50">
          <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2"><Layers size={16} /> 系统内存栈 (Memory Stack)</div>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono text-[10px]">
              使用量: {(currentStep?.callStack.length || 0) * 32} B
            </span>
          </h3>
          <div className="flex-1 flex flex-col justify-start bg-slate-200/60 rounded-xl p-3 border-2 border-slate-200 overflow-y-auto relative shadow-inner">
             <div className="flex flex-col-reverse gap-2">
               <AnimatePresence>
                  {currentStep?.callStack.map((frame, idx) => {
                    const match = frame.match(/(fact|fib|pos)\((\d+)\)/);
                    const name = match ? (match[1] === 'pos' ? 'get_position' : match[1]) : 'func';
                    const arg = match ? match[2] : '';
                    // Deterministic fake memory address growing downwards
                    const memAddr = `0x${(8192 - idx * 32).toString(16).padStart(4, '0').toUpperCase()}`;

                    return (
                      <motion.div
                        key={`${frame}-${idx}`}
                        initial={{ opacity: 0, x: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="bg-white border-l-4 border-indigo-500 shadow-sm rounded-r-lg p-3 relative overflow-hidden shrink-0"
                      >
                        <div className="text-[10px] font-bold text-slate-400 mb-1 flex justify-between items-center border-b border-slate-100 pb-1">
                          <span>STACK FRAME {idx + 1}</span>
                          <span className="font-mono text-slate-300">{memAddr}</span>
                        </div>
                        <div className="font-mono text-sm text-slate-700 mt-1">
                          <span className="text-indigo-600 font-bold">{name}</span>()
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 mt-2 pl-2 border-l-2 border-indigo-100 flex flex-col gap-1.5">
                           <div>
                             局部变量:{' '}
                             <span className="text-indigo-800 bg-indigo-50 px-1 rounded font-bold">n = {arg}</span>
                           </div>
                           <div>
                             返回地址:{' '}
                             <span className="text-slate-400 bg-slate-100 px-1 rounded">0x{(8192 - idx * 32 + 8).toString(16).padStart(4, '0').toUpperCase()}</span>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {currentStep?.callStack.length === 0 && (
                    <motion.div className="text-slate-400 text-sm italic text-center py-8">
                      内存已清空 (Stack Empty)
                    </motion.div>
                  )}
               </AnimatePresence>
             </div>
          </div>
        </div>

      </div>

      </div>

    </div>
  );
};
