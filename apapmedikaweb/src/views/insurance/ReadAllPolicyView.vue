<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import axios from 'axios';
import { DataTable } from 'simple-datatables';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'vue-router';

const router = useRouter();

// Reactive state for policies, filters, and loading state
const policies = ref<any[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const role = ref<'ADMIN' | 'PATIENT'>('ADMIN');
const statusFilter = ref<string>(''); // To filter by status
const minCoverage = ref<number | null>(null);
const maxCoverage = ref<number | null>(null);
const patientId = ref(''); // Patient ID for patient role

const decodeJWT = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    console.log('Decoded JWT:', decoded); // Debug log
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

// Get role dynamically (for example, from localStorage or route params)
onMounted(async () => {
  role.value = localStorage.getItem('role') as 'ADMIN' | 'PATIENT'; // Or get from route params
  if (role.value === 'PATIENT') {
    patientId.value = localStorage.getItem('patientId') || ''; // Assuming patient ID is stored in localStorage
  }
  const token = localStorage.getItem('authToken');

  if (token) {
    console.log('Auth Token:', token);
    const decoded = decodeJWT(token);
    if (decoded && decoded.sub) { // Use 'sub' for email as per JWT generation
      const email = decoded.sub;
      await fetchUserId(email);
    } else {
      console.warn('Invalid or missing email (sub) in JWT. Decoded JWT:', decoded);
    }
  } else {
    console.warn('No token found in localStorage');
  }
  fetchPolicies();
});

// Fetch user role based on email
const fetchUserId = async (email: string) => {
  try {
    const response = await fetch(`http://localhost:8084/api/user/detail/${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Failed to fetch role');

    const data = await response.json();
    console.log('API Role Response:', data);

    patientId.value = data.data.id;

  } catch (error) {
    console.error('Error fetching user role:', error);
  }
};

// Watch for changes in the `policies` array to reinitialize DataTable
watch(policies, () => {
  initializeDataTable();
});

// Fetch policies from API based on the role
const fetchPolicies = async () => {
  loading.value = true;
  try {
    let url = '';

    if (role.value === 'ADMIN') {
      url = 'http://localhost:8081/api/policy/admin/all';
    } else if (role.value === 'PATIENT' && patientId.value) {
      url = `http://localhost:8081/api/policy/patient/all?id=${patientId.value}`;
    }

    if (role.value === 'PATIENT' && patientId.value){
      if (minCoverage.value !== null && maxCoverage.value !== null && statusFilter.value) {
        url += `&status=${statusFilter.value}&min=${minCoverage.value}&max=${maxCoverage.value}`;
      }

      else if (statusFilter.value) {
        url += `&status=${statusFilter.value}`;
      }
      else if (minCoverage.value !== null && maxCoverage.value !== null) {
        url += `&min=${minCoverage.value}&max=${maxCoverage.value}`;
      }
    }

    if (minCoverage.value !== null && maxCoverage.value !== null && statusFilter.value) {
      url += `?status=${statusFilter.value}&min=${minCoverage.value}&max=${maxCoverage.value}`;
    }

    else if (statusFilter.value) {
      url += `?status=${statusFilter.value}`;
    }
    else if (minCoverage.value !== null && maxCoverage.value !== null) {
      url += `?min=${minCoverage.value}&max=${maxCoverage.value}`;
    }

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

// Initialize DataTable
const initializeDataTable = () => {
  nextTick(() => {
    if (
      document.getElementById('policyTable') &&
      typeof DataTable !== 'undefined'
    ) {
      new DataTable('#policyTable', {
        searchable: true,
        sortable: true,
      });

      // Rebind event listener after DataTable renders
      bindViewDetailsEvents();
    }
  });
};

// Function to bind the 'View Details' event listener
const bindViewDetailsEvents = () => {
  const buttons = document.querySelectorAll('.view-policy-btn');
  buttons.forEach((button: any) => {
    button.addEventListener('click', () => {
      const policyId = button.getAttribute('data-policy-id');
      viewPolicyDetails(policyId);
    });
  });
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

// Navigate to the patient's details page
const viewPolicyDetails = (policyId: string) => {
  router.push({ name: 'PolicyDetails', params: { id: policyId } })
}

</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen pt-16 w-full">
    <p>Loading policies...</p>
  </div>

  <div v-if="!loading" class="max-w-7xl mx-auto p-6 pt-20 w-full">

    <!-- Filters -->
    <div class="flex space-x-4 mb-4">
      <select v-model="statusFilter" @change="handleStatusFilter(statusFilter)" class="border px-4 py-2 rounded-md">
        <option value="">All Status</option>
        <option value="Created">Created</option>
        <option value="Partially Claimed">Partially Claimed</option>
        <option value="Fully Claimed">Fully Claimed</option>
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

      <!-- Conditionally render the "Create Policy" button for ADMIN -->
      <div v-if="role === 'ADMIN'">
        <RouterLink to="/policy/create">
          <button class="bg-green-600 text-white px-4 py-2 rounded-lg">Create Policy</button>
        </RouterLink>
      </div>
    </div>

    <!-- DataTable -->
    <table id="policyTable" class="min-w-full table-auto border-collapse">
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
        <tr v-if="policies.length === 0">
          <td colspan="6" class="text-center py-4">No data available</td>
        </tr>

        <tr v-for="policy in policies" :key="policy.id">
          <td class="border px-4 py-2">{{ policy.id }}</td>
          <td class="border px-4 py-2">{{ policy.patientId }}</td>
          <td class="border px-4 py-2">{{ policy.companyName }}</td>
          <td class="border px-4 py-2">{{ policy.totalCoverage }}</td>
          <td class="border px-4 py-2">{{ policy.status }}</td>
          <td class="border px-4 py-2">
            <button
              class="bg-blue-500 text-white px-4 py-2 rounded-lg view-policy-btn"
              :data-policy-id="policy.id"
            >
              View Details
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="policies.length === 0" class="text-center mt-6">
      <p>No policies found.</p>
    </div>
  </div>
</template>
