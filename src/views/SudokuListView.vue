<script setup lang="ts">
import { ref } from 'vue';
import { getGameList } from '@/api/sudoku';
import { useRouter } from 'vue-router';
import type { SudokuGamePublicVo } from '@/models/vo/SudokuGameVo';
import type { PageDataVo } from '@/models/vo/PageDataVo';

const router = useRouter();
const games = ref<SudokuGamePublicVo[]>([]);
const pageData = ref<PageDataVo>({ page: 1, pageSize: 10, total: 0, totalPage: 1 });
const currentPage = ref(1);
const isLoading = ref(false);

async function loadGames(page: number) {
  isLoading.value = true;
  try {
    const response = await getGameList(page);
    games.value = response.data.data.games;
    pageData.value = response.data.data.pageData;
  } catch (error) {
    console.error('Failed to load games:', error);
  } finally {
    isLoading.value = false;
  }
}

function handleGameClick(gameId: string) {
  router.push(`/sudoku-ws?gameId=${gameId}`);
}

// 初始化加载第一页数据
loadGames(currentPage.value);
</script>

<template>
  <div class="sudoku-list-view">
    <h1>数独游戏大厅</h1>
    <div v-if="isLoading">加载中...</div>
    <div v-else>
      <ul>
        <li
          v-for="game in games"
          :key="game.gameId"
          @click="handleGameClick(game.gameId)"
          class="game-item"
          :class="{ 'game-win': game.isWin, 'game-lose': !game.isWin }"
        >
          <div>游戏ID: {{ game.gameId }}</div>
          <div>Seed: {{ game.seed }}</div>
          <div>状态: {{ game.isWin ? '胜利' : '未完成' }}</div>
        </li>
      </ul>
      <div class="pagination">
        <button
          @click="
            currentPage--;
            loadGames(currentPage);
          "
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        <span>第 {{ currentPage }} 页</span>
        <button
          @click="
            currentPage++;
            loadGames(currentPage);
          "
          :disabled="pageData.totalPage === currentPage"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sudoku-list-view {
  padding: 20px;
}
.game-item {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ccc;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.game-item:hover {
  background-color: #f0f0f0;
}
.game-win {
  border-left: 4px solid #4caf50;
}
.game-lose {
  border-left: 4px solid #f44336;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
