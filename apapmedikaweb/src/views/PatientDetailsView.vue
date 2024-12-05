<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Reactive state for patient details
const patient = ref<any>(null)
const loading = ref(true)
const errorMessage = ref('')

// Modal visibility state
const showModal = ref(false)
const showConfirmationModal = ref(false)
const newClass = ref<number | null>(null)

// Success message state
const successMessage = ref('')

// Fetch patient details using the ID from the route
const fetchPatientDetails = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:8084/api/patient/detail/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch patient details')

    const data = await response.json()
    console.log('API Patient Detail Response:', data)

    patient.value = data.data
  } catch (error) {
    errorMessage.value = 'Failed to load patient details.'
    console.error('Error fetching patient details:', error)
  } finally {
    loading.value = false
  }
}

// Get patient ID from route params and fetch details on mount
onMounted(() => {
  const patientId = route.params.id as string
  fetchPatientDetails(patientId)
})

// Function to handle the upgrade of patient class
const upgradePatientClass = async () => {
  if (newClass.value && newClass.value >= 1 && newClass.value <= 3) {
    showConfirmationModal.value = true
  } else {
    alert('Please enter a valid class between 1 and 3.')
  }
}

// Confirm the upgrade and call the API
const confirmUpgrade = async () => {
  try {
    const response = await fetch(`http://localhost:8084/api/admin/upgrade_patient?id=${patient.value.id}&patientClass=${newClass.value}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to upgrade patient class')

    // Refresh the patient details after successful upgrade
    fetchPatientDetails(patient.value.id)

    // Display success message
    successMessage.value = 'Patient class successfully upgraded!'

    // Auto-hide the success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

    // Close the modals
    showConfirmationModal.value = false
    showModal.value = false
  } catch (error) {
    console.error('Error upgrading patient class:', error)
    alert('Failed to upgrade patient class.')
  }
}

// Close the modal
const closeModal = () => {
  showModal.value = false
  newClass.value = null
}
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <p>Loading patient details...</p>
  </div>

  <div v-if="!loading && errorMessage" class="flex justify-center items-center min-h-screen">
    <p class="text-red-600">{{ errorMessage }}</p>
  </div>

  <div v-if="!loading && patient" class="flex justify-center items-center min-h-screen">
    <div class="max-w-4xl p-6 bg-white rounded-lg shadow-lg w-full">
      <h2 class="text-3xl font-semibold text-center mb-6">Patient Details</h2>

      <div class="space-y-4">
        <div>
          <strong class="font-semibold">Name:</strong> {{ patient.name }}
        </div>
        <div>
          <strong class="font-semibold">Username:</strong> {{ patient.username }}
        </div>
        <div>
          <strong class="font-semibold">Email:</strong> {{ patient.email }}
        </div>
        <div>
          <strong class="font-semibold">Gender:</strong> {{ patient.gender }}
        </div>
        <div>
          <strong class="font-semibold">NIK:</strong> {{ patient.nik }}
        </div>
        <div>
          <strong class="font-semibold">Birthplace:</strong> {{ patient.birthPlace }}
        </div>
        <div>
          <strong class="font-semibold">Birthdate:</strong> {{ new Date(patient.birthDate).toLocaleDateString() }}
        </div>
        <div>
          <strong class="font-semibold">Class:</strong> {{ patient.pclass }}
        </div>
        <div>
          <strong class="font-semibold">Created At:</strong> {{ new Date(patient.createdAt).toLocaleString() }}
        </div>
        <div>
          <strong class="font-semibold">Updated At:</strong> {{ new Date(patient.updatedAt).toLocaleString() }}
        </div>
      </div>

      <!-- Button to show the modal -->
      <div class="text-center mt-6">
        <button
          @click="showModal = true"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Upgrade Patient Class
        </button>
      </div>
    </div>
  </div>

  <!-- Success Message -->
  <div v-if="successMessage" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
    {{ successMessage }}
  </div>

  <!-- Modal for upgrading patient class -->
  <div v-if="showModal" class="fixed inset-0 bg-gray-500 flex justify-center items-center z-40">
    <div class="bg-white p-6 rounded-lg max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-4">Upgrade Patient Class</h3>
      <div class="mb-4">
        <label for="patientClass" class="block text-sm font-semibold">Enter Patient Class (1-3):</label>
        <input
          type="number"
          id="patientClass"
          v-model="newClass"
          min="1"
          max="3"
          class="border px-4 py-2 w-full rounded-md"
        />
      </div>
      <div class="flex justify-between">
        <button @click="closeModal" class="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
        <button @click="upgradePatientClass" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Upgrade</button>
      </div>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <div v-if="showConfirmationModal" class="fixed inset-0 bg-gray-500  flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded-lg max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-4">Are you sure you want to upgrade the class?</h3>
      <div class="flex justify-between">
        <button @click="showConfirmationModal = false" class="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
        <button @click="confirmUpgrade" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Yes</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal styles */
.fixed {
  position: fixed;
}

.bg-gray-500 {
  background-color: rgba(0, 0, 0, 0.5);
}

.bg-opacity-75 {
  opacity: 0.75;
}

.z-50 {
  z-index: 50;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.w-full {
  width: 100%;
}

.text-center {
  text-align: center;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

/* Success message styling */
.bg-green-500 {
  background-color: #38a169;
}

.shadow-lg {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
