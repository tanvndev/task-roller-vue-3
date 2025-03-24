<script setup>
import Loading from '@/components/Loading.vue'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { onMounted, ref } from 'vue'

const formattedTableData = ref([])

const loadTableData = async () => {
  const resultsSnapshot = await getDocs(collection(db, 'results'))
  const results = resultsSnapshot.docs.map((doc) => doc.data().tasks)
  const allTasks = results.flat()

  // Bước 2: Nhóm các task theo person và đếm số lần
  const personTasks = allTasks.reduce((acc, { person, task }) => {
    if (!acc[person]) {
      acc[person] = {}
    }

    if (!acc[person][task]) {
      acc[person][task] = 0
    }

    acc[person][task]++

    return acc
  }, {})

  // Bước 3: Format dữ liệu để hiển thị trong bảng
  const formattedData = Object.keys(personTasks).map((person) => {
    const tasks = personTasks[person]
    return {
      person,
      tasks: Object.keys(tasks).map((task) => ({
        task,
        count: tasks[task],
      })).sort((a, b) => b.count - a.count),
    }
  })

  formattedTableData.value = formattedData
}

onMounted(() => {
  loadTableData()
})
</script>

<template>
  <div class="fullscreen-container">
    <div class="tasks-list" v-if="formattedTableData.length">
      <div v-for="(personData, index) in formattedTableData" :key="index" class="person-card">
        <h3>{{ personData.person }}</h3>
        <ul class="task-list">
          <li v-for="(task, taskIndex) in personData.tasks" :key="taskIndex" class="task-item">
            <span class="task-name"
              ><strong>{{ task.task || 'Được ngồi chơi =))' }}</strong></span
            >
            <span class="task-count">{{ task.count }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <Loading />
    </div>
  </div>
</template>
<style scoped>
.tasks-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 20px;
}

.person-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  padding: 20px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.person-card:hover {
  transform: translateY(-10px);
}

.person-card h3 {
  text-align: center;
  color: #333;
  font-size: 1.3em;
  margin-bottom: 15px;
  font-weight: bold;
}

.task-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.task-item {
  background-color: #f4f7fa;
  border-radius: 5px;
  margin: 8px 0;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.task-item:hover {
  background-color: #e1f3ff;
}

.task-name {
  font-weight: bold;
  color: #007bff;
}

.task-count {
  color: #666;
  font-size: 0.9em;
  margin-left: 10px;
  background-color: #d1e7fd;
  padding: 4px 8px;
  border-radius: 12px;
}
</style>
