<script setup lang="ts">
import { useBillStore } from '@/stores/bill'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import type { BillInterface } from '@/interface/bill.interface'
import VButton from '@/components/VButton.vue'
import { useToast } from 'vue-toastification'
import type { AppointmentInterface } from '@/interface/appointment.interface'
import type { ReservationInterface } from '@/interface/reservation.interface'

const router = useRouter()

const route = useRoute()
const { id: billId } = route.params

const billStore = useBillStore()
const toast = useToast()

const bill = ref<BillInterface | undefined>(undefined)
const appointmentFee = ref<number | null>(null)
const reservationFee = ref<number | null>(null)

const getBill = async () => {
  try {
    bill.value = await billStore.getBillDetail(billId as string)
    if (bill.value) {
      if (bill.value.appointmentId) {
        await getAppointmentFee(bill.value.appointmentId)
      }
      if (bill.value.reservationId) {
        await getReservationFee(bill.value.reservationId)
      }
    }
  } catch (err) {
    toast.error('Failed to fetch bill details')
  }
}

const getAppointmentFee = async (appointmentId: string) => {
  try {
    const response = await fetch(`http://localhost:8081/api/appointment?id=${appointmentId}`)
    const data = await response.json()
    if (data.status === 200 && data.data) {
      appointmentFee.value = data.data.totalFee
    }
  } catch (err) {
    toast.error('Failed to fetch appointment fee')
  }
}

const getReservationFee = async (reservationId: string) => {
  try {
    const response = await fetch(`http://localhost:8083/api/reservations/${reservationId}`)
    const data = await response.json()
    if (data.status === 200 && data.data) {
      reservationFee.value = data.data.totalFee
    }
  } catch (err) {
    toast.error('Failed to fetch reservation fee')
  }
}

onMounted(getBill)
</script>

<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">Detail Bill</h1>
      </div>
  
      <div class="flex flex-col gap-2 py-4">
        <div class="flex flex-col gap-1 w-full">
          <span>ID Bill</span>
          <span class="text-xl font-bold">{{ bill?.id }}</span>
        </div>
  
        <div class="flex flex-col gap-1 w-full">
          <span>Appointment Total Fee</span>
          <span class="text-xl font-bold">
            {{ appointmentFee !== null ? `Rp. ${appointmentFee}` : '-' }}
          </span>
        </div>
  
        <div class="flex gap-12 w-full">
          <div class="flex flex-col gap-1 w-1/3">
            <span>Reservation Fee</span>
            <span class="text-xl font-bold">
              {{ reservationFee !== null ? `Rp. ${reservationFee}` : '-' }}
            </span>
          </div>
          <div class="flex flex-col gap-1 w-1/3">
            <span>Total Fee </span>
            <span class="text-xl font-bold">
              {{'Rp. ' + bill?.subtotal }}</span>
          </div>
        </div>
      </div>
  
      <div class="flex gap-2 py-2">
        <VButton @click="router.back()" class="bg-slate-600 hover:bg-slate-800 text-white">Kembali</VButton>
      </div>
      <div v-if="bill?.status === 'UNPAID'" class="flex gap-2 py-2">
        <RouterLink :to="`/bill/${billId}/update`" class="w-full">
          <VButton class="bg-amber-600 hover:bg-amber-800 text-white">Pay Bill</VButton>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
</style>
