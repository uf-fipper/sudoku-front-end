<script setup lang="ts">
export interface SudokuValue {
  value: number;
  isInvalid: boolean;
  isBaseIndex: boolean;
  smallNumbers: number[];
}

defineProps<{
  item: SudokuValue;
  /**
   * 是否选中
   */
  isValueSelected: boolean;
  /**
   * 选中的数是否处于同一行或同一列
   */
  isValueSelectedOther: boolean;
  /**
   * 选中的数是否与当前数的数字相同
   */
  isOtherSelectedNumber: boolean;
  onClick?: (e: PointerEvent) => void;
}>();
</script>

<template>
  <button
    :class="{
      'value-selected': isValueSelected,
      'value-selected-other': isValueSelectedOther,
      'value-selected-other-base-index': isValueSelectedOther && item.isBaseIndex,
      'base-index': item.isBaseIndex,
      'value-other-selected-number': isOtherSelectedNumber,
    }"
    @click="onClick"
  >
    <span v-if="item.value !== 0" :class="{ invalid: item.isInvalid }">{{ item.value }}</span>
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
  background: #d4eaff;
}

.base-index {
  background: #e8f5e9;
  font-weight: bold;
}

.value-selected-other-base-index {
  background: #e3fdfb;
}

.value-other-selected-number {
  background: #ffe0e0;
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

button:not(.base-index):hover {
  background: #f5f5f5;
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
</style>
