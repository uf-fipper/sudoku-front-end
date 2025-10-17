import type { SudokuNewGameDto } from '@/models/dto/SudokuNewGameDto';
import type { SudokuSetValueDto } from '@/models/dto/SudokuSetValueDto';
import type { BaseVo } from '@/models/vo/BaseVo';
import type { SudokuGamePublicVo } from '@/models/vo/SudokuGameVo';
import type { SudokuListVo } from '@/models/vo/SudokuListVo';
import type { SudokuSetValueVo } from '@/models/vo/SudokuSetValueVo';
import type { SudokuWebSocketBaseVo } from '@/models/vo/SudokuWebSocketBaseVo';
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

export class WebSocketApiManager {
  ws: WebSocket;

  private callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: (data: any) => void;
  } = {};

  constructor(gameId: string) {
    const wsUrl = baseWsUrl;
    this.ws = new WebSocket(`${wsUrl}/Sudoku/Connect?gameId=${gameId}`);
    this.ws.onmessage = (event) => {
      const data: BaseVo<SudokuWebSocketBaseVo> = JSON.parse(event.data);
      console.log(data);
      const type = data.data.type;
      this.callbacks[type]?.(data.data.data);
    };
  }

  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  onmessage<T>(type: string, callback: (data: T) => void) {
    this.callbacks[type] = callback;
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>) {
    this.ws.send(data);
  }

  private sendJson(type: string, data: unknown) {
    this.ws.send(JSON.stringify({ type, data }));
  }

  sendSetValue(data: SudokuSetValueDto) {
    console.log(data);
    this.sendJson('SetValue', data);
  }

  sendSetSendSolve(data: boolean) {
    this.sendJson('SetSendSolve', { sendSolve: data });
  }
}
