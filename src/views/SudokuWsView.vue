<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { WebSocketApiManager } from '@/api/sudoku';
import type { SudokuGamePublicVo } from '@/models/vo/SudokuGameVo';
import { useRoute, useRouter } from 'vue-router';
import type { SudokuSetValueVo } from '@/models/vo/SudokuSetValueVo';
import SudokuView from '@/components/SudokuView.vue';

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
let manager: WebSocketApiManager | undefined = undefined;

function getSelectedValue(): number | undefined {
  const valueSelectedItem = game.value?.valueSelectedItem;
  if (valueSelectedItem === undefined) return undefined;
  const value = game.value?.sudokuValues?.[valueSelectedItem[0]][valueSelectedItem[1]]?.value;
  if (value === 0) return undefined;
  return value;
}

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
    isSmallNumberMode: game.value?.isSmallNumberMode ?? false,
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
  manager = new WebSocketApiManager(gameId);
  manager.onmessage<SudokuSetValueVo>('SetValue', (data) => {
    resetGame(data.game);
  });
  manager.onmessage<SudokuGamePublicVo>('Game', (data) => {
    resetGame(data);
  });
}

function isBaseIndex(row: number, col: number): boolean {
  if (game.value === undefined) return false;
  return game.value.baseIndexs.has(`${row},${col}`);
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
      manager?.sendSetValue({
        gameId: game.value.gameId,
        i: row,
        j: col,
        value: game.value.bottomSelectedItem,
      });
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
  const size = game.value.rawGame.board.length;
  // 非提示状态
  if (game.value.rawGame.correctMap?.[0] === undefined) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        game.value.sudokuValues[i][j].isInvalid = checkInvalidNumberOnce(i, j);
      }
    }
  }
  // 提示状态
  else {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!game.value.rawGame.correctMap[i][j]) {
          game.value.sudokuValues[i][j].isInvalid = true;
        }
      }
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

function toggleHintMode() {
  if (game.value === undefined || manager === undefined) return;
  const isHintEnabled = game.value.rawGame.correctMap !== null;
  manager.sendSetSendSolve(!isHintEnabled);
}

function goBack() {
  router.push('/sudoku-list');
}

onMounted(() => {
  startGame();
});

onUnmounted(() => {
  if (manager) {
    manager.close();
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
    <SudokuView
      :sudoku-values="game.sudokuValues"
      :value-selected-item="game.valueSelectedItem"
      :selected-value="getSelectedValue()"
      :handle-click="handleClick"
    ></SudokuView>
    <div class="bottom-buttons">
      <div class="mode-toggle">
        <button @click="toggleSmallNumberMode" class="mode-button">
          {{ game.isSmallNumberMode ? '小' : '大' }}
        </button>
        <button @click="toggleHintMode" class="mode-button">
          {{ game.rawGame.correctMap === null ? '开启提示' : '关闭提示' }}
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
