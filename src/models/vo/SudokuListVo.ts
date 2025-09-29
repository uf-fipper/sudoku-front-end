import type { PageDataVo } from './PageDataVo';
import type { SudokuGamePublicVo } from './SudokuGameVo';

export interface SudokuListVo {
  games: SudokuGamePublicVo[];
  pageData: PageDataVo;
}
