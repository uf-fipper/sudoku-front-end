<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getGame, wsConnect } from '@/api/sudoku';
import type { SudokuGamePublicVo } from '@/models/vo/SudokuGameVo';
import { useRoute, useRouter } from 'vue-router';
import type { BaseVo } from '@/models/vo/BaseVo';
import type { SudokuWebSocketBaseVo } from '@/models/vo/SudokuWebSocketBaseVo';
import type { SudokuSetValueVo } from '@/models/vo/SudokuSetValueVo';

const route = useRoute();
const router = useRouter();
const gameId = route.query.gameId as string;

interface SudokuValue {
  value: number;
  isInvalid: boolean;
  isBaseIndex: boolean;
  smallNumbers: number[];
}

interface Game {
  gameId: string;
  sudokuValues: SudokuValue[][];
  valueSelectedItem?: [number, number];
  bottomSelectedItem?: number;
  baseIndexs: Set<string>;
  rawGame: SudokuGamePublicVo;
  isSmallNumberMode: boolean;
}

const game = ref<Game>();
let socket: WebSocket | null = null;

function resetGame(newGame: SudokuGamePublicVo) {
  const valueSelectedItem = game.value?.valueSelectedItem;
  const bottomSelectedItem = game.value?.bottomSelectedItem;
  const baseIndexs =
    game.value?.baseIndexs ?? new Set(newGame.baseIndexs.map((item) => `${item[0]},${item[1]}`));
  const size = newGame.board.length;

  const newGameValue: Game = {
    gameId: newGame.gameId,
    sudokuValues: newGame.board.map((line) =>
      line.map((item) => {
        return { value: item, isInvalid: false, isBaseIndex: false, smallNumbers: [] };
      }),
    ),
    valueSelectedItem,
    bottomSelectedItem,
    baseIndexs,
    rawGame: newGame,
    isSmallNumberMode: false,
  };
  if (game.value !== undefined) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGame.board[i][j] === 0) {
          newGameValue.sudokuValues[i][j].smallNumbers = game.value.sudokuValues[i][j].smallNumbers;
        }
      }
    }
  }
  game.value = newGameValue;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (isBaseIndex(i, j)) {
        game.value.sudokuValues[i][j].isBaseIndex = true;
      }
    }
  }
  handleInvalid();
}

function startGame() {
  if (typeof gameId !== 'string' || gameId === '') {
    console.error('Invalid gameId');
    return;
  }
  getGame(gameId).then((res) => {
    resetGame(res.data.data);
    socket = wsConnect(gameId);
    socket.onmessage = (event) => {
      const data: BaseVo<SudokuWebSocketBaseVo> = JSON.parse(event.data);
      console.log(data);
      if (data.data.type === 'SetValue') {
        const setValueData = data.data.data as SudokuSetValueVo;
        resetGame(setValueData.game);
      }
    };
  });
}

function isBaseIndex(row: number, col: number): boolean {
  if (game.value === undefined) return false;
  return game.value.baseIndexs.has(`${row},${col}`);
}

function isValueSelected(row: number, col: number) {
  return game.value?.valueSelectedItem?.[0] === row && game.value?.valueSelectedItem?.[1] === col;
}

function isValueSelectedOther(row: number, col: number) {
  return (
    !isValueSelected(row, col) &&
    (game.value?.valueSelectedItem?.[0] === row || game.value?.valueSelectedItem?.[1] === col)
  );
}

function handleClick(row: number, col: number) {
  if (game.value === undefined) return;
  if (game.value.bottomSelectedItem !== undefined && !isBaseIndex(row, col)) {
    if (game.value.isSmallNumberMode) {
      // 小数字模式
      const selectedNumber = game.value.bottomSelectedItem;
      const smallNumbers = game.value.sudokuValues[row][col].smallNumbers;
      const index = smallNumbers.indexOf(selectedNumber);
      if (selectedNumber === 0) {
      }
      if (index === -1) {
        smallNumbers.push(selectedNumber);
      } else {
        smallNumbers.splice(index, 1);
      }
    } else {
      // 大数字模式
      socket?.send(
        JSON.stringify({
          type: 'SetValue',
          data: {
            gameId: game.value.gameId,
            i: row,
            j: col,
            value: game.value.bottomSelectedItem,
          },
        }),
      );
    }
  }
  if (
    game.value.bottomSelectedItem === undefined &&
    game.value.valueSelectedItem?.[0] === row &&
    game.value.valueSelectedItem?.[1] === col
  ) {
    game.value.valueSelectedItem = undefined;
  } else {
    game.value.valueSelectedItem = [row, col];
  }
  handleInvalid();
}

function handleInvalid() {
  if (game.value === undefined) return;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      game.value.sudokuValues[i][j].isInvalid = checkInvalidNumberOnce(i, j);
    }
  }
}

function checkInvalidNumberOnce(row: number, col: number): boolean {
  if (game.value === undefined) return false;
  const value = game.value.sudokuValues[row][col].value;
  if (value === 0) return false;
  for (let j = 0; j < 9; j++) {
    if (j !== col && game.value.sudokuValues[row][j].value === value) {
      return true;
    }
  }
  for (let i = 0; i < 9; i++) {
    if (i !== row && game.value.sudokuValues[i][col].value === value) {
      return true;
    }
  }
  const rowStart = Math.floor(row / 3) * 3;
  const colStart = Math.floor(col / 3) * 3;
  for (let i = rowStart; i < rowStart + 3; i++) {
    for (let j = colStart; j < colStart + 3; j++) {
      if (i !== row && j !== col && game.value.sudokuValues[i][j].value === value) {
        return true;
      }
    }
  }
  return false;
}

function bottomSelectItem(item: number) {
  if (game.value === undefined) return;
  if (game.value.bottomSelectedItem === item) {
    game.value.bottomSelectedItem = undefined;
    return;
  }
  game.value.bottomSelectedItem = item;
}

function toggleSmallNumberMode() {
  if (game.value === undefined) return;
  game.value.isSmallNumberMode = !game.value.isSmallNumberMode;
}

function goBack() {
  router.push('/sudoku-list');
}

onMounted(() => {
  startGame();
});

onUnmounted(() => {
  if (socket) {
    socket.close();
  }
});
</script>

<template>
  <div v-if="game != undefined">
    <div class="game-header">
      <button @click="goBack" class="back-button">返回列表</button>
      <div class="game-info">
        <div>游戏ID: {{ game.gameId }}</div>
        <div>Seed: {{ game.rawGame.seed }}</div>
        <div :class="{ 'status-win': game.rawGame.isWin, 'status-lose': !game.rawGame.isWin }">
          状态: {{ game.rawGame.isWin ? '胜利' : '未完成' }}
        </div>
      </div>
    </div>
    <div class="sudoku-view">
      <table>
        <tbody>
          <tr v-for="(line, i) in game.sudokuValues" :key="`sudoku-line-${i}`">
            <td v-for="(item, j) in line" :key="`sudoku-item-${i}-${j}`">
              <button
                :class="{
                  'value-selected': isValueSelected(i, j),
                  'value-selected-other': isValueSelectedOther(i, j),
                  'base-index': item.isBaseIndex,
                  invalid: item.isInvalid,
                }"
                @click="handleClick(i, j)"
              >
                <span v-if="item.value !== 0">{{ item.value }}</span>
                <div v-else class="small-numbers">
                  <div v-for="num in [1, 2, 3]" :key="`small-${num}`" class="small-number-row">
                    <span v-if="item.smallNumbers.includes(num)">{{ num }}</span>
                    <span v-else>&nbsp;</span>
                  </div>
                  <div v-for="num in [4, 5, 6]" :key="`small-${num}`" class="small-number-row">
                    <span v-if="item.smallNumbers.includes(num)">{{ num }}</span>
                    <span v-else>&nbsp;</span>
                  </div>
                  <div v-for="num in [7, 8, 9]" :key="`small-${num}`" class="small-number-row">
                    <span v-if="item.smallNumbers.includes(num)">{{ num }}</span>
                    <span v-else>&nbsp;</span>
                  </div>
                </div>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="bottom-buttons">
      <div class="mode-toggle">
        <button @click="toggleSmallNumberMode" class="mode-button">
          {{ game.isSmallNumberMode ? '小' : '大' }}
        </button>
      </div>
      <table>
        <tbody>
          <tr
            v-for="(tds, i) in [
              [1, 2, 3, 4, 5],
              [6, 7, 8, 9, 0],
            ]"
            :key="`bottom-line-${i}`"
          >
            <td v-for="i in tds" :key="`bottom-item-${i}`">
              <button
                :class="{ 'bottom-selected': i === game.bottomSelectedItem }"
                @click="() => bottomSelectItem(i)"
              >
                {{ i === 0 ? '<' : i }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else>
    <p>加载中...</p>
  </div>
</template>

<style scoped>
.sudoku-view {
  margin: 20px auto;
  max-width: 500px;
}

.sudoku-view table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 20px;
  border: 2px solid #333;
}

.sudoku-view tr:nth-child(3n) {
  border-bottom: 2px solid #333;
}

.sudoku-view td {
  padding: 0;
  border: 1px solid #ccc;
  position: relative;
  width: 11.11%;
}

.sudoku-view td:nth-child(3n) {
  border-right: 2px solid #333;
}

.sudoku-view td::after {
  content: '';
  display: block;
  padding-bottom: 100%;
}

.sudoku-view button {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
  font-size: 1.5em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.small-numbers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  font-size: 0.6em;
  gap: 1px;
  padding: 2px;
}

.small-number-row {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  min-width: 0;
}

.sudoku-view button:hover {
  background: #f5f5f5;
}

.sudoku-view button.value-selected {
  background: #e3f2fd;
  color: #1976d2;
}

.sudoku-view button.value-selected-other {
  background: #f5f5f5;
}

.sudoku-view button.base-index {
  background: #e8f5e9;
  font-weight: bold;
}

.sudoku-view button.invalid {
  color: #f44336;
}

.bottom-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.bottom-buttons button {
  padding: 10px 15px;
  font-size: 1em;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.bottom-buttons button:hover {
  background: #f5f5f5;
}

.bottom-buttons button.bottom-selected {
  background: #e3f2fd;
  color: #1976d2;
}
</style>
