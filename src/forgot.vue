<script setup lang="ts">
import {ref, Ref} from 'vue';
import {XMarkIcon} from '@heroicons/vue/24/solid';

// variables
const domain: Ref<string> = ref('');

const darkMode: Ref<boolean> = ref(false);
const dialog: Ref<boolean> = ref(false);
const dialogTitle: Ref<string> = ref('');
const dialogText: Ref<string> = ref('');

const authCode: Ref<string> = ref('');
const newPassword: Ref<string> = ref('');
const errorNewPassword: Ref<string> = ref('');
const passwordConfirm: Ref<string> = ref('');

function openDialog(title: string, text: string) {
  dialogTitle.value = title;
  dialogText.value = text;
  dialog.value = true;
}

// when pressing escape, close the dialog
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dialog.value = false;
  }
});

function validatePassword(pass: string) {
  // must be at least 8 characters
  // must be alphanumeric with special characters (also spaces)
  // has at least one number

  if (pass === '') {
    return '';
  } else if (pass.length < 8) {
    return 'Password must be at least 8 characters!';
  } else if (!/^[a-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+$/i.test(pass)) {
    return 'Password must be alphanumeric with special characters!';
  } else if (!/\d/.test(pass)) {
    return 'Password must contain at least one number!';
  } else {
    return 'valid';
  }
}

async function handlePasswordReset (){
  try {
    const response = await fetch(`/auth/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `token=${encodeURIComponent(authCode.value)}&password=${encodeURIComponent(newPassword.value)}`,
    });

    const data = await response.json();

    if (data.success) {
      openDialog('Success', '');

      let countdown: number = 5.0;

      const interval = window.setInterval(() => {
        countdown -= 0.1;
        countdown = parseFloat(countdown.toFixed(1));
        if (countdown <= 0) {
          clearInterval(interval);
          window.location.href = '/';
        } else {
          dialogText.value = `Your password has been reset! Redirecting you to <a href="/home/">home</a> in ${countdown}s...`;
        }
      }, 100);
    } else {
      openDialog('Error', data.message);
    }
  } catch (e) {
    openDialog('Error', 'Something went wrong!');
  }
}

// Handle dark mode toggle
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  darkMode.value = e.matches;
});

window.addEventListener('load', () => {
  darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  domain.value = window.location.origin;
  // get the auth code from the url (token)
  const urlParams = new URLSearchParams(window.location.search);
  authCode.value = urlParams.get('token') || '';

  if (authCode.value === '') {
    openDialog('Error', 'No token provided!');
  }
});

</script>

<template>
  <!-- dialog -->
  <div class="model fixed inset-0 flex items-start justify-center pt-20" v-if="dialog">
    <!-- Overlay with blur effect -->
    <div class="absolute inset-0 bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 backdrop-blur-sm"
         @click="dialog = false"></div>
    <!-- Dialog content -->
    <div class="model__content p-6 glass-morphic-window w-96 absolute top-1/5 left-1/2 transform -translate-x-1/2">
      <div class="model__header flex justify-between items-center mb-4">
        <h2 class="model__title text-2xl font-semibold"> {{ dialogTitle }} </h2>
        <button class="model__close p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" @click="dialog = false">
          <XMarkIcon class="h-6 w-6"></XMarkIcon>
        </button>
      </div>
      <div class="model__body">
        <div v-html="dialogText"></div>
      </div>
    </div>
  </div>

  <!-- Password recovory form -->
  <div class="relative top-40">
    <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">

        <img v-if="darkMode" class="mx-auto h-10 w-auto" src="/src/assets/images/logo-dark.svg"
             alt="Organization logo dark version"/>
        <img v-else class="mx-auto h-10 w-auto" src="/src/assets/images/logo.svg" alt="Organization logo"/>

        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">Rest your password</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="handlePasswordReset">
          <div>
            <label for="password" class="block text-sm font-medium leading-6">New Password</label>
            <div class="mt-2">
              <input autocomplete="new-password" placeholder="Choose your password" v-model="newPassword"
                     :required="true"
                     type="password" @keyup="errorNewPassword = validatePassword(newPassword)"
                     class="global-input"/>
              <small v-if="errorNewPassword !== 'valid'" class="text-red-600 dark:text-red-400"> {{ errorNewPassword }}</small>
            </div>

            <div class="mt-2">
              <input autocomplete="new-password" placeholder="Confirm your password" v-model="passwordConfirm"
                     :required="true" type="password" class="global-input"/>
              <small v-if="(newPassword !== passwordConfirm) && errorNewPassword == 'valid'"
                     class="text-red-600 dark:text-red-400"> Password does not match! </small>
            </div>
          </div>

          <div>
            <button type="submit" :disabled="(newPassword !== passwordConfirm) || errorNewPassword !== 'valid'" class="big-green-button">
              Reset Password
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>
