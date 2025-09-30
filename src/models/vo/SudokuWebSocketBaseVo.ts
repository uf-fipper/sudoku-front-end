export interface SudokuWebSocketBaseVo<T = unknown> {
  type: string;
  data: T;
}
