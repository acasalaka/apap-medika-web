import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CreateAppointmentView from "@/views/CreateAppointmentView.vue";
import DetailAppointmentView from "@/views/DetailAppointmentView.vue";
import UpdateStatusView from "@/views/UpdateStatusView.vue";
import AppointmentView from "@/views/AppointmentView.vue";
import ReservationView from '@/views/ReservationView.vue';
import DetailReservationView from '@/views/DetailReservationView.vue';
import BillView from '@/views/BillView.vue';
import DetailBillView from '@/views/DetailBillView.vue';
import CreateReservationView from '@/views/CreateReservationView.vue';

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
      name: 'tambah appointment',
      component: CreateAppointmentView,
    },
    {
      path: '/appointment/:id',
      name: 'detail appointment',
      component: DetailAppointmentView,
    },
    {
      path: '/appointment/:id/edit',
      name: 'ubah status appointment',
      component: UpdateStatusView,
    },
    {
      path: '/reservation',
      name: 'reservation',
      component: ReservationView,
    },
    {
      path: '/reservation/:id',
      name: 'detail reservation',
      component: DetailReservationView,
    },
    {
      path: '/bill',
      name: 'bill',
      component: BillView,
    },
    {
      path: '/bill/:id',
      name : 'detail bill',
      component: DetailBillView,
    },
    {
      path:'/reservation/add',
      name: 'tambah reservation',
      component: CreateReservationView,
    }
  ],
})

export default router
