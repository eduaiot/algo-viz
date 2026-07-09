export type NodeStatus = 'active' | 'waiting' | 'done';

export interface TreeNodeData {
  id: string;
  label: string;
  status: NodeStatus;
  result: number | null;
  children: TreeNodeData[];
}

export interface UShapeNode {
  id: string;
  text: string;
  subText?: string;
  col: number;
  row: number;
  type: 'call' | 'base' | 'return';
}

export interface UShapeArrow {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

export interface UShapeData {
  nodes: UShapeNode[];
  arrows: UShapeArrow[];
}

export interface TraceStep {
  tree: TreeNodeData;
  uShape?: UShapeData;
  message: string;
  activeNodeId: string;
  codeLine: number;
  callStack: string[];
}
