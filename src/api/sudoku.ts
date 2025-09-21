import type { BaseVo } from '@/models/vo/BaseVo';
import type { SudokuGameVo } from '@/models/vo/SudokuGameVo';
import axios, { type AxiosResponse } from 'axios';

const baseUrl: string = import.meta.env.VITE_BASE_URL;

const client = axios.create({ baseURL: baseUrl });

export function newSudoku(): Promise<AxiosResponse<BaseVo<SudokuGameVo>>> {
  return client.get(`Sudoku/CreateGame`);
}
