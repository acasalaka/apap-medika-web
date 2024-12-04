<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { DataTable } from 'simple-datatables';
import VButton from '@/components/VButton.vue';
import { useAppointmentStore } from '@/stores/appointment';

const appointmentStore = useAppointmentStore();
const error = ref<string | null>(null);

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

const statusFilter = ref('');
const startDate = ref('');
const endDate = ref('');

const filteredAppointments = computed(() => {
  return appointmentStore.appointments.filter((appointment) => {
    const matchesStatus = statusFilter.value
      ? appointment.status === statusFilter.value
      : true;

    const matchesDate =
      (!startDate.value || new Date(appointment.date) >= new Date(startDate.value)) &&
      (!endDate.value || new Date(appointment.date) <= new Date(endDate.value));

    return matchesStatus && matchesDate;
  });
});

const fetchAppointmentsByDate = async () => {
  if (!startDate.value || !endDate.value) {
    error.value = 'Please provide both start and end dates.';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(
      `http://localhost:8081/api/appointment/by-date?startDate=${startDate.value}&endDate=${endDate.value}`
    );
    const data = await response.json();

    if (response.ok) {
      appointmentStore.appointments = data.data;
    } else {
      error.value = data.message || 'Failed to fetch appointments.';
    }
  } catch (err) {
    error.value = `Error: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

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
        <div v-if="appointmentStore.role==='ADMIN'">
            <RouterLink to="/appointment/add">
              <VButton class="add-button">+ Buat Appointment Baru</VButton>
            </RouterLink>
        </div>
        <div class="filters flex flex-row gap-4">
          <select v-model="statusFilter" class="filter-input">
            <option value="">Filter by Status</option>
            <option value="Created">Created</option>
            <option value="Done">Done</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input type="date" v-model="startDate" placeholder="Start Date" class="filter-input" />
          <input type="date" v-model="endDate" placeholder="End Date" class="filter-input" />
          <VButton @click="fetchAppointmentsByDate" class="bg-blue-500 hover:bg-blue-700 text-white">
            Apply Date Filter
          </VButton>
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
