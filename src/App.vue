<script setup>
import { computed, ref, onMounted } from 'vue'
import { auth, db } from './firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { useRoute } from 'vue-router'
import {
  getDocs,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore'

import './styles/attendance.css'

const isMenuOpen = ref(false)
const user = ref(null)
const showNameModal = ref(false)

const realName = ref('')
const savedRealName = ref('')

const route = useRoute()

const pageTitle = computed(() => {
  switch (route.path) {
    case '/':
      return '오늘 근무 확인'

    case '/history':
      return '내 출퇴근 기록'

    case '/settings':
      return '설정'

    case '/employees':
      return '직원 현황'

    default:
      return '출퇴근 관리'
  }
})

const ADMIN_EMAILS = [
  'yulim020477@gmail.com',
  'gusalsno@gmail.com'
]

const isAdmin = computed(() => {
  return (
    user.value &&
    ADMIN_EMAILS.includes(user.value.email)
  )
})

async function login() {
  await setPersistence(
    auth,
    browserLocalPersistence
  )
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

  window.location.reload()
  isMenuOpen.value = false
}

async function saveRealName() {

  if (!realName.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }

  await setDoc(
    doc(db, 'users', user.value.uid),
    {
      realName: realName.value,
      email: user.value.email,
      createdAt: new Date().toISOString()
    }
  )

  savedRealName.value = realName.value

  showNameModal.value = false
}

// 로그인 > users/uid 조회 > 없음 > 이름 입력 모달 띄움
onMounted(() => {

  onAuthStateChanged(
    auth,
    async (currentUser) => {

      user.value = currentUser

      if (!currentUser) return

      const userRef = doc(
        db,
        'users',
        currentUser.uid
      )
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        showNameModal.value = true
      } else {
        savedRealName.value =
          userSnap.data().realName
      }
    }
  )

})
</script>

<template>
<div>
    <div v-if="!user" class="login-page">
      <div class="login-card">

        <div class="login-logo">
          <img
            src="/logo.png"
            alt="logo"
          />
        </div>

        <h1>출퇴근 관리</h1>

        <p>
          직원의 출근 · 퇴근을<br>
          간편하게 기록하세요
        </p>

        <button
          class="login-btn"
          @click="login"
        >
          Google로 시작하기
        </button>
      </div>
  </div>
      
  <div v-else>
    <div class="header">
      <button
        class="menu-btn"
        @click="isMenuOpen = !isMenuOpen"
      >
        ☰
      </button>
      <div v-if="user" class="profile-circle">
        {{ savedRealName?.slice(1) }}
      </div>
      

      <div>
        <h1 class="page-title">{{ pageTitle }}</h1>

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
          {{ savedRealName || '게스트' }}
        </div>

        <div class="profile-role">
          {{ savedRealName }} --> 직급란
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
    :class="{ active: route.path === '/' }"
    @click="$router.push('/'); isMenuOpen=false"
    >
    <span>📅</span>
    <span>오늘 근무 확인</span>
  </div>

  <div
    class="menu-item"
    :class="{ active: route.path === '/history' }"
    @click="$router.push('/history'); isMenuOpen=false"
  >
    <span>📋</span>
    <span>내 출퇴근 기록</span>
  </div>

  <div
    v-if="isAdmin"
    class="menu-item"
    @click="$router.push('/employees'); isMenuOpen=false"
  >
    <span>👥</span>
    <span>직원 현황</span>
  </div>

  <div
    class="menu-item"
    :class="{ active: route.path === '/settings' }"
    @click="$router.push('/settings'); isMenuOpen=false"
  >
    <span>⚙️</span>
    <span>급여 계산</span>
  </div>
  <div
    class="menu-item"
    :class="{ active: route.path === '/settings' }"
    @click="$router.push('/settings'); isMenuOpen=false"
  >
    <span>⚙️</span>
    <span>특이사항</span>
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
    <router-view />

    

    </div>
<div
  v-if="showNameModal"
  class="modal-overlay"
>
  <div class="memo-modal">

    <h3>이름 등록</h3>

    <p>
      관리자에게 표시될 이름을 입력해주세요.
    </p>

    <input
      v-model="realName"
      type="text"
      placeholder="예: 홍길동"
    />

    <div class="modal-buttons">
      <button @click="saveRealName">
        저장
      </button>
    </div>

  </div>

</div>

</div>
</template>