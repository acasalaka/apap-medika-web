<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { DataTable } from 'simple-datatables';
import VButton from '@/components/VButton.vue';
import { useAppointmentStore } from '@/stores/appointment';

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

const loading = ref(true);

const patientFilter = ref('');
const doctorFilter = ref('');
const statusFilter = ref('');

const filteredAppointments = computed(() =>
    appointmentStore.appointments.filter((appointment) => {
      const matchesPatient = patientFilter.value
          ? appointment.patientName.toLowerCase().includes(patientFilter.value.toLowerCase())
          : true;
      const matchesDoctor = doctorFilter.value
          ? appointment.doctorName.toLowerCase().includes(doctorFilter.value.toLowerCase())
          : true;
      const matchesStatus = statusFilter.value
          ? appointment.status.toString() === statusFilter.value
          : true;

      return matchesPatient && matchesDoctor && matchesStatus;
    })
);

onMounted(async () => {
  await appointmentStore.getAppointments();
  loading.value = false;

  if (
    document.getElementById('default-table') &&
    typeof DataTable !== 'undefined'
  ) {
    new DataTable('#default-table', {
      searchable: true,
      sortable: true,
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

        <div class="filters flex flex-row gap-4">
          <input type="text" v-model="patientFilter" placeholder="Filter by Patient" class="filter-input"/>
          <input type="text" v-model="doctorFilter" placeholder="Filter by Doctor" class="filter-input"/>
          <select v-model="statusFilter" class="filter-input">
            <option value="">Filter by Status</option>
            <option value="Created">Created</option>
            <option value="Done">Done</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <table id="default-table">
          <thead>
          <tr>
            <th>No.</th>
            <th>ID Appointment</th>
            <th>Pasien</th>
            <th>Dokter</th>
            <th>Tanggal Appointment</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(appointment, index) in filteredAppointments" :key="appointment.id">
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ index + 1 }}</td>
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ appointment.id }}</td>
            <td>{{ appointment.patientName }}</td>
            <td>{{ appointment.doctorName }}</td>
            <td>{{ formatDate(appointment.date) }}</td>
            <td>{{ appointment.status }}</td>
            <td class="flex gap-1">
              <RouterLink :to="`/appointment/${appointment.id}`" class="w-full">
                <VButton class="detail-button">Lihat</VButton>
              </RouterLink>
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
</style>
