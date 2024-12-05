<script setup lang="ts">
import { onMounted, reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppointmentStore } from "@/stores/appointment";
import VButton from "@/components/VButton.vue";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { AppointmentInterface, UpdateStatusInterface } from "@/interface/appointment.interface";

const route = useRoute();
const router = useRouter();
const { id: appointmentId } = route.params;

const appointmentStore = useAppointmentStore();

const appointmentDetails = reactive<AppointmentInterface>({
  id: "",
  doctorName: "",
  patientName: "",
  date: "",
  diagnosis: "",
  treatments: [],
  totalFee: 0,
  status: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const statusUpdateModel = reactive<UpdateStatusInterface>({
  id: appointmentDetails.id,
  status: 0,
  updatedBy: ""
});

const statusOptions = computed(() => {
  const appointmentDate = new Date(appointmentDetails.date);
  const now = new Date();
  const differenceInDays = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (!appointmentDetails.diagnosis && appointmentDetails.treatments.length === 0) {
    return [{ value: 1, label: "Done" }];
  }

  if (differenceInDays <= 1) {
    return [{ value: 1, label: "Done" }];
  }

  return [
    { value: 1, label: "Done" },
    { value: 2, label: "Cancelled" },
  ];
});

const getAppointment = async () => {
  if (appointmentId) {
    try {
      const appointment = await appointmentStore.getAppointmentDetail(appointmentId as string);
      Object.assign(appointmentDetails, appointment);

      statusUpdateModel.id = appointment.id;
      statusUpdateModel.status = appointment.status;
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    }
  }
};

const updateAppointmentStatus = async () => {
  try {
    await appointmentStore.updateAppointmentStatus(statusUpdateModel.id, statusUpdateModel);
    router.back();
  } catch (error) {
    console.error("Failed to update appointment status:", error);
    alert("Failed to update appointment status. Please try again.");
  }
};

onMounted(getAppointment);
</script>

<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">Ubah Status Appointment Untuk Appointment {{ appointmentDetails.id }}</h1>
      </div>

      <p><strong>Pasien: </strong> {{ appointmentDetails.patientName || "Data not available" }}</p>
      <p><strong>Dokter: </strong> {{ appointmentDetails.doctorName || "Data not available" }}</p>
      <p><strong>Tanggal Appointment: </strong> {{ appointmentDetails.date ? format(new Date(appointmentDetails.date), "EEEE, dd MMMM yyyy", { locale: id }) : "Invalid Date" }}</p>
      <p><strong>Diagnosis: </strong> {{ appointmentDetails.diagnosis || "No diagnosis available" }}</p>
      <p><strong>Treatment: </strong>
        <span v-if="appointmentDetails.treatments.length">
          <ul><li v-for="(treatment, index) in appointmentDetails.treatments" :key="index">{{ index + 1 }}. {{ treatment }}</li></ul>
        </span>
        <span v-else>No treatments available</span>
      </p>

      <form @submit.prevent="updateAppointmentStatus" class="flex flex-col gap-4 p-4">
        <label for="status" class="font-bold text-lg">Status</label>
        <select id="status" v-model.number="statusUpdateModel.status" class="p-2 border rounded">
          <option value="">Pilih status</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <div class="flex justify-end gap-2">
          <VButton class="bg-slate-600 hover:bg-slate-800 text-white" @click="router.back()">Back</VButton>
          <VButton class="bg-green-400 hover:bg-green-800 text-white" type="submit">Save</VButton>
        </div>
      </form>
    </div>
  </main>
</template>
