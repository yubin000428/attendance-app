<script setup>
import { computed } from 'vue'
import { getDocs } from 'firebase/firestore'
import { db, auth } from './firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { ref, onMounted } from 'vue'
import './styles/attendance.css'
import { useRoute } from 'vue-router'


const isMenuOpen = ref(false)
const currentTab = ref('today')

const user = ref(null)

const checkInTime = ref('')     // 출근 시간 Date 저장
const checkInDisplay = ref('')  // 화면에 보여줄 출근 시간 저장  

const checkOutTime = ref('')    // 퇴근 시간 Date 저장
const checkOutDisplay = ref('') // 화면에 보여줄 퇴근 시간 저장

const workHours = ref('')       // 근무 시간 저장

const attendanceList = ref([])
const route = useRoute()
const pageTitle = computed(() => {
  switch (route.path) {
    case '/':
      return '오늘 근무'

    case '/history':
      return '출퇴근 기록'

    case '/settings':
      return '설정'

    case '/employees':
      return '직원 현황'

    default:
      return '출퇴근 관리'
  }
})

async function login() {
  try {
    const provider = new GoogleAuthProvider()

    const result = await signInWithPopup(
      auth,
      provider
    )

    user.value = result.user
  } catch (error) {
  console.error(error)

  alert(
    error.code +
    '\n' +
    error.message
  )
}
}

async function logout() {
  await signOut(auth)

  currentTab.value = 'today'
  isMenuOpen.value = false
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
  await addDoc(collection(db, 'attendance'), {
    uid: user.value.uid,
    name: user.value.displayName,
    email: user.value.email,

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
    uid: user.value.uid,
    name: user.value.displayName,
    email: user.value.email,

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
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
  })
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

      <h1>{{ pageTitle }}</h1>
    </div>
    <div class="user-box">

      <button
        v-if="!user"
        @click="login"
      >
        Google 로그인
      </button>

      <div v-else>

        👤 {{ user.displayName }} 입장 !
      </div>

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
          {{ user?.displayName || '게스트' }}
        </div>

        <div class="profile-role">
          {{ user ? user.email : '로그인 필요' }}
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
    :class="{ active: route.path === '/today' }"
    @click="$router.push('/today'); isMenuOpen=false"
    >
    <span>📅</span>
    <span>오늘 근무</span>
  </div>

  <div
    class="menu-item"
    :class="{ active: route.path === '/history' }"
    @click="$router.push('/history'); isMenuOpen=false"
  >
    <span>📋</span>
    <span>출퇴근 기록</span>
  </div>

  <div
    class="menu-item"
    :class="{ active: route.path === '/settings' }"
    @click="$router.push('/settings'); isMenuOpen=false"
  >
    <span>⚙️</span>
    <span>설정</span>
  </div>
  <div
    v-if="user"
    class="menu-item logout-item"
    @click="logout"
  >
    <span>🚪</span>
    <span>로그아웃</span>
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

</template>