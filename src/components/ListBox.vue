<script setup lang="ts">
import type { SudokuGamePublicVo } from '@/models/vo/SudokuGameVo';

const props = defineProps<{
  game: SudokuGamePublicVo;
}>();

const game = props.game;

function getDifficultyText(emptyCount: number) {
  if (emptyCount <= 20) {
    return '简单';
  } else if (emptyCount <= 40) {
    return '中等';
  } else {
    return '困难';
  }
}
</script>

<template>
  <div>游戏ID: {{ game.gameId }}</div>
  <div>Seed: {{ game.seed }}</div>
  <div>状态: {{ game.isWin ? '胜利' : '未完成' }}</div>
  <div>剩余空格数：{{ game.boardEmptyCount }}</div>
  <div>难度：{{ getDifficultyText(game.startBoardEmptyCount) }}</div>
</template>
