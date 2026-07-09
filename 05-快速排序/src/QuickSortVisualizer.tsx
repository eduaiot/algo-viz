import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

interface Step {
  array: number[];
  pivotIndex: number | null;
  currentIndex: number | null;
  basketAssignments: ('left' | 'middle' | 'right' | null)[];
  partitionRange: [number, number] | null;
  codeLine: number;
  message: string;
  sortedIndices: Set<number>;
}

const PYTHON_CODE = [
  "def quick_sort(arr):",
  "    if len(arr) <= 1:",
  "        return arr",
  "    ",
  "    pivot = arr[len(arr) // 2]",
  "    left = []   # 比标杆小",
  "    middle = [] # 和标杆一样大",
  "    right = []  # 比标杆大",
  "    ",
  "    for num in arr:",
  "        if num < pivot:",
  "            left.append(num)",
  "        elif num == pivot:",
  "            middle.append(num)",
  "        else:",
  "            right.append(num)",
  "            ",
  "    return quick_sort(left) + middle + quick_sort(right)"
];

const FRUITS = ['🍒', '🍓', '🍇', '🥝', '🍌', '🍎', '🍑', '🥭', '🍍', '🍉'];
const INITIAL_ARRAY_SIZE = 7;

export default function QuickSortVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const generateRandomArray = useCallback((size = INITIAL_ARRAY_SIZE) => {
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArray);
    setSteps([]);
    setCurrentStepIndex(-1);
  }, []);

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const generateSteps = useCallback(() => {
    const newSteps: Step[] = [];
    let currentArray = [...array];
    const sortedIndices = new Set<number>();

    function quickSort(arr: number[], offset: number): number[] {
      if (arr.length <= 1) {
        if (arr.length === 1) sortedIndices.add(offset);
        return arr;
      }

      const pivotIdxInArr = Math.floor(arr.length / 2);
      const pivot = arr[pivotIdxInArr];
      const basketAssignments: ('left' | 'middle' | 'right' | null)[] = new Array(currentArray.length).fill(null);

      newSteps.push({
        array: [...currentArray],
        pivotIndex: offset + pivotIdxInArr,
        currentIndex: null,
        basketAssignments: [...basketAssignments],
        partitionRange: [offset, offset + arr.length - 1],
        codeLine: 5,
        message: `选择标杆：${pivot}`,
        sortedIndices: new Set(sortedIndices)
      });

      const left: number[] = [];
      const middle: number[] = [];
      const right: number[] = [];

      for (let i = 0; i < arr.length; i++) {
        const num = arr[i];
        const globalIdx = offset + i;

        newSteps.push({
          array: [...currentArray],
          pivotIndex: offset + pivotIdxInArr,
          currentIndex: globalIdx,
          basketAssignments: [...basketAssignments],
          partitionRange: [offset, offset + arr.length - 1],
          codeLine: 10,
          message: `点名：${num}`,
          sortedIndices: new Set(sortedIndices)
        });

        if (num < pivot) {
          left.push(num);
          basketAssignments[globalIdx] = 'left';
          newSteps.push({
            array: [...currentArray],
            pivotIndex: offset + pivotIdxInArr,
            currentIndex: globalIdx,
            basketAssignments: [...basketAssignments],
            partitionRange: [offset, offset + arr.length - 1],
            codeLine: 12,
            message: `${num} < ${pivot}，进左篮子`,
            sortedIndices: new Set(sortedIndices)
          });
        } else if (num === pivot) {
          middle.push(num);
          basketAssignments[globalIdx] = 'middle';
          newSteps.push({
            array: [...currentArray],
            pivotIndex: offset + pivotIdxInArr,
            currentIndex: globalIdx,
            basketAssignments: [...basketAssignments],
            partitionRange: [offset, offset + arr.length - 1],
            codeLine: 14,
            message: `${num} == ${pivot}，进中间篮子`,
            sortedIndices: new Set(sortedIndices)
          });
        } else {
          right.push(num);
          basketAssignments[globalIdx] = 'right';
          newSteps.push({
            array: [...currentArray],
            pivotIndex: offset + pivotIdxInArr,
            currentIndex: globalIdx,
            basketAssignments: [...basketAssignments],
            partitionRange: [offset, offset + arr.length - 1],
            codeLine: 16,
            message: `${num} > ${pivot}，进右篮子`,
            sortedIndices: new Set(sortedIndices)
          });
        }
      }

      // Concatenation step visualization
      const combined = [...left, ...middle, ...right];
      const nextArray = [...currentArray];
      for (let i = 0; i < combined.length; i++) {
        nextArray[offset + i] = combined[i];
      }

      newSteps.push({
        array: [...nextArray],
        pivotIndex: null,
        currentIndex: null,
        basketAssignments: new Array(currentArray.length).fill(null),
        partitionRange: [offset, offset + arr.length - 1],
        codeLine: 18,
        message: `分兵结束，重新归队`,
        sortedIndices: new Set(sortedIndices)
      });

      currentArray = [...nextArray];

      // Recursively sort left and right
      const sortedLeft = quickSort(left, offset);
      const sortedRight = quickSort(right, offset + left.length + middle.length);

      // After recursion, the middle part is definitely sorted in the context of this range
      for (let i = 0; i < middle.length; i++) {
        sortedIndices.add(offset + left.length + i);
      }

      return [...sortedLeft, ...middle, ...sortedRight];
    }

    quickSort([...array], 0);

    newSteps.push({
      array: [...currentArray].sort((a, b) => a - b),
      pivotIndex: null,
      currentIndex: null,
      basketAssignments: new Array(array.length).fill(null),
      partitionRange: null,
      codeLine: 0,
      message: "全部排好队了！",
      sortedIndices: new Set(array.map((_, i) => i))
    });

    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [array]);

  const handleNext = () => {
    if (steps.length === 0) {
      generateSteps();
      return;
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  const currentStep = steps[currentStepIndex] || {
    array: array,
    pivotIndex: null,
    currentIndex: null,
    basketAssignments: new Array(array.length).fill(null),
    partitionRange: null,
    codeLine: -1,
    message: "",
    sortedIndices: new Set()
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto w-full">
      <header className="w-full mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">快速排序：篮子分兵法</h1>
        <p className="text-slate-500 font-medium">Quick Sort: The Three-Basket Approach</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Visualizer Section */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-[340px] flex flex-col items-center relative overflow-hidden">
            {/* Top explanation text */}
            <div className="w-full text-center mb-2 min-h-[36px] flex items-center justify-center">
              {currentStep.message && (
                <span className="text-xs md:text-sm font-bold text-indigo-900 bg-indigo-50/60 px-4 py-1 rounded-full border border-indigo-100/40 shadow-sm">
                  {currentStep.message}
                </span>
              )}
            </div>

            {/* Top Row: Original Sub-array */}
            <div className="flex items-end justify-center gap-2 h-[120px] w-full border-b border-slate-100 pb-4">
              <AnimatePresence mode="popLayout">
                {(() => {
                  const N = currentStep.array.length;
                  const leftElements = currentStep.array.map((_, i) => i).filter(i => currentStep.basketAssignments[i] === 'left');
                  const middleElements = currentStep.array.map((_, i) => i).filter(i => currentStep.basketAssignments[i] === 'middle');
                  const rightElements = currentStep.array.map((_, i) => i).filter(i => currentStep.basketAssignments[i] === 'right');

                  return currentStep.array.map((val, idx) => {
                    const assignment = currentStep.basketAssignments[idx];
                    const isPivot = currentStep.pivotIndex === idx;
                    const isCurrent = currentStep.currentIndex === idx;
                    const isSorted = currentStep.sortedIndices.has(idx);
                    const isDimmed = currentStep.partitionRange &&
                      (idx < currentStep.partitionRange[0] || idx > currentStep.partitionRange[1]);

                    // Determine colors based on state
                    let bgColor = 'bg-slate-200';
                    let textColor = 'text-slate-600';
                    let ring = '';

                    if (isSorted) {
                      bgColor = 'bg-emerald-500';
                      textColor = 'text-white';
                    } else if (isPivot) {
                      bgColor = 'bg-orange-400';
                      textColor = 'text-white';
                    } else if (assignment === 'left') {
                      bgColor = 'bg-rose-400';
                      textColor = 'text-white';
                    } else if (assignment === 'middle') {
                      bgColor = 'bg-teal-400';
                      textColor = 'text-white';
                    } else if (assignment === 'right') {
                      bgColor = 'bg-sky-400';
                      textColor = 'text-white';
                    }

                    // "Current" (点名) state overrides others for visibility
                    if (isCurrent) {
                      bgColor = 'bg-indigo-600';
                      textColor = 'text-white';
                      ring = 'ring-2 ring-offset-2 ring-indigo-600';
                    }

                    // Vertical displacement logic
                    let translateY = 0;
                    let translateX = 0;
                    if (assignment) {
                      translateY = 95;
                      const originX = (idx - (N - 1) / 2) * 64;
                      let basketCenter = 0;
                      let k = 0;
                      let count = 0;

                      if (assignment === 'left') {
                        basketCenter = -160;
                        k = leftElements.indexOf(idx);
                        count = leftElements.length;
                      } else if (assignment === 'middle') {
                        basketCenter = 0;
                        k = middleElements.indexOf(idx);
                        count = middleElements.length;
                      } else if (assignment === 'right') {
                        basketCenter = 160;
                        k = rightElements.indexOf(idx);
                        count = rightElements.length;
                      }

                      const targetX = basketCenter + (k - (count - 1) / 2) * 60;
                      translateX = targetX - originX;
                    }

                    const fruitIndex = Math.min(Math.floor((val - 10) / 9), FRUITS.length - 1);
                    const fruit = FRUITS[fruitIndex];

                    return (
                      <motion.div
                        key={`${idx}-${val}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: isDimmed ? 0.2 : 1,
                          y: translateY,
                          x: translateX,
                          scale: isCurrent ? 1.2 : 1,
                        }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
                        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-xs font-bold relative transition-colors duration-200
                          ${bgColor} ${textColor} ${ring} shadow-md
                        `}
                      >
                        <span className="text-2xl drop-shadow-sm">{fruit}</span>
                        <span className="absolute -bottom-6 text-slate-700 font-mono text-[11px] bg-slate-100/80 px-2 py-0.5 rounded-full">{val}</span>
                        {isPivot && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-orange-600 font-mono font-bold">PIVOT</div>}
                      </motion.div>
                    );
                  });
                })()}
              </AnimatePresence>
            </div>

            {/* Bottom Labels for Baskets */}
            <div className="flex justify-between w-full mt-auto pt-4 px-4 opacity-70">
              <div className="flex flex-col items-center gap-1 w-1/3">
                <div className="w-full h-1 bg-rose-500/20 rounded-full"></div>
                <span className="text-[10px] font-medium tracking-wide text-rose-600 font-bold">左篮子</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-1/3">
                <div className="w-full h-1 bg-teal-500/20 rounded-full"></div>
                <span className="text-[10px] font-medium tracking-wide text-teal-600 font-bold">中间篮子</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-1/3">
                <div className="w-full h-1 bg-blue-600/20 rounded-full"></div>
                <span className="text-[10px] font-medium tracking-wide text-blue-700 font-bold">右篮子</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white border border-slate-200 rounded-xl py-4 px-6 flex flex-wrap md:flex-nowrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-3 w-full">
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-slate-600 font-medium">标杆</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <div className="w-3 h-3 rounded bg-rose-500"></div>
              <span className="text-slate-600 font-medium">左篮子 (小于标杆)</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <div className="w-3 h-3 rounded bg-teal-500"></div>
              <span className="text-slate-600 font-medium">中间篮子 (等于标杆)</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <div className="w-3 h-3 rounded bg-blue-600"></div>
              <span className="text-slate-600 font-medium">右篮子 (大于标杆)</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <div className="w-3 h-3 rounded bg-slate-200"></div>
              <span className="text-slate-600 font-medium">未排序</span>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex <= 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 transition-all active:scale-95 text-sm font-bold text-slate-700"
              title="上一步"
            >
              <ChevronLeft size={18} /> 上一步
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex >= steps.length - 1 && steps.length > 0}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 transition-all active:scale-95 text-sm font-bold text-white shadow-md shadow-indigo-600/20"
              title="下一步"
            >
              下一步 <ChevronRight size={18} />
            </button>

            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-bold text-slate-700"
            >
              <RotateCcw size={18} /> 重新开始
            </button>
          </div>
        </div>

        {/* Code Section */}
        <div className="w-full lg:w-[45%] shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">Py代码</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
            </div>
            <div className="p-4 font-mono text-[13px] overflow-y-auto overflow-x-hidden flex-1 bg-white">
              {PYTHON_CODE.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 px-2 py-0.5 rounded transition-colors ${currentStep.codeLine === idx + 1 ? 'bg-sky-100 text-sky-700 font-bold' : 'text-slate-500'
                    }`}
                >
                  <span className="w-6 text-right opacity-40 select-none">{idx + 1}</span>
                  <pre className="whitespace-pre">{line}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
