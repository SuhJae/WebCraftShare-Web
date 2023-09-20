<script setup lang="ts">
import {onUnmounted, ref, Ref} from 'vue';
import {UserCircleIcon, XMarkIcon} from '@heroicons/vue/24/solid';

// variables
let interval: number | null = null;
const showUserDropdown: Ref<boolean> = ref(false);

const domain: Ref<string> = ref('');
const darkMode: Ref<boolean> = ref(false);

const dialog: Ref<boolean> = ref(false);
const dialogTitle: Ref<string> = ref('');
const dialogText: Ref<string> = ref('');
const isDialogCloseDisabled: Ref<boolean> = ref(false);
const logoutConfirm: Ref<boolean> = ref(false);

const userEmail: Ref<string> = ref('');
const userName: Ref<string> = ref('');

function toggleUserDropdown() {
  showUserDropdown.value = !showUserDropdown.value;
}

function openDialog(title: string, text: string) {
  dialogTitle.value = title;
  dialogText.value = text;
  dialog.value = true;
}

function closeDialog() {
  if (isDialogCloseDisabled.value) {
    return;
  }
  dialog.value = false;
  logoutConfirm.value = false;
  dialogTitle.value = '';
  dialogText.value = '';
}

function logoutCheck() {
  openDialog('Logout', 'Are you sure you want to logout?');
  logoutConfirm.value = true;
}

async function handleLogout() {
  closeDialog();

  try {
    const response = await fetch('/api/logout/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      isDialogCloseDisabled.value = true;
      openDialog('Returning to home', 'Successfully logged out');

      let countdown: number = 3.0;

      interval = window.setInterval(() => {
        countdown -= 0.1;
        countdown = parseFloat(countdown.toFixed(1));

        if (countdown <= 0) {
          clearInterval(interval!);
          window.location.href = '/';
        } else {
          dialogText.value = `Successfully logged out!<br>Returning to <a herf="/">home</a> in ${countdown}s...`;
        }
      }, 100);
    } else {
      openDialog('Error', 'Server returned an error while logging out. If this problem persists, try clearing your browser cache and cookies.');
    }
  } catch (error) {
    openDialog('Communication Error', 'Error occurred while communicating to the server while logging in. Please try again.');
  }
}

async function fetchUserInfo() {
  try {
    const response = await fetch('/api/userinfo/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      userEmail.value = data.email;
      userName.value = data.name;
    } else {
      openDialog('Server Returned Error', data.message);
    }
  } catch (error) {
    openDialog('Communication Error', 'Error occurred while communicating to the server while fetching user info. Please try again.');
  }
}


// when pressing escape, close the dialog
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDialog();
  }
});

// Handle dark mode toggle
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  darkMode.value = e.matches;
});

// when the page is loaded
window.addEventListener('load', () => {
  darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  domain.value = window.location.origin;
  fetchUserInfo();
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});

</script>

<template>
  <!-- Navbar -->
  <nav
      class="bg-slate-200 bg-opacity-40 dark:bg-slate-950 dark:bg-opacity-40 shadow-sm py-3 px-6 backdrop-blur-md sticky top-0 z-50 border-b border-opacity-20 border-slate-400 dark:border-opacity-20 dark:border-slate-200">
    <div class="flex items-center justify-between mx-auto px-4 w-full">

      <!-- Logo Section -->
      <div class="flex items-center space-x-2">
        <img v-if="darkMode" class="h-10 w-auto" src="/src/assets/images/logo-dark.svg" alt="WebCraftShare Logo">
        <img v-else class="h-10 w-auto" src="/src/assets/images/logo.svg" alt="WebCraftShare Logo">
        <span class="text-xl font-semibold hidden md:block">WebCraftShare</span>
        <span class="text-xl font-semibold md:hidden">WCS</span>
      </div>

      <!-- Right section: Currently Logged In Account, Logout Button, and Dropdown Menu Toggle -->
      <div class="flex items-center space-x-4">

        <!-- Desktop User Info and Logout Button -->
        <div class="flex items-center space-x-4 md:flex hidden text-right" id="navbarDropdown">
          <div class="text-gray-700 dark:text-white">
            <span class="font-semibold">Signed in as <span class="text-emerald-500">{{
                userName
              }}</span></span><br><small>{{ userEmail }}</small>
          </div>
          <button class="red-scary-button" @click="logoutCheck">Sign Out</button>
        </div>

        <!-- Mobile Dropdown Menu Toggle Button -->
        <button
            class="md:hidden p-2 hover:backdrop-blur-sm hover:backdrop-opacity-30 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md"
            @click="toggleUserDropdown">
          <UserCircleIcon class="h-6 w-6"></UserCircleIcon>
        </button>

        <!-- Dropdown menu for smaller screens -->
        <div class="glass-morphic-window absolute right-6 top-14  md:hidden" v-if="showUserDropdown"
             id="smallScreenMenu">
          <div class="p-4 border-b border-opacity-20 border-slate-400 dark:border-opacity-20 dark:border-slate-200">
            <span class="font-semibold">Signed in as: <span class="text-emerald-500">{{ userName }}</span></span>
            <br>
            <small>{{ userEmail }}</small>
          </div>
          <button class="w-full text-left p-4 text-red-500 font-semibold hover:text-white hover:bg-red-500 rounded-b-lg"
                  @click="logoutCheck"> Sign out
          </button>
        </div>
      </div>
    </div>
  </nav>


  <!-- dialog -->
  <div class="model fixed inset-0 flex items-start justify-center pt-20" v-if="dialog">
    <!-- Overlay with blur effect -->
    <div class="absolute inset-0 bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 backdrop-blur-sm"
         @click="closeDialog"></div>
    <!-- Dialog content -->
    <div class="model__content p-6 glass-morphic-window w-96 absolute top-1/5 left-1/2 transform -translate-x-1/2">
      <div class="model__header flex justify-between items-center mb-4">
        <h2 class="model__title text-2xl font-semibold"> {{ dialogTitle }} </h2>
        <button class="model__close p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" @click="closeDialog"
                v-if=!isDialogCloseDisabled>
          <XMarkIcon class="h-6 w-6"></XMarkIcon>
        </button>
      </div>
      <div class="model__body">
        <div v-html="dialogText"></div>
      </div>
      <div class="model__footer flex justify-end mt-4" v-if=logoutConfirm>
        <button class="just-a-button" @click="closeDialog">Cancel</button>
        <button class="red-scary-button ml-2" @click="handleLogout">Confirm</button>
      </div>
    </div>
  </div>

  <!-- test contents -->
  <div class=" max-w-screen-lg align-middle mx-auto">
    <div v-for="i in 100" :key="i" class="p-4">
      <h1>Test title</h1>
      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Expedita adipisci laboriosam, sit, eos voluptatem
        error
        voluptate possimus quisquam aliquid numquam odio deserunt voluptates non ea praesentium ipsa exercitationem.
        Sint,
        ipsam.</p>
    </div>
  </div>
</template>
