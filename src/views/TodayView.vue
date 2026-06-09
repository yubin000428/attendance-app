<script setup>
import { useAttendance } from '../composables/useAttendance'

const {
  checkInTime,
  checkOutTime,
  todayCheckIn,
  todayCheckOut,
  workHours,
  checkIn,
  checkOut
} = useAttendance()
</script>



<template>
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
</template>