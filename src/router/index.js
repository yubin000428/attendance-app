import { createRouter, createWebHistory } from 'vue-router'

import TodayView from '../views/TodayView.vue'
import HistoryView from '../views/HistoryView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    component: TodayView
  },
  {
    path: '/history',
    component: HistoryView
  },
  {
    path: '/settings',
    component: SettingsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router