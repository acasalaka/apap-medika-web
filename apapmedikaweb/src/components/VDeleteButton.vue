<script setup lang="ts">

import VButton from '@/components/VButton.vue'
import { useAppointmentStore } from '@/stores/appointment'

const appointmentStore = useAppointmentStore()

const { appointmentId } = defineProps({
  appointmentId: {
    type: String,
    required: true
  }
})

const deleteAppointment = async () => await appointmentStore.deleteAppointment(appointmentId)
</script>

<template>
  <VButton @click="deleteAppointment" class="delete-button">Hapus</VButton>
</template>

<style scoped>
  .delete-button {
    @apply bg-rose-600 hover:bg-rose-800 text-white;
  }
</style>
