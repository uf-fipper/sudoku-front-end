<script setup lang="ts">
import { ref } from 'vue';

const sudokuValues = ref([
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
]);

// 数独区域点击的位置
const valueSelectedItem = ref<[number, number] | null>(null);

// 0是删除
const bottomSelectedItem = ref<number | null>(null);

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
  if (bottomSelectedItem.value === 0) {
  }
  if (bottomSelectedItem.value !== null) {
    sudokuValues.value[row][col] = bottomSelectedItem.value;
  }
  if (valueSelectedItem.value?.[0] === row && valueSelectedItem.value?.[1] === col) {
    valueSelectedItem.value = null;
  } else {
    valueSelectedItem.value = [row, col];
  }
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
  <div>
    <div class="sudoku-view">
      <table>
        <tbody>
          <tr v-for="(line, i) in sudokuValues" :key="`sudoku-line-${i}`">
            <td v-for="(item, j) in line" :key="`sudoku-item-${i}-${j}`">
              <button
                :class="{
                  'value-selected': isValueSelected(i, j),
                  'value-selected-other': isValueSelectedOther(i, j),
                }"
                @click="handleClick(i, j)"
              >
                {{ item }}
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
</style>
