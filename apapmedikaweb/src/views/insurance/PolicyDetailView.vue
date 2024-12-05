<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { DataTable } from 'simple-datatables';

// Policy and coverage details
const policy = ref({
  id: '',
  patientName: '',
  companyName: '',
  companyId: '',
  expiryDate: '',
  totalCoverage: 0,
  totalCovered: 0,
  status: '',
  createdAt: '',
  createdBy: '',
  updatedAt: '',
  updatedBy: '',
  coverages: [] as Array<any>,
});

const expiryDate = ref('');
const canEditExpiry = ref(false);
const canCancelPolicy = ref(false);
const canDeletePolicy = ref(false);
const usedCoverageIds = ref<Set<number>>(new Set());

const showModal = ref(false); // Control modal visibility
const modalAction = ref<'cancel' | 'delete' | ''>(''); // Action to perform (cancel or delete)

const route = useRoute();
const router = useRouter();

// Fetch role from localStorage
const role = ref<'ADMIN' | 'PATIENT'>('ADMIN');

// Fetch policy details
const fetchPolicyDetails = async () => {
  try {
    const policyId = route.params.id;
    const response = await fetch(`http://localhost:8081/api/policy/detail?id=${policyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    policy.value = response.data.data;
    expiryDate.value = response.data.data.expiryDate; // Set default expiryDate value from policy

    // Fetch the company ID and call the get_coverages API
    const companyId = policy.value.companyId;
    await fetchCompanyCoverages(companyId);

    // Fetch the used coverages for this policy
    await fetchUsedCoverages(policyId);

    // Check if the policy can be cancelled or deleted
    canEditExpiry.value = policy.value.status === 'Created';
    canCancelPolicy.value = policy.value.status === 'Created';
    canDeletePolicy.value = policy.value.status === 'Created';

    // Initialize DataTable after the data is fetched
    nextTick(() => {
      initializeDataTable();
    });
  } catch (error) {
    console.error('Error fetching policy details:', error);
  }
};

watch(policy.value.coverages, () => {
  initializeDataTable();
});

const initializeDataTable = () => {
  if (
    document.getElementById('coverageTable') &&
    typeof DataTable !== 'undefined'
  ) {
    new DataTable('#coverageTable', {
      searchable: true,
      sortable: true,
    });
  }
};

// Fetch coverages for the company
const fetchCompanyCoverages = async (companyId: string) => {
  try {
    const response = await fetch(`http://localhost:8081/api/company/get_coverages?id=${companyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    const coveragesData = response.data.data;

    // Assign the coverages data to the policy
    policy.value.coverages = coveragesData.map(coverage => ({
      ...coverage,
      claimed: false,  // Default state for claimed (we'll update this later)
    }));
  } catch (error) {
    console.error('Error fetching company coverages:', error);
  }
};

// Fetch used coverages for the policy
const fetchUsedCoverages = async (policyId: string) => {
  try {
    const response = await fetch(`http://localhost:8081/api/policy/get_used_coverages?policyId=${policyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    const usedCoverageIdsData = response.data.data;

    // Populate the usedCoverageIds set with the IDs of coverages that have been used
    usedCoverageIds.value = new Set(usedCoverageIdsData);

    // Update the claimed property of coverages in policy
    policy.value.coverages.forEach(coverage => {
      coverage.claimed = usedCoverageIds.value.has(coverage.id);
    });
  } catch (error) {
    console.error('Error fetching used coverages:', error);
  }
};

// Update expiry date
const updateExpiryDate = async () => {
  try {
    const policyId = route.params.id;

    // Convert expiryDate to Date object if it's a valid date string
    const expiryDateFormatted = new Date(expiryDate.value);

    // Ensure the expiryDate is valid
    if (isNaN(expiryDateFormatted.getTime())) {
      alert('Invalid expiry date');
      return;
    }

    const requestPayload = {
      id: policyId,
      expiryDate: expiryDateFormatted,
    };

    const response = await axios.put(
        `http://localhost:8081/api/policy/update-expirydate`,
        requestPayload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        }
    );

    alert('Expiry date updated successfully!');
    window.location.reload()
  } catch (error) {
    console.error('Error updating expiry date:', error);
    alert('Failed to update expiry date.');
  }
};

// Cancel the policy
const cancelPolicy = async () => {
  try {
    const policyId = route.params.id;
    await axios.put(`http://localhost:8081/api/policy/cancel?id=${policyId}`);
    alert('Policy cancelled successfully!');
    window.location.reload()
  } catch (error) {
    console.error('Error cancelling policy:', error);
    alert('Failed to cancel policy.');
  }
};

// Delete the policy
const deletePolicy = async () => {
  try {
    const policyId = route.params.id;
    await axios.delete(`http://localhost:8081/api/policy/delete?id=${policyId}`);
    alert('Policy deleted successfully!');
    router.push('/insurance'); // Redirect to policy list page
  } catch (error) {
    console.error('Error deleting policy:', error);
    alert('Failed to delete policy.');
  }
};

// Show the modal with the selected action
const openModal = (action: 'cancel' | 'delete') => {
  modalAction.value = action;
  showModal.value = true;
};

// Confirm the modal action
const confirmAction = async () => {
  if (modalAction.value === 'cancel') {
    await cancelPolicy();
  } else if (modalAction.value === 'delete') {
    await deletePolicy();
  }
  showModal.value = false;
};

// On component mounted, fetch policy details and initialize datatable
onMounted(() => {
  role.value = localStorage.getItem('role') as 'ADMIN' | 'PATIENT'; // Or get from route params
  fetchPolicyDetails();
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 pt-20 w-full">
    <h2 class="text-2xl font-semibold mb-6">Policy Details</h2>

    <div class="mb-6">
      <div class="grid grid-cols-2 gap-4">
        <div><strong>ID Policy:</strong> {{ policy.id }}</div>
        <div><strong>Patient Name:</strong> {{ policy.patientName }}</div>
        <div><strong>Company Name:</strong> {{ policy.companyName }}</div>
        <div>
          <strong>Expiry Date:</strong>
          <template v-if="role === 'ADMIN'">
            <input
              type="date"
              v-model="expiryDate"
              class="border px-4 py-2 rounded-md"
            />
          </template>
          <template v-else>
            <span>{{ policy.expiryDate }}</span>
          </template>
        </div>
        <div><strong>Total Coverage:</strong> {{ policy.totalCoverage }}</div>
        <div><strong>Total Covered:</strong> {{ policy.totalCovered }}</div>
        <div><strong>Status:</strong> {{ policy.status }}</div>
        <div><strong>Created At:</strong> {{ policy.createdAt }}</div>
        <div><strong>Created By:</strong> {{ policy.createdBy }}</div>
        <div><strong>Last Updated At:</strong> {{ policy.updatedAt }}</div>
        <div><strong>Last Updated By:</strong> {{ policy.updatedBy }}</div>
      </div>
    </div>

    <!-- Coverages DataTable -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-4">Coverages</h3>
      <table id="coverageTable" class="min-w-full table-auto border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border px-4 py-2">Coverage ID</th>
            <th class="border px-4 py-2">Coverage Name</th>
            <th class="border px-4 py-2">Used?</th>
            <th class="border px-4 py-2">Created At</th>
            <th class="border px-4 py-2">Updated At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coverage in policy.coverages" :key="coverage.id" :class="{'bg-green-100': coverage.claimed}">
            <td class="border px-4 py-2">{{ coverage.id }}</td>
            <td class="border px-4 py-2">{{ coverage.name }}</td>
            <td class="border px-4 py-2">
              <input type="checkbox" :checked="coverage.claimed" disabled />
            </td>
            <td class="border px-4 py-2">{{ coverage.createdAt }}</td>
            <td class="border px-4 py-2">{{ coverage.updatedAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4">
      <button
        v-if="canEditExpiry"
        @click="updateExpiryDate"
        class="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Update Expiry Date
      </button>
      <button
        v-if="canCancelPolicy"
        @click="openModal('cancel')"
        class="bg-yellow-500 text-white px-4 py-2 rounded-md"
      >
        Cancel Policy
      </button>
      <button
        v-if="canDeletePolicy"
        @click="openModal('delete')"
        class="bg-red-500 text-white px-4 py-2 rounded-md"
      >
        Delete Policy
      </button>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Are you sure?</h3>
        <div class="flex gap-4">
          <button @click="confirmAction" class="bg-red-500 text-white px-4 py-2 rounded-md">Yes</button>
          <button @click="showModal = false" class="bg-gray-500 text-white px-4 py-2 rounded-md">No</button>
        </div>
      </div>
    </div>
  </div>
</template>
