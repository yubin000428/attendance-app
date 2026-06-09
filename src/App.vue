<script setup>
import { ref, onMounted } from 'vue'

const checkInTime = ref('')     // 출근 시간 Date 저장
const checkInDisplay = ref('')  // 화면에 보여줄 출근 시간 저장  

const checkOutTime = ref('')    // 퇴근 시간 Date 저장
const checkOutDisplay = ref('') // 화면에 보여줄 퇴근 시간 저장

const workHours = ref('')       // 근무 시간 저장

const savedCheckOut = localStorage.getItem('checkOutDisplay')

if (savedCheckOut) {
  checkOutDisplay.value = savedCheckOut
}
function checkIn() {
  if (checkInTime.value !== '') {
    alert('이미 출근했습니다.')
    return
  }

  const now = new Date()

  checkInTime.value = now
  checkInDisplay.value = now.toLocaleTimeString()
  localStorage.setItem('checkInDisplay', checkInDisplay.value)
  localStorage.setItem('checkInTime', now.toISOString())
}

function checkOut() {
  // 비활성화로 버튼은 막아놨지만 로직 방어역할
  if (!checkInTime.value) {
    alert('먼저 출근을 해주세요.')
    return
  }
  if (checkOutTime.value) {
    alert('이미 퇴근했습니다.')
    return
  }
  const now = new Date()

  checkOutTime.value = now
  checkOutDisplay.value = now.toLocaleTimeString()
  workHours.value = '계산중...'
  localStorage.setItem('checkOutDisplay', checkOutDisplay.value)

  const diff = checkOutTime.value - checkInTime.value
  const totalSeconds = Math.floor(diff / 1000)
  const totalMinutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (totalSeconds < 60) {
      workHours.value = `${totalSeconds}초 근무`
    } else if (hours === 0) {
      workHours.value = `${minutes}분 근무`
    } else {
      workHours.value = `${hours}시간 ${minutes}분 근무`
    }
  localStorage.setItem('workHours', workHours.value)
  localStorage.setItem('checkOutTime', now.toISOString())
}

function resetData() {
  checkInTime.value = ''
  checkOutTime.value = ''

  checkInDisplay.value = ''
  checkOutDisplay.value = ''

  workHours.value = ''

  localStorage.removeItem('checkInDisplay')
  localStorage.removeItem('checkOutDisplay')
  localStorage.removeItem('workHours')
}

onMounted(() => {
  const savedCheckIn = localStorage.getItem('checkInDisplay')

  if (savedCheckIn) {
    checkInDisplay.value = savedCheckIn
  }

  const savedCheckOut = localStorage.getItem('checkOutDisplay')

  if (savedCheckOut) {
    checkOutDisplay.value = savedCheckOut
  }
  const savedWorkHours = localStorage.getItem('workHours')

  if (savedWorkHours) {
    workHours.value = savedWorkHours
  }

  const savedCheckInTime = localStorage.getItem('checkInTime')

  if (savedCheckInTime) {
    checkInTime.value = new Date(savedCheckInTime)
  }

  const savedCheckOutTime = localStorage.getItem('checkOutTime')

  if (savedCheckOutTime) {
    checkOutTime.value = new Date(savedCheckOutTime)
  }
})
</script>

<template>
  <div>
    <h1>알바 출퇴근 관리</h1>

    <button @click="checkIn" :disabled="checkInTime !== ''">
      출근하기
    </button>

    <p>출근시간: {{ checkInDisplay }}</p>

    <button
      @click="checkOut"
      :disabled="checkInTime === '' || checkOutTime !== ''"
    >
      퇴근하기
    </button>

    <p></p>
    <button @click="resetData">
      초기화
    </button>

    <p>퇴근시간: {{ checkOutDisplay }}</p>

    <p>근무시간: {{ workHours }}</p>
  </div>
</template>