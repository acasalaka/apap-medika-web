<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { DataTable } from 'simple-datatables';
import VButton from '@/components/VButton.vue';
import { useBillStore } from '@/stores/bill';
import VDeleteButton from '@/components/VDeleteButton.vue';

const billStore = useBillStore();

onMounted(async () => {
  await billStore.getBill();

  if (
    document.getElementById('default-table') &&
    typeof DataTable !== 'undefined'
  ) {
    new DataTable('#default-table', {
      searchable: false,
    });
    
  }
});

const filteredBills = computed(() => {
  return billStore.bills.filter(
    (bill) => bill.status === 'TREATMENT_IN_PROGRESS' || bill.status === 'UNPAID' || bill.status === 'PAID'
  );
});
</script>
<template>
  <main class="flex items-center justify-center w-full h-full">
    <div v-if="billStore.loading" class="message-layer">
      <span class="animate-pulse font-bold text-4xl">Fetching data...</span>
    </div>

    <div class="px-12 py-20 w-full" v-else>
      <div v-if="!billStore.error" class="flex flex-col gap-6">

        <table id="default-table">
          <thead>
          <tr>
            <th>
              <span class="flex items-center">No.</span>
            </th>
            <th>
              <span class="flex items-center">ID Bill</span>
            </th>
            <th>
              <span class="flex items-center">Status</span>
            </th>
            <th>
              <span class="flex items-center">Action</span>
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(bill, index) in filteredBills"
              :key="bill.id"
          >
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ index + 1 }}
            </td>
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ bill.id }}
            </td>
            <td>{{ bill.status }}</td>
            <td class="flex gap-1">
              <RouterLink :to="`/bill/${bill.id}`" class="w-full">
                <VButton class="detail-button">Lihat</VButton>
              </RouterLink>
              <!-- <VDeleteButton :appointmentId="appointment.id" /> -->
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="message-layer">
        <span class="text-xl">{{ billStore.error }}</span>
      </div>
    </div>
  </main>
</template>


<style scoped>
.message-layer {
  @apply w-full h-screen flex items-center justify-center;
}

.add-button {
  @apply bg-green-600 hover:bg-green-800 text-white;
}

.detail-button {
  @apply bg-cyan-600 hover:bg-cyan-800 text-white;
}

.edit-button {
  @apply bg-amber-600 hover:bg-amber-800 text-white;
}
</style>
