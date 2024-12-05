<script setup lang="ts">
import { onMounted } from 'vue';
import { DataTable } from 'simple-datatables';
import VButton from '@/components/VButton.vue';
import { useReservationStore } from '@/stores/reservation';
import VDeleteButton from '@/components/VDeleteButton.vue';

const reservationStore = useReservationStore();

onMounted(async () => {
  await reservationStore.getReservations();

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
    <div v-if="reservationStore.loading" class="message-layer">
      <span class="animate-pulse font-bold text-4xl">Fetching data...</span>
    </div>

    <div class="px-12 py-20 w-full" v-else>
      <div v-if="!reservationStore.error" class="flex flex-col gap-6">
        <RouterLink to="/reservation/add">
          <VButton class="add-button">+ Buat Reservasi Baru</VButton>
        </RouterLink>

        <table id="default-table">
          <thead>
          <tr>
            <th>
              <span class="flex items-center">No.</span>
            </th>
            <th>
              <span class="flex items-center">ID</span>
            </th>
            <th>
              <span class="flex items-center">Nurse</span>
            </th>
            <th>
              <span class="flex items-center">Patient</span>
            </th>
            <th data-type="date" data-format="YYYY/DD/MM">
              <span class="flex items-center">Tanggal Masuk</span>
            </th>
            <th data-type="date" data-format="YYYY/DD/MM">
              <span class="flex items-center">Tanggal Keluar</span>
            </th>
            <th>
              <span class="flex items-center">Action</span>
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(reservation, index) in reservationStore.reservations"
              :key="reservation.id"
          >
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ index + 1 }}
            </td>
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ reservation.id }}
            </td>
            <td>{{ reservation.assignedNurse }}</td>
            <td>{{ reservation.patientId }}</td>
            <td>{{(reservation.dateIn) }}</td>
            <td>{{ (reservation.dateOut) }}</td>
            <td class="flex gap-1">
              <RouterLink :to="`/reservation/${reservation.id}`" class="w-full">
                <VButton class="detail-button">Lihat</VButton>
              </RouterLink>
              <RouterLink :to="`/reservation/${reservation.id}`" class="w-full">
                <VButton class="edit-button">Update</VButton>
              </RouterLink>
              <!-- <VDeleteButton :reservationId="reservation.id" /> -->
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="message-layer">
        <span class="text-xl">{{ reservationStore.error }}</span>
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