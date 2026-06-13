export type Student = {
  id: string;
  name: string;
  height: number;
  value: number;
}

export type SortStep = {
  array: Student[];
  comparing: [number, number] | null;
  swapping: boolean;
  sortedIndices: number[];
  message: string;
  subMessage?: string;
  loopState?: {
    i: number | null;
    j: number | null;
    desc?: string;
  };
}

export function generateBubbleSortSteps(initialArray: Student[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const sortedIndices: number[] = [];
  const count = arr.length - 1;

  steps.push({
    array: [...arr],
    comparing: null,
    swapping: false,
    sortedIndices: [...sortedIndices],
    message: "结合代码演示冒泡排序！",
    subMessage: `列表长度为 ${arr.length}。代码中 count = ${count}。外层循环 i 将执行 ${count} 次。我们用身高代表数组中的不同数字，高个子往后移。`,
    loopState: { i: null, j: null, desc: "准备开始外层循环..." }
  });

  for (let i = 0; i < count; i++) {
    steps.push({
       array: [...arr],
       comparing: null,
       swapping: false,
       sortedIndices: [...sortedIndices],
       message: `开始进行 第 ${i + 1} 轮冒泡 (外层循环)`,
       subMessage: `处于外层循环 for i in range(count)，当前 i = ${i}。内层循环需要执行 "count - i" 也就是 ${count - i} 次，把最大的移到无序区的最后。`,
       loopState: { i, j: null, desc: `for i in range(count):  # 当前 i=${i}` }
    });

    for (let j = 0; j < count - i; j++) {
       steps.push({
         array: [...arr],
         comparing: [j, j + 1],
         swapping: false,
         sortedIndices: [...sortedIndices],
         message: `比较相邻元素：num[${j}] 和 num[${j+1}]`,
         subMessage: `内层循环 j = ${j}。左边值为 ${arr[j].value}，右边值为 ${arr[j+1].value}。${arr[j].value > arr[j+1].value ? "左边大于右边，满足条件！准备交换" : "左侧不大于右侧，保持不动。"}`,
         loopState: { i, j, desc: `for j in range(count - i):  # 当前 j=${j}` }
       });

       if (arr[j].value > arr[j+1].value) {
          const temp = arr[j];
          arr[j] = arr[j+1];
          arr[j+1] = temp;

          steps.push({
            array: [...arr],
            comparing: [j, j + 1], 
            swapping: true,
            sortedIndices: [...sortedIndices],
            message: `满足条件！交换位置`,
            subMessage: `执行：num[j], num[j+1] = num[j+1], num[j]。把值更大的不断往后放。`,
            loopState: { i, j, desc: `if num[j] > num[j+1]: 交换!` }
          });
       }
    }
    sortedIndices.push(arr.length - 1 - i);
    steps.push({
        array: [...arr],
        comparing: null,
        swapping: false,
        sortedIndices: [...sortedIndices],
        message: `第 ${i + 1} 轮结束：最大值归位`,
        subMessage: `在第 ${i + 1} 轮冒泡中，数字 ${arr[arr.length - 1 - i].value} 成功冒泡到了正确位置，打上标记！当前列表：[${arr.map(a => a.value).join(', ')}]`,
        loopState: { i, j: null, desc: `print("当前列表:", num)` }
    });
  }
  
  sortedIndices.push(0);
  steps.push({
    array: [...arr],
    comparing: null,
    swapping: false,
    sortedIndices: [...sortedIndices],
    message: "排序彻底完成！🎉",
    subMessage: `所有代码执行完毕！最终排序结果: [${arr.map(a => a.value).join(', ')}]。`,
    loopState: { i: null, j: null, desc: `print("\\n最终排序结果:", num)` }
  });

  return steps;
}
