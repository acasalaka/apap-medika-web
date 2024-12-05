<script setup lang="ts">
</script>

<template>
  <main class="flex items-center justify-center w-full h-screen">
    <div class="flex flex-col w-fit gap-4 items-center">
      <h1 class="text-4xl font-bold">
        Selamat datang di
        <span class="text-green-600">ApapMedika</span>
      </h1>
      <div class="w-full flex flex-col gap-4">
        <RouterLink to="/login" class="w-full">
          <VButton class="home-button">Login</VButton>
        </RouterLink>
        <RouterLink to="/register" class="w-full">
          <VButton class="home-button">Register</VButton>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-button {
  @apply hover:bg-green-600 border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg text-center w-full;
}
</style>
