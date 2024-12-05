<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { DataTable } from "simple-datatables";
import { useRouter } from 'vue-router';


const router = useRouter();

// Define types
interface Patient {
  id: string;
  name: string;
  nik: string;
}

interface PatientDetails {
  id: string;
  name: string;
  username: string;
  email: string;
  gender: string;
  role: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  specialist: number;
  yearsOfExperience: number;
  fee: number | null;
  schedules: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  pclass: number;
}

interface Company {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

interface Coverage {
  id: number;
  name: string;
  coverageAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Reactive variables
const patients = ref<Patient[]>([]);
const selectedPatient = ref<string | null>(null);
const patientDetails = ref<PatientDetails | null>(null);

const companies = ref<Company[]>([]);
const selectedCompany = ref<string | null>(null);

const coverages = ref<Coverage[]>([]);

const loading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

const expiryDate = ref<string>('');

// Utility function to format date into yyyy-mm-dd
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Fetch patients data from API
const fetchPatients = async () => {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:8084/api/user/PATIENT`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (response.status === 200) {
      patients.value = data.data.map((patient: any) => ({
        id: patient.id,
        name: patient.name,
        nik: patient.nik,
      }));
      errorMessage.value = null; // Reset error message
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    errorMessage.value = 'Failed to fetch patients. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Fetch patient details from API
const fetchPatientDetails = async (patientId: string) => {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:8084/api/user/detail/id/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (response.status === 200) {
      // Format birthDate before setting it
      data.data.birthDate = formatDate(data.data.birthDate);
      patientDetails.value = data.data;
      errorMessage.value = null; // Reset error message
    }
  } catch (error) {
    console.error('Error fetching patient details:', error);
    errorMessage.value = 'Failed to fetch patient details. Please try again.';
  } finally {
    loading.value = false;
  }
};

const getInsuranceLimit = computed(() => {
  if (patientDetails.value) {
    switch (patientDetails.value.pclass) {
      case 1:
        return 'Rp50,000,000.00';
      case 2:
        return 'Rp35,000,000.00';
      case 3:
        return 'Rp25,000,000.00';
      default:
        return 'No Limit';
    }
  }
  return 'No Limit';
});

// Fetch company data from API
const fetchCompanies = async () => {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:8082/api/company/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (response.status === 200) {
      companies.value = data.data.map((company: any) => ({
        id: company.id,
        name: company.name,
      }));
      errorMessage.value = null; // Reset error message
    }
  } catch (error) {
    console.error('Error fetching companies:', error);
    errorMessage.value = 'Failed to fetch companies. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Fetch coverage data for a specific company
const fetchCoverages = async (companyId: string) => {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:8082/api/company/get_coverages?id=${companyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = await response.json();
    if (response.status === 200) {
      coverages.value = data.data;
      // Initialize DataTable after data is fetched
      setTimeout(() => {
        const table = new DataTable('#coverageTable'); // Initialize DataTable
      }, 0);
      errorMessage.value = null; // Reset error message
    }
  } catch (error) {
    console.error('Error fetching coverages:', error);
    errorMessage.value = 'Failed to fetch coverage details. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Watch for changes in selectedPatient and fetch corresponding patient details
watch(selectedPatient, (newPatientId) => {
  if (newPatientId) {
    fetchPatientDetails(newPatientId);
  } else {
    patientDetails.value = null; // Clear patient details if no patient is selected
  }
});

// Watch for changes in selectedCompany and fetch coverages for that company
watch(selectedCompany, (newCompanyId) => {
  if (newCompanyId) {
    fetchCoverages(newCompanyId);
  } else {
    coverages.value = []; // Clear coverages if no company is selected
  }
});

// Fetch patients and companies on mount
onMounted(() => {
  fetchPatients();
  fetchCompanies();
});


const submitForm = async () => {
  if (selectedPatient.value && selectedCompany.value && expiryDate.value) {
    loading.value = true;
    try {
      const response = await axios.post('http://localhost:8082/api/policy/create', {
        patientId: selectedPatient.value,
        companyId: selectedCompany.value,
        expiryDate: expiryDate.value,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        // Show success message
        alert('Policy Berhasil Dibuat');

        // Redirect to /insurance after confirmation
        router.push('/insurance');
      } else {
        alert('Failed to create policy. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating policy:', error);

      // Check if the error message matches the specific case
      if (error.response && error.response.data.message === "Policy tidak dapat dibuat. Patient class tidak cukup") {
        alert('Patient Class Tidak cukup. Lakukan upgrade patient class');
      } else {
        alert('There was an error creating the policy.');
      }
    } finally {
      loading.value = false;
    }
  } else {
    alert('Please select both a patient and a company before submitting.');
  }
};

</script>

<template>
  <div class="max-w-7xl mx-auto p-16 pt-20 w-full">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Create Policy</h1>
    <form @submit.prevent="submitForm" class="bg-white p-6 rounded-lg shadow-md">
      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center mb-4">
        <div class="spinner-border text-blue-500" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="text-red-600 text-center mb-4">
        {{ errorMessage }}
      </div>

      <!-- Expiry Date Input -->
      <div class="form-group mb-6">
        <label for="expiryDate" class="block text-lg font-medium text-gray-700">Expiry Date</label>
        <input
          v-model="expiryDate"
          type="date"
          id="expiryDate"
          class="form-control mt-2 p-3 w-full border border-gray-300 rounded-md"
          required
        />
      </div>


      <!-- Patient Dropdown -->
      <div class="form-group mb-6">
        <label for="patient" class="block text-lg font-medium text-gray-700">Patient</label>
        <select v-model="selectedPatient" id="patient" class="form-control mt-2 p-3 w-full border border-gray-300 rounded-md" required>
          <option value="" disabled>Select a patient</option>
          <option v-for="patient in patients" :key="patient.id" :value="patient.id">
            {{ patient.nik }} - {{ patient.name }}
          </option>
        </select>
      </div>

      <!-- Patient Details (conditionally rendered) -->
      <div v-if="patientDetails" class="patient-details mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 class="text-xl font-semibold text-gray-700 mb-4">Patient Details</h3>
        <p><strong>NIK:</strong> {{ patientDetails.nik }}</p>
        <p><strong>Name:</strong> {{ patientDetails.name }}</p>
        <p><strong>Gender:</strong> {{ patientDetails.gender }}</p>
        <p><strong>Birth Date:</strong> {{ patientDetails.birthDate }}</p>
        <p><strong>Patient Class:</strong> {{ patientDetails.pclass }}</p>
        <p><strong>Insurance Limit:</strong> {{ getInsuranceLimit }}</p>
      </div>

      <!-- Company Dropdown -->
      <div class="form-group mb-6">
        <label for="company" class="block text-lg font-medium text-gray-700">Company</label>
        <select v-model="selectedCompany" id="company" class="form-control mt-2 p-3 w-full border border-gray-300 rounded-md" required>
          <option value="" disabled>Select a company</option>
          <option v-for="company in companies" :key="company.id" :value="company.id">
            {{ company.name }}
          </option>
        </select>
      </div>

      <!-- Coverage Table -->
      <div v-if="coverages.length" class="mb-6">
        <h3 class="text-lg font-semibold mb-4">Available Coverages</h3>
        <table id="coverageTable" class="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th class="border-b p-2">Coverage ID</th> <!-- Added ID column header -->
              <th class="border-b p-2">Coverage Name</th>
              <th class="border-b p-2">Coverage Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coverage in coverages" :key="coverage.id">
              <td class="border-b p-2">{{ coverage.id }}</td> <!-- Display ID in the table -->
              <td class="border-b p-2">{{ coverage.name }}</td>
              <td class="border-b p-2">{{ coverage.coverageAmount }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Submit Button -->
      <div class="form-group mb-6">
        <button type="submit" class="btn btn-primary w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700">
          Create Policy
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Spinner Styles */
.spinner-border {
  border-width: 0.2em;
  border-color: #007bff transparent transparent transparent;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
