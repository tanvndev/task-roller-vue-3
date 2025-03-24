<script setup>
import Loading from '@/components/Loading.vue'
import { db } from '@/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { computed, onMounted, ref, watch } from 'vue'

const people = ref([])
const tasks = ref([])
const selectedPeople = ref([])
const selectedTasks = ref([])
const assignedTasks = ref([JSON.parse(localStorage.getItem('assignedTasks')) || []])
const isLoading = ref(false)

const allPeopleSelected = computed(() => selectedPeople.value.length === people.value.length)
const allTasksSelected = computed(() => selectedTasks.value.length === tasks.value.length)

const newPerson = ref('')
const addPerson = async () => {
  if (newPerson.value.trim() && people.value.includes((p) => p.name === newPerson.value)) {
    newPerson.value = ''
    return alert('Nhập tên chưa hay nhập trùng tên rồi ?')
  }

  const payload = { name: newPerson.value }
  await addDoc(collection(db, 'people'), payload)
  getAllData()
  newPerson.value = ''
}

const removePerson = async (id) => {
  await deleteDoc(doc(db, 'people', id))
  getAllData()
}

const newTask = ref('')
const addTask = async () => {
  if (newTask.value.trim() && tasks.value.includes((t) => t.name === newTask.value)) {
    newTask.value = ''
    return alert('Nhập việc chưa hay nhập trùng việc rồi ?')
  }

  const payload = { name: newTask.value }
  await addDoc(collection(db, 'tasks'), payload)
  getAllData()
  newTask.value = ''
}

const toggleSelectAllPeople = () => {
  selectedPeople.value = allPeopleSelected.value ? [] : [...people.value.map((p) => p.id)]
}

const toggleSelectAllTasks = () => {
  selectedTasks.value = allTasksSelected.value ? [] : [...tasks.value.map((t) => t.id)]
}

const removeTask = async (id) => {
  await deleteDoc(doc(db, 'tasks', id))
  getAllData()
}

const assignTasks = async () => {
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

  shuffledPeople.forEach((personId) => {
    if (shuffledTasks.length > 0) {
      taskMap.set(personId, [shuffledTasks.shift()])
    } else {
      taskMap.set(personId, [])
    }
  })

  while (shuffledTasks.length > 0) {
    let personId = shuffledPeople[Math.floor(Math.random() * shuffledPeople.length)]
    taskMap.get(personId).push(shuffledTasks.shift())
  }

  assignedTasks.value = Array.from(taskMap.entries()).map(([personId, taskIds]) => {
    const person = people.value.find((p) => p.id === personId)?.name || 'Unknown'
    const taskNames = taskIds.map((id) => tasks.value.find((t) => t.id === id)?.name).join(' + ')
    return { person, task: taskNames }
  })

  const today = new Date().toISOString().split('T')[0] // Lấy ngày hiện tại (YYYY-MM-DD)

  const resultsCollection = collection(db, 'results')
  const q = query(resultsCollection, where('date', '==', today))
  const querySnapshot = await getDocs(q)

  if (!querySnapshot.empty) {
    // Nếu đã có, cập nhật kết quả
    const docRef = querySnapshot.docs[0].ref
    await updateDoc(docRef, { tasks: assignedTasks.value })
    console.log(1)
  } else {
    console.log(2)

    // Nếu chưa có, thêm mới
    await addDoc(resultsCollection, { date: today, tasks: assignedTasks.value })
  }
}

const getAllData = async () => {
  try {
    isLoading.value = true

    const tasksSnapshot = await getDocs(collection(db, 'tasks'))
    tasks.value = tasksSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))

    const peopleSnapshot = await getDocs(collection(db, 'people'))
    people.value = peopleSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

const copyToClipboard = () => {
  const text = assignedTasks.value
    .filter((item) => item.person && item.task)
    .map((item, index) => `${index + 1}. ${item.person} - ${item.task}`)
    .join('\n');
  navigator.clipboard.writeText(text);
}

// Load dữ liệu từ LocalStorage khi mở trang
onMounted(() => {
  getAllData()
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
      <div class="logo-container">
        <img src="https://www.roller.software/hubfs/Favicon_192x192.png" alt="logo" class="logo" />
        <h1 class="title">TaskRoller - Random Công Việc</h1>
      </div>

      <div class="list-container">
        <!-- Box people -->
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
          <!-- List people -->
          <div v-if="!isLoading">
            <div class="my-10">
              <label class="cyberpunk-checkbox-label">
                <input
                  type="checkbox"
                  class="cyberpunk-checkbox"
                  :checked="allPeopleSelected"
                  @change="toggleSelectAllPeople"
                />

                {{ allPeopleSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
              </label>
            </div>
            <ul>
              <li v-for="(person, index) in people" :key="person.id">
                <label class="cyberpunk-checkbox-label">
                  <input
                    type="checkbox"
                    class="cyberpunk-checkbox"
                    :value="person.id"
                    v-model="selectedPeople"
                  />
                  {{ person.name }}</label
                >
                <button @click="removePerson(person.id)" class="delete-btn">❌</button>
              </li>
            </ul>
            <h2 class="title-bottom">
              Người được chọn:
              <span>{{ selectedPeople?.length }}</span>
            </h2>
          </div>
          <div v-else class="my-50">
            <Loading />
          </div>
        </div>

        <!-- Box tasks -->
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

          <!-- List tasks -->
          <div v-if="!isLoading">
            <div class="my-10">
              <label class="cyberpunk-checkbox-label">
                <input
                  type="checkbox"
                  class="cyberpunk-checkbox"
                  :checked="allTasksSelected"
                  @change="toggleSelectAllTasks"
                />

                {{ allTasksSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
              </label>
            </div>
            <ul>
              <li v-for="(task, index) in tasks" :key="task.id">
                <label class="cyberpunk-checkbox-label">
                  <input
                    type="checkbox"
                    class="cyberpunk-checkbox"
                    :value="task.id"
                    v-model="selectedTasks"
                  />
                  {{ task.name }}</label
                >
                <button @click="removeTask(task.id)" class="delete-btn">❌</button>
              </li>
            </ul>
            <h2 class="title-bottom">
              Việc được chọn:
              <span>{{ selectedTasks?.length }}</span>
            </h2>
          </div>
          <div v-else class="my-50">
            <Loading />
          </div>
        </div>
      </div>

      <button @click="assignTasks" class="btn-primary">Thực hiện</button>
    </div>
    <div class="content" v-if="assignedTasks.length">
      <div class="result-box">
        <div class="list-result">
          <h2 class="mb-0">Kết quả phân công</h2>
          <button @click="copyToClipboard" class="btn-secondary">Sao chép</button>
        </div>
        <ul>
          <div v-for="(item, index) in assignedTasks" :key="index">
            <li v-if="item.person && item.task">
              {{ index + 1 }}. {{ item.person }} - {{ item.task }}
            </li>
          </div>
        </ul>
        <RouterLink to="/statistic" class="a-underline"> Thống kê </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.a-underline {
  background: linear-gradient(0deg, #3498db, #3498db) no-repeat right bottom / 0 var(--bg-h);
  transition: background-size 350ms;
  --bg-h: 100%;
}
.a-underline:where(:hover, :focus-visible) {
  background-size: 100% var(--bg-h);
  background-position-x: left;
}

.a-underline {
  margin-top: 15px;
  display: inline-block;
  padding-bottom: 2px;
  --bg-h: 2px;
}

.a-underline {
  text-decoration: none;
  line-height: 1;
  color: #222222;
}

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
