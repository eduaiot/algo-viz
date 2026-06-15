import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Code2, ChevronLeft } from 'lucide-react';
import { Tile, SortState } from './types';
import { MahjongTile } from './components/MahjongTile';

const CODE_LINES = [
  "nums = [8,9,1,3,2,5]",
  "n = len(nums)",
  "",
  "for i in range(n):",
  "    min_index = i ",
  "    ",
  "    for j in range(i + 1, n):",
  "        if nums[j] < nums[min_index]:",
  "            min_index = j ",
  "            ",
  "    nums[i], nums[min_index] = nums[min_index], nums[i]"
];

const generateInitialTiles = (): Tile[] => {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffle array using Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Take first 6 and convert to Tiles
  return pool.slice(0, 6).map((val, idx) => ({ id: `tile-${idx}-${val}`, value: val }));
};

const generateStates = (initialArr: Tile[]): SortState[] => {
  const arr = [...initialArr];
  const steps: SortState[] = [];
  const n = arr.length;

  steps.push({
    arr: [...arr],
    sortedEnd: 0,
    targetIdx: null,
    comparing: [],
    candidateIdx: null,
    swapping: [],
    message: "开始选择排序演示。当前所有元素都在未排序组中。",
    activeLines: [0, 1]
  });

  // 外层循环：循环整个列表，总认为“未排序”的最左边第1个值最小值
  for (let i = 0; i < n; i++) {
    // 1. “未排序”的最左边第1个值最小值
    let min_index = i;

    steps.push({
      arr: [...arr],
      sortedEnd: i, // 仍在未排序区域
      targetIdx: i,
      comparing: [],
      candidateIdx: min_index, // 高亮为目前最小值
      swapping: [],
      message: `第 ${i + 1} 轮外层循环：设定未排序区最左侧（位置 i 为 ${i}）为目标基准位，默认其牌面是最小值。`,
      activeLines: [3, 4]
    });

    // 2. 内层循环：从“未排序”里面找最小值的位置
    for (let j = i + 1; j < n; j++) {
      steps.push({
        arr: [...arr],
        sortedEnd: i,
        targetIdx: i,
        comparing: [j, min_index],
        candidateIdx: min_index, // 保持之前候选颜色的高亮
        swapping: [],
        message: `内层循环：用未排序组的 ${arr[j].value}万 与当前最小值 ${arr[min_index].value}万 进行比较。`,
        activeLines: [6, 7]
      });

      if (arr[j].value < arr[min_index].value) {
        // 3. 更换最新的最小值位置
        min_index = j;
        steps.push({
          arr: [...arr],
          sortedEnd: i,
          targetIdx: i,
          comparing: [],
          candidateIdx: min_index,
          swapping: [],
          message: `发现更小值！更新最小值位置 min_index 为当前发现的 ${arr[min_index].value}万。`,
          activeLines: [8]
        });
      }
    }

    // 4. 每次最外层的一圈，把真正最小的人与最左侧“认为小的”进行交换
    if (min_index !== i) {
      steps.push({
        arr: [...arr],
        sortedEnd: i,
        targetIdx: i,
        comparing: [],
        candidateIdx: min_index,
        swapping: [i, min_index],
        message: `本轮比较结束：把真正最小的（${arr[min_index].value}万）与原本的基准位元素（${arr[i].value}万）进行交换。`,
        activeLines: [10]
      });

      // 物理交换
      const temp = arr[i];
      arr[i] = arr[min_index];
      arr[min_index] = temp;

      steps.push({
        arr: [...arr],
        sortedEnd: i,
        targetIdx: i,
        comparing: [],
        candidateIdx: i,
        swapping: [],
        message: `交换完成！基准位现在已被整个未排序组的最小值 ${arr[i].value}万 占据。`,
        activeLines: [10]
      });
    } else {
      steps.push({
        arr: [...arr],
        sortedEnd: i,
        targetIdx: i,
        comparing: [],
        candidateIdx: min_index,
        swapping: [],
        message: `本轮比较结束：基准目标位的 ${arr[i].value}万 本身就是最小值，无需位置交换。`,
        activeLines: [10]
      });
    }

    // 已排好的元素进入已排序状态区
    steps.push({
      arr: [...arr],
      sortedEnd: i + 1, // i 及其之前的元素正式划入已排序区域
      targetIdx: null,
      comparing: [],
      candidateIdx: null,
      swapping: [],
      message: `将确认排好序的 ${arr[i].value}万 划入已排序组。`,
      activeLines: []
    });
  }

  steps.push({
    arr: [...arr],
    sortedEnd: n,
    targetIdx: null,
    comparing: [],
    candidateIdx: null,
    swapping: [],
    message: "🎉 选择排序演示结束。所有元素均已排序完成！",
    activeLines: []
  });

  return steps;
};

export default function App() {
  const [initialTiles, setInitialTiles] = useState<Tile[]>([]);
  const [states, setStates] = useState<SortState[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const tiles = generateInitialTiles();
    setInitialTiles(tiles);
    setStates(generateStates(tiles));
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    let timer: number;
    if (isPlaying && currentStepIdx < states.length - 1) {
      timer = window.setTimeout(() => {
        setCurrentStepIdx(s => s + 1);
      }, 1500); // 1.5s per step
    } else if (currentStepIdx >= states.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, states.length]);

  if (states.length === 0) return null;

  const currentState = states[currentStepIdx];
  // remove isolated sorted/unsorted slice to not mess up indices mappings if we use single map
  /* Removed slice, we will render from `currentState.arr` directly */

  const getTileStatus = (indexInArr: number) => {
    if (currentState.swapping.includes(indexInArr)) return 'swapping';
    if (currentState.candidateIdx === indexInArr) return 'candidate';
    if (currentState.comparing.includes(indexInArr)) return 'comparing';
    return 'normal';
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-32">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 max-w-6xl mx-auto border-b border-gray-100">
        <div className="flex justify-start mb-6">
          <a
            href="../index.html"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
          >
            <ChevronLeft size={18} />
            <span>返回首页</span>
          </a>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-center text-slate-900">
          选择排序演示 (Selection Sort)
        </h1>
      </header>

      {/* Message Banner */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 shadow-sm text-center min-h-[100px] flex items-center justify-center transition-all duration-300">
          <p className="text-xl md:text-2xl font-medium tracking-wide text-blue-900">
            {currentState.message}
          </p>
        </div>
      </div>

      {/* Interactive Board */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Arrays */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Single Row Array */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-medium text-slate-700">麻将牌序列</h2>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                已排序区
              </span>
              <span className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-white text-slate-600 rounded-full border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                未排序区
              </span>
              <span className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                基准位 (i)
              </span>
              <span className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                当前最小 (min)
              </span>
            </div>
          </div>

            <div className="flex flex-wrap gap-4 md:gap-x-6 md:gap-y-16 min-h-[110px] md:min-h-[220px] p-6 pt-10 pb-10 md:pt-14 md:pb-14 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm relative">
              {currentState.arr.map((tile, idx) => {
                const isSorted = idx < currentState.sortedEnd;
                const isTarget = idx === currentState.targetIdx;
                return (
                  <div key={tile.id} className="relative z-10">
                    <MahjongTile 
                      tile={tile} 
                      status={getTileStatus(idx)} 
                      isSorted={isSorted}
                      isTarget={isTarget}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Code View */}
        <div className="lg:col-span-1">
          <section className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2">
              <Code2 className="text-slate-500" size={24} />
              <h2 className="text-xl font-medium text-slate-700">算法代码 (Python)</h2>
            </div>
            
            <div className="flex-1 bg-[#1e1e1e] rounded-3xl p-6 shadow-inner font-mono text-sm md:text-base overflow-x-auto relative">
              <div className="flex flex-col gap-[2px]">
                {CODE_LINES.map((line, idx) => {
                  const isActive = currentState.activeLines.includes(idx);
                  return (
                    <div 
                      key={idx} 
                      className={`px-3 py-1 -mx-3 rounded transition-colors duration-300 flex ${
                        isActive ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400'
                      }`}
                    >
                      <span className={`w-6 text-right mr-4 select-none ${isActive ? 'text-blue-500/50' : 'text-slate-600'}`}>
                        {idx + 1}
                      </span>
                      <pre className="whitespace-pre flex-1 m-0 pointer-events-none">
                        {line}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

      </main>

      {/* Floating Action Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100">
        
        {/* Reset Button */}
        <button 
          onClick={init}
          className="p-4 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="重新发牌"
        >
          <RotateCcw size={24} />
        </button>

        {/* Play/Pause Button */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={currentStepIdx >= states.length - 1}
          className={`p-4 rounded-full transition-colors ${
            isPlaying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          } disabled:opacity-50`}
          title={isPlaying ? "暂停播放" : "自动播放"}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        {/* Separator */}
        <div className="w-[1px] h-10 bg-slate-200 mx-1"></div>

        {/* Next Step Button */}
        <button 
          onClick={() => {
            setIsPlaying(false);
            if (currentStepIdx < states.length - 1) {
              setCurrentStepIdx(s => s + 1);
            }
          }}
          disabled={currentStepIdx >= states.length - 1}
          className="bg-blue-600 shadow-md shadow-blue-500/20 text-white font-medium text-lg px-8 py-4 rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:shadow-none"
        >
          下一步 <ChevronRight size={24} />
        </button>
        
      </div>
    </div>
  );
}
