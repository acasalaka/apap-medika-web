<script setup lang="ts">
import { useRouter } from 'vue-router';
import VButton from '@/components/VButton.vue'
import { useAppointmentStore } from '@/stores/appointment'

const router = useRouter();
const appointmentStore = useAppointmentStore()

const { appointmentId } = defineProps({
  appointmentId: {
    type: String,
    required: true
  }
})

const deleteAppointment = async () => {
  if (confirm('Apakah Anda yakin ingin menghapus appointment ini?')) {
    try {
      await appointmentStore.deleteAppointment(appointmentId as string);
      alert('Appointment berhasil dihapus.');
      await router.push('/appointment');
    } catch (error) {
      console.error('Gagal menghapus appointment:', error);
      alert('Gagal menghapus appointment. Silakan coba lagi.');
    }
  }
};

</script>

<template>
  <VButton @click="deleteAppointment" class="delete-button">Hapus</VButton>
</template>

<style scoped>
  .delete-button {
    @apply bg-rose-600 hover:bg-rose-800 text-white;
  }
</style>
