<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import ExcelImport from '@/components/ui/ExcelImport.vue'

const authStore = useAuthStore();

interface Student {
  id: number
  first_name: string
  last_name: string
}

interface ServiceRequest {
  id: number
  student_id: number
  student_name: string
  service_type: 'ID Replacement' | 'Good Moral Certificate' | 'Form 137'
  date_requested: string
  status: 'Pending' | 'Approved' | 'Rejected'
  remarks?: string
}

const requests = ref<ServiceRequest[]>([])
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

const filters = reactive({
  status: '', 
  from: '',
  to: '' 
})

const currentRequest = reactive<ServiceRequest>({
  id: 0,
  student_id: 0,
  student_name: '',
  service_type: 'ID Replacement',
  date_requested: '',
  status: 'Pending',
  remarks: ''
})

// Excel import
const showExcelModal = ref(false)
const showSummaryModal = ref(false)
const importSummary = ref<any>(null)

const openExcelModal = () => {
  showExcelModal.value = true
}

const closeExcelModal = () => {
  showExcelModal.value = false
}

const handleImportCompleted = (summary: any) => {
  // Check if summary is a string, parse it
  if (typeof summary === 'string') {
    try {
      importSummary.value = JSON.parse(summary)
    } catch (err) {
      console.error('Failed to parse import summary:', err)
      importSummary.value = null
    }
  } else {
    importSummary.value = summary
  }

  console.log('Import Summary:', importSummary.value)
  showSummaryModal.value = true
  fetchStudents()
  closeExcelModal()
}

const closeSummaryModal = () => {
  showSummaryModal.value = false
  importSummary.value = null
}

// Fetch requests
const fetchRequests = async (page = 1) => {
  loading.value = true
  try {
    let url = `/service-requests?page=${page}`

    if (filters.status) url += `&status=${filters.status}`
    if (filters.from) url += `&from=${filters.from}`
    if (filters.to) url += `&to=${filters.to}`

    const res = await api.get(url)
    requests.value = res.data.data.map((r: any) => ({
      id: r.id ?? 0,
      student_id: r.student?.id ?? 0,
      student_name: r.student ? `${r.student.first_name} ${r.student.last_name}` : 'Unknown',
      service_type: r.service_type ?? 'ID Replacement',
      date_requested: r.date_requested ?? '',
      status: r.status ?? 'Pending',
      remarks: r.remarks ?? ''
    }))
    pagination.currentPage = res.data.current_page ?? 1
    pagination.lastPage = res.data.last_page ?? 1
    pagination.perPage = res.data.per_page ?? 10
    pagination.total = res.data.total ?? 0
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Fetch students
const fetchStudents = async () => {
  try {
    const res = await api.get('/students')
    students.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchRequests()
  fetchStudents()
})

// Add/Edit request
const openAddModal = () => {
  isEditing.value = false
  Object.assign(currentRequest, {
    id: 0,
    student_id: 0,
    student_name: '',
    service_type: 'ID Replacement',
    date_requested: '',
    status: 'Pending',
    remarks: ''
  })
  showModal.value = true
}

const openEditModal = (request: ServiceRequest) => {
  isEditing.value = true
  Object.assign(currentRequest, {
    id: request.id ?? 0,
    student_id: request.student_id ?? 0,
    student_name: request.student_name ?? 'Unknown',
    service_type: request.service_type ?? 'ID Replacement',
    date_requested: request.date_requested ?? '',
    status: request.status ?? 'Pending',
    remarks: request.remarks ?? ''
  })
  showModal.value = true
}

// Save request
const saveRequest = async () => {
  if (!currentRequest.student_id || !currentRequest.service_type || !currentRequest.date_requested) {
    alert('Please fill all required fields')
    return
  }

  const payload = {
    student_id: currentRequest.student_id,
    service_type: currentRequest.service_type,
    date_requested: currentRequest.date_requested,
    status: currentRequest.status,
    remarks: currentRequest.remarks
  }

  try {
    if (isEditing.value) {
      await api.put(`/service-requests/${currentRequest.id}`, payload)
    } else {
      await api.post('/service-requests', payload)
    }
    await fetchRequests(pagination.currentPage)
    showModal.value = false
  } catch (err) {
    console.error(err)
  }
}

// Delete request
const deleteRequest = async (id: number) => {
  if (!confirm('Are you sure you want to delete this request?')) return
  try {
    await api.delete(`/service-requests/${id}`)
    await fetchRequests(pagination.currentPage)
  } catch (err) {
    console.error(err)
  }
}

// Pagination
const goToPage = (page: number) => {
  if (page < 1 || page > pagination.lastPage) return
  fetchRequests(page)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold text-gray-900">Service Requests</h1>
        <p class="mt-2 text-sm text-gray-700">Manage all student service requests.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button @click="openAddModal" class="block rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-500">
          Add Request
        </button>
      </div>
    </div>

    <!-- Filters & Bulk Import -->
    <div class="flex justify-between gap-2 mt-4 flex-wrap">
      <div class="flex items-end gap-2">
        <button @click="openExcelModal" class="px-3 py-2 rounded border hover:bg-gray-100">Bulk Import</button>
        <ExcelImport
          v-if="showExcelModal"
          @close="showExcelModal = false"
          @import-completed="handleImportCompleted"
        />
      </div>

      <div class="flex gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="filters.status" class="border px-3 py-2 rounded mt-1">
            <option value="">All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">From</label>
          <input type="date" v-model="filters.from" class="border px-3 py-2 rounded mt-1" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">To</label>
          <input type="date" v-model="filters.to" class="border px-3 py-2 rounded mt-1" />
        </div>
        <div class="flex items-end gap-2">
          <button @click="fetchRequests(1)" class="px-3 py-2 rounded bg-neutral-600 text-white hover:bg-neutral-500">Filter</button>
          <button @click="Object.assign(filters, { status: '', from: '', to: '' }); fetchRequests(1)" class="px-3 py-2 rounded border hover:bg-gray-100">Clear</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="mt-4 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow outline outline-black/5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Student</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service Type</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date Requested</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Remarks</th>
                  <th class="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="loading">
                  <td colspan="6" class="text-center py-4 text-gray-500">Loading...</td>
                </tr>
                <tr v-else-if="requests.length === 0">
                  <td colspan="6" class="text-center py-4 text-gray-500">No requests found.</td>
                </tr>
                <tr v-else v-for="request in requests" :key="request.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{{ request.student_name }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ request.service_type }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ request.date_requested }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ request.status }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{{ request.remarks }}</td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex gap-2 justify-end">
                    <button class="text-neutral-600 hover:text-neutral-900" @click="openEditModal(request)">Edit</button>
                    <button v-if="authStore.user.role == 'admin'" class="text-red-600 hover:text-red-900" @click="deleteRequest(request.id)">Delete</button>
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

    <!-- Add/Edit Request Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">{{ isEditing ? 'Edit Request' : 'Add Request' }}</h2>
        <form @submit.prevent="saveRequest" class="space-y-3">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Student</label>
              <select v-model="currentRequest.student_id" class="w-full border px-3 py-2 rounded mt-1" required>
                <option value="" disabled>Select student</option>
                <option v-for="student in students" :key="student.id" :value="student.id">
                  {{ student.first_name }} {{ student.last_name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Service Type</label>
              <select v-model="currentRequest.service_type" class="w-full border px-3 py-2 rounded mt-1">
                <option>ID Replacement</option>
                <option>Good Moral Certificate</option>
                <option>Form 137</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Date Requested</label>
              <input v-model="currentRequest.date_requested" type="date" class="w-full border px-3 py-2 rounded mt-1" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select v-model="currentRequest.status" class="w-full border px-3 py-2 rounded mt-1">
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea v-model="currentRequest.remarks" class="w-full border px-3 py-2 rounded mt-1" placeholder="Optional remarks"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" @click="showModal = false" class="px-3 py-2 rounded border hover:bg-gray-100">Cancel</button>
            <button type="button" @click="saveRequest" class="px-3 py-2 rounded bg-neutral-600 text-white hover:bg-neutral-500">
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Excel Import Summary Modal -->
    <div v-if="showSummaryModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">📊 Import Summary</h2>
        <div class="space-y-2 max-h-96 overflow-y-auto text-sm text-gray-700">
        
        <p>📝 <strong>Total Rows Processed:</strong> {{ Number(importSummary?.rows_processed || 0) - 1 }}</p>
        <p>✅ <strong>Successful Requests:</strong> {{ importSummary?.successful_requests ?? 0 }}</p>
        <p>🆕 <strong>New Students Created:</strong> {{ importSummary?.new_students ?? 0 }}</p>

        
        <div v-if="importSummary?.skipped_rows?.length" class="mt-2">
            <p>⚠️ <strong>Skipped Rows:</strong></p>
            <ul class="list-disc list-inside ml-5 text-red-600 mt-2">
                <li v-for="skip in importSummary.skipped_rows" :key="skip.row">
                    ❌ Row {{ skip.row }}: {{ skip.reason }}
                </li>
            </ul>
        </div>

        </div>

        <div class="flex justify-end mt-4">
            <button 
                @click="closeSummaryModal(); fetchRequests()" 
                class="px-4 py-2 rounded bg-neutral-100 border-neutral-400 border hover:bg-neutral-200"
            >
                ✖️ Close
            </button>
        </div>
    </div>
    </div>
  </div>
</template>
