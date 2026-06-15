import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { CardData } from '../types';

const INITIAL_CARDS: CardData[] = [
  { id: 1, value: 7, suit: '♥️', display: '7', faceUp: true, status: 'idle' },
  { id: 2, value: 3, suit: '♠️', display: '3', faceUp: true, status: 'idle' },
  { id: 3, value: 10, suit: '♦️', display: '10', faceUp: true, status: 'idle' },
  { id: 4, value: 2, suit: '♣️', display: '2', faceUp: true, status: 'idle' }
];

const CODE_LINES = [
  { num: 1, text: "nums = [7,3,10,2]" },
  { num: 2, text: "" },
  { num: 3, text: "# 默认第1张已经排好，从第2张开始" },
  { num: 4, text: "for i in range(1, len(nums)):" },
  { num: 5, text: "    current_card = nums[i] # 抓到的新牌" },
  { num: 6, text: "    j = i - 1              # 已排序好的最右侧第一张" },
  { num: 7, text: "    " },
  { num: 8, text: "    # 新牌与左侧“已排序好”的牌比较，从右侧开始比较" },
  { num: 9, text: "    while j >= 0 and nums[j] > current_card:" },
  { num: 10, text: "        nums[j + 1] = nums[j] # 往右挪" },
  { num: 11, text: "        j -= 1              # 继续往前看前一张牌" },
  { num: 12, text: "        " },
  { num: 13, text: "    # 找到了合适的位置，把新牌放进去" },
  { num: 14, text: "    nums[j + 1] = current_card" },
  { num: 15, text: "" },
  { num: 16, text: "print(nums)" }
];

export default function InsertionSort() {
  const [cards, setCards] = useState<CardData[]>([...INITIAL_CARDS]);
  const [i, setI] = useState(1);
  const [currIdx, setCurrIdx] = useState(1);
  const [phase, setPhase] = useState('START_SCREEN');
  const [activeLines, setActiveLines] = useState<number[]>([1]);
  const [message, setMessage] = useState('欢迎！这是初始的 4 张牌。点击下方按钮开始演示插入排序算法。');

  const handleNext = () => {
    let newCards = [...cards];

    switch(phase) {
      case 'START_SCREEN':
        newCards = newCards.map((c, idx) => ({
          ...c,
          faceUp: idx === 0,
          status: idx === 0 ? 'sorted' : 'idle'
        }));
        setCards(newCards);
        setPhase('READY');
        setActiveLines([3, 4]);
        setMessage(`算法开始：将最左侧的第一张牌 (${newCards[0].display}) 视为“已排序”的基准。其余牌扣下，准备逐一抓取。`);
        break;

      case 'READY':
        if (i >= newCards.length) {
          setPhase('FINISHED');
          setActiveLines([16]);
          setMessage("🎉 排序完成！所有的牌均已按从小到大的顺序排列好。");
          newCards.forEach(c => (c.status = 'sorted'));
          setCards(newCards);
          break;
        }
        setCurrIdx(i);
        newCards[i].faceUp = true;
        newCards[i].status = 'active';
        setCards(newCards);
        setPhase('COMPARE');
        setActiveLines([5, 6]);
        setMessage(`抓取下一张牌：${newCards[i].display}。准备将其插入到前面已排序序列的合适位置。`);
        break;

      case 'COMPARE':
        if (currIdx === 0) {
          setPhase('DONE');
          setActiveLines([13, 14]);
          setMessage(`已到达最左侧，比较结束，当前牌位置确定。`);
        } else {
          newCards[currIdx].status = 'active';
          newCards[currIdx - 1].status = 'comparing';
          setCards(newCards);
          setPhase('EVAL');
          setActiveLines([8, 9]);
          setMessage(`比较当前抓取的牌 (${newCards[currIdx].display}) 和它此时左侧的牌 (${newCards[currIdx - 1].display}) 的大小。`);
        }
        break;

      case 'EVAL':
        const insertedCard = newCards[currIdx];
        const comparedCard = newCards[currIdx - 1];

        if (insertedCard.value < comparedCard.value) {
          // Swap
          newCards[currIdx] = comparedCard;
          newCards[currIdx - 1] = insertedCard;
          
          newCards[currIdx - 1].status = 'active';
          newCards[currIdx].status = 'sorted';

          const nextCurrIdx = currIdx - 1;
          setCurrIdx(nextCurrIdx);
          setCards(newCards);
          
          setMessage(`因为 ${insertedCard.display} < ${comparedCard.display}，它们需要互换位置！`);
          
          setPhase('COMPARE');
          setActiveLines([10, 11]);
        } else {
          // No swap
          newCards[currIdx - 1].status = 'sorted';
          newCards[currIdx].status = 'active';
          setCards(newCards);
          setPhase('DONE');
          setActiveLines([13, 14]);
          setMessage(`因为 ${insertedCard.display} >= ${comparedCard.display}，无需互换，它已找到了正确的位置！`);
        }
        break;

      case 'DONE':
        newCards[currIdx].status = 'sorted';
        setCards(newCards);
        setI(i + 1);
        setPhase('READY');
        setActiveLines([4]);
        setMessage(`当前牌插入完毕！前面的区域恢复为有序序列。准备抓取紧接着的下一张牌。`);
        break;

      case 'FINISHED':
        // Reset
        setCards([...INITIAL_CARDS]);
        setI(1);
        setCurrIdx(1);
        setPhase('START_SCREEN');
        setActiveLines([1]);
        setMessage('欢迎！这是初始的 4 张牌。点击下方按钮开始演示插入排序算法。');
        break;
    }
  };

  const isFinished = phase === 'FINISHED';

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-32">
      <header className="px-6 py-8 text-center max-w-4xl mx-auto">
        <div className="flex justify-start mb-6">
          <a
            href="../index.html"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
          >
            <ChevronLeft size={18} />
            <span>返回首页</span>
          </a>
        </div>
         <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
           插入排序动画演示
         </h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8 items-stretch pb-20">
        <div className="flex-1 w-full flex flex-col items-center">
          {/* 指导信息面板 */}
          <div className="w-full mb-10 max-w-2xl min-h-[120px] flex items-center justify-center bg-sky-50 text-sky-900 border-2 border-sky-100 rounded-3xl p-6 md:p-8 text-center shadow-sm transition-all duration-300">
            <p className="text-xl sm:text-2xl font-semibold leading-snug">
              {message}
            </p>
          </div>

          {/* 扑克牌容器 */}
          <div className="relative flex flex-row justify-center items-center gap-3 sm:gap-6 py-16 px-2 overflow-x-auto min-h-[350px] w-full">
          {cards.map((card, index) => {
            const isRed = card.suit === '♥️' || card.suit === '♦️';
            const isDeck = !card.faceUp;
            const deckIndex = isDeck ? cards.slice(0, index).filter(c => !c.faceUp).length : 0;
            const isStacked = isDeck && deckIndex > 0;
            
            // Adjust margin to pull stacked cards to the left, overlapping the previous card.
            const stackedMarginClass = isStacked ? "-ml-[90px] sm:-ml-[128px]" : "";

            // 确定背景和高亮样式
            let bgClass = "bg-slate-800 border-slate-700 shadow-xl shadow-black/40"; 
            if (card.faceUp) {
                if (card.status === 'active') bgClass = "bg-white border-blue-500 shadow-2xl ring-4 ring-blue-500 ring-offset-2";
                else if (card.status === 'comparing') bgClass = "bg-white border-orange-400 shadow-xl ring-4 ring-orange-400 ring-offset-2";
                else if (card.status === 'sorted') bgClass = "bg-slate-50 border-emerald-400 shadow-md ring-2 ring-emerald-400 opacity-95";
                else bgClass = "bg-white border-slate-200 shadow-md";
            }

            let yPos = 0;
            if (card.status === 'active') yPos = -24;
            else if (card.status === 'comparing') yPos = -8;
            else if (isDeck) yPos = deckIndex * 4; // Shift down for 3D depth

            let zPos = 10;
            if (card.status === 'active') zPos = 30;
            else if (card.status === 'comparing') zPos = 20;
            else if (isDeck) zPos = 10 - deckIndex; // Leftmost card is on top

            return (
              <motion.div
                layout
                key={card.id}
                animate={{
                  y: yPos,
                  scale: card.status === 'active' ? 1.05 : 1,
                  zIndex: zPos
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`relative w-24 h-36 sm:w-32 sm:h-48 rounded-2xl flex-shrink-0 flex items-center justify-center border-2 overflow-hidden select-none ${bgClass} ${stackedMarginClass}`}
              >
                {card.faceUp ? (
                  <div className={`absolute inset-0 p-3 sm:p-4 flex flex-col justify-between ${isRed ? 'text-red-500' : 'text-slate-800'}`}>
                    <div className="font-bold text-2xl sm:text-3xl self-start leading-none tracking-tighter">
                      {card.display}
                    </div>
                    <div className="text-5xl sm:text-7xl self-center">
                      {card.suit}
                    </div>
                    <div className="font-bold text-2xl sm:text-3xl self-end rotate-180 leading-none tracking-tighter">
                      {card.display}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-1 rounded-xl bg-slate-700 border border-slate-600 overflow-hidden">
                     {/* 简单的卡背网格纹理 */}
                     <div 
                        className="absolute inset-0 opacity-10" 
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)' }}
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-600 bg-slate-800/80 shadow-inner flex items-center justify-center text-slate-500 font-bold text-xs" />
                     </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

          {/* 图例 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm sm:text-base font-semibold text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded hover:scale-110 transition-transform ring-2 ring-emerald-400 bg-emerald-50"></div>
              <span>已排序序列</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded hover:scale-110 transition-transform ring-4 ring-blue-500 ring-offset-1 bg-white"></div>
              <span>当前抓取待插入牌</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded hover:scale-110 transition-transform ring-4 ring-orange-400 ring-offset-1 bg-white"></div>
              <span>正在进行对比的牌</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded hover:scale-110 transition-transform bg-slate-800 border-2 border-slate-600"></div>
              <span>扣下的未知牌</span>
            </div>
          </div>
        </div>

        {/* 右侧：代码展示区域 */}
        <div className="w-full lg:w-[480px] shrink-0 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col self-start sticky top-8">
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">insertion_sort.py</span>
          </div>
          <div className="p-4 overflow-x-auto text-sm lg:text-[15px] font-mono text-slate-300 leading-relaxed">
            {CODE_LINES.map((line) => (
              <div 
                key={line.num} 
                className={`px-3 py-1 rounded flex items-center transition-colors ${activeLines.includes(line.num) ? 'bg-blue-500/30 text-blue-100 shadow-[inset_3px_0_0_0_#3b82f6]' : 'text-slate-400'}`}
              >
                <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-4">{line.num}</span>
                <span className="whitespace-pre">{line.text}</span>
                {line.num === 16 && phase === 'FINISHED' && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="ml-4 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-bold text-xs"
                  >
                    # 输出: [{cards.map(c => c.value).join(', ')}]
                  </motion.span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 悬浮操作按钮 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={handleNext}
          className="group relative inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 sm:px-10 sm:py-5 text-lg sm:text-xl font-bold text-white shadow-2xl transition-all hover:-translate-y-2 hover:bg-slate-800 hover:shadow-slate-900/40 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none focus:ring-4 focus:ring-slate-900/30"
        >
          {isFinished ? (
            <>
              重新开始 <RotateCcw className="ml-3 h-6 w-6 group-hover:-rotate-90 transition-transform duration-300" />
            </>
          ) : (
            <>
              {phase === 'START_SCREEN' ? '开始演示' : '下一步'} <ChevronRight className="ml-3 h-7 w-7 group-hover:translate-x-1.5 transition-transform duration-300" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
