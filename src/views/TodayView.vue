<script setup>
import { computed } from 'vue'
import { useAttendance } from '../composables/useAttendance'
import { onMounted } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

const {
  checkInTime,
  checkOutTime,
  workHours,
  checkIn,
  checkOut,
  loadTodayStatus
} = useAttendance()

const isCheckedIn = computed(() => checkInTime.value !== '')
const isCheckedOut = computed(() => checkOutTime.value !== '')

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadTodayStatus()
    }
  })
})
</script>



<template>
  <!-- 오늘 근무 탭 -->
    <div class="attendance-buttons">
      <button
        class="circle-btn checkin-btn"
        @click="checkIn"
        :disabled="isCheckedIn"
      >
        출근
      </button>

      <button
        class="circle-btn checkout-btn"
        @click="checkOut"
        :disabled="!isCheckedIn || isCheckedOut"
      >
        퇴근
      </button>
    </div>

      <button
        class="reset-btn"
      >
        초기화
      </button>

      <div class="work-card">
      <h2>📅 오늘 근무 확인</h2>

      <div class="work-row">
        <span>🟢 출근</span>
        <span>
          {{
            checkInTime
              ? checkInTime.toLocaleTimeString('ko-KR')
              : '-'
          }}
        </span>
      </div>

      <div class="work-row">
        <span>🔴 퇴근</span>
        <span>
          {{
            checkOutTime
              ? checkOutTime.toLocaleTimeString('ko-KR')
              : '-'
          }}
        </span>
      </div>
      
      
      <div class="work-row">
        <span>⏰ 근무시간</span>
        <span>{{ workHours || '-' }}</span>
      </div>
    </div>
</template>