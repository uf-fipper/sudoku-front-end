<script setup lang="ts">
import { ref } from 'vue';
import { newSudoku } from '@/api/sudoku';

class SudokuValue {
  value: number;
  isInvalid: boolean;

  constructor(value: number, isInvalid?: boolean) {
    this.value = value;
    this.isInvalid = isInvalid ?? false;
  }
}

const isShow = ref(false);

// const sudokuValuesRaw = [
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
// ];
const sudokuValuesRaw = ref<number[][] | null>(null);

const sudokuValues = ref<SudokuValue[][] | null>(null);

// 数独区域点击的位置
const valueSelectedItem = ref<[number, number] | null>(null);

// 0是删除
const bottomSelectedItem = ref<number | null>(null);

function startGame() {
  newSudoku().then((res) => {
    isShow.value = true;
    console.log(res);
    sudokuValuesRaw.value = res.data.data.board;
    console.log(sudokuValuesRaw.value);
    sudokuValues.value = sudokuValuesRaw.value!.map((line) =>
      line.map((item) => new SudokuValue(item, false)),
    );
    handleInvalid();
  });
}

function isValueSelected(row: number, col: number) {
  return valueSelectedItem.value?.[0] === row && valueSelectedItem.value?.[1] === col;
}

function isValueSelectedOther(row: number, col: number) {
  return (
    !isValueSelected(row, col) &&
    (valueSelectedItem.value?.[0] === row || valueSelectedItem.value?.[1] === col)
  );
}

function handleClick(row: number, col: number) {
  if (sudokuValues.value === null) return;
  if (bottomSelectedItem.value === 0) {
  }
  if (bottomSelectedItem.value !== null) {
    sudokuValues.value[row][col].value = bottomSelectedItem.value;
  }
  if (valueSelectedItem.value?.[0] === row && valueSelectedItem.value?.[1] === col) {
    valueSelectedItem.value = null;
  } else {
    valueSelectedItem.value = [row, col];
  }
  // 这里要判断是否有重复的数字，有则标红
  handleInvalid();
}

function handleInvalid() {
  if (sudokuValues.value === null) return;
  console.log('handleInvalid');
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (checkInvalidNumberOnce(i, j)) {
        console.log('true');
        sudokuValues.value[i][j].isInvalid = true;
      } else {
        console.log('false');
        sudokuValues.value[i][j].isInvalid = false;
      }
    }
  }
}

function checkInvalidNumberOnce(row: number, col: number): boolean {
  if (sudokuValues.value === null) return false;
  const value = sudokuValues.value[row][col].value;
  if (value === 0) return false;
  // 行
  for (let j = 0; j < 9; j++) {
    if (j !== col && sudokuValues.value[row][j].value === value) {
      return true;
    }
  }
  // 列
  for (let i = 0; i < 9; i++) {
    if (i !== row && sudokuValues.value[i][col].value === value) {
      return true;
    }
  }
  // 九宫格
  const rowStart = Math.floor(row / 3) * 3;
  const colStart = Math.floor(col / 3) * 3;
  for (let i = rowStart; i < rowStart + 3; i++) {
    for (let j = colStart; j < colStart + 3; j++) {
      if (i !== row && j !== col && sudokuValues.value[i][j].value === value) {
        return true;
      }
    }
  }
  return false;
}

function bottomSelectItem(item: number) {
  if (bottomSelectedItem.value === item) {
    bottomSelectedItem.value = null;
    return;
  }
  bottomSelectedItem.value = item;
}
</script>

<template>
  <div v-if="isShow">
    <div class="sudoku-view">
      <table>
        <tbody>
          <tr v-for="(line, i) in sudokuValues" :key="`sudoku-line-${i}`">
            <td v-for="(item, j) in line" :key="`sudoku-item-${i}-${j}`">
              <button
                :class="{
                  'value-selected': isValueSelected(i, j),
                  'value-selected-other': isValueSelectedOther(i, j),
                  invalid: item.isInvalid,
                }"
                @click="handleClick(i, j)"
              >
                <span>{{ item.value }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
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
                :class="{ 'bottom-selected': i === bottomSelectedItem }"
                @click="() => bottomSelectItem(i)"
              >
                {{ i }}
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
.bottom-selected {
  background-color: aqua;
}

.value-selected {
  background-color: aqua;
}

.value-selected-other {
  background-color: aquamarine;
}

.invalid {
  color: red;
}
</style>
