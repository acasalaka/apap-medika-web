<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const getLinkClass = (path: string) => route.path === path ? 'text-green-600' : 'text-black hover:text-green-600'
</script>

<template>
  <header class="fixed flex items-center w-full gap-4 px-3 py-4 bg-white">
    <RouterLink to="/" class="text-xl font-bold text-green-600">ApapMedika</RouterLink>
    <nav class="flex gap-6">
      <RouterLink to="/appointment" :class="getLinkClass('/appointment')">Appointment</RouterLink>
    </nav>
    <nav class="flex gap-6">
      <RouterLink to="/insurance" :class="getLinkClass('/insurance')">Insurance</RouterLink>
    </nav>
    <nav class="flex gap-6">
      <RouterLink to="/hospitalization" :class="getLinkClass('/hospitalization')">Hospitalization</RouterLink>
    </nav>
    <nav class="flex gap-6">
      <RouterLink to="/profile" :class="getLinkClass('/profile')">Profile</RouterLink>
    </nav>
    <nav class="flex gap-6">
      <RouterLink to="/bill" :class="getLinkClass('/bill')">Bill</RouterLink>
    </nav>
  </header>
</template>
