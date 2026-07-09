import { TreeNodeData, TraceStep, UShapeNode, UShapeArrow } from '../types';

function clone(node: TreeNodeData): TreeNodeData {
  return JSON.parse(JSON.stringify(node));
}

export function getQueueTrace(n: number): TraceStep[] {
  const states: TraceStep[] = [];
  const callStack: string[] = [];
  const nodes: UShapeNode[] = [];
  const arrows: UShapeArrow[] = [];
  let stepCount = 1;
  
  const pushState = (msg: string, activeId: string, line: number) => {
    states.push({
      tree: { id: 'dummy', label: '', status: 'active', result: null, children: [] },
      uShape: { nodes: [...nodes], arrows: [...arrows] },
      message: msg,
      activeNodeId: activeId,
      codeLine: line,
      callStack: [...callStack]
    });
  };

  pushState(`第 ${n} 个人想知道自己是第几位，开始向前面的人询问`, '', 0);

  // Winding
  for (let i = n; i > 1; i--) {
    callStack.push(`pos(${i})`);
    const nodeId = `L${i}`;
    nodes.push({
      id: nodeId,
      text: `第${i}人: 问前面`,
      subText: `第 ${stepCount} 次询问`,
      col: -(i - 1),
      row: n - i,
      type: 'call'
    });
    if (i < n) {
      arrows.push({
        id: `A-L${i+1}-L${i}`,
        fromId: `L${i+1}`,
        toId: nodeId
      });
    }
    pushState(`🎯 第 ${i} 个人问第 ${i-1} 个人：“你是第几位？”，等待前面人的回答...`, nodeId, 4);
    stepCount++;
  }
  
  // Base Case
  callStack.push(`pos(1)`);
  const baseId = `B1`;
  nodes.push({
    id: baseId,
    text: `第1人: 我是第1位`,
    subText: `第 ${stepCount} 次询问(排头)`,
    col: 0,
    row: n - 1,
    type: 'base'
  });
  arrows.push({
    id: `A-L2-B1`,
    fromId: `L2`,
    toId: baseId
  });
  pushState(`✅ 第 1 个人排在最前面，知道自己是第 1 位。开始向后传递答案！`, baseId, 2);
  callStack.pop();
  
  // Unwinding
  let prevId = baseId;
  for (let i = 2; i <= n; i++) {
    const nodeId = `R${i}`;
    nodes.push({
      id: nodeId,
      text: `第${i}人: 我是第 ${i} 位`,
      col: (i - 1),
      row: n - i,
      type: 'return'
    });
    arrows.push({
      id: `A-${prevId}-${nodeId}`,
      fromId: prevId,
      toId: nodeId,
      label: '告知'
    });
    pushState(`🔙 第 ${i} 个人得知前面的人是第 ${i-1} 位，因此自己是第 ${i-1} + 1 = ${i} 位。`, nodeId, 4);
    callStack.pop();
    prevId = nodeId;
  }
  
  pushState(`🎉 所有人询问完毕，第 ${n} 个人最终确认自己是第 ${n} 位！`, `R${n}`, 4);
  
  return states;
}

export function getFactorialTrace(n: number): TraceStep[] {
  const states: TraceStep[] = [];
  const callStack: string[] = [];
  const nodes: UShapeNode[] = [];
  const arrows: UShapeArrow[] = [];
  let stepCount = 1;
  
  const pushState = (msg: string, activeId: string, line: number) => {
    states.push({
      tree: { id: 'dummy', label: '', status: 'active', result: null, children: [] },
      uShape: { nodes: [...nodes], arrows: [...arrows] },
      message: msg,
      activeNodeId: activeId,
      codeLine: line,
      callStack: [...callStack]
    });
  };

  pushState(`准备计算阶乘 fact(${n})`, '', 0);

  // Winding
  for (let i = n; i > 1; i--) {
    callStack.push(`fact(${i})`);
    const nodeId = `L${i}`;
    nodes.push({
      id: nodeId,
      text: `f(${i}) = ${i} × f(${i-1})`,
      subText: `第 ${stepCount} 次调用`,
      col: -(i - 1),
      row: n - i,
      type: 'call'
    });
    if (i < n) {
      arrows.push({
        id: `A-L${i+1}-L${i}`,
        fromId: `L${i+1}`,
        toId: nodeId
      });
    }
    pushState(`🎯 调用 fact(${i})，尚未到达出口，继续深入递归...`, nodeId, 4);
    stepCount++;
  }
  
  // Base Case
  callStack.push(`fact(1)`);
  const baseId = `B1`;
  nodes.push({
    id: baseId,
    text: `f(1) = 1`,
    subText: `第 ${stepCount} 次调用`,
    col: 0,
    row: n - 1,
    type: 'base'
  });
  arrows.push({
    id: `A-L2-B1`,
    fromId: `L2`,
    toId: baseId
  });
  pushState(`✅ 达到基本情况 fact(1)，直接返回 1。递归开始回溯！`, baseId, 2);
  callStack.pop();
  
  // Unwinding
  let prevId = baseId;
  for (let i = 2; i <= n; i++) {
    const nodeId = `R${i}`;
    let parts = [];
    let res = 1;
    for(let j=i; j>=1; j--) {
      parts.push(j);
      res *= j;
    }
    
    nodes.push({
      id: nodeId,
      text: `f(${i}) = ${parts.join(' × ')} = ${res}`,
      col: (i - 1),
      row: n - i,
      type: 'return'
    });
    arrows.push({
      id: `A-${prevId}-${nodeId}`,
      fromId: prevId,
      toId: nodeId,
      label: '返回'
    });
    pushState(`🔙 fact(${i}) 收到下层返回值，计算完成并出栈。`, nodeId, 4);
    callStack.pop();
    prevId = nodeId;
  }
  
  pushState(`🎉 全部计算完成，得到最终结果！`, `R${n}`, 4);
  
  return states;
}

export function getFibonacciTrace(n: number): TraceStep[] {
  let nextId = 1;
  const states: TraceStep[] = [];
  const callStack: string[] = [];

  function run(val: number, node: TreeNodeData, treeRoot: TreeNodeData): number {
    callStack.push(`fib(${val})`);
    
    node.status = 'active';
    states.push({ tree: clone(treeRoot), message: `🎯 进入函数，分配独立上下文，参数 n = ${val}`, activeNodeId: node.id, codeLine: 0, callStack: [...callStack] });

    states.push({ tree: clone(treeRoot), message: `🔍 检查基本情况 (递归出口)：${val} <= 1？`, activeNodeId: node.id, codeLine: 1, callStack: [...callStack] });

    if (val <= 1) {
      node.result = val;
      node.status = 'done';
      states.push({ tree: clone(treeRoot), message: `✅ 到达出口，直接返回 ${val}。当前函数执行结束。`, activeNodeId: node.id, codeLine: 2, callStack: [...callStack] });
      callStack.pop();
      return val;
    }

    states.push({ tree: clone(treeRoot), message: `⏳ 尚未到达出口。必须先计算左侧的 fib(${val-1})。`, activeNodeId: node.id, codeLine: 4, callStack: [...callStack] });

    node.status = 'waiting';
    const leftChild: TreeNodeData = { id: `fib-${val-1}-${nextId++}`, label: `fib(${val-1})`, status: 'active', result: null, children: [] };
    node.children.push(leftChild);
    
    states.push({ tree: clone(treeRoot), message: `🔄 【左侧递归调用】压栈！当前函数暂停，跳转去执行一个全新的 fib(${val-1})`, activeNodeId: leftChild.id, codeLine: 4, callStack: [...callStack] });

    const leftRes = run(val - 1, leftChild, treeRoot);

    node.status = 'waiting';
    states.push({ tree: clone(treeRoot), message: `🔙 左侧 fib(${val-1}) 返回 ${leftRes}。现在必须计算右侧的 fib(${val-2})。`, activeNodeId: node.id, codeLine: 4, callStack: [...callStack] });

    const rightChild: TreeNodeData = { id: `fib-${val-2}-${nextId++}`, label: `fib(${val-2})`, status: 'active', result: null, children: [] };
    node.children.push(rightChild);
    
    states.push({ tree: clone(treeRoot), message: `🔄 【右侧递归调用】压栈！再次暂停，跳转执行一个全新的 fib(${val-2})`, activeNodeId: rightChild.id, codeLine: 4, callStack: [...callStack] });

    const rightRes = run(val - 2, rightChild, treeRoot);

    node.status = 'active';
    states.push({ tree: clone(treeRoot), message: `🔙 右侧 fib(${val-2}) 返回 ${rightRes}。左右计算完毕，恢复执行。`, activeNodeId: node.id, codeLine: 4, callStack: [...callStack] });

    node.result = leftRes + rightRes;
    node.status = 'done';
    states.push({ tree: clone(treeRoot), message: `🧮 合并结果：${leftRes} + ${rightRes} = ${node.result}，返回并结束当前函数。`, activeNodeId: node.id, codeLine: 4, callStack: [...callStack] });

    callStack.pop();
    return node.result;
  }

  const rootNode: TreeNodeData = { id: `fib-${n}-${nextId++}`, label: `fib(${n})`, status: 'active', result: null, children: [] };
  run(n, rootNode, rootNode);
  
  return states;
}
