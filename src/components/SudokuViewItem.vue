<script setup lang="ts">
export interface SudokuValue {
  value: number;
  isInvalid: boolean;
  isBaseIndex: boolean;
  smallNumbers: number[];
}

defineProps<{
  item: SudokuValue;
  isValueSelected: boolean;
  isValueSelectedOther: boolean;
  onClick?: (e: PointerEvent) => void;
}>();
</script>

<template>
  <button
    :class="{
      'value-selected': isValueSelected,
      'value-selected-other': isValueSelectedOther,
      'base-index': item.isBaseIndex,
      invalid: item.isInvalid,
    }"
    @click="onClick"
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
</template>

<style lang="css" scoped>
.value-selected {
  background: #e3f2fd;
  color: #1976d2;
}

.value-selected-other {
  background: #f5f5f5;
}

.base-index {
  background: #e8f5e9;
  font-weight: bold;
}

.invalid {
  color: #f44336;
}

button {
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

button:hover {
  background: #f5f5f5;
}
</style>
