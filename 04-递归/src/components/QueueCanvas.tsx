import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, User } from 'lucide-react';

interface QueueCanvasProps {
  activeNodeId: string;
}

export const QueueCanvas: React.FC<QueueCanvasProps> = ({ activeNodeId }) => {
  // 解析当前状态
  // activeNodeId 的格式可以是：L5, L4, L3, L2 (递去); B1 (基本情况); R2, R3, R4, R5 (归来)
  const getActivePerson = (nodeId: string) => {
    if (!nodeId) return -1;
    if (nodeId.startsWith('L')) return parseInt(nodeId.slice(1));
    if (nodeId.startsWith('R')) return parseInt(nodeId.slice(1));
    if (nodeId === 'B1') return 1;
    return -1;
  };

  const activePerson = getActivePerson(activeNodeId);
  const isWinding = activeNodeId.startsWith('L');
  const isUnwinding = activeNodeId.startsWith('R');
  const isBaseCase = activeNodeId === 'B1';

  // 每个人物的信息
  const people = [
    { num: 5, label: '第 5 人', x: 100, pct: '10%' },
    { num: 4, label: '第 4 人', x: 300, pct: '30%' },
    { num: 3, label: '第 3 人', x: 500, pct: '50%' },
    { num: 2, label: '第 2 人', x: 700, pct: '70%' },
    { num: 1, label: '第 1 人', x: 900, pct: '90%' },
  ];

  // 获取特定人物的当前气泡文本
  const getBubbleText = (num: number) => {
    if (activePerson !== num) return null;
    if (isWinding) {
      return '你是第几位？';
    }
    if (isBaseCase && num === 1) {
      return '我在最前面，我是第 1 位！';
    }
    if (isUnwinding) {
      return `我前面是第 ${num - 1} 位，那我就是第 ${num} 位！`;
    }
    return null;
  };

  // 检查上方某条“递”曲线是否应激活
  // 从 i 传到 i-1。当 activeNodeId 为 L(i) 时激活
  const isWindingPathActive = (fromNum: number) => {
    return isWinding && activePerson === fromNum;
  };

  // 检查下方某条“归”曲线是否应激活
  // 从 i-1 传到 i。当 activeNodeId 为 R(i) 时激活。特别地，从 1 传给 2 时，由 R2 触发
  const isUnwindingPathActive = (toNum: number) => {
    return isUnwinding && activePerson === toNum;
  };

  return (
    <div className="flex-1 overflow-auto relative p-8 flex flex-col justify-start items-center bg-slate-50/50 pt-16">
      
      {/* CSS 动画注入，用来控制 SVG 虚线的滚动流动效果 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow-right {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes flow-left {
          to {
            stroke-dashoffset: 20;
          }
        }
        .flow-right-active {
          animation: flow-right 0.8s linear infinite;
        }
        .flow-left-active {
          animation: flow-left 0.8s linear infinite;
        }
      `}} />

      {/* 主可视化看板 */}
      <div className="relative w-full max-w-[900px] h-[360px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-8 flex flex-col justify-between overflow-hidden">
        
        {/* 背景辅助文字 */}
        <div className="absolute top-4 left-6 text-xs font-semibold text-slate-400 tracking-wider">
          QUEUE RECURSION VISUALIZER
        </div>

        {/* 顶部/底部提示 */}
        <div className="absolute top-4 right-6 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
            <span className="text-slate-500 font-medium">递去 (提问)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
            <span className="text-slate-500 font-medium">归来 (传回位置)</span>
          </div>
        </div>

        {/* 核心动画连线层 SVG */}
        <svg 
          viewBox="0 0 1000 200" 
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="none"
        >
          <defs>
            <marker id="purple-arrow" viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 -5 L 10 0 L 0 5 z" fill="#a855f7" />
            </marker>
            <marker id="teal-arrow" viewBox="0 -5 10 10" refX="2" refY="0" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 10 -5 L 0 0 L 10 5 z" fill="#14b8a6" />
            </marker>
          </defs>

          {/* ================= 上方：递（紫色） ================= */}
          {/* 5 -> 4 */}
          <path 
            d="M 100 80 Q 200 20 300 80" 
            fill="none" 
            stroke={isWindingPathActive(5) ? '#a855f7' : '#e2e8f0'} 
            strokeWidth={isWindingPathActive(5) ? '3' : '2'}
            strokeDasharray="6,4"
            className={isWindingPathActive(5) ? 'flow-right-active' : ''}
            markerEnd="url(#purple-arrow)"
          />
          {/* 4 -> 3 */}
          <path 
            d="M 300 80 Q 400 20 500 80" 
            fill="none" 
            stroke={isWindingPathActive(4) ? '#a855f7' : '#e2e8f0'} 
            strokeWidth={isWindingPathActive(4) ? '3' : '2'}
            strokeDasharray="6,4"
            className={isWindingPathActive(4) ? 'flow-right-active' : ''}
            markerEnd="url(#purple-arrow)"
          />
          {/* 3 -> 2 */}
          <path 
            d="M 500 80 Q 600 20 700 80" 
            fill="none" 
            stroke={isWindingPathActive(3) ? '#a855f7' : '#e2e8f0'} 
            strokeWidth={isWindingPathActive(3) ? '3' : '2'}
            strokeDasharray="6,4"
            className={isWindingPathActive(3) ? 'flow-right-active' : ''}
            markerEnd="url(#purple-arrow)"
          />
          {/* 2 -> 1 */}
          <path 
            d="M 700 80 Q 800 20 900 80" 
            fill="none" 
            stroke={isWindingPathActive(2) ? '#a855f7' : '#e2e8f0'} 
            strokeWidth={isWindingPathActive(2) ? '3' : '2'}
            strokeDasharray="6,4"
            className={isWindingPathActive(2) ? 'flow-right-active' : ''}
            markerEnd="url(#purple-arrow)"
          />

          {/* ================= 下方：归（青色） ================= */}
          {/* 2 <- 1 */}
          <path 
            d="M 700 120 Q 800 180 900 120" 
            fill="none" 
            stroke={isUnwindingPathActive(2) ? '#14b8a6' : '#e2e8f0'} 
            strokeWidth={isUnwindingPathActive(2) ? '3' : '2'}
            strokeDasharray="6,4"
            className={isUnwindingPathActive(2) ? 'flow-left-active' : ''}
            markerEnd="url(#teal-arrow)"
          />
          {/* 3 <- 2 */}
          <path 
            d="M 500 120 Q 600 180 700 120" 
            fill="none" 
            stroke={isUnwindingPathActive(3) ? '#14b8a6' : '#e2e8f0'} 
            strokeWidth={isUnwindingPathActive(3) ? '3' : '2'}
            strokeDasharray="6,4"
            className={isUnwindingPathActive(3) ? 'flow-left-active' : ''}
            markerEnd="url(#teal-arrow)"
          />
          {/* 4 <- 3 */}
          <path 
            d="M 300 120 Q 400 180 500 120" 
            fill="none" 
            stroke={isUnwindingPathActive(4) ? '#14b8a6' : '#e2e8f0'} 
            strokeWidth={isUnwindingPathActive(4) ? '3' : '2'}
            strokeDasharray="6,4"
            className={isUnwindingPathActive(4) ? 'flow-left-active' : ''}
            markerEnd="url(#teal-arrow)"
          />
          {/* 5 <- 4 */}
          <path 
            d="M 100 120 Q 200 180 300 120" 
            fill="none" 
            stroke={isUnwindingPathActive(5) ? '#14b8a6' : '#e2e8f0'} 
            strokeWidth={isUnwindingPathActive(5) ? '3' : '2'}
            strokeDasharray="6,4"
            className={isUnwindingPathActive(5) ? 'flow-left-active' : ''}
            markerEnd="url(#teal-arrow)"
          />
        </svg>

        {/* 商店/收银台放置在最右侧 */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20"
          style={{ left: '95%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-14 h-14 bg-indigo-50 border-2 border-indigo-500/20 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/5">
            <Store size={28} />
          </div>
          <span className="text-[11px] font-bold text-indigo-500 mt-2 bg-indigo-50 px-2 py-0.5 rounded-full">
            收银台(排头)
          </span>
        </div>

        {/* 5个排队小人与对话气泡 */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[120px] flex items-center justify-start z-20">
          {people.map((person) => {
            const isSelfActive = activePerson === person.num;
            const bubbleText = getBubbleText(person.num);

            // 决定角色颜色
            let colorClass = "bg-slate-100 border-slate-300 text-slate-500";
            if (isSelfActive) {
              if (isWinding) colorClass = "bg-purple-500 border-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110";
              else if (isUnwinding) colorClass = "bg-teal-500 border-teal-600 text-white shadow-lg shadow-teal-500/30 scale-110";
              else if (isBaseCase) colorClass = "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110";
            }

            return (
              <div 
                key={person.num}
                className="absolute flex flex-col items-center justify-center transition-all duration-300"
                style={{ left: person.pct, transform: 'translateX(-50%)' }}
              >
                
                {/* 气泡对话框 */}
                <AnimatePresence>
                  {bubbleText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className={`absolute -top-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg shadow-slate-900/10 font-medium z-30`}
                    >
                      {bubbleText}
                      {/* 气泡三角 */}
                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 人物图标 */}
                <motion.div
                  animate={isSelfActive ? { y: [-3, 3, -3] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${colorClass}`}
                >
                  <User size={24} />
                </motion.div>

                {/* 人物序号标签 */}
                <span className={`text-xs mt-2 font-mono font-bold transition-colors ${isSelfActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  {person.label}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
