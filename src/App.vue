<script setup>
import { ref } from 'vue'

const checkInTime = ref('')     // 출근 시간 Date 저장
const checkInDisplay = ref('')  // 화면에 보여줄 출근 시간 저장  

const checkOutTime = ref('')    // 퇴근 시간 Date 저장
const checkOutDisplay = ref('') // 화면에 보여줄 퇴근 시간 저장

const workHours = ref('')       // 근무 시간 저장
function checkIn() {
  if (checkInTime.value !== '') {
    alert('이미 출근했습니다.')
    return
  }

  const now = new Date()

  checkInTime.value = now
  checkInDisplay.value = now.toLocaleTimeString()
}

function checkOut() {
  const now = new Date()

  checkOutTime.value = now
  checkOutDisplay.value = now.toLocaleTimeString()
  workHours.value = '계산중...'

  const diff = checkOutTime.value - checkInTime.value

  const hours = (diff / 1000 / 60 / 60).toFixed(2)

  workHours.value = `${hours}시간 근무`
}
</script>

<template>
  <div>
    <h1>알바 출퇴근 관리</h1>

    <button @click="checkIn">
      출근하기
    </button>

    <p>출근시간: {{ checkInDisplay }}</p>

    <button @click="checkOut">
      퇴근하기
    </button>

    <p>퇴근시간: {{ checkOutDisplay }}</p>

    <p>근무시간: {{ workHours }}</p>
  </div>
</template>