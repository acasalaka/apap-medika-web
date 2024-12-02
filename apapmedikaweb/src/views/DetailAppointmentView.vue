<script setup lang="ts">
import { useAppointmentStore } from '@/stores/appointment';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import type { AppointmentInterface } from '@/interface/appointment.interface';
import { format } from 'date-fns';
import VButton from '@/components/VButton.vue';

const router = useRouter();
const route = useRoute();
const { id: appointmentId } = route.params;

const appointmentStore = useAppointmentStore();
const appointment = ref(undefined as undefined | AppointmentInterface);

const getAppointment = async () => {
  appointment.value = await appointmentStore.getAppointmentDetail(appointmentId as string);
}

onMounted(getAppointment);
</script>

<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">Detail Appointment</h1>
      </div>
      <div class="flex flex-col gap-2 py-4">
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">ID Appointment: </span>
          <span class="text-xl font-regular">{{ appointment?.id }}</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">Nama Pasien: </span>
          <span class="text-xl font-regular">{{ appointment?.patientName }}</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">Nama Dokter: </span>
          <span class="text-xl font-regular">{{ appointment?.doctorName }}</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">Tanggal Appointment: </span>
          <span class="text-xl font-regular">
            {{ appointment ? format(new Date(appointment.date), 'EEEE, dd MMMM yyyy', { locale: id }) : "-" }}
          </span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">Status: </span>
          <span class="text-xl font-regular">{{ appointment?.status }}</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">Diagnosis: </span>
          <span v-if="appointment?.diagnosis" class="text-xl font-regular">
            {{ appointment.diagnosis }}
          </span>
          <span v-else class="text-xl font-regular">
            Belum ada diagnosis
          </span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">Treatments: </span>
          <span class="text-xl font-regular" v-if="appointment?.treatments?.length === 0">Belum ada treatments</span>
          <span class="text-xl font-regular" v-for="(treatment, index) in appointment?.treatments" :key="index">
      {{ index + 1 }}. {{ treatment }}
    </span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">Dibuat pada: </span>
          <span class="text-xl font-regular">
            {{ appointment ? format(new Date(appointment.createdAt), 'EEEE, dd MMMM yyyy', { locale: id }) : "-" }}
          </span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-xl font-bold">Diperbarui pada: </span>
          <span class="text-xl font-regular">
            {{ appointment ? format(new Date(appointment.updatedAt), 'EEEE, dd MMMM yyyy', { locale: id }) : "-" }}
          </span>
        </div>
      </div>
      <div class="flex gap-2 py-2">
        <VButton @click="router.back()" class="bg-slate-600 hover:bg-slate-800 text-white">Kembali</VButton>
        <RouterLink :to="`/appointment/${appointmentId}/status`" class="w-full">
          <VButton class="bg-blue-400 hover:bg-blue-800 text-white">Update Status</VButton>
        </RouterLink>
        <RouterLink :to="`/appointment/${appointmentId}/status`" class="w-full">
          <VButton class="bg-blue-400 hover:bg-blue-600 text-white">Update Diagnosis & Treatment</VButton>
        </RouterLink>
        <RouterLink :to="`/appointment/${appointmentId}/status`" class="w-full">
          <VButton class="bg-red-400 hover:bg-red-800 text-white">Delete Appointment</VButton>
        </RouterLink>
      </div>
    </div>
  </main>
</template>
