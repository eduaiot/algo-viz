export type Tile = {
    id: string;
    value: number;
};
  
export type SortState = {
    arr: Tile[];
    sortedEnd: number; // Index up to which the array is sorted
    targetIdx: number | null; // Index of the target slot for the outer loop (i)
    comparing: number[]; // Indices currently being compared in the loop
    candidateIdx: number | null; // Index of the current minimum candidate found
    swapping: number[]; // Indices currently being swapping (to show animation)
    message: string;
    activeLines: number[]; // Lines of code currently executing (0-indexed)
};
