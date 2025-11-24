<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  const auth = useAuthStore();
  const router = useRouter();

  const email = ref('');
  const password = ref('');
  const error = ref<string | null>(null);
  const loading = ref(false);

  const handleLogin = async () => {
    loading.value = true;
    error.value = null;

    try {
      await auth.login(email.value, password.value);
      router.push('/service-requests');
    } catch (err: any) {
        error.value = auth.error || 'Login failed';
    } finally {
      loading.value = false;
    }
  }
</script>

<template>
  <div class="flex h-dvh flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-10">
      <div class="relative">
        <img class="mx-auto h-10 w-auto absolute -top-20 left-1/2 -translate-x-1/2" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=neutral&shade=500" alt="Your Company" />
        <div class="mt-10 text-center text-2xl/9 font-semibold tracking-tight text-neutral-900 dark:text-white">Sign in to your account</div>
        <div class="text-center text-neutral-700">Please enter your details to continue</div>
      </div>
      <form 
        @submit.prevent="handleLogin"
        class="space-y-6" 
      >
        <div>
            <div class="col-span-2">
              <input 
                v-model="email"
                id="email-address" 
                name="email" 
                type="email" 
                autocomplete="email" 
                required aria-label="Email address" 
                class="block w-full rounded-t-md bg-white px-3 py-1.5 text-base text-gray-900 outline -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:relative focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-gray-700 dark:placeholder:text-gray-500 dark:focus:outline-neutral-500" placeholder="Email" />
            </div>
            <div class="-mt-px">
              <input 
                v-model="password"
                id="password" 
                name="password" 
                type="password" 
                autocomplete="current-password" 
                required aria-label="Password" 
                class="block w-full rounded-b-md bg-white px-3 py-1.5 text-base text-gray-900 outline -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:relative focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-gray-700 dark:placeholder:text-gray-500 dark:focus:outline-neutral-500" placeholder="Password" />
            </div>
        </div>
        <div>
            <button type="submit" class="flex w-full justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 dark:bg-neutral-500 dark:shadow-none dark:hover:bg-neutral-400 dark:focus-visible:outline-neutral-500">Sign in</button>
        </div>
        <div class="mt-4 text-center text-sm text-red-600" v-if="error">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>
