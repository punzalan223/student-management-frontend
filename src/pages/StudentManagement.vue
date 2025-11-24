<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/lib/axios' // Use your custom axios instance

interface Student {
  id: number
  studentNumber: string
  firstName: string
  lastName: string
  gradeLevel: string
  email: string
  status: 'Active' | 'Inactive'
}

// State
const students = ref<Student[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const loading = ref(true)

const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
  perPage: 10,
  total: 0
})

const currentStudent = reactive<Student>({
  id: 0,
  studentNumber: '',
  firstName: '',
  lastName: '',
  gradeLevel: '',
  email: '',
  status: 'Active',
})

// Map snake_case from backend to camelCase
const mapStudent = (s: any): Student => ({
  id: s.id,
  studentNumber: s.student_number,
  firstName: s.first_name,
  lastName: s.last_name,
  gradeLevel: s.grade_level,
  email: s.email,
  status: s.status
})

// Fetch students
const fetchStudents = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get(`/students?page=${page}`)
    students.value = res.data.data.map(mapStudent)
    pagination.currentPage = res.data.current_page
    pagination.lastPage = res.data.last_page
    pagination.perPage = res.data.per_page
    pagination.total = res.data.total
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchStudents())

// Modal handlers
const openAddModal = () => {
  isEditing.value = false
  Object.assign(currentStudent, { id: 0, studentNumber: '', firstName: '', lastName: '', gradeLevel: '', email: '', status: 'Active' })
  showModal.value = true
}

const openEditModal = (student: Student) => {
  isEditing.value = true
  Object.assign(currentStudent, student)
  showModal.value = true
}

// Save student
const saveStudent = async () => {
  if (!currentStudent.studentNumber || !currentStudent.firstName || !currentStudent.lastName || !currentStudent.gradeLevel || !currentStudent.email) {
    alert('Please fill all required fields')
    return
  }

  const payload = {
    student_number: currentStudent.studentNumber,
    first_name: currentStudent.firstName,
    last_name: currentStudent.lastName,
    grade_level: currentStudent.gradeLevel,
    email: currentStudent.email,
    status: currentStudent.status
  }

  try {
    if (isEditing.value) {
      await api.put(`/students/${currentStudent.id}`, payload)
    } else {
      await api.post('/students', payload)
    }
    await fetchStudents(pagination.currentPage)
    showModal.value = false
  } catch (err) {
    console.error(err)
  }
}

// Delete student
const deleteStudent = async (id: number) => {
  if (!confirm('Are you sure you want to delete this student?')) return
  try {
    await api.delete(`/students/${id}`)
    await fetchStudents(pagination.currentPage)
  } catch (err) {
    console.error(err)
  }
}

// Pagination
const goToPage = (page: number) => {
  if (page < 1 || page > pagination.lastPage) return
  fetchStudents(page)
}
</script>

<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold text-gray-900">Student Management</h1>
        <p class="mt-2 text-sm text-gray-700">Manage all students including their details and status.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button @click="openAddModal" class="block rounded-md bg-neutral-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-neutral-500">
          Add Student
        </button>
      </div>
    </div>

    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow outline outline-black/5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Student Number</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">First Name</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Name</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Grade Level</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th class="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="loading">
                  <td colspan="7" class="text-center py-4 text-gray-500">Loading...</td>
                </tr>
                <tr v-else-if="students.length === 0">
                  <td colspan="7" class="text-center py-4 text-gray-500">No students found.</td>
                </tr>
                <tr v-else v-for="student in students" :key="student.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-sky-700">{{ student.studentNumber }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ student.firstName }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ student.lastName }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ student.gradeLevel }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ student.email }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ student.status }}</td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex gap-2 justify-end">
                    <button class="text-neutral-600 hover:text-neutral-900" @click="openEditModal(student)">Edit</button>
                    <button class="text-red-600 hover:text-red-900" @click="deleteStudent(student.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="pagination.lastPage > 1" class="flex justify-center mt-4 gap-2">
              <button @click="goToPage(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1" class="px-3 py-1 border rounded">Prev</button>
              <span>Page {{ pagination.currentPage }} of {{ pagination.lastPage }}</span>
              <button @click="goToPage(pagination.currentPage + 1)" :disabled="pagination.currentPage === pagination.lastPage" class="px-3 py-1 border rounded">Next</button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">{{ isEditing ? 'Edit Student' : 'Add Student' }}</h2>
        <form @submit.prevent="saveStudent" class="space-y-3">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Student Number</label>
                    <input
                    required
                    v-model="currentStudent.studentNumber"
                    type="text"
                    class="w-full border px-3 py-2 rounded mt-1"
                    placeholder="Enter student number"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                    required
                    v-model="currentStudent.firstName"
                    type="text"
                    class="w-full border px-3 py-2 rounded mt-1"
                    placeholder="Enter first name"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                    required
                    v-model="currentStudent.lastName"
                    type="text"
                    class="w-full border px-3 py-2 rounded mt-1"
                    placeholder="Enter last name"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Grade Level</label>
                    <input
                    required
                    v-model="currentStudent.gradeLevel"
                    type="text"
                    class="w-full border px-3 py-2 rounded mt-1"
                    placeholder="Enter grade level"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input
                    required
                    v-model="currentStudent.email"
                    type="email"
                    class="w-full border px-3 py-2 rounded mt-1"
                    placeholder="Enter email"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <select
                    v-model="currentStudent.status"
                    class="w-full border px-3 py-2 rounded mt-1"
                    >
                    <option>Active</option>
                    <option>Inactive</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <button type="button" @click="showModal = false" class="px-3 py-2 rounded border hover:bg-gray-100">Cancel</button>
                <button type="button" @click="saveStudent" class="px-3 py-2 rounded bg-neutral-600 text-white hover:bg-neutral-500">
                    {{ isEditing ? 'Update' : 'Add' }}
                </button>
            </div>
        </form>
      </div>
    </div>

  </div>
</template>
