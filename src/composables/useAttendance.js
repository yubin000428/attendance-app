import { ref, computed } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { auth } from '../firebase'

const attendanceList = ref([])

const checkInTime = ref('')
const checkOutTime = ref('')
const workHours = ref('')

const user = auth.currentUser

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

  await addDoc(
    collection(db, 'attendance'),
    {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      type: 'checkin',
      time: now.toISOString()
    }
  )

  await loadAttendance()
}

  async function checkOut() {

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

        type: 'checkout',
        time: now.toISOString()
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

    todayCheckIn,
    todayCheckOut
    }
}