<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

const route = useRoute();
const router = useRouter();

const userRole = ref('');
const name = ref('');
const isLoggedIn = ref(false);
const loading = ref(true);

// Helper function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    console.log('Decoded JWT:', decoded); // Debug log
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

// Check if user is logged in and fetch role if necessary
onMounted(async () => {
  const token = localStorage.getItem('authToken');

  if (token) {
    console.log('Auth Token:', token);
    const decoded = decodeJWT(token);
    if (decoded && decoded.sub) { // Use 'sub' for email as per JWT generation
      const email = decoded.sub;
      await fetchUserRole(email);
    } else {
      console.warn('Invalid or missing email (sub) in JWT. Decoded JWT:', decoded);
      isLoggedIn.value = false;
    }
  } else {
    console.warn('No token found in localStorage');
    isLoggedIn.value = false;
  }
  loading.value = false;
})

// Fetch user role based on email
const fetchUserRole = async (email: string) => {
  try {
    const response = await fetch(`http://localhost:8084/api/user/detail/${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Failed to fetch role');

    const data = await response.json();
    console.log('API Role Response:', data);

    userRole.value = data.data.role;
    name.value = data.data.name;
    isLoggedIn.value = true;
  } catch (error) {
    console.error('Error fetching user role:', error);
    isLoggedIn.value = false;
  }
};

// Determine the active link based on route path
const getLinkClass = (path: string) =>
  route.path === path ? 'text-green-600' : 'text-black hover:text-green-600';

// Logout logic
const logout = () => {
  localStorage.removeItem('authToken');
  userRole.value = ''; // Clear user role
  isLoggedIn.value = false;
  router.push('/'); // Redirect to homepage
};
</script>

<template>
  <header class="fixed flex items-center justify-between w-full px-3 py-4 bg-white">
    <!-- Left side: Logo and navigation links -->
    <div class="flex items-center gap-6">
      <RouterLink to="/home" class="text-xl font-bold text-green-600">ApapMedika</RouterLink>

      <!-- Navigation links based on user role -->
      <nav class="flex gap-6">
        <RouterLink
          v-if="userRole === 'ADMIN'"
          to="/viewAllPatient"
          :class="getLinkClass('/viewAllPatient')"
        >
          View All Patients
        </RouterLink>

        <RouterLink
          v-if="userRole === 'ADMIN' || userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'PATIENT'"
          to="/appointment"
          :class="getLinkClass('/appointment')"
        >
          Appointment
        </RouterLink>

        <RouterLink
          v-if="userRole === 'ADMIN' || userRole === 'PATIENT'"
          to="/insurance"
          :class="getLinkClass('/insurance')"
        >
          Policy
        </RouterLink>

        <RouterLink
          v-if="userRole === 'ADMIN' || userRole === 'NURSE' || userRole === 'PATIENT'"
          to="/hospitalization"
          :class="getLinkClass('/hospitalization')"
        >
          Reservation
        </RouterLink>

        <RouterLink
          v-if="userRole === 'PATIENT'"
          to="/bill"
          :class="getLinkClass('/bill')"
        >
          Bill
        </RouterLink>
      </nav>
    </div>

    <!-- Right side: Hello {name} and Logout button -->
    <div class="flex items-center gap-6 ml-auto">
      <!-- Show Hello {name} link only if user is logged in and is a patient -->
      <RouterLink
        v-if="userRole === 'PATIENT' && isLoggedIn"
        to="/userDetail"
        :class="getLinkClass('/userDetail')"
        class="text-black hover:text-green-600"
      >
        Hello, {{ name }}!
      </RouterLink>

      <!-- Logout button only visible if user is logged in -->
      <a
        v-if="isLoggedIn"
        @click.prevent="logout"
        class="text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer mr-4"
      >
        Logout
      </a>
    </div>
  </header>
</template>


