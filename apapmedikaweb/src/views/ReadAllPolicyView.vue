<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

// Reactive state for policies, filters, and loading state
const policies = ref<any[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const role = ref<'ADMIN' | 'PATIENT'>('ADMIN');
const statusFilter = ref<string>(''); // To filter by status
const minCoverage = ref<number | null>(null);
const maxCoverage = ref<number | null>(null);
const searchQuery = ref('');
const patientId = ref(''); // Patient ID for patient role

// Get role dynamically (for example, from localStorage or route)
onMounted(() => {
  role.value = localStorage.getItem('role') as 'ADMIN' | 'PATIENT'; // Or get from route params
  if (role.value === 'PATIENT') {
    patientId.value = localStorage.getItem('patientId') || ''; // Assuming patient ID is stored in localStorage
  }
  fetchPolicies();
});

// Watch the searchQuery and apply it as a filter
watch(searchQuery, () => {
  fetchPolicies();
});

// Fetch policies from API based on the role
const fetchPolicies = async () => {
  loading.value = true;
  try {
    let url = '';

    if (role.value === 'ADMIN') {
      url = 'http://localhost:8081/api/policy/admin/all';
    } else if (role.value === 'PATIENT' && patientId.value) {
      url = `http://localhost:8081/api/pol/all?id=${patientId.value}`;
    }

    // // Append filters to the API call
    // if (statusFilter.value) {
    //   url += `&status=${statusFilter.value}`;
    // }
    // if (minCoverage.value !== null && maxCoverage.value !== null) {
    //   url += `&minCoverage=${minCoverage.value}&maxCoverage=${maxCoverage.value}`;
    // }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    policies.value = response.data.data;
  } catch (error) {
    errorMessage.value = 'Failed to fetch policies';
    console.error('Error fetching policies:', error);
  } finally {
    loading.value = false;
  }
};

// Function to handle status filter
const handleStatusFilter = (status: string) => {
  statusFilter.value = status;
  fetchPolicies();
};

// Function to handle coverage range filter
const handleCoverageFilter = () => {
  fetchPolicies();
};

// Function to navigate to the policy details page
const viewPolicyDetails = (policyId: string) => {
  // Navigate to the policy detail page (assuming Vue Router is set up)
  // Example: router.push({ name: 'policy-details', params: { id: policyId } })
};
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <p>Loading policies...</p>
  </div>

  <div v-if="!loading && errorMessage" class="flex justify-center items-center min-h-screen">
    <p class="text-red-600">{{ errorMessage }}</p>
  </div>

  <div v-if="!loading && policies.length > 0" class="max-w-7xl mx-auto p-6">
    <div class="flex justify-between mb-4">
      <div>
        <input
          v-model="searchQuery"
          type="text"
          class="border px-4 py-2 rounded-lg"
          placeholder="Search Policies..."
        />
      </div>

      <!-- Admin only: Button to create a new policy
      <div v-if="role === 'ADMIN'">
        <button class="bg-blue-500 text-white px-4 py-2 rounded-lg" @click="/* Add logic to navigate to create policy */">
          Create New Policy
        </button>
      </div> -->
    </div>

    <div class="flex space-x-4 mb-4">
      <select v-model="statusFilter" @change="handleStatusFilter(statusFilter)" class="border px-4 py-2 rounded-md">
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="Expired">Expired</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <div>
        <label for="minCoverage" class="mr-2">Min Coverage:</label>
        <input
          v-model.number="minCoverage"
          type="number"
          id="minCoverage"
          class="border px-4 py-2 rounded-md"
          placeholder="Min Coverage"
        />
      </div>

      <div>
        <label for="maxCoverage" class="mr-2">Max Coverage:</label>
        <input
          v-model.number="maxCoverage"
          type="number"
          id="maxCoverage"
          class="border px-4 py-2 rounded-md"
          placeholder="Max Coverage"
        />
      </div>

      <button @click="handleCoverageFilter" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Apply Coverage Filter</button>
    </div>

    <table class="min-w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2">ID Policy</th>
          <th class="border px-4 py-2">Patient</th>
          <th class="border px-4 py-2">Company</th>
          <th class="border px-4 py-2">Total Coverage</th>
          <th class="border px-4 py-2">Status</th>
          <th class="border px-4 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="policy in policies" :key="policy.id">
          <td class="border px-4 py-2">{{ policy.id }}</td>
          <td class="border px-4 py-2">{{ policy.patientId }}</td>
          <td class="border px-4 py-2">{{ policy.companyId }}</td>
          <td class="border px-4 py-2">{{ policy.totalCoverage }}</td>
          <td class="border px-4 py-2">{{ policy.status }}</td>
          <td class="border px-4 py-2">
            <button
              @click="viewPolicyDetails(policy.id)"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              View Details
            </button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>

  <div v-if="!loading && policies.length === 0" class="text-center mt-6">
    <p>No policies found.</p>
  </div>
</template>

<style scoped>
/* Custom styling */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 12px;
}

th {
  background-color: #f4f4f4;
}

button {
  cursor: pointer;
}
</style>
