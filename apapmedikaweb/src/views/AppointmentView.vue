<script setup lang="ts">
import { onMounted } from 'vue';
import { DataTable } from 'simple-datatables';
import VButton from '@/components/VButton.vue';
import { useAppointmentStore } from '@/stores/appointment';
import VDeleteButton from '@/components/VDeleteButton.vue';

const appointmentStore = useAppointmentStore();

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", options);
};

onMounted(async () => {
  await appointmentStore.getAppointments();

  if (
    document.getElementById('default-table') &&
    typeof DataTable !== 'undefined'
  ) {
    new DataTable('#default-table', {
      searchable: false,
    });
  }
});
</script>
<template>
  <main class="flex items-center justify-center w-full h-full">
    <div v-if="appointmentStore.loading" class="message-layer">
      <span class="animate-pulse font-bold text-4xl">Fetching data...</span>
    </div>

    <div class="px-12 py-20 w-full" v-else>
      <div v-if="!appointmentStore.error" class="flex flex-col gap-6">
        <RouterLink to="/appointment/add">
          <VButton class="add-button">+ Buat Appointment Baru</VButton>
        </RouterLink>

        <table id="default-table">
          <thead>
          <tr>
            <th>
              <span class="flex items-center">No.</span>
            </th>
            <th>
              <span class="flex items-center">ID Appointment</span>
            </th>
            <th>
              <span class="flex items-center">Pasien</span>
            </th>
            <th>
              <span class="flex items-center">Dokter</span>
            </th>
            <th data-type="date" data-format="YYYY/DD/MM">
              <span class="flex items-center">Tanggal Appointment</span>
            </th>
            <th>
              <span class="flex items-center">Status</span>
            </th>
            <th>
              <span class="flex items-center">Action</span>
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(appointment, index) in appointmentStore.appointments"
              :key="appointment.id"
          >
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ index + 1 }}
            </td>
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ appointment.id }}
            </td>
            <td>{{ appointment.patientName }}</td>
            <td>{{ appointment.doctorName }}</td>
            <td>{{ formatDate(appointment.date) }}</td>
            <td>{{ appointment.status }}</td>
            <td class="flex gap-1">
              <RouterLink :to="`/appointment/${appointment.id}`" class="w-full">
                <VButton class="detail-button">Lihat</VButton>
              </RouterLink>
              <RouterLink :to="`/appointment/${appointment.id}/edit`" class="w-full">
                <VButton class="edit-button">Edit</VButton>
              </RouterLink>
              <VDeleteButton :appointmentId="appointment.id" />
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="message-layer">
        <span class="text-xl">{{ appointmentStore.error }}</span>
      </div>
    </div>
  </main>
</template>

<style scoped>
.message-layer {
  @apply w-full h-screen flex items-center justify-center;
}

.add-button {
  @apply bg-green-600 hover:bg-green-800 text-white;
}

.detail-button {
  @apply bg-cyan-600 hover:bg-cyan-800 text-white;
}

.edit-button {
  @apply bg-amber-600 hover:bg-amber-800 text-white;
}
</style>
