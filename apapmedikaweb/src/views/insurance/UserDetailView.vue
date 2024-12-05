<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

const router = useRouter()

// Reactive state variables
const user = ref<any>(null)
const isLoggedIn = ref(false)
const loading = ref(true)
const errorMessage = ref('')

// Helper function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const decoded = jwtDecode(token)
    console.log('Decoded JWT:', decoded) // Debug log
    return decoded
  } catch (error) {
    console.error('Invalid token:', error)
    return null
  }
}

// Function to fetch user details
const fetchUserDetails = async (email: string) => {
  try {
    const response = await fetch(`http://localhost:8084/api/user/detail/${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch user details')

    const data = await response.json()
    console.log('API User Details Response:', data)

    // Update the reactive state with user data
    user.value = data.data
    isLoggedIn.value = true
  } catch (error) {
    errorMessage.value = 'Failed to load user data.'
    isLoggedIn.value = false
    console.error('Error fetching user details:', error)
  } finally {
    loading.value = false
  }
}

// OnMounted lifecycle hook to fetch details after component is mounted
onMounted(async () => {
  const token = localStorage.getItem('authToken')

  if (token) {
    const decoded = decodeJWT(token)
    if (decoded && decoded.sub) {
      await fetchUserDetails(decoded.sub) // Use 'sub' field for email
    } else {
      errorMessage.value = 'Invalid or missing token.'
    }
  } else {
    errorMessage.value = 'No token found in localStorage.'
  }
})
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <p>Loading user details...</p>
  </div>

  <div v-if="!loading && errorMessage" class="flex justify-center items-center min-h-screen">
    <p class="text-red-600">{{ errorMessage }}</p>
  </div>

  <div v-if="!loading && user" class="flex justify-center items-center min-h-screen">
    <!-- Card Container -->
    <div class="max-w-4xl w-full p-6 bg-white rounded-lg shadow-lg">
      <!-- Title -->
      <h2 class="text-3xl font-semibold text-center mb-6">{{ user.username }}'s Details</h2>

      <div class="space-y-6">
        <!-- Name -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Name:</strong>
          <p class="text-lg text-gray-900">{{ user.name }}</p>
        </div>

        <!-- Username -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Username:</strong>
          <p class="text-lg text-gray-900">{{ user.username }}</p>
        </div>

        <!-- Email -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Email:</strong>
          <p class="text-lg text-gray-900">{{ user.email }}</p>
        </div>

        <!-- Gender -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Gender:</strong>
          <p class="text-lg text-gray-900">{{ user.gender }}</p>
        </div>

        <!-- Role -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Role:</strong>
          <p class="text-lg text-gray-900">{{ user.role }}</p>
        </div>

        <!-- NIK -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">NIK:</strong>
          <p class="text-lg text-gray-900">{{ user.nik || 'N/A' }}</p>
        </div>

        <!-- Birth Place -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Birth Place:</strong>
          <p class="text-lg text-gray-900">{{ user.birthPlace || 'N/A' }}</p>
        </div>

        <!-- Birth Date -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Birth Date:</strong>
          <p class="text-lg text-gray-900">{{ user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'N/A' }}</p>
        </div>

        <!-- Created At -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Created At:</strong>
          <p class="text-lg text-gray-900">{{ new Date(user.createdAt).toLocaleString() }}</p>
        </div>

        <!-- Updated At -->
        <div class="flex justify-between items-center">
          <strong class="text-sm text-gray-700">Updated At:</strong>
          <p class="text-lg text-gray-900">{{ new Date(user.updatedAt).toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles to improve card look and spacing */
.card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.card-content {
  margin-top: 1.5rem;
}

.card-content div {
  margin-bottom: 1rem;
}
</style>
