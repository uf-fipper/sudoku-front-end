<script setup lang="ts">
import { newGame } from '@/api/sudoku';
import router from '@/router';
import { ref } from 'vue';

const props = defineProps<{
  onCancelNewGameForm: () => void;
}>();

const newGameForm = ref<{ difficulty: 'easy' | 'medium' | 'hard' }>({
  difficulty: 'easy',
});

async function submitNewGameForm() {
  try {
    let maxCount: number;
    switch (newGameForm.value.difficulty) {
      case 'easy':
        maxCount = 20;
        break;
      case 'medium':
        maxCount = 40;
        break;
      case 'hard':
        maxCount = 81;
        break;
      default:
        maxCount = 20;
        break;
    }
    const response = await newGame({ maxCount });
    router.push(`/sudoku-ws?gameId=${response.data.data.gameId}`);
  } catch (error) {
    console.error('Failed to create new game:', error);
  } finally {
    props.onCancelNewGameForm();
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>创建新游戏</h2>
      <form @submit.prevent="submitNewGameForm">
        <div class="form-group">
          <label for="difficulty">难度:</label>
          <select id="difficulty" v-model="newGameForm.difficulty">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" @click="props.onCancelNewGameForm()">取消</button>
          <button type="submit">创建</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type='submit'] {
  background-color: #4caf50;
  color: white;
}

.form-actions button[type='button'] {
  background-color: #f44336;
  color: white;
}
</style>
