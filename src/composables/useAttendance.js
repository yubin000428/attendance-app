import { ref, computed } from 'vue'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { auth } from '../firebase'

const attendanceList = ref([])

const checkInTime = ref('')
const checkOutTime = ref('')
const workHours = ref('')

const user = auth.currentUser

function getWorkDate() {
  const now = new Date()

  // 새벽 3시 이전이면 전날로 처리
  if (now.getHours() < 3) {
    now.setDate(now.getDate() - 1)
  }

  return now.toISOString().split('T')[0]
}

export function useAttendance() {

  async function loadAttendance() {
    const snapshot = await getDocs(
      collection(db, 'attendance')
    )

    attendanceList.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    attendanceList.value.sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    )
  }

  // 얘가 출근을 이미했는지 ? firebase에서 데이터 불러오기
  async function loadTodayStatus() {

    const user = auth.currentUser

    if (!user) return

    const snapshot = await getDocs(
      query(
        collection(db, 'attendance'),
        where('uid', '==', user.uid)
      )
    )

    const myRecords = snapshot.docs.map(doc => doc.data())

    const todayWorkDate = getWorkDate()

    const todayRecords = myRecords.filter(
      item => item.workDate === todayWorkDate
    )

    const lastCheckIn = todayRecords
      .filter(item => item.type === 'checkin')
      .sort(
        (a, b) =>
          new Date(b.time) - new Date(a.time)
      )[0]

    const lastCheckOut = todayRecords
      .filter(item => item.type === 'checkout')
      .sort(
        (a, b) =>
          new Date(b.time) - new Date(a.time)
      )[0]
      
    if (lastCheckIn) {
      checkInTime.value = new Date(lastCheckIn.time)
    }

    if (lastCheckOut) {
      checkOutTime.value = new Date(lastCheckOut.time)
    }
    if (checkInTime.value && checkOutTime.value) {

    const diff =
      checkOutTime.value.getTime() -
      checkInTime.value.getTime()

    const totalMinutes =
      Math.floor(diff / 1000 / 60)

    const hours =
      Math.floor(totalMinutes / 60)

    const minutes =
      totalMinutes % 60

    workHours.value =
      `${hours}시간 ${minutes}분`
  }
}
    
 async function checkIn() {

  const user = auth.currentUser

  if (!user) {
    alert('로그인 후 이용해주세요.')
    return
  }

  if (checkInTime.value) {
    alert('이미 출근했습니다.')
    return
  }

  const now = new Date()

  checkInTime.value = now
   console.log('출근 후', checkInTime.value)

  await addDoc(
    collection(db, 'attendance'),
    {
      uid: user.uid,
      name: user.displayName,
      email: user.email,

      type: 'checkin',
      time: now.toISOString(),

      workDate: getWorkDate()
    }
  )

  await loadAttendance()
}

  async function checkOut(memo = '') {

    const user = auth.currentUser

    if (!user) {
        alert('로그인 후 이용해주세요.')
        return
    }

    if (!checkInTime.value) {
        alert('먼저 출근해주세요.')
        return
    }

    if (checkOutTime.value) {
        alert('이미 퇴근했습니다.')
        return
    }

    const now = new Date()

    await addDoc(
    collection(db, 'attendance'),
    {
      uid: user.uid,
      name: user.displayName,
      email: user.email,

      memo,

      type: 'checkout',
      time: now.toISOString(),

      workDate: getWorkDate()
    }
  )

    checkOutTime.value = now

    const diff = checkOutTime.value - checkInTime.value

    const totalMinutes = Math.floor(diff / 1000 / 60)

    const hours = Math.floor(totalMinutes / 60)

    const minutes = totalMinutes % 60

    workHours.value = `${hours}시간 ${minutes}분`

    await loadAttendance()
    }

  const todayCheckIn = computed(() =>
    attendanceList.value.find(
      item => item.type === 'checkin'
    )
  )

  const todayCheckOut = computed(() =>
    attendanceList.value.find(
      item => item.type === 'checkout'
    )
  )

  return {
    attendanceList,

    checkInTime,
    checkOutTime,

    workHours,

    checkIn,
    checkOut,

    loadAttendance,
    loadTodayStatus,

    todayCheckIn,
    todayCheckOut
    }
}