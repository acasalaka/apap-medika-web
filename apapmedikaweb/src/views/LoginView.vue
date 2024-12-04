<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const login = async () => {
  loading.value = true
  errorMessage.value = ''

  const credentials = {
    email: email.value,
    password: password.value
  }

  try {
    const response = await fetch('http://localhost:8084/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Login failed. Please try again.')
    }

    const data = await response.json()
    const token = data.data.token // Assuming the token is returned in the 'token' field

    // Store the token in localStorage
    localStorage.setItem('authToken', token)

    // Refresh the page to trigger a state update in the navbar
    location.reload()  // Page reload triggers reactivity and navbar update

  } catch (error) {
    errorMessage.value = error.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-6 bg-white rounded shadow">
      <h2 class="text-2xl font-bold text-center mb-4">Login</h2>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            id="email"
            type="email"
            class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm">
          {{ errorMessage }}
        </div>

        <div>
          <button
            :disabled="loading"
            type="submit"
            class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Add additional styles here if needed */
</style>
