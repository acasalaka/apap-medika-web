<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);

// Check if the user is logged in by verifying the presence of the auth token
const checkAuthentication = () => {
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    isLoggedIn.value = true;
  }
};

onMounted(() => {
  checkAuthentication();
  if (!isLoggedIn.value) {
    router.push('/login'); // If not logged in, redirect to login page
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-green-600">Selamat Datang ke ApapMedika!</h1>
      <p class="mt-4 text-lg">Anda berhasil masuk! Selamat datang di aplikasi kami.</p>
    </div>
  </div>
</template>

<style scoped>
/* Add additional styling here if needed */
</style>
