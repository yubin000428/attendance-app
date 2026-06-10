<script setup>
import {
  ref,
  computed,
  onMounted
} from 'vue'
import { db } from '../firebase'

import {
  collection,
  getDocs
} from 'firebase/firestore'


const employees = ref([])

async function loadEmployees() {

  const usersSnapshot =
    await getDocs(collection(db, 'users'))

  const attendanceSnapshot =
    await getDocs(collection(db, 'attendance'))

  const users =
    usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

  const attendance =
    attendanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

  const today = getWorkDate()
  const workingCount = computed(
    () =>
      employees.value.filter(
        item => item.status === '근무중'
      ).length
  )

  const finishedCount = computed(
    () =>
      employees.value.filter(
        item => item.status === '퇴근'
      ).length
  )

  const todayRecords =
    attendance.filter(
      item => item.workDate === today
    )

  employees.value = users
    .map(user => {

      const userRecords =
        todayRecords.filter(
          item => item.uid === user.id
        )

      const checkIn =
        userRecords.find(
          item => item.type === 'checkin'
        )

      const checkOut =
        userRecords.find(
          item => item.type === 'checkout'
        )

      if (!checkIn) return null

      return {
        uid: user.id,

        name:
          user.realName,

        role:
          user.role || '직원',

        checkIn,

        checkOut,

        status:
          checkOut
            ? '퇴근'
            : '근무중'
      }
    })
    .filter(Boolean)
    .sort((a, b) => {

    if (
      a.status === '근무중' &&
      b.status !== '근무중'
    ) return -1

    if (
      a.status !== '근무중' &&
      b.status === '근무중'
    ) return 1

    return 0
  })
}

function formatTime(time) {

  if (!time) return '-'

  return new Date(time)
    .toLocaleTimeString(
      'ko-KR',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    )
}

function getWorkDate() {

  const now = new Date()

  const hour = now.getHours()

  if (hour < 3) {
    now.setDate(
      now.getDate() - 1
    )
  }

  return now
    .toISOString()
    .slice(0, 10)
}

onMounted(() => {
  loadEmployees()
})
</script>

<template>

<div class="summary-cards">

  <div class="summary-card">
    <div class="summary-number">
      {{ workingCount }}
    </div>
    <div class="summary-label">
      근무중
    </div>
  </div>

  <div class="summary-card">
    <div class="summary-number">
      {{ finishedCount }}
    </div>
    <div class="summary-label">
      퇴근
    </div>
  </div>

</div>

<div
  v-for="employee in employees"
  :key="employee.uid"
  class="employee-card"
>

  <div class="avatar">
    {{ employee.name?.charAt(0) }}
  </div>

  <div class="employee-info">

    <div class="employee-name">
      {{ employee.name }}
    </div>

    <div class="employee-role">
      {{ employee.role }}
    </div>

    <div class="employee-times">

      출근 :
      {{ formatTime(employee.checkIn.time) }}

      <template v-if="employee.checkOut">

        <br>

        퇴근 :
        {{ formatTime(employee.checkOut.time) }}

      </template>

    </div>

  </div>

  <div class="employee-status">

    <span
      :class="
        employee.status === '근무중'
          ? 'working'
          : 'finished'
      "
    >
      {{ employee.status }}
    </span>

  </div>

</div>

</template>

<style src="../styles/employees.css"></style>
