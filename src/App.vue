<script setup>
import { computed } from 'vue'
import { getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, onMounted } from 'vue'
import './styles/attendance.css'

const currentTab = ref('today')

const checkInTime = ref('')     // 출근 시간 Date 저장
const checkInDisplay = ref('')  // 화면에 보여줄 출근 시간 저장  

const checkOutTime = ref('')    // 퇴근 시간 Date 저장
const checkOutDisplay = ref('') // 화면에 보여줄 퇴근 시간 저장

const workHours = ref('')       // 근무 시간 저장

const attendanceList = ref([])

const savedCheckOut = localStorage.getItem('checkOutDisplay')

if (savedCheckOut) {
  checkOutDisplay.value = savedCheckOut
}
async function checkIn() {
  if (checkInTime.value !== '') {
    alert('이미 출근했습니다.')
    return
  }

  const now = new Date()
  console.log('출근 버튼 클릭')
  checkInTime.value = now
  checkInDisplay.value = now.toLocaleTimeString()
  console.log('firebase 저장 직전')
  await addDoc(collection(db, 'attendance'), {
    type: 'checkin',
    time: now.toISOString()
  })
  console.log('firebase 저장 성공')
}

async function checkOut() {
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
  await addDoc(collection(db, 'attendance'), {
    type: 'checkout',
    time: now.toISOString()
  })

  checkOutTime.value = now
  checkOutDisplay.value = now.toLocaleTimeString()
  workHours.value = '계산중...'

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

async function loadAttendance() {
  const snapshot = await getDocs(collection(db, 'attendance'))

  attendanceList.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  attendanceList.value.sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  )

  console.log(attendanceList.value)
}

const todayCheckIn = computed(() =>
  attendanceList.value.find(item => item.type === 'checkin')
)

const todayCheckOut = computed(() =>
  attendanceList.value.find(item => item.type === 'checkout')
)

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
  loadAttendance()
})
</script>

<template>
  <div>
    <br/><br/>
    <h1>출퇴근 관리</h1>

    <div class="tab-menu">
      <button @click="currentTab = 'today'">
        오늘 근무
      </button>

      <button @click="currentTab = 'history'">
        기록
      </button>
    </div>

    <!-- 오늘 근무 탭 -->
    <div class="attendance-buttons">
      <button
        class="circle-btn checkin-btn"
        @click="checkIn"
        :disabled="checkInTime !== ''"
      >
        출근
      </button>

      <button
        class="circle-btn checkout-btn"
        @click="checkOut"
        :disabled="checkInTime === '' || checkOutTime !== ''"
      >
        퇴근
      </button>
    </div>

      <button
        class="reset-btn"
        @click="resetData"
      >
        초기화
      </button>

      <div class="work-card">
      <h2>📅 오늘 근무</h2>

      <div class="work-row">
        <span>🟢 출근</span>
        <span>
          {{
            todayCheckIn
              ? new Date(todayCheckIn.time).toLocaleTimeString('ko-KR')
              : '-'
          }}
        </span>
      </div>

      <div class="work-row">
        <span>🔴 퇴근</span>
        <span>
          {{
            todayCheckOut
              ? new Date(todayCheckOut.time).toLocaleTimeString('ko-KR')
              : '-'
          }}
        </span>
      </div>

      <div class="work-row">
        <span>⏰ 근무시간</span>
        <span>{{ workHours || '-' }}</span>
      </div>
    </div>

    </div>

    <!-- 기록 탭 -->
    <div v-if="currentTab === 'history'">

      <h2>📋 출퇴근 기록</h2>

      <ul class="attendance-list">
        <li v-for="item in attendanceList" :key="item.id">
          {{ new Date(item.time).toLocaleString('ko-KR') }}
          {{ item.type === 'checkin' ? '🟢 출근' : '🔴 퇴근' }}
        </li>
      </ul>

    </div>

</template>