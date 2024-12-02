import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CreateAppointmentView from "@/views/CreateAppointmentView.vue";
import DetailAppointmentView from "@/views/DetailAppointmentView.vue";
import UpdateStatusView from "@/views/UpdateStatusView.vue";
import AppointmentView from "@/views/AppointmentView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/appointment',
      name: 'appointment',
      component: AppointmentView,
    },
    {
      path: '/appointment/add',
      name: 'add-appointment',
      component: CreateAppointmentView,
    },
    {
      path: '/appointment/:id',
      name: 'detail-appointment',
      component: DetailAppointmentView,
    },
    {
      path: '/appointment/:id/status',
      name: 'status-appointment',
      component: UpdateStatusView,
    }
  ],
})

export default router
