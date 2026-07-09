import React, { useState, useMemo } from 'react';
import { getFactorialTrace, getQueueTrace } from './lib/traceGenerator';
import { TraceVisualizer } from './components/TraceVisualizer';

export default function App() {
  const [algo, setAlgo] = useState<'queue' | 'factorial'>('queue');

  const trace = useMemo(() => {
    if (algo === 'queue') {
      return getQueueTrace(5);
    }
    return getFactorialTrace(4);
  }, [algo]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50">
      {/* Tab Navigation */}
      <div className="flex-none bg-white border-b border-slate-200 py-3 px-6 flex justify-center items-center gap-4 z-30">
        <button
          onClick={() => setAlgo('queue')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            algo === 'queue'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          1. 排队买东西场景 (直观理解)
        </button>
        <button
          onClick={() => setAlgo('factorial')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            algo === 'factorial'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          2. 数学阶乘计算 (深入代码)
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <TraceVisualizer
          key={algo}
          trace={trace}
          algo={algo}
          onReset={() => {}}
          nValue={algo === 'queue' ? 5 : 4}
        />
      </div>
    </div>
  );
}
