/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, Fragment } from 'react';
import { generateBubbleSortSteps, Student } from './bubbleSort';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: '数字 5', value: 5, height: 165 },
  { id: 's2', name: '数字 2', value: 2, height: 150 },
  { id: 's3', name: '数字 8', value: 8, height: 180 },
  { id: 's4', name: '数字 1', value: 1, height: 145 },
];

export default function App() {
  const steps = useMemo(() => generateBubbleSortSteps(INITIAL_STUDENTS), []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];

  const sortedIndices = currentStep.sortedIndices;
  const minSortedIndex = sortedIndices.length > 0 ? Math.min(...sortedIndices) : -1;
  const desc = currentStep.loopState?.desc || "";
  const isActive = (match: string) => desc.includes(match);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
     if (currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
     }
  }

  const reset = () => {
    setCurrentStepIndex(0);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans pb-40">
      {/* 极简顶栏进度 */}
      <div className="fixed top-0 left-0 h-1.5 bg-gray-100 w-full z-50">
         <div
           className="h-full bg-blue-600 transition-all duration-300 ease-out"
           style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
         ></div>
      </div>

      <header className="py-12 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-gray-900">
          冒泡排序演示：体育课排队
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          通过同学们按身高排队的实例，直观理解<br className="sm:hidden" />算法中的<strong className="text-blue-600">外层循环</strong>与<strong className="text-orange-500">内层循环</strong>。
        </p>
      </header>

      <main className="max-w-[1600px] w-full mx-auto px-4 xl:px-8 mt-2 relative flex flex-col xl:flex-row gap-6 items-stretch pb-[80px]">
         {/* Left Main Column */}
         <div className="flex-1 flex flex-col min-w-0">
           {/* 状态解说长条 */}
           <div className="bg-gray-50 border-l-4 border-blue-600 p-6 md:p-8 rounded-r-2xl mb-6 min-h-[140px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                     {currentStep.message}
                  </h2>
                  {currentStep.subMessage && (
                     <p className="text-lg text-gray-600 leading-relaxed font-medium">
                       {currentStep.subMessage}
                     </p>
                  )}
                </motion.div>
              </AnimatePresence>
           </div>

           {/* 动画演示白板舞台 */}
           <div className="relative bg-white border-2 flex-1 border-gray-100 rounded-[2rem] pt-12 pb-0 px-2 md:px-8 flex flex-col justify-end shadow-sm overflow-hidden min-h-[500px]">
             {/* 实感背景地平线 */}
             <div className="absolute bottom-0 left-0 w-full h-[60px] bg-slate-50 border-t-4 border-slate-200 z-0"></div>

             <div className="flex flex-nowrap items-end justify-center gap-2 md:gap-4 w-full relative z-10 pb-[60px]">
               {currentStep.array.map((student, index) => {
                  const isComparing = currentStep.comparing && (currentStep.comparing[0] === index || currentStep.comparing[1] === index);
                  const isSorted = sortedIndices.includes(index);
                  const isBoundary = index === minSortedIndex && index > 0;

                  // 动态高度映射：基础 160px，每增加 1cm 增高 6px
                  // 155cm -> 190px，180cm -> 340px，差距显著
                  const displayHeight = 160 + (student.height - 150) * 6;

                  return (
                    <Fragment key={student.id}>
                      {isBoundary && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="flex flex-col items-center justify-end h-[360px] mx-1 md:mx-2 z-20"
                        >
                          <div className="text-emerald-700 font-extrabold text-xs md:text-sm mb-3 bg-emerald-100 border-2 border-emerald-200 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                            ✅ 已排好 (无需再比)
                          </div>
                          <div className="w-0.5 border-l-[3px] border-dashed border-emerald-400 h-full opacity-50"></div>
                        </motion.div>
                      )}

                      <motion.div
                         layout
                         transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                         style={{ height: `${displayHeight}px` }}
                         className={`
                           relative w-[110px] md:w-[130px] rounded-t-2xl border-x-2 border-t-2 flex flex-col items-center justify-between pb-5 pt-7 bg-white cursor-default origin-bottom
                           ${isComparing ? 'border-orange-500 shadow-2xl scale-105 z-30' : 'border-gray-200 z-10 hover:border-gray-300 transition-colors'}
                           ${isSorted ? 'border-emerald-500 bg-emerald-50/80 shadow-inner' : 'shadow-md'}
                           ${isComparing && isSorted ? 'bg-orange-50' : ''}
                         `}
                      >
                         {/* 数组索引与代码变量对应 */}
                         <div className={`absolute -top-5 font-mono text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border shadow-sm transition-all whitespace-nowrap
                            ${currentStep.loopState?.j === index ? 'bg-orange-600 text-white border-orange-700 scale-110 z-50' :
                              currentStep.loopState?.j !== null && currentStep.loopState?.j + 1 === index ? 'bg-orange-400 text-white border-orange-500 scale-110 z-50' :
                              isSorted ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                           {currentStep.loopState?.j === index ? `j=${index}` : 
                            currentStep.loopState?.j !== null && currentStep.loopState?.j + 1 === index ? `j+1=${index}` : 
                            `num[${index}]`}
                         </div>

                         <div className="text-[2.5rem] md:text-[3.5rem] leading-none mb-auto transform-gpu mt-1">
                           {isSorted ? '🧑‍🎓' : '🧍'}
                         </div>
                         
                         <div className="flex flex-col items-center mt-auto w-full px-2">
                           <div className="font-extrabold text-lg md:text-2xl text-gray-900 tracking-wide break-keep">{student.name}</div>
                           <div className={`mt-2 font-mono text-xl md:text-2xl font-black px-3 py-1.5 md:px-5 md:py-2 rounded-xl transition-colors border-2 w-full text-center
                              ${isComparing ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-inner' : 'bg-gray-100 text-gray-700 border-gray-200'}
                              ${isSorted ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-inner' : ''}
                           `}>
                             {student.value}
                           </div>
                         </div>

                         {/* 换位动画提示字 */}
                         {isComparing && currentStep.swapping && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              className="absolute top-1/2 -translate-y-1/2 bg-orange-600 text-white text-sm md:text-base px-4 py-1.5 rounded-full whitespace-nowrap font-bold shadow-lg shadow-orange-500/40 border-2 border-white z-40"
                            >
                              换位!
                            </motion.div>
                         )}
                      </motion.div>
                    </Fragment>
                  )
               })}
             </div>
           </div>
         </div>

         {/* Right Sidebar Column - Code & Variables Panel */}
         <div className="w-full xl:w-[500px] 2xl:w-[600px] shrink-0">
           <div className="bg-[#1e1e1e] rounded-2xl shadow-xl border border-[#333] flex flex-col overflow-hidden sticky top-6">
              {/* Mac window header */}
              <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between border-b border-[#111]">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
                </div>
                <span className="text-gray-400 text-xs font-sans font-bold tracking-wider">执行排演</span>
                <div className="w-11"></div>
              </div>

              <div className="p-4 md:p-6 font-mono text-[13px] md:text-sm flex-1 flex flex-col gap-5">
                 {/* Python Code View */}
                 <div className="bg-[#141414] p-4 rounded-xl border border-[#333] text-[#d4d4d4] overflow-x-auto shadow-inner leading-relaxed">
                    <pre className="!m-0 relative z-10 w-full whitespace-pre flex flex-col min-w-max">
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("准备开始") ? "bg-blue-500/25 border-l-[3px] border-blue-400" : "border-l-[3px] border-transparent"}`}>
                        <span className="text-[#569cd6]">num</span> = [{INITIAL_STUDENTS.map(s => s.value).join(', ')}]
                      </div>
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("准备开始") ? "bg-blue-500/25 border-l-[3px] border-blue-400" : "border-l-[3px] border-transparent"}`}>
                        <span className="text-[#9cdcfe]">count</span> = <span className="text-[#dcdcaa]">len</span>(num) <span className="text-[#d4d4d4]">-</span> <span className="text-[#b5cea8]">1</span>
                      </div>
                      
                      <div className="h-2"></div>
                      
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("for i") ? "bg-blue-500/25 border-l-[3px] border-blue-400" : "border-l-[3px] border-transparent"}`}>
                        <span className="text-[#c586c0]">for</span> <span className="text-[#9cdcfe]">i</span> <span className="text-[#c586c0]">in</span> <span className="text-[#dcdcaa]">range</span>(count):
                      </div>
                      
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("for i") ? "bg-blue-500/25 border-l-[3px] border-blue-400" : "border-l-[3px] border-transparent"}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#dcdcaa]">print</span>(<span className="text-[#ce9178]">f"\\n第 &#123;i+1&#125; 轮冒泡："</span>, <span className="text-[#9cdcfe]">end</span>=<span className="text-[#ce9178]">''</span>)
                      </div>
                      
                      <div className="h-2"></div>
                      
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("for j") ? "bg-blue-500/25 border-l-[3px] border-blue-400" : "border-l-[3px] border-transparent"}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#c586c0]">for</span> <span className="text-[#9cdcfe]">j</span> <span className="text-[#c586c0]">in</span> <span className="text-[#dcdcaa]">range</span>(count - i):
                      </div>
                      
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("if num[j]") ? "bg-blue-500/25 border-l-[3px] border-blue-400" : "border-l-[3px] border-transparent"}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#c586c0]">if</span> <span className="text-[#569cd6]">num</span>[j] &gt; <span className="text-[#569cd6]">num</span>[j+1]:
                      </div>
                      
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("交换") ? "bg-[#2ea043]/30 border-l-[3px] border-[#2ea043]" : "border-l-[3px] border-transparent"}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#569cd6]">num</span>[j], <span className="text-[#569cd6]">num</span>[j+1] = <span className="text-[#569cd6]">num</span>[j+1], <span className="text-[#569cd6]">num</span>[j]
                      </div>
                      
                      <div className="h-2"></div>
                      
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("当前列表") ? "bg-blue-500/25 border-l-[3px] border-blue-400" : "border-l-[3px] border-transparent"}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#dcdcaa]">print</span>(<span className="text-[#ce9178]">"当前列表:"</span>, num, <span className="text-[#9cdcfe]">end</span>=<span className="text-[#ce9178]">''</span>)
                      </div>
                      
                      <div className="h-2"></div>
                      
                      <div className={`px-2 py-0.5 rounded transition-colors ${isActive("最终排序结果") ? "bg-blue-500/25 border-l-[3px] border-blue-400" : "border-l-[3px] border-transparent"}`}>
                        <span className="text-[#dcdcaa]">print</span>(<span className="text-[#ce9178]">"\\n最终排序结果:"</span>, num)
                      </div>
                    </pre>
                 </div>

                 {/* Variable View */}
                 <div className="bg-[#252526] p-4 rounded-xl border border-[#333]">
                    <div className="mb-3 text-[#569cd6] font-bold pb-2 border-b border-[#444] text-xs uppercase tracking-widest flex items-center gap-2 flex-wrap">
                      <span className="bg-[#1e1e1e] p-1 rounded">LOCAL VARIABLES</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[#9cdcfe] w-12 shrink-0">count</span> 
                        <span className="text-gray-500">=</span> 
                        <span className="text-[#b5cea8] font-bold">{steps[0].array.length - 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[#9cdcfe] w-12 shrink-0">i</span> 
                        <span className="text-gray-500">=</span> 
                        {currentStep.loopState?.i !== null ? (
                          <motion.span 
                            key={`i-${currentStep.loopState.i}`} 
                            initial={{ color: "#fff", scale: 1.2 }} 
                            animate={{ color: "#b5cea8", scale: 1 }}
                            className="text-[#b5cea8] font-bold inline-block"
                          >
                            {currentStep.loopState.i}
                          </motion.span>
                        ) : (
                          <span className="text-gray-500 italic">undefined</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[#9cdcfe] w-12 shrink-0">j</span> 
                        <span className="text-gray-500">=</span> 
                        {currentStep.loopState?.j !== null ? (
                          <motion.span 
                            key={`j-${currentStep.loopState.j}`} 
                            initial={{ color: "#fff", scale: 1.2 }} 
                            animate={{ color: "#b5cea8", scale: 1 }}
                            className="text-[#b5cea8] font-bold inline-block"
                          >
                            {currentStep.loopState.j}
                          </motion.span>
                        ) : (
                          <span className="text-gray-500 italic">undefined</span>
                        )}
                      </div>
                    </div>
                 </div>

                 {/* Execution Details Overlay */}
                 {currentStep.loopState?.desc && (
                   <div className="text-[#ce9178] bg-[#3e1b1b] border border-[#a22a2a]/30 p-3 rounded-xl font-bold text-xs mt-auto flex items-start gap-2 shadow-inner leading-relaxed">
                     <span className="text-[#f14c4c] mt-0.5 shrink-0">❯</span>
                     <span>{currentStep.loopState.desc}</span>
                   </div>
                 )}
              </div>
           </div>
         </div>
      </main>

      {/* 底部悬浮控制台 - 永远固定在屏幕底部保证随时可以点击 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white border border-gray-200 px-6 py-4 rounded-[2rem] shadow-2xl z-50 overflow-x-auto whitespace-nowrap pointer-events-auto">
         <button
            onClick={reset}
            disabled={currentStepIndex === 0}
            className="flex items-center justify-center p-3 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="重新开始"
         >
           <RotateCcw size={22} strokeWidth={2.5} />
         </button>

         <div className="w-px h-8 bg-gray-200 mx-1"></div>

         <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center justify-center p-3 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors font-medium border border-transparent hover:border-gray-200"
         >
            <ChevronLeft size={24} className="mr-1" />
            <span className="hidden sm:inline font-bold">上一步</span>
         </button>

         <div className="flex items-center justify-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100 mx-2">
            <span className="text-blue-600 font-mono font-bold text-sm">
                {currentStepIndex + 1}
            </span>
            <span className="text-gray-400 font-mono font-bold text-sm mx-1">/</span>
            <span className="text-gray-500 font-mono font-bold text-sm">
                 {steps.length}
            </span>
         </div>

         <button
            onClick={nextStep}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center justify-center px-8 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-blue-600/20 group"
         >
            <span className="font-extrabold text-lg mr-2">下一步</span>
            <ChevronRight size={22} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
         </button>
      </div>
    </div>
  );
}

