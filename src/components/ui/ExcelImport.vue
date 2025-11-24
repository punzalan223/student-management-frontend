<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import api from '@/lib/axios';

// FIX: Update defineEmits to accept the 'summary' payload
const emit = defineEmits<{
  (e: 'import-completed', summary: any): void; // summary required
  (e: 'close'): void;
}>();

const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const importStatus = ref('');
const importSummary = ref<any>(null);

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  selectedFile.value = target.files ? target.files[0] : null; // pick first file only
};

// Recursive polling function
const pollForSummary = async (attempts = 0) => {
  if (attempts >= 20) {
    importStatus.value = 'Polling timed out.';
    uploading.value = false;
    return;
  }

  try {
    const res = await api.get('/service-requests/import/summary');

    if (res.data.summary) {
      // Backend already returns JSON, assign directly
      importSummary.value = res.data.summary; 
      importStatus.value = 'Completed';
      uploading.value = false;

      // This call now matches the updated emit definition
      emit('import-completed', importSummary.value); 

    } else {
      console.log(`Job still processing (Attempt ${attempts + 1})...`);
      setTimeout(() => pollForSummary(attempts + 1), 3000);
    }
  } catch (err: any) {
    console.error('Polling error:', err);
    importStatus.value = 'Polling failed due to server error.';
    uploading.value = false;
  }
};

const uploadExcel = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  importStatus.value = 'Uploading...';
  importSummary.value = null;

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    await api.post('/service-requests/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    importStatus.value = 'Processing...';
    pollForSummary();

  } catch (err: any) {
    console.error(err);
    importStatus.value = 'Failed to upload or start processing.';
    uploading.value = false;
  }
};
</script>



<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-lg font-semibold text-neutral-900 mb-4">Import Service Requests</h2>

      <div class="flex flex-col gap-4">
        <input
          type="file"
          accept=".xlsx,.csv"
          @change="handleFileUpload"
          class="border rounded px-3 py-2"
        />
        <button
          @click="uploadExcel"
          :disabled="uploading || !selectedFile"
          class="px-4 py-2 rounded bg-neutral-600 text-white hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ uploading ? 'Processing...' : 'Upload' }}
        </button>
      </div>

      <div v-if="importStatus" class="mt-4 text-sm text-gray-700">
        Status: {{ importStatus }}
      </div>

      <!-- SUMMARY BLOCK -->
      <div v-if="importSummary" class="mt-4 text-sm text-gray-700">
        <p><strong>Total Rows Processed:</strong> {{ importSummary.rows_processed }}</p>
        <p><strong>Successful Requests:</strong> {{ importSummary.successful_requests }}</p>
        <p><strong>New Students Created:</strong> {{ importSummary.new_students }}</p>
        <p v-if="importSummary.skipped_rows.length">
          <strong>Skipped Rows:</strong>
          <ul class="list-disc ml-5">
            <li v-for="skip in importSummary.skipped_rows" :key="skip.row">
              Row {{ skip.row }}: {{ skip.reason }}
            </li>
          </ul>
        </p>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button @click="$emit('close')" class="px-3 py-2 rounded border hover:bg-gray-100">Close</button>
      </div>
    </div>
  </div>
</template>
