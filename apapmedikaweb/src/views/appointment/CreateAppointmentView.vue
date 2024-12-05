<script setup lang="ts">
import { reactive } from 'vue';
import { useAppointmentStore } from '@/stores/appointment';
import VAddAppointmentForm from '@/components/VAddAppointmentForm.vue';
import type { AppointmentRequestInterface } from '@/interface/appointment.interface';
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const appointmentStore = useAppointmentStore();

const appointmentModel = reactive<AppointmentRequestInterface>({
  nik: "",
  doctorId: "",
  date: "",
});

const addAppointment = async (bodyRequest: AppointmentRequestInterface) => {
  try {
    const inputDate = bodyRequest.date as string;

    const monthMap: { [key: string]: string } = {
      Januari: "01",
      Februari: "02",
      Maret: "03",
      April: "04",
      Mei: "05",
      Juni: "06",
      Juli: "07",
      Agustus: "08",
      September: "09",
      Oktober: "10",
      November: "11",
      Desember: "12",
    };

    const dateParts = inputDate.split(",")[1]?.trim().split(" ");
    if (!dateParts || dateParts.length !== 3) {
      throw new Error("Invalid date format. Expected format: 'Hari, Tanggal Bulan Tahun'");
    }

    const day = dateParts[0].padStart(2, "0");
    const month = monthMap[dateParts[1]];
    const year = dateParts[2];

    if (!month) {
      throw new Error(`Invalid month name: '${dateParts[1]}'`);
    }

    const formattedDate = `${year}-${month}-${day}`;
    bodyRequest.date = formattedDate;

    console.log(bodyRequest);
    await appointmentStore.addAppointment(bodyRequest);
  } catch (error) {
    console.error("Error while parsing or submitting date:", error.message);
  }
};

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

<style scoped>
</style>
