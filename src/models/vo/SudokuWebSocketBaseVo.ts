export interface SudokuWebSocketBaseVo<T = unknown> {
  type: string;
  messageSeq: number;
  data: T;
}
