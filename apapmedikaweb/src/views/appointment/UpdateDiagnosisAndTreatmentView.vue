<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppointmentStore } from "@/stores/appointment";
import VButton from "@/components/VButton.vue";
import type { AppointmentInterface, UpdateTreatmentInterface } from "@/interface/appointment.interface";
import type { TreatmentOptionInterface } from "@/interface/treatment.interface";
import type { CommonResponseInterface } from "@/interface/common.interface";

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

const treatmentUpdateModel = reactive<UpdateTreatmentInterface>({
  id: appointmentDetails.id,
  diagnosis: "",
  treatments: [],
});

const treatmentOptions = ref<TreatmentOptionInterface[]>([]);

const fetchTreatments = async () => {
  const response = await fetch("http://localhost:8081/api/treatment/viewall");
  const data: CommonResponseInterface<TreatmentOptionInterface[]> = await response.json();
  treatmentOptions.value = data.data;
};

const fetchAppointment = async () => {
  if (appointmentId) {
    try {
      const appointment = await appointmentStore.getAppointmentDetail(appointmentId as string);
      Object.assign(appointmentDetails, appointment);

      treatmentUpdateModel.id = appointment.id;
      treatmentUpdateModel.diagnosis = appointment.diagnosis || "";
      treatmentUpdateModel.treatments = appointment.treatments.map((t) => t.id || t); // Ensure it's an array of IDs
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    }
  }
};

const addTreatmentRow = () => {
  treatmentUpdateModel.treatments.push(null);
};

const removeTreatmentRow = (index: number) => {
  treatmentUpdateModel.treatments.splice(index, 1);
};

const updateAppointmentTreatment = async () => {
  const confirmation = confirm(
    "Apakah Anda yakin ingin menyimpan perubahan pada appointment ini?"
  );

  if (!confirmation) {
    return;
  }

  try {
    await appointmentStore.updateAppointmentTreatment(treatmentUpdateModel.id, treatmentUpdateModel);
    router.back();
  } catch (error) {
    console.error("Failed to update appointment diagnosis and treatments:", error);
    alert("Failed to update appointment diagnosis and treatments. Please try again.");
  }
};

onMounted(() => {
  fetchAppointment();
  fetchTreatments();
});
</script>

<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">
          Ubah Diagnosis dan Treatment Appointment Untuk Appointment {{ appointmentDetails.id }}
        </h1>
      </div>

      <div class="w-full flex justify-between">
        <p><strong>Pasien: </strong> {{ appointmentDetails.patientName || "Data not available" }}</p>
      </div>
      <div class="w-full flex justify-between">
        <p><strong>Dokter: </strong> {{ appointmentDetails.doctorName || "Data not available" }}</p>
      </div>
      <div class="w-full flex justify-between">
        <p><strong>Status: </strong> {{ appointmentDetails.status }}</p>
      </div>

      <form @submit.prevent="updateAppointmentTreatment" class="flex flex-col gap-4 p-4">
        <label for="diagnosis" class="font-bold">Diagnosis:</label>
        <input id="diagnosis" v-model="treatmentUpdateModel.diagnosis" class="p-2 border rounded" placeholder="Enter diagnosis"/>

        <div class="flex flex-col gap-2">
          <label class="font-bold">Treatments:</label>
          <div v-for="(treatment, index) in treatmentUpdateModel.treatments" :key="index" class="flex items-center gap-2">
            <select v-model="treatmentUpdateModel.treatments[index]" class="p-2 border rounded flex-1">
              <option value="">Select treatment</option>
              <option v-for="option in treatmentOptions" :key="option.id" :value="option.id">
                {{ option.name }}
              </option>
            </select>
            <VButton class="bg-red-500 hover:bg-red-700 text-white" type="button" @click="removeTreatmentRow(index)">
              Remove
            </VButton>
          </div>
          <VButton class="bg-blue-500 hover:bg-blue-700 text-white" type="button" @click="addTreatmentRow">
            Add Treatment
          </VButton>
        </div>

        <div class="flex justify-end gap-2">
          <VButton class="bg-slate-600 hover:bg-slate-800 text-white" @click="router.back()">Back</VButton>
          <VButton class="bg-green-400 hover:bg-green-800 text-white" type="submit">Save</VButton>
        </div>
      </form>
    </div>
  </main>
</template>
