<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const employees = ref([])

async function loadEmployees() {
  const snapshot = await getDocs(
    collection(db, 'attendance')
  )

  const records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  // uid별 최신 기록만 저장
  const latestMap = {}

  records.forEach(record => {
    const current = latestMap[record.uid]

    if (
      !current ||
      new Date(record.time) > new Date(current.time)
    ) {
      latestMap[record.uid] = record
    }
  })

  employees.value = Object.values(latestMap)
}

onMounted(() => {
  loadEmployees()
})
</script>

<template>
  <div class="employee-page">

    <h2>👥 직원 현황</h2>

    <div
      v-for="employee in employees"
      :key="employee.uid"
      class="employee-card"
    >
      <h3>
        {{ employee.name }}
      </h3>

      <p>
        {{ employee.email }}
      </p>

      <p v-if="employee.type === 'checkin'">
        🟢 근무중
      </p>

      <p v-else>
        🔴 퇴근
      </p>

    </div>

  </div>
</template>