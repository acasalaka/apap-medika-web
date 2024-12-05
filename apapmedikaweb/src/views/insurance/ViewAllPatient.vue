<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive state variables
const patients = ref<any[]>([])
const loading = ref(true)
const errorMessage = ref('')

// Function to fetch all patients
const fetchPatients = async () => {
  try {
    const response = await fetch('http://localhost:8084/api/patient/viewall', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch patients')

    const data = await response.json()
    console.log('API Patients Response:', data)

    patients.value = data.data
  } catch (error) {
    errorMessage.value = 'Failed to load patient data.'
    console.error('Error fetching patients:', error)
  } finally {
    loading.value = false
  }
}

// Navigate to the patient's details page
const viewPatientDetails = (patientId: string) => {
  router.push({ name: 'PatientDetails', params: { id: patientId } })
}

// Fetch patients when component is mounted
onMounted(fetchPatients)
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <p>Loading patient data...</p>
  </div>

  <div v-if="!loading && errorMessage" class="flex justify-center items-center min-h-screen">
    <p class="text-red-600">{{ errorMessage }}</p>
  </div>

  <div v-if="!loading && patients.length > 0" class="flex flex-col items-center py-6">
    <!-- Centered title -->
    <h2 class="text-3xl font-semibold mb-6 text-center">All Patients</h2>

    <!-- Centered card/container for patients list -->
    <div class="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6">
      <table class="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th class="px-4 py-2 border-b">Patient ID</th>
            <th class="px-4 py-2 border-b">Name</th>
            <th class="px-4 py-2 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in patients" :key="patient.id">
            <td class="px-4 py-2 border-b">{{ patient.id }}</td>
            <td class="px-4 py-2 border-b">{{ patient.name }}</td>
            <td class="px-4 py-2 border-b text-center">
              <button
                @click="viewPatientDetails(patient.id)"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles to center the title and card properly */
h2 {
  text-align: center;
  margin-top: 100px; /* Add margin to move the title down below the navbar */
}

table {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  text-align: left;
  padding: 12px 16px;
}

th {
  background-color: #f7fafc;
  font-weight: bold;
}

button {
  cursor: pointer;
}

button:hover {
  background-color: #3182ce;
}

/* Ensures the card itself is centered with proper spacing */
.max-w-4xl {
  margin-top: 20px;
}
</style>
