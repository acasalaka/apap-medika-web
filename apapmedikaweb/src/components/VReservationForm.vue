<script setup lang="ts">
import VInput from '@/components/VInput.vue'
import VSelect from '@/components/VSelect.vue'
import VButton from '@/components/VButton.vue'
import type { ReservationRequestInterface } from '@/interface/reservation.interface'
import { onMounted, ref, watch, type PropType } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import type { FacilityOptionInterface } from '@/interface/facility.interface'
import type { CommonResponseInterface } from '@/interface/common.interface'

const router = useRouter()
const toast = useToast()

const props = defineProps({
  action: {
    type: Function as PropType<(data: ReservationRequestInterface) => Promise<void>>,
    required: true
  },
  reservationModel: {
    type: Object as PropType<ReservationRequestInterface>,
    required: true
  }
})

const model = ref<ReservationRequestInterface>(props.reservationModel)

const patientFound = ref(false)
interface Room {
  id: string;
  name: string;
  pricePerDay: number;
}

const roomsAvailable = ref<Room[]>([])
const facilityOptions = ref([] as FacilityOptionInterface[])

const emit = defineEmits(['update:modelValue'])
watch(() => model.value, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

const searchPatient = async () => {
  if (!model.value.nik) {
    toast.error('Please enter a valid NIK')
    return
  }

  try {
    const response = await fetch(`http://localhost:8084/api/patient/get-nik/${model.value.nik}`)
    const data = await response.json()

    if (data.status === 200 && data.data) {
      model.value.patient = data.data
      model.value.patientId = data.data.id
      model.value.pClass = data.data.pclass
      patientFound.value = true
    } else {
      toast.error('Patient not found')
      patientFound.value = false
    }
  } catch (err) {
    toast.error('Error fetching patient data')
    patientFound.value = false
  }
}

// Fetch available rooms for selected dates
const fetchAvailableRooms = async () => {
  if (!model.value.dateIn || !model.value.dateOut) {
    toast.error('Please fill in Date In and Date Out before selecting a room')
    return
  }

  try {
    const response = await fetch(`http://localhost:8083/api/reservations/availableRoom?dateIn=${model.value.dateIn}&dateOut=${model.value.dateOut}`)
    const data = await response.json()

    if (data.status === 200) {
      roomsAvailable.value = data.data
      toast.success('Rooms fetched successfully')
    } else {
      toast.error('No available rooms for the selected dates')
      roomsAvailable.value = []
    }
  } catch (err) {
    toast.error('Error fetching rooms')
  }
}

const getFacility = async () => {
  const response = await fetch('http://localhost:8083/api/reservations/getFacilities')
  const data: CommonResponseInterface<FacilityOptionInterface[]> = await response.json()
  facilityOptions.value = data.data
}

const addFacilityRow = () => {
  model.value.facilities.push({ id: ''})
}

const deleteFacilityRow = (index: number) => {
  model.value.facilities.splice(index, 1)
}

const handleSubmit = async () => await props.action(model.value)

onMounted(getFacility)
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-2 py-2">
    <!-- NIK Input -->
    <VInput id="nik" name="nik" label="NIK" v-model="model.nik" />
    <VButton @click="searchPatient" type="button" class="bg-green-600 hover:bg-green-800 text-white">
      Cari Pasien
    </VButton>

    <div v-if="patientFound" class="mt-4">
      <h2 class="font-semibold text-xl">Patient Information</h2>
      <p><strong>NIK:</strong> {{ model.patient.nik }}</p>
      <p><strong>Name:</strong> {{ model.patient.name }}</p>
      <p><strong>Gender:</strong> {{ model.patient.gender }}</p>
      <p><strong>Email:</strong> {{ model.patient.email }}</p>
      <p v-if="model.pClass === 1"><strong>Insurance Limit: Rp.</strong>50.000.000</p>
      <p v-if="model.pClass === 2"><strong>Insurance Limit: Rp.</strong> 35.000.000</p>
      <p v-if="model.pClass === 3"><strong>Insurance Limit: Rp.</strong> 25.000.000</p>
    </div>

    <!-- Date fields and room selection -->
    <div v-if="patientFound" class="mt-4">
      <VInput id="dateIn" name="dateIn" label="Tanggal Mulai" type="date" v-model="model.dateIn" />
      <VInput id="dateOut" name="dateOut" label="Tanggal Selesai" type="date" v-model="model.dateOut" />
      <VButton
        @click="fetchAvailableRooms"
        type="button"
        :disabled="!model.dateIn || !model.dateOut"
        class="mt-2 bg-blue-600 hover:bg-blue-800 text-white"
      >
        Cari Ruangan
      </VButton>

      <VSelect
        id="roomId"
        name="roomId"
        label="Pilih Ruangan"
        v-model="model.roomId"
        :disabled="!model.dateIn || !model.dateOut"
      >
        <option value="">Pilih Ruangan</option>
        <option v-for="room in roomsAvailable" :key="room.id" :value="room.id">
          {{ room.name }} - {{ room.pricePerDay }} / hari
        </option>
      </VSelect>
    </div>

    <div v-if="patientFound" class="mt-4">
      <label>Fasilitas</label>
      <VButton type="button" @click="addFacilityRow"  class="mt-2 bg-gray-600 hover:bg-gray-800 text-white">
        Tambah Row
      </VButton>

      <div v-for="(facility, index) in model.facilities" :key="index" class="mt-2 flex gap-2">
        <VSelect id="facility" name="facility" label="Pilih Facility" v-model="facility.id">
          <option value="">Pilih Fasilitas...</option>
          <option v-for="option in facilityOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
        </VSelect>
        <VButton @click="deleteFacilityRow(index)" class="bg-red-600 hover:bg-red-800 text-white">
          Hapus
        </VButton>
      </div>
    </div>

    <div class="flex gap-2 py-2">
      <VButton @click="router.back()"  class="bg-slate-600 hover:bg-slate-800 text-white">
        Kembali
      </VButton>
      <VButton type="submit" class="bg-green-600 hover:bg-green-800 text-white">Simpan</VButton>
    </div>
  </form>
</template>

<style scoped>
</style>
