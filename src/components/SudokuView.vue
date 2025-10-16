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
