<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Profile popup state
const profileMenuOpen = ref(false)
const profileMenuRef = ref<HTMLElement | null>(null)
const toggleProfileMenu = () => profileMenuOpen.value = !profileMenuOpen.value

// Close popup when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (profileMenuOpen.value && profileMenuRef.value && !profileMenuRef.value.contains(event.target as Node)) {
    profileMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// Only your real nav item
const navItems = [
  { name: 'Service Requests', icon: 'folder-search', path: '/service-requests' },
  { name: 'Student Management', icon: 'folder-open', path: '/student-management' },
]

const goTo = (path: string) => router.push(path)

const handleLogout = () => {
  authStore.logout();
  router.push('/');
}

</script>

<template>
  <div class="h-dvh flex">
    <!-- Sidebar -->
    <div class="flex flex-col max-w-xs h-full w-full bg-neutral-100">
      <div class="h-16 flex items-center justify-between px-6">
        <img class="h-10" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=neutral&shade=500" alt="Your Company" />
        <span class="rounded-full border bg-white px-6 py-1 text-xs">
          {{ authStore.user.role.charAt(0).toUpperCase() + authStore.user.role.slice(1) }}
        </span>
      </div>
      <div class="py-8 px-6 space-y-2 flex-1">
        <div 
          v-for="item in navItems" 
          :key="item.path"
          @click="goTo(item.path)"
          :class="[
            'flex items-center gap-4 cursor-pointer rounded-md p-2',
            route.path === item.path ? 'bg-gray-200/70' : 'hover:bg-gray-200'
          ]"
        >
          <!-- Service Requests icon -->
          <svg v-if="item.icon === 'folder-search'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-search">
            <path d="M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1"/>
            <path d="m21 21-1.9-1.9"/>
            <circle cx="17" cy="17" r="3"/>
          </svg>
          <svg v-if="item.icon === 'folder-open'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open-icon lucide-folder-open"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div class="py-8 px-6">
        <div class="">{{ authStore.user.name }}</div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Top bar -->
      <div class="h-16 border-b w-full flex items-center justify-end px-8 relative">
        <div ref="profileMenuRef" class="relative">
          <button @click="toggleProfileMenu" class="h-12 w-12 rounded-full border border-neutral-200 bg-white cursor-pointer flex items-center justify-center">
              <!-- Person Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A4 4 0 0112 15a4 4 0 016.879 2.804M12 12a5 5 0 100-10 5 5 0 000 10z" />
              </svg>
          </button>

          <!-- Popup menu -->
          <div v-if="profileMenuOpen" class="absolute right-0 w-32 rounded-md bg-white z-50 border border-gray-200 shadow-md cursor-pointer">
            <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
          </div>
        </div>
      </div>

      <!-- Main area -->
      <main class="flex-1 p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
