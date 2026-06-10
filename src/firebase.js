import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'


const firebaseConfig = {
  apiKey: "AIzaSyA8HbcLZgA8iRslkJAso_omsVkpahRUUi0",
  authDomain: "attendance-app-7fe54.firebaseapp.com",
  projectId: "attendance-app-7fe54",
  storageBucket: "attendance-app-7fe54.firebasestorage.app",
  messagingSenderId: "685414648866",
  appId: "1:685414648866:web:e7a28571f52ba1fdfb4e7b"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)