<script setup>
import { ref, computed, onMounted } from 'vue'

import { auth, db } from '../firebase'

import {
  collection,
  getDocs
} from 'firebase/firestore'

const records = ref([])

// 월 선택
const selectedMonth = ref(
  new Date()
    .toISOString()
    .slice(0, 7)
)

const monthLabel = computed(() => {

  const [year, month] =
    selectedMonth.value.split('-')

  return `${year}년 ${Number(month)}월`
})

// 기록이 있는 월만 보여주기
const monthOptions = computed(() => {

  const currentMonth =
    new Date()
      .toISOString()
      .slice(0, 7)

  const months =
    [...new Set([
      currentMonth,
      ...records.value.map(
        item => item.date.slice(0, 7)
      )
    ])]

  return months
    .sort()
    .reverse()
})

// 이번달 근무일수
const monthRecords = computed(
  () =>
    records.value.filter(
      item =>
        item.date.startsWith(
          selectedMonth.value
        )
    )
)

const workDays = computed(
  () =>
    monthRecords.value.filter(
      item => item.checkIn
    ).length
)

// 이번달 총 근무시간
const totalWorkMinutes =
  computed(() =>
    monthRecords.value.reduce(
      (sum, item) =>
        sum + item.workMinutes,
      0
    )
  )

const totalWorkTime =
  computed(() => {

    const h =
      Math.floor(
        totalWorkMinutes.value / 60
      )

    const m =
      totalWorkMinutes.value % 60

    return `${h}시간 ${m}분`
  })

async function loadMyAttendance() {

  const user = auth.currentUser

  if (!user) return

  const snapshot =
    await getDocs(
      collection(db, 'attendance')
    )

  const allRecords =
    snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

  const myRecords =
    allRecords.filter(
      item => item.uid === user.uid
    )

  const grouped = {}

  myRecords.forEach(record => {

    if (!grouped[record.workDate]) {

      grouped[record.workDate] = {
        date: record.workDate,
        checkIn: null,
        checkOut: null,
        workMinutes: 0
      }
    }

    if (record.type === 'checkin') {
      grouped[record.workDate].checkIn =
        record.time
    }

    if (record.type === 'checkout') {
      grouped[record.workDate].checkOut =
        record.time
    }
  })

  records.value =
    Object.values(grouped)
      .map(item => {

        let workMinutes = 0

        if (
          item.checkIn &&
          item.checkOut
        ) {

          const start =
            item.checkIn.toDate()

          const end =
            item.checkOut.toDate()

          workMinutes =
            Math.floor(
              (end - start) /
              1000 /
              60
            )
        }

        return {
          ...item,
          workMinutes
        }
      })
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date)
      )
}

function formatTime(timestamp) {

  if (!timestamp) return '-'

  return timestamp
    .toDate()
    .toLocaleTimeString(
      'ko-KR',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    )
}

function formatWorkTime(minutes) {

  const h =
    Math.floor(minutes / 60)

  const m =
    minutes % 60

  return `${h}시간 ${m}분`
}

onMounted(() => {
  loadMyAttendance()
})
</script>
<template>
<div class="month-box">

  <span>
    📅 {{ monthLabel }}
  </span>

  <select
    v-model="selectedMonth"
    class="month-select"
  >
    <option
      v-for="month in monthOptions"
      :key="month"
      :value="month"
    >
      {{ month }}
    </option>
  </select>

</div>

<div class="summary-wrap">

  <div class="summary-card">
    <div class="summary-label">
      이번달 근무일수
    </div>
    <div class="summary-number">
      {{ workDays }}
    </div>
  </div>

  <div class="summary-card">
    <div class="summary-label">
      이번달 근무시간
    </div>
    <div class="summary-number">
      {{ totalWorkTime }}
    </div>
  </div>

</div>

<div
  v-for="record in records"
  :key="record.date"
  class="record-card"
>

  <div class="record-date">
    📅 {{ record.date }}
  </div>

  <div class="record-row">
    출근
    {{ formatTime(record.checkIn) }}
  </div>

  <div class="record-row">
    퇴근
    {{ formatTime(record.checkOut) }}
  </div>

  <div class="record-time">

    근무시간

    {{ formatWorkTime(
      record.workMinutes
    ) }}

  </div>

</div>

</template>
<style src="../styles/history.css"></style>
