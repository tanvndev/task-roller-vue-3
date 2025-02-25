<script setup>
import { ref, watch, onMounted } from 'vue'

const people = ref(JSON.parse(localStorage.getItem('people')) || [])
const tasks = ref(JSON.parse(localStorage.getItem('tasks')) || [])
const selectedPeople = ref([])
const selectedTasks = ref([])
const assignedTasks = ref(JSON.parse(localStorage.getItem('assignedTasks')) || [])

const newPerson = ref('')
const addPerson = () => {
  if (newPerson.value.trim() && !people.value.includes(newPerson.value)) {
    people.value.push(newPerson.value)
    newPerson.value = ''
  }
}

const removePerson = (index) => {
  people.value.splice(index, 1)
  selectedPeople.value = selectedPeople.value.filter((person) => people.value.includes(person))
}

const newTask = ref('')
const addTask = () => {
  if (newTask.value.trim() && !tasks.value.includes(newTask.value)) {
    tasks.value.push(newTask.value)
    newTask.value = ''
  }
}

const removeTask = (index) => {
  tasks.value.splice(index, 1)
  selectedTasks.value = selectedTasks.value.filter((task) => tasks.value.includes(task))
}

const assignTasks = () => {
  if (people.value.length === 0 || tasks?.value.length === 0) {
    assignedTasks.value = []
    return alert('Nhìn xem đã nhập người và công việc chưa ?')
  }

  if (selectedPeople.value.length === 0 || selectedTasks.value.length === 0) {
    assignedTasks.value = []
    return alert('Nhìn xem đã chọn người và công việc chưa ?')
  }

  let shuffledTasks = [...selectedTasks.value].sort(() => Math.random() - 0.5)
  let shuffledPeople = [...selectedPeople.value].sort(() => Math.random() - 0.5)

  let taskMap = new Map()

  shuffledPeople.forEach((person) => {
    if (shuffledTasks.length > 0) {
      taskMap.set(person, [shuffledTasks.shift()])
    } else {
      taskMap.set(person, [])
    }
  })

  while (shuffledTasks.length > 0) {
    let person = shuffledPeople[Math.floor(Math.random() * shuffledPeople.length)]
    taskMap.get(person).push(shuffledTasks.shift())
  }

  // Gộp công việc thành một dòng
  assignedTasks.value = Array.from(taskMap.entries()).map(([person, tasks]) => ({
    person,
    task: tasks.join(' + '), // Nối tất cả công việc lại
  }))
}

const copyToClipboard = () => {
  const text = assignedTasks.value
    .map((item, index) => `${index + 1}. ${item.person} - ${item.task}`)
    .join('\n')
  navigator.clipboard.writeText(text)
}

watch(
  [people, tasks, assignedTasks],
  () => {
    localStorage.setItem('people', JSON.stringify(people.value))
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
    localStorage.setItem('assignedTasks', JSON.stringify(assignedTasks.value))
  },
  { deep: true },
)

// Load dữ liệu từ LocalStorage khi mở trang
onMounted(() => {
  selectedPeople.value = JSON.parse(localStorage.getItem('selectedPeople')) || []
  selectedTasks.value = JSON.parse(localStorage.getItem('selectedTasks')) || []
  assignedTasks.value = JSON.parse(localStorage.getItem('assignedTasks')) || []
})

// Lưu vào LocalStorage khi thay đổi danh sách
watch(
  [selectedPeople, selectedTasks, assignedTasks],
  () => {
    localStorage.setItem('selectedPeople', JSON.stringify(selectedPeople.value))
    localStorage.setItem('selectedTasks', JSON.stringify(selectedTasks.value))
    localStorage.setItem('assignedTasks', JSON.stringify(assignedTasks.value))
  },
  { deep: true },
)
</script>

<template>
  <div class="fullscreen-container">
    <div class="content">
      <h1 class="title">TaskRoller - Random Công Việc</h1>

      <div class="list-container">
        <div class="box">
          <h2 class="title-top">
            Danh sách người trực nhật
            <span>({{ people?.length }})</span>
          </h2>
          <div class="input-group">
            <input
              v-model="newPerson"
              placeholder="Nhập tên"
              class="input-field"
              @keyup.enter="addPerson"
            />
            <button @click="addPerson" class="btn">Thêm</button>
          </div>
          <ul>
            <li v-for="(person, index) in people" :key="person">
              <label class="cyberpunk-checkbox-label">
                <input
                  type="checkbox"
                  class="cyberpunk-checkbox"
                  :value="person"
                  v-model="selectedPeople"
                />
                {{ person }}</label
              >
              <button @click="removePerson(index)" class="delete-btn">❌</button>
            </li>
          </ul>
          <h2 class="title-bottom">
            Người được chọn:
            <span>{{ selectedPeople?.length }}</span>
          </h2>
        </div>

        <div class="box">
          <h2>Danh sách công việc ({{ tasks?.length }})</h2>
          <div class="input-group">
            <input
              v-model="newTask"
              placeholder="Nhập công việc"
              class="input-field"
              @keyup.enter="addTask"
            />
            <button @click="addTask" class="btn">Thêm</button>
          </div>
          <ul>
            <li v-for="(task, index) in tasks" :key="task">
              <label class="cyberpunk-checkbox-label">
                <input
                  type="checkbox"
                  class="cyberpunk-checkbox"
                  :value="task"
                  v-model="selectedTasks"
                />
                {{ task }}</label
              >
              <button @click="removeTask(index)" class="delete-btn">❌</button>
            </li>
          </ul>
          <h2 class="title-bottom">
            Việc được chọn:
            <span>{{ selectedTasks?.length }}</span>
          </h2>
        </div>
      </div>

      <button @click="assignTasks" class="btn-primary">Thực hiện</button>
    </div>
    <div class="content" v-if="assignedTasks.length">
      <div class="result-box">
        <div class="list-result">
          <h2 class="mb-0">Danh sách làm việc</h2>
          <button @click="copyToClipboard" class="btn-secondary">Sao chép</button>
        </div>
        <ul>
          <li v-for="(task, index) in assignedTasks" :key="index">
            {{ index + 1 }}. {{ task.person }} - {{ task.task }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* From Uiverse.io by adamgiebl */
.cyberpunk-checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #3498db;
  border-radius: 5px;
  background-color: transparent;
  display: inline-block;
  position: relative;
  margin-right: 10px;
  cursor: pointer;
}

.cyberpunk-checkbox:before {
  content: '';
  background-color: #3498db;
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 10px;
  height: 10px;
  border-radius: 3px;
  transition: all 0.3s ease-in-out;
}

.cyberpunk-checkbox:checked:before {
  transform: translate(-50%, -50%) scale(1);
}

.cyberpunk-checkbox-label {
  font-size: 18px;
  color: #222222;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
}
</style>
