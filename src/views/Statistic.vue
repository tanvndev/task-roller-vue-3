<script setup>
import Loading from '@/components/Loading.vue'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { onMounted, ref } from 'vue'
import OIA_CAT from '/audio/OIIA_CAT.mp3'
import SpinningCat from '/audio/Spinning_Cat.mp3'
import CatKiss from '/images/cat-kiss.gif'
import CatOIA from '/images/oia-uia.gif'
import RickRoll from '/images/rickroll-roll.gif'

const formattedTableData = ref([])
const audioPlayer = ref(null)

function checkOddEvenDayFromDate(date = new Date()) {
  const day = date.getDate() // Lấy ngày từ đối tượng Date

  if (day < 1 || day > 31) {
    return false
  }

  if (day % 2 === 0) {
    return true
  } else {
    return false
  }
}

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
      tasks: Object.keys(tasks)
        .map((task) => ({
          task,
          count: tasks[task],
        }))
        .sort((a, b) => b.count - a.count),
    }
  })

  formattedTableData.value = formattedData
}

onMounted(() => {
  loadTableData()
  audioPlayer.value.play()
})
</script>

<template>
  <div class="fullscreen-container">
    <audio ref="audioPlayer" controls class="d-none">
      <source v-if="checkOddEvenDayFromDate()" :src="SpinningCat" type="audio/mp3" />
      <source v-else :src="SpinningCat" type="audio/mp3" />
      Trình duyệt của bạn không hỗ trợ thẻ audio.
    </audio>
    <div class="tasks-list" v-if="formattedTableData.length">
      <div v-for="(personData, index) in formattedTableData" :key="index" class="person-card">
        <div class="task-header">
          <h3>{{ personData.person }}</h3>
          <img :src="CatOIA" class="icon" alt="gif" />
        </div>
        <ul class="task-list">
          <li v-for="(task, taskIndex) in personData.tasks" :key="taskIndex" class="task-item">
            <div class="task-name">
              <img :src="CatKiss" v-if="taskIndex === 0" class="icon" alt="gif" />
              <img :src="RickRoll" v-if="task.task == ''" class="icon" alt="gif" />
              <strong>{{ task.task || 'Được ngồi chơi =))' }}</strong>
            </div>
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
.task-header {
  display: flex;
  justify-content: center;
  align-self: center;
}
.task-header .icon {
  width: 35px;
  height: 30px;
  margin-left: 6px;
  border-radius: 8px;
  object-fit: contain;
  transform: scale(1);
}
.task-header h3 {
  margin: 0;
}

.task-name .icon {
  width: 20px;
  margin-right: 4px;
  border-radius: 8px;
  transition: linear 2s;
}
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
  display: flex;
  justify-content: center;
  align-items: center;
  transition: linear 2s;
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
