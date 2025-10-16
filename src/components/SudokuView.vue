<script setup lang="ts">
import SudokuViewItem from './SudokuViewItem.vue';
import { type SudokuValue } from './SudokuViewItem.vue';

const { sudokuValues, valueSelectedItem, handleClick } = defineProps<{
  sudokuValues: SudokuValue[][];
  valueSelectedItem?: [number, number];
  handleClick?: (i: number, j: number) => void;
}>();

function isValueSelected(row: number, col: number) {
  return valueSelectedItem?.[0] === row && valueSelectedItem?.[1] === col;
}

function isValueSelectedOther(row: number, col: number) {
  return (
    !isValueSelected(row, col) && (valueSelectedItem?.[0] === row || valueSelectedItem?.[1] === col)
  );
}
</script>

<template>
  <div class="sudoku-view">
    <table>
      <tbody>
        <tr v-for="(line, i) in sudokuValues" :key="`sudoku-line-${i}`">
          <td v-for="(item, j) in line" :key="`sudoku-item-${i}-${j}`">
            <SudokuViewItem
              :item="item"
              :is-value-selected="isValueSelected(i, j)"
              :is-value-selected-other="isValueSelectedOther(i, j)"
              @click="() => handleClick?.(i, j)"
            ></SudokuViewItem>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="css" scoped>
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
</style>
