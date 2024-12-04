<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Form fields
const name = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const gender = ref<boolean | null>(null);
const role = ref('');
const nik = ref('');
const birthPlace = ref('');
const birthDate = ref('');
const patientClass = ref<number | null>(null);
const specialist = ref<number | null>(null); // The specialist value will be numeric (1-16)
const yearsOfExperience = ref<number | null>(null);
const fee = ref<number | null>(null);
const schedules = ref<{ day: number | null }[]>([]); // Store the schedules as an array of objects

const errorMessage = ref('');
const loading = ref(false);

const roles = ['ADMIN', 'NURSE', 'PATIENT', 'DOCTOR'];

// Mapping days to values (Sunday = 1, Monday = 2, ..., Saturday = 7)
const availableDays = [
  { name: 'Sunday', value: 1 },
  { name: 'Monday', value: 2 },
  { name: 'Tuesday', value: 3 },
  { name: 'Wednesday', value: 4 },
  { name: 'Thursday', value: 5 },
  { name: 'Friday', value: 6 },
  { name: 'Saturday', value: 7 },
];

// Mapping specialist values to text
const specialistOptions = [
  { value: 1, text: "GGI" },
  { value: 2, text: "ANK" },
  { value: 3, text: "BDH" },
  { value: 4, text: "PRE" },
  { value: 5, text: "JPD" },
  { value: 6, text: "KKL" },
  { value: 7, text: "MTA" },
  { value: 8, text: "OBG" },
  { value: 9, text: "PDL" },
  { value: 10, text: "PRU" },
  { value: 11, text: "THT" },
  { value: 12, text: "RAD" },
  { value: 13, text: "KSJ" },
  { value: 14, text: "ANS" },
  { value: 15, text: "NRO" },
  { value: 16, text: "URO" },
  { value: -1, text: "UMM" }, // Default option
];

// Add a new schedule row
const addSchedule = () => {
  schedules.value.push({ day: null });
};

// Remove a schedule row
const removeSchedule = (index: number) => {
  schedules.value.splice(index, 1);
};

// Register function
const register = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const body: any = {
      name: name.value,
      username: username.value,
      email: email.value,
      password: password.value,
      gender: gender.value,
      role: role.value,
    };

    // Add Patient-specific fields if role is Patient
    if (role.value === 'PATIENT') {
      body.nik = nik.value;
      body.birthPlace = birthPlace.value;
      body.birthDate = birthDate.value;
      body.patientClass = patientClass.value;
    }

    // Add Doctor-specific fields if role is Doctor
    if (role.value === 'DOCTOR') {
      body.specialist = specialist.value;
      body.yearsOfExperience = yearsOfExperience.value;
      body.fee = fee.value;
      body.schedules = schedules.value.map(schedule => schedule.day); // Send only the day values
    }

    const response = await fetch('http://localhost:8084/api/user/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Registration failed. Please try again.');
    }

    const responseData = await response.json();
    // Handle success
    router.push('/login'); // Redirect to login after successful registration
  } catch (error) {
    console.error('Error during registration:', error);
    errorMessage.value = error.message || 'An unexpected error occurred.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen">
    <h2 class="text-2xl font-bold text-center mb-6">Register</h2> <!-- Title moved outside the card -->
    <div class="w-full max-w-md p-6 bg-white rounded shadow">
      <form @submit.prevent="register" class="space-y-4">

        <!-- Other form fields (name, username, email, password, etc.) -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            v-model="name"
            id="name"
            type="text"
            class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            v-model="username"
            id="username"
            type="text"
            class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            id="email"
            type="email"
            class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label for="gender" class="block text-sm font-medium text-gray-700">Gender</label>
          <select
            v-model="gender"
            id="gender"
            class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="null" disabled selected>Select Gender</option>
            <option value="false">Male</option>
            <option value="true">Female</option>
          </select>
        </div>

        <!-- Role Selector -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
          <select
            v-model="role"
            id="role"
            class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          >
            <option v-for="roleOption in roles" :key="roleOption" :value="roleOption">{{ roleOption }}</option>
          </select>
        </div>

        <!-- Dynamic Fields for Doctor -->
        <div v-if="role === 'DOCTOR'">
          <div>
            <label for="specialist" class="block text-sm font-medium text-gray-700">Specialist</label>
            <select
              v-model="specialist"
              id="specialist"
              class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
              required
            >
              <option v-for="option in specialistOptions" :key="option.value" :value="option.value">
                {{ option.text }}
              </option>
            </select>
          </div>
          <div>
            <label for="yearsOfExperience" class="block text-sm font-medium text-gray-700">Years of Experience</label>
            <input
              v-model="yearsOfExperience"
              id="yearsOfExperience"
              type="number"
              class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label for="fee" class="block text-sm font-medium text-gray-700">Fee</label>
            <input
              v-model="fee"
              id="fee"
              type="number"
              class="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <!-- Schedule Fields -->
        <div v-if="role === 'DOCTOR'">
          <div v-for="(schedule, index) in schedules" :key="index">
            <label :for="'schedule_' + index" class="block text-sm font-medium text-gray-700">Schedule Day {{ index + 1 }}</label>
            <div class="flex items-center space-x-2">
              <select
                v-model="schedule.day"
                :id="'schedule_' + index"
                class="block w-1/2 px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="null" disabled>Select Day</option>
                <option v-for="day in availableDays" :key="day.value" :value="day.value">
                  {{ day.name }}
                </option>
              </select>
              <button
                @click="removeSchedule(index)"
                type="button"
                class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
          <button
            @click="addSchedule"
            type="button"
            class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Schedule
          </button>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center space-x-4 mt-4">
          <button
            type="submit"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            :disabled="loading"
          >
            Register
          </button>
        </div>
      </form>

      <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>
    </div>
  </main>
</template>



<style scoped>
/* Add your styling here */
</style>
