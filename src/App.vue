<script setup>
import { computed, ref, onMounted } from 'vue'
import { auth } from './firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { useRoute } from 'vue-router'

import './styles/attendance.css'

const isMenuOpen = ref(false)
const user = ref(null)

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

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
  })
})
</script>

<template>
  <div>
    <div class="header">
      <button
        class="menu-btn"
        @click="isMenuOpen = !isMenuOpen"
      >
        ☰
      </button>
      

      <div>
    <h1>{{ pageTitle }}</h1>

  </div>
    </div>
    <div class="user-box">

      <button
        v-if="!user"
        @click="login"
      >
        Google 로그인
      </button>
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
    <div>

      <router-view />
    </div>

    </div>

</template>