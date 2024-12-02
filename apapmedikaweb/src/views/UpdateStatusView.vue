<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useAppointmentStore } from '@/stores/appointment';
import VProyekForm from '@/components/VAddAppointmentForm.vue';
import type { AppointmentRequestInterface } from '@/interfaces/appointment.interface';
import { useRoute } from 'vue-router';

const route = useRoute();
const { id: appointmentId } = route.params;

const appointmentStore = useAppointmentStore();

const appointmentModel = reactive({
  idDoctor: "",
  idPatient: "",
  date: "",
});

const updateAppointment = async (bodyRequest: AppointmentRequestInterface) =>
  await appointmentStore.updateAppointment(appointmentId as string, bodyRequest);

const getAppointment = async () => {
  if (typeof appointmentId === 'string') {
    const appointment = await appointmentStore.getAppointmentDetail(appointmentId);

    if (appointment) {
      appointmentModel.idDoctor = appointment.idDoctor;
      appointmentModel.idPatient = appointment.idPatient;
      appointmentModel.date = appointment.date;
    }
  }
}

onMounted(getAppointment);
</script>
<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">Ubah Proyek</h1>
      </div>
      <VProyekForm :appointmentModel="appointmentModel" :action="updateAppointment" />
    </div>
  </main>
</template>
