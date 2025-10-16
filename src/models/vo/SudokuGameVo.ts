export interface SudokuGamePublicVo {
  gameId: string;
  board: number[][];
  baseIndexs: [number, number][];
  seed: number;
  isWin: boolean;
  boardEmptyCount: number;
  startBoardEmptyCount: number;
}
