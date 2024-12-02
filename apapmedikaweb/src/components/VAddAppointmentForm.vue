<script setup lang="ts">
import VSelect from '@/components/VSelect.vue';
import VButton from '@/components/VButton.vue';
import type { AppointmentRequestInterface } from '@/interface/appointment.interface';
import type { PatientOptionInterface } from '@/interface/patient.interface';
import type { DoctorOptionInterface, DoctorScheduleInterface } from '@/interface/doctor.interface';
import { ref, onMounted, watch } from 'vue';
import type { CommonResponseInterface } from '@/interface/common.interface';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  appointmentModel: {
    type: Object as PropType<AppointmentRequestInterface>,
    required: true,
  },
  action: {
    type: Function as PropType<(data: AppointmentRequestInterface) => Promise<void>>,
    required: true,
  },
});

const patientOptions = ref<PatientOptionInterface[]>([]);
const doctorOptions = ref<DoctorOptionInterface[]>([]);
const doctorSchedules = ref<string[]>([]);

const fetchPatients = async () => {
  const response = await fetch('http://localhost:8084/api/patient/viewall');
  const data: CommonResponseInterface<PatientOptionInterface[]> = await response.json();
  patientOptions.value = data.data;
  console.log(data);
};

const fetchDoctors = async () => {
  const response = await fetch('http://localhost:8084/api/doctor/viewall');
  const data: CommonResponseInterface<DoctorOptionInterface[]> = await response.json();
  doctorOptions.value = data.data;
  console.log(data);
};

const fetchDoctorSchedule = async (doctorId: string) => {
  if (!doctorId) {
    doctorSchedules.value = [];
    return;
  }
  const response = await fetch(`http://localhost:8084/api/doctor/${doctorId}/schedule`);
  const data: CommonResponseInterface<DoctorScheduleInterface> = await response.json();
  doctorSchedules.value = data.data?.schedules || [];
};

watch(
  () => props.appointmentModel.doctorId,
  (newDoctorId) => {
    fetchDoctorSchedule(newDoctorId);
  }
);

const handleSubmit = async () => {
  await props.action(props.appointmentModel);
};

onMounted(() => {
  fetchPatients();
  fetchDoctors();
});
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 p-4">
    <VSelect id="patient" name="patient" label="Pasien" v-model="appointmentModel.nik">
      <option value="">Pilih Pasien</option>
      <option v-for="patient in patientOptions" :key="patient.nik" :value="patient.nik">
        {{ patient.nik }} - {{ patient.name }}
      </option>
    </VSelect>

    <VSelect id="doctor" name="doctor" label="Dokter" v-model="appointmentModel.doctorId">
      <option value="">Pilih Dokter</option>
      <option v-for="doctor in doctorOptions" :key="doctor.id" :value="doctor.id">
        {{ doctor.name }}
      </option>
    </VSelect>

    <VSelect id="schedule" name="schedule" label="Tanggal" v-model="appointmentModel.date">
      <option value="">Pilih Jadwal Dokter</option>
      <option v-for="schedule in doctorSchedules" :key="schedule" :value="schedule">
        {{ schedule }}
      </option>
    </VSelect>

    <div class="flex justify-end gap-2">
      <VButton @click="router.back()" type="button" class="bg-gray-500 hover:bg-gray-700 text-white">Back</VButton>
      <VButton type="submit" class="bg-green-500 hover:bg-green-700 text-white">Save</VButton>
    </div>
  </form>
</template>

<style scoped>
</style>
