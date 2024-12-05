<script setup lang="ts">
import { reactive } from 'vue'
import { useReservationStore } from '@/stores/reservation'
import VReservationForm from '@/components/VReservationForm.vue'
import type { ReservationRequestInterface } from '@/interface/reservation.interface'
import type { PatientInterface } from '@/interface/patient.interface';

const reservationStore = useReservationStore()

const reservationModel = reactive({
  nik : "",
  dateIn: "",
  dateOut: "",
  roomId: "",
  patientId: "",
  appointmentId: "",
  patient : {} as PatientInterface,
  facility: "",
  pClass: 0,
  facilities: [],
})

const addReservation = async (bodyRequest: ReservationRequestInterface) => await reservationStore.addReservation(bodyRequest)
</script>

<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">Tambah Reservasi</h1>
      </div>
      <VReservationForm :reservationModel="reservationModel" :patientModel="reservationModel.patient" :action="addReservation"/>
    </div>
  </main>
</template>