<script setup lang="ts">
import { reactive } from 'vue';
import { useAppointmentStore } from '@/stores/appointment';
import VAddAppointmentForm from '@/components/VAddAppointmentForm.vue';
import type { AppointmentRequestInterface } from '@/interface/appointment.interface';

const appointmentStore = useAppointmentStore();

const appointmentModel = reactive<AppointmentRequestInterface>({
  nik: "",
  doctorId: "",
  date: "",
});

const addAppointment = async (bodyRequest: AppointmentRequestInterface) => await appointmentStore.addAppointment(bodyRequest);
</script>
<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">Tambah Appointment</h1>
      </div>
      <VAddAppointmentForm :appointmentModel="appointmentModel" :action="addAppointment" />
    </div>
  </main>
</template>

