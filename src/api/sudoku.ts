import type { SudokuSetValueDto } from '@/models/dto/SudokuSetValueDto';
import type { BaseVo } from '@/models/vo/BaseVo';
import type { SudokuGamePublicVo } from '@/models/vo/SudokuGameVo';
import type { SudokuSetValueVo } from '@/models/vo/SudokuSetValueVo';
import axios, { type AxiosResponse } from 'axios';

const baseUrl: string = import.meta.env.VITE_BASE_URL;

const client = axios.create({ baseURL: baseUrl });

export function newGame(): Promise<AxiosResponse<BaseVo<SudokuGamePublicVo>>> {
  return client.post(`Sudoku/NewGame`);
}

export function getGame(): Promise<AxiosResponse<BaseVo<SudokuGamePublicVo>>> {
  return client.get(`Sudoku/GetGame`);
}

export function setValue(dto: SudokuSetValueDto): Promise<AxiosResponse<BaseVo<SudokuSetValueVo>>> {
  return client.post(`Sudoku/SetValue`, dto, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
