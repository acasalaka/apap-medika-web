import { createRouter, createWebHistory } from 'vue-router';
import ReservationView from '@/views/ReservationView.vue';
import CreateReservationView from '@/views/CreateReservationView.vue';
import DetailReservationView from '@/views/DetailReservationView.vue';
import BillView from '@/views/BillView.vue';
import DetailBillView from '@/views/DetailBillView.vue';
import CreateAppointmentView from '@/views/appointment/CreateAppointmentView.vue';
import DetailAppointmentView from '@/views/appointment/DetailAppointmentView.vue';
import UpdateStatusView from '@/views/appointment/UpdateStatusView.vue';
import AppointmentView from '@/views/appointment/AppointmentView.vue';
import LoginView from '@/views/LoginView.vue';
import HomeNotLoggedInView from '../views/HomeNotLoggedInView.vue';
import RegisterView from '@/views/RegisterView.vue';
import HomeView from '@/views/HomeView.vue';
import UserDetailView from '@/views/UserDetailView.vue';
import ViewAllPatient from '@/views/ViewAllPatient.vue';
import PatientDetailsView from '@/views/PatientDetailsView.vue';
import ReadAllPolicyView from '@/views/ReadAllPolicyView.vue';
import UpdateDiagnosisAndTreatmentView from "@/views/appointment/UpdateDiagnosisAndTreatmentView.vue";

// Simulated authentication check (use a real auth system in production)
function isLoggedIn(): boolean {
  return !!localStorage.getItem('authToken'); // Check if an auth token exists
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homeNotLoggedIn',
      component: HomeNotLoggedInView,
      meta: { requiresAuth: false }, // Public route
    },
    {
      path: '/home',
      name: 'homeLoggedIn',
      component: HomeView,
      meta: { requiresAuth: true }, // Public route
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }, // Public route
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }, // Public route
    },
    {
      path: '/userDetail',
      name: 'userDetail',
      component: UserDetailView,
      meta: { requiresAuth: true }, // Public route
    },
    {
      path: '/patient/details/:id',
      name: 'PatientDetails',
      component: PatientDetailsView,
      props: true,
      meta: { requiresAuth: true }, // Public route      // Pass route params as props
    },
    {
      path: '/viewAllPatient',
      name: 'viewAllPatient',
      component: ViewAllPatient,
      meta: { requiresAuth: true }, // Public route
    },
    { path: '/insurance',
      name: 'insurance',
      component: ReadAllPolicyView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/appointment',
      name: 'appointment',
      component: AppointmentView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/appointment/add',
      name: 'add-appointment',
      component: CreateAppointmentView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/appointment/:id',
      name: 'detail-appointment',
      component: DetailAppointmentView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/appointment/:id/status',
      name: 'status-appointment',
      component: UpdateStatusView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/appointment/:id/treatment',
      name: 'treatment-appointment',
      component: UpdateDiagnosisAndTreatmentView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/reservation',
      name: 'reservation',
      component: ReservationView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/reservation/:id',
      name: 'detail reservation',
      component: DetailReservationView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/bill',
      name: 'bill',
      component: BillView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/bill/:id',
      name : 'detail bill',
      component: DetailBillView,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path:'/reservation/add',
      name: 'tambah reservation',
      component: CreateReservationView,
      meta: { requiresAuth: true }, // Protected route
    },
  ],
});

// Add a navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !isLoggedIn()) {
    // If not logged in, redirect to login
    next({ name: 'homeNotLoggedIn' });
  } else if (!requiresAuth && isLoggedIn() && (to.name === 'login' || to.name === 'register')) {
    // If logged in and trying to access login/register, redirect to appointment
    next({ name: 'homeLoggedIn' });
  } else {
    next(); // Proceed to the route
  }
});

export default router;
