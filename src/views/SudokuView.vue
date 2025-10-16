<script setup lang="ts">
import { ref } from 'vue';
import { getGame, newGame, setValue } from '@/api/sudoku';
import type { SudokuGamePublicVo } from '@/models/vo/SudokuGameVo';
import { useRoute, useRouter } from 'vue-router';
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
  // 数独区域点击的位置
  valueSelectedItem?: [number, number];
  // 0是删除
  bottomSelectedItem?: number;
  baseIndexs: Set<string>;
  rawGame: SudokuGamePublicVo;
  isSmallNumberMode: boolean;
}

const game = ref<Game>();

function resetGame(newGame: SudokuGamePublicVo) {
  const valueSelectedItem = game.value?.valueSelectedItem;
  const bottomSelectedItem = game.value?.bottomSelectedItem;
  const baseIndexs =
    game.value?.baseIndexs ?? new Set(newGame.baseIndexs.map((item) => `${item[0]},${item[1]}`));

  game.value = {
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
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (isBaseIndex(i, j)) {
        game.value.sudokuValues[i][j].isBaseIndex = true;
      }
    }
  }
  console.log(game.value.sudokuValues);
  handleInvalid();
}

function startGame() {
  if (typeof gameId === 'string' && gameId !== '') {
    getGame(gameId).then((res) => {
      console.log(res);
      resetGame(res.data.data);
    });
  } else {
    newGame().then((res) => {
      console.log(res);
      resetGame(res.data.data);
    });
  }
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
      if (index === -1) {
        smallNumbers.push(selectedNumber);
      } else {
        smallNumbers.splice(index, 1);
      }
    } else {
      // 大数字模式
      if (game.value.sudokuValues[row][col].value === 0) {
        setValue({
          i: row,
          j: col,
          gameId: game.value.gameId,
          value: game.value.bottomSelectedItem,
        }).then((res) => {
          resetGame(res.data.data.game);
        });
      }
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
  // 这里要判断是否有重复的数字，有则标红
  handleInvalid();
}

function handleInvalid() {
  if (game.value === undefined) return;
  console.log('handleInvalid');
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (checkInvalidNumberOnce(i, j)) {
        console.log('true');
        game.value.sudokuValues[i][j].isInvalid = true;
      } else {
        console.log('false');
        game.value.sudokuValues[i][j].isInvalid = false;
      }
    }
  }
}

function checkInvalidNumberOnce(row: number, col: number): boolean {
  if (game.value === undefined) return false;
  const value = game.value.sudokuValues[row][col].value;
  if (value === 0) return false;
  // 行
  for (let j = 0; j < 9; j++) {
    if (j !== col && game.value.sudokuValues[row][j].value === value) {
      return true;
    }
  }
  // 列
  for (let i = 0; i < 9; i++) {
    if (i !== row && game.value.sudokuValues[i][col].value === value) {
      return true;
    }
  }
  // 九宫格
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
    <div class="mode-toggle">
      <button @click="toggleSmallNumberMode" class="mode-button">
        {{ game.isSmallNumberMode ? '切换到大数字模式' : '切换到小数字模式' }}
      </button>
    </div>
    <SudokuView
      :sudoku-values="game.sudokuValues"
      :value-selected-item="game.valueSelectedItem"
      :handle-click="handleClick"
    ></SudokuView>
    <div class="bottom-buttons">
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
    <button @click="startGame">开始游戏</button>
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
  width: 11.11%; /* 确保每个格子宽度一致 */
}

.sudoku-view td:nth-child(3n) {
  border-right: 2px solid #333;
}

.sudoku-view td::after {
  content: '';
  display: block;
  padding-bottom: 100%;
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
