<script setup lang="ts">
import { useAppointmentStore } from '@/stores/appointment'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import type { AppointmentInterface } from '@/interface/appointment.interface'
import { format } from 'date-fns'
import VButton from '@/components/VButton.vue'
import VDeleteButton from '@/components/VDeleteButton.vue'

const router = useRouter()
const route = useRoute()
const { id: appointmentId } = route.params

const appointmentStore = useAppointmentStore()
const appointment = ref<AppointmentInterface | null>(null)

const getAppointment = async () => {
  try {
    appointment.value = await appointmentStore.getAppointmentDetail(appointmentId as string)
  } catch (error) {
    console.error('Failed to fetch appointment details:', error)
  }
}

onMounted(getAppointment)
</script>

<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div
      v-if="appointment"
      class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl"
    >
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">Detail Appointment</h1>
      </div>
      <div class="flex flex-col gap-2 py-4">
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">ID Appointment: </span>
          <span class="text-l font-regular">{{ appointment.id }}</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">Nama Pasien: </span>
          <span class="text-l font-regular">{{ appointment.patientName }}</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">Nama Dokter: </span>
          <span class="text-l font-regular">{{ appointment.doctorName }}</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">Tanggal Appointment: </span>
          <span class="text-l font-regular">
            {{ format(new Date(appointment.date), 'EEEE, dd MMMM yyyy', { locale: id }) }}
          </span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">Status: </span>
          <span class="text-l font-regular">{{ appointment.status }}</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">Diagnosis: </span>
          <span v-if="appointment.diagnosis" class="text-l font-regular">
            {{ appointment.diagnosis }}
          </span>
          <span v-else class="text-l font-regular"> Belum ada diagnosis </span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">Treatments: </span>
          <span v-if="appointment.treatments.length > 0" class="text-l font-regular">
            <ul>
              <li v-for="(treatment, index) in appointment.treatments" :key="index">
                {{ index + 1 }}. {{ treatment }}
              </li>
            </ul>
          </span>
          <span v-else class="text-l font-regular">Belum ada treatments</span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">Dibuat pada: </span>
          <span class="text-l font-regular">
            {{ format(new Date(appointment.createdAt), 'EEEE, dd MMMM yyyy', { locale: id }) }}
          </span>
        </div>
        <div class="flex flex-row gap-1 w-full">
          <span class="text-l font-bold">Diperbaharui pada: </span>
          <span class="text-l font-regular">
            {{ format(new Date(appointment.updatedAt), 'EEEE, dd MMMM yyyy', { locale: id }) }}
          </span>
        </div>
      </div>
      <div class="flex gap-2 py-2">
        <VButton @click="router.back()" class="bg-slate-600 hover:bg-slate-800 text-white">Kembali</VButton>
        <RouterLink :to="`/appointment/${appointmentId}/status`" class="w-full">
          <VButton class="bg-blue-400 hover:bg-blue-800 text-white">Update Status</VButton>
        </RouterLink>
        <RouterLink :to="`/appointment/${appointmentId}/treatment`" class="w-full">
          <VButton class="bg-blue-400 hover:bg-blue-600 text-white">Update Diagnosis</VButton>
        </RouterLink>
        <VDeleteButton :appointmentId="appointment.id" />
      </div>
    </div>
  </main>
</template>
