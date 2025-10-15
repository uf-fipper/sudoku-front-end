import type { SudokuNewGameDto } from '@/models/dto/SudokuNewGameDto';
import type { SudokuSetValueDto } from '@/models/dto/SudokuSetValueDto';
import type { BaseVo } from '@/models/vo/BaseVo';
import type { SudokuGamePublicVo } from '@/models/vo/SudokuGameVo';
import type { SudokuListVo } from '@/models/vo/SudokuListVo';
import type { SudokuSetValueVo } from '@/models/vo/SudokuSetValueVo';
import axios, { type AxiosResponse } from 'axios';

const baseHost: string = import.meta.env.VITE_BASE_HOST;
const baseHttpUrl = `${import.meta.env.VITE_BASE_HTTP_PROTOCOL}://${baseHost}`;
const baseWsUrl = `${import.meta.env.VITE_BASE_WS_PROTOCOL}://${baseHost}`;

const client = axios.create({ baseURL: baseHttpUrl });

export function newGame(
  dto?: SudokuNewGameDto,
): Promise<AxiosResponse<BaseVo<SudokuGamePublicVo>>> {
  return client.post(`Sudoku/NewGame`, dto, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function getGame(gameId: string): Promise<AxiosResponse<BaseVo<SudokuGamePublicVo>>> {
  return client.get(`Sudoku/GetGame`, { params: { gameId } });
}

export function getGameList(page: number): Promise<AxiosResponse<BaseVo<SudokuListVo>>> {
  return client.get(`Sudoku/GetGameList`, { params: { page } });
}

export function setValue(dto: SudokuSetValueDto): Promise<AxiosResponse<BaseVo<SudokuSetValueVo>>> {
  return client.post(`Sudoku/SetValue`, dto, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function wsConnect(gameId: string): WebSocket {
  const wsUrl = baseWsUrl;
  return new WebSocket(`${wsUrl}/Sudoku/Connect?gameId=${gameId}`);
}
