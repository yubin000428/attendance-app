<script setup>
import { computed } from 'vue'
import { getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, onMounted } from 'vue'
import './styles/attendance.css'

const isMenuOpen = ref(false)
const currentTab = ref('today')

const checkInTime = ref('')     // 출근 시간 Date 저장
const checkInDisplay = ref('')  // 화면에 보여줄 출근 시간 저장  

const checkOutTime = ref('')    // 퇴근 시간 Date 저장
const checkOutDisplay = ref('') // 화면에 보여줄 퇴근 시간 저장

const workHours = ref('')       // 근무 시간 저장

const attendanceList = ref([])

async function checkIn() {
  if (checkInTime.value !== '') {
    alert('이미 출근했습니다.')
    return
  }

  const now = new Date()
  console.log('출근 버튼 클릭')
  checkInTime.value = now
  checkInDisplay.value = now.toLocaleTimeString()
  await addDoc(collection(db, 'attendance'), {
    type: 'checkin',
    time: now.toISOString()
  })
  await loadAttendance()
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
    await loadAttendance()
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
}

onMounted(() => {
  loadAttendance()
})

</script>

<template>
  <div>
    <br/><br/>
    <div class="header">
      <button
        class="menu-btn"
        @click="isMenuOpen = !isMenuOpen"
      >
        ☰
      </button>
      <h1>출퇴근 관리</h1>
    </div>

   <div v-if="isMenuOpen" class="overlay"
     @click="isMenuOpen = false">
</div>

<div v-if="isMenuOpen" class="side-menu">

  <div class="menu-header">

    <div class="profile-box">
      <div class="profile-avatar">
        👤
      </div>

      <div>
        <div class="profile-name">
          최유빈
        </div>

        <div class="profile-role">
          관리자
        </div>
      </div>
    </div>

    <button
      class="close-btn"
      @click="isMenuOpen = false"
    >
      ✕
    </button>

  </div>

  <div
    class="menu-item"
    @click="currentTab='today'; isMenuOpen=false"
  >
    <span>🏠</span>
    <span>오늘 근무</span>
  </div>

  <div
    class="menu-item"
    @click="currentTab='history'; isMenuOpen=false"
  >
    <span>📋</span>
    <span>출퇴근 기록</span>
  </div>

  <div class="menu-item">
    <span>⚙️</span>
    <span>설정</span>
  </div>

  <div class="menu-footer">
    v1.0.0
  </div>

  </div>
    <!-- 오늘 근무 탭 -->
    <div class="attendance-buttons">
      <button
        class="circle-btn checkin-btn"
        @click="checkIn"
        :disabled="!!checkInTime"
      >
        출근
      </button>

      <button
        class="circle-btn checkout-btn"
        @click="checkOut"
        :disabled="!checkInTime || !!checkOutTime"
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