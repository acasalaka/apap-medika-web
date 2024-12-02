<script setup lang="ts">
import VInput from '@/components/VInput.vue';
import VSelect from '@/components/VSelect.vue';
import VButton from '@/components/VButton.vue';
import VTextArea from '@/components/VTextArea.vue';
import type { AppointmentRequestInterface } from '@/interfaces/appointment.interface';
import { onMounted, type PropType, ref, toRefs, watch } from 'vue';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  action: {
    type: Function as PropType<(data: AppointmentRequestInterface) => Promise<void>>,
    required: true,
  },
  appointmentModel: {
    type: Object as PropType<AppointmentRequestInterface>,
    required: true,
  },
});

const model = toRefs(props).appointmentModel;

const emit = defineEmits(['update:modelValue']);

watch(() => model, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

const handleSubmit = async () => await props.action(model.value);

// const developerOptions = ref([] as DeveloperOptionInterface[]);
//
// const getDevelopers = async () => {
//   const response = await fetch('http://localhost:8080/api/developer/viewall');
//   const data: CommonResponseInterface<DeveloperOptionInterface[]> = await response.json();
//   developerOptions.value = data.data;
// }
//
// onMounted(getDevelopers);

</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-2 py-2">
    <VInput id="name" name="name" label="Nama Proyek" v-model="model.nama" />
    <VTextArea id="description" name="description" label="Deskripsi" v-model="model.deskripsi" />

    <div class="flex w-full justify-between gap-2">
      <VInput id="start-date" name="startDate" label="Tanggal Mulai" type="date" v-model="model.tanggalMulai" />
      <VInput id="end-date" name="endDate" label="Tanggal Selesai" type="date" v-model="model.tanggalSelesai" />
    </div>

    <div class="flex w-full justify-between gap-2">
      <VSelect id="status" name="status" label="Status" v-model="model.status">
        <option value="">Pilih status...</option>
        <option value="STARTED">Started</option>
        <option value="ONGOING">On Going</option>
        <option value="FINISHED">Finished</option>
      </VSelect>

<!--      <VSelect id="developer" name="developer" label="Developer" v-model="model.developer">-->
<!--        <option value="">Pilih developer...</option>-->
<!--        <option v-for="developer in developerOptions" :key="developer.id" :value="developer.id">-->
<!--          {{ developer.nama }}-->
<!--        </option>-->
<!--      </VSelect>-->
    </div>

    <div class="flex gap-2 py-2">
      <VButton @click="router.back()" type="button" class="bg-slate-600 hover:bg-slate-800 text-white">Kembali</VButton>
      <VButton type="submit" class="bg-green-600 hover:bg-green-800 text-white">Simpan</VButton>
    </div>
  </form>
</template>

<style scoped>
</style>
