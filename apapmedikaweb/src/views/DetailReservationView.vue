<script setup lang="ts">
import { useReservationStore } from '@/stores/reservation';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import type { ReservationInterface } from '@/interface/reservation.interface';
import VButton from '@/components/VButton.vue';
import VInput from '@/components/VInput.vue';
import VSelect from '@/components/VSelect.vue';
import { useToast } from 'vue-toastification';
import type { FacilityInterface } from '@/interface/facility.interface';


const router = useRouter();
const route = useRoute();
const { id: reservationId } = route.params;
interface Room {
  id: string;
  name: string;
  pricePerDay: number;
}


const reservationStore = useReservationStore();
const toast = useToast();
const reservation = ref<ReservationInterface | undefined>(undefined);
const facility = ref<FacilityInterface | undefined>(undefined);
const isUpdate = ref(false); 
const roomsAvailable = ref<Room[]>([])
const showDeleteModal = ref(false); 
const showDetailsModal = ref(false);

const model = ref({
  dateIn: '',
  dateOut: '',
  roomId: '',
});

const getReservation = async () => {
  try {
    reservation.value = await reservationStore.getReservationDetail(reservationId as string);
  } catch (err) {
    toast.error('Error fetching reservation details');
  }
};

const showPriceDetails = () => {
  showDetailsModal.value = true;
};

const roomPrice = computed(() => {
  if (reservation.value?.roomId && reservation.value?.totalFee) {
    return reservation.value.totalFee;
  }
  return 0;
});

const totalDays = computed(() => {
  if (reservation.value?.dateIn && reservation.value?.dateOut) {
    const dateIn = new Date(reservation.value.dateIn);
    const dateOut = new Date(reservation.value.dateOut);
    const diffTime = Math.abs(dateOut.getTime() - dateIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  }
  return 0;
});

const totalRoomPrice = computed(() => {
  return roomPrice.value * totalDays.value;
});

const handleDeleteReservation = async () => {
  try {
    await reservationStore.deleteReservation(reservationId as string);
    toast.success('Reservation deleted successfully');
    router.push('/reservations'); 
  } catch (err) {
    toast.error('Failed to delete reservation');
  }
};
const fetchAvailableRooms = async () => {
  if (!model.value.dateIn || !model.value.dateOut) {
    toast.error('Please fill in Date In and Date Out before selecting a room');
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8083/api/reservations/availableRoom?dateIn=${model.value.dateIn}&dateOut=${model.value.dateOut}`
    );
    const data = await response.json();
    if (data.status === 200) {
      roomsAvailable.value = data.data;
      toast.success('Rooms fetched successfully');
    } else {
      toast.error('No available rooms for the selected dates');
      roomsAvailable.value = [];
    }
  } catch (err) {
    toast.error('Error fetching rooms');
  }
};

const handleUpdateReservation = async () => {
  if (!model.value.roomId || !model.value.dateIn || !model.value.dateOut) {
    toast.error('Please fill in all the required fields');
    return;
  }

  try {
    await reservationStore.updateReservation(reservationId as string, model.value);
    toast.success('Reservation updated successfully');
    isUpdate.value = false;  
  } catch (err) {
    toast.error('Failed to update reservation');
  }
};

onMounted(getReservation);
</script>

<template>
  <main class="w-full h-screen flex justify-center items-center bg-gray-400/30">
    <div class="w-[60%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h1 class="text-green-600 font-bold text-xl">Detail Reservasi</h1>
      </div>

      <div v-if="!isUpdate" class="flex flex-col gap-2 py-4">
        <div class="flex flex-col gap-1 w-full">
          <span>ID Reservasi</span>
          <span class="text-xl font-bold">{{ reservation?.id }}</span>
        </div>
        <div class="flex flex-col gap-1 w-full">
          <span>Nama Pasien</span>
          <span class="text-xl font-bold">{{ reservation?.patientId }}</span>
        </div>
        <div class="flex flex-col gap-1 w-full">
          <span>Nama Ruangan</span>
          <span class="text-xl font-bold">{{ reservation?.roomId }}</span>
        </div>
        <div class="flex flex-col gap-1 w-full">
          <span>Assigned Nurse</span>
          <span class="text-xl font-bold">{{ reservation?.assignedNurse }}</span>
        </div>
        <div class="flex flex-col gap-1 w-full">
          <span>Total Fee</span>
          <span class="text-xl font-bold cursor-pointer clickable" @click="showPriceDetails">{{ "Rp." + reservation?.totalFee }}</span>
        </div>
        <div class="flex flex-col gap-1 w-full">
          <span>Status</span>
          <span class="text-xl font-bold">{{ "nanti Isi Status" }}</span>
        </div>

        <!-- Show Buttons -->
        <div class="flex gap-2 py-2">
          <VButton @click="router.back()" class="bg-slate-600 hover:bg-slate-800 text-white">Kembali</VButton>
          <VButton @click="isUpdate = true" class="bg-amber-600 hover:bg-amber-800 text-white">
            Update Room
          </VButton>
          <VButton @click="showDeleteModal = true" class="bg-red-600 hover:bg-red-800 text-white">
            Delete
          </VButton>
        </div>
      </div>
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg w-[40%]">
          <h2 class="text-lg font-bold mb-4">Rincian Harga Reservasi</h2>
          <div class="flex flex-col gap-2">
            <p><strong>Harga Kamar:</strong> Rp. {{ roomPrice }}</p>
            <p><strong>Jumlah Hari:</strong> {{ totalDays }} hari</p>
            <p><strong>Total Harga Kamar:</strong> Rp. {{ totalRoomPrice }}</p>

            <h3 class="font-semibold mt-4">Fasilitas:</h3>

            <!-- <h3 class="font-semibold mt-4">Fasilitas:</h3>
            <ul>
              <li v-for="(facility, index) in reservation?.listFacility" :key="index">
                {{ facility.name }} - Rp. {{ facility.fee }}
              </li>
            </ul> -->
            
            <p class="font-semibold mt-4"><strong>Total Harga:</strong> Rp. {{ reservation?.totalFee }}</p>
            
            <div class="flex justify-end gap-2 mt-6">
              <VButton @click="showDetailsModal = false" class="bg-gray-600 hover:bg-gray-800 text-white">
                Tutup
              </VButton>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isUpdate" class="mt-4">
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
          <div class="flex gap-2 py-2">
            <VButton @click="handleUpdateReservation" class="bg-green-600 hover:bg-green-800 text-white">
              Simpan Perubahan
            </VButton>
            <VButton @click="isUpdate = false" class="bg-gray-600 hover:bg-gray-800 text-white">
              Batal
            </VButton>
          </div>
      </div>

      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg w-[30%]">
          <h2 class="text-lg font-bold mb-4">Konfirmasi Hapus</h2>
          <p>Apakah Anda yakin ingin menghapus reservasi ini?</p>
          <div class="flex justify-end gap-2 mt-6">
            <VButton @click="showDeleteModal = false" class="bg-gray-600 hover:bg-gray-800 text-white">
              Batal
            </VButton>
            <VButton @click="handleDeleteReservation" class="bg-red-600 hover:bg-red-800 text-white">
              Hapus
            </VButton>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>



<style scoped>
.clickable {
  color: #007BFF; 
  text-decoration: underline; 
}

.clickable:hover {
  color: #0056b3; 
  text-decoration: underline; 
}
</style>

