import type { SudokuGamePublicVo } from './SudokuGameVo';

export interface SudokuSetValueVo {
  game: SudokuGamePublicVo;
  isSuccess: boolean;
  isBase: boolean;
  isWin: boolean;
}
