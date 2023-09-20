<script setup lang="ts">
import {computed, ref, Ref} from 'vue';
import {XMarkIcon} from '@heroicons/vue/24/solid';

// variables
const domain: Ref<string> = ref('');

const darkMode: Ref<boolean> = ref(false);
const dialog: Ref<boolean> = ref(false);
const dialogTitle: Ref<string> = ref('');
const dialogText: Ref<string> = ref('');

const errorEmail: Ref<string> = ref('');
const email: Ref<string> = ref('');
const password: Ref<string> = ref('');
const organizationName: Ref<string> = ref('');
const organizationEmail: Ref<string> = ref('');

const passwordReset: Ref<boolean> = ref(false);
const recovoryEmail: Ref<string> = ref('');
const errorRecovoryEmail: Ref<string> = ref('');

const verifyEmail: Ref<boolean> = ref(false);
const signUpEmail: Ref<string> = ref('');
const errorSignUpEmail: Ref<string> = ref('');

const signUp: Ref<boolean> = ref(false);
const authCode: Ref<string> = ref('');
const userNameStatus: Ref<string> = ref('');
const userName: Ref<string> = ref('');
const newPassword: Ref<string> = ref('');
const errorNewPassword: Ref<string> = ref('');
const passwordConfirm: Ref<string> = ref('');

const isSubmitting: Ref<boolean> = ref(false);
const passwordErrorMsg: Ref<string> = ref('');

const userNameStatusCache: { [key: string]: string } = {};


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

// check if the email is valid
function validateEmail(email: string) {
  const re = /\S+@\S+\.\S+/; // check if the email is valid
  // check if the email is from the organization
  const org = new RegExp(`@${organizationEmail.value}$`);

  if (email === '') {
    return '';
  } else if (!re.test(email)) {
    return 'Please enter a valid email!';
  } else if (!org.test(email)) {
    return `Please enter a ${organizationName.value} (${organizationEmail.value}) email!`;
  } else {
    return 'valid';
  }
}

async function validateUserName(userName: string) {
  // must be at least 3 characters
  // must be less than 20 characters
  // must be alphanumeric

  if (userName === '') {
    return '';
  } else if (userName.length < 3) {
    return 'Nickname must be at least 3 characters!';
  } else if (userName.length > 20) {
    return 'Nickname must be less than 20 characters!';
  } else if (!/^[a-z0-9]+$/i.test(userName)) {
    return 'Nickname must be alphanumeric!';
  }

  if (userNameStatusCache[userName]) {
    if (userNameStatusCache[userName] === 'r') {
      return 'Nickname is reserved!';
    } else if (userNameStatusCache[userName] === 'e') {
      return 'Nickname already exists!';
    } else if (userNameStatusCache[userName] === 'v') {
      return 'valid';
    }
  }

  userNameStatus.value = 'checking . . .';

  // Check if username is duplicate
  const response = await fetch(`/auth/checkhandle?handle=${encodeURIComponent(userName)}`);
  const data = await response.json();

  if (data.reserved) {
    userNameStatusCache[userName] = 'r';
    return 'Nickname is reserved!';
  }
  else if (data.exists) {
    userNameStatusCache[userName] = 'e';
    return 'Nickname already exists!';
  }
  userNameStatusCache[userName] = 'v';
  return 'valid';
}

async function handleNicknameKeyUp() {
  userNameStatus.value = await validateUserName(userName.value);
}

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

async function handleLogin() {

  isSubmitting.value = true;

  try {
    const response = await fetch('/auth/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email.value)}&password=${encodeURIComponent(password.value)}`,
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "/home/";
    } else {
      passwordErrorMsg.value = data.message;
    }
  } catch (error) {
    openDialog('Communication Error', 'Error occurred while communicating to the server while logging in. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
}

async function handlePasswordReset() {
  try {
    const response = await fetch('/auth/forgot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(recovoryEmail.value)}`,
    });

    const data = await response.json();
    passwordReset.value = false;
    recovoryEmail.value = '';
    openDialog('Check your email!', data.message);
  } catch (error) {
    openDialog('Communication Error', 'Error occurred while communicating to the server while resetting password. Please try again.');
  }
}

async function handleSignUpEmail() {
  const response = await fetch(`/auth/authmail?email=${encodeURIComponent(signUpEmail.value)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded&',
    },
  });

  const data = await response.json();

  if (!data.success) {
    openDialog('Error', data.message);
    return;
  }
  else {
    openDialog('Check your email!', data.message);
    verifyEmail.value = false;
    signUp.value = true;
  }
}

async function handleSignUp() {
  try {
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(signUpEmail.value)}&code=${encodeURIComponent(authCode.value)}&handle=${encodeURIComponent(userName.value)}&password=${encodeURIComponent(newPassword.value)}`,
    });

    const data = await response.json();

    if (data.success) {
      signUp.value = false;
      openDialog('Success', 'Successfully signed up! You will be redirected to <a href="/home/">home</a> in 3 seconds.');

      let countdown: number = 5.0;

      const interval = window.setInterval(() => {
        countdown -= 0.1;
        countdown = parseFloat(countdown.toFixed(1));

        if (countdown <= 0) {
          clearInterval(interval);
          window.location.href = '/home/';
        } else {
          dialogText.value = `Successfully signed up!<br>Sigining in to <a href="/home/">home</a> in ${countdown}s...`;
        }
      }, 100);
    } else {
      openDialog('Error', data.message);
    }
  } catch (error) {
    openDialog('Communication Error', 'Error occurred while communicating to the server while signing up. Please try again.');
  }


}

async function fetchOrganizationInfo() {
  try{
    const response = await fetch('/auth/org');
    const data = await response.json();
    organizationName.value = data.name;
    organizationEmail.value = data.email;
  }
  catch (error) {
    openDialog('Communication Error', 'Error occurred while communicating to the server while fetching organization info. Please try again.');
  }
}


// Handle dark mode toggle
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  darkMode.value = e.matches;
});

window.addEventListener('load', () => {
  darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  domain.value = window.location.origin;
  fetchOrganizationInfo();
});

// computed
const signUpValid: Ref<boolean> = computed(() => {
  return (errorSignUpEmail.value === 'valid') && (userNameStatus.value === 'valid') && (errorNewPassword.value === 'valid') && (newPassword.value === passwordConfirm.value);
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

  <!-- Password recovory -->
  <div class="dialog fixed inset-0 flex items-start justify-center pt-20" v-if="passwordReset">
    <!-- Overlay with blur effect -->
    <div class="absolute inset-0 bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 backdrop-blur-sm"
         @click="passwordReset = false"></div>
    <!-- Dialog content -->
    <div class="model__content p-6 glass-morphic-window w-96 absolute top-1/5 left-1/2 transform -translate-x-1/2">
      <div class="dialog__header flex justify-between items-center mb-4">
        <h2 class="dialog__title text-2xl font-semibold"> Password recovery </h2>
        <button class="dialog__close p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                @click="passwordReset = false">
          <XMarkIcon class="h-6 w-6"></XMarkIcon>
        </button>
      </div>
      <div class="dialog__body">
        <form class="space-y-6" @submit.prevent="handlePasswordReset">
          <div>
            <label for="email" class="block text-sm font-medium leading-6">Email address</label>
            <div class="mt-2">
              <input autocomplete="email" placeholder="Enter your email" v-model="recovoryEmail" :required="true"
                     @keyup="errorRecovoryEmail = validateEmail(recovoryEmail)" class="glass-morphic-input"/>
              <small v-if="errorRecovoryEmail !== 'valid'" class="text-red-600 dark:text-red-400"> {{
                  errorRecovoryEmail
                }}</small>
            </div>
          </div>
          <div>
            <button type="submit" :disabled="errorRecovoryEmail !== 'valid'" class="big-green-button">Send email
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Sign up Email verification -->
  <div class="dialog fixed inset-0 flex items-start justify-center pt-20" v-if="verifyEmail">
    <!-- Overlay with blur effect -->
    <div class="absolute inset-0 bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 backdrop-blur-sm"
         @click="verifyEmail = false"></div>
    <!-- Dialog content -->
    <div class="model__content p-6 glass-morphic-window w-96 absolute top-1/5 left-1/2 transform -translate-x-1/2">
      <div class="dialog__header flex justify-between items-center mb-4">
        <h2 class="dialog__title text-2xl font-semibold"> Enter your {{ organizationName }} email! </h2>
        <button class="dialog__close p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                @click="verifyEmail = false">
          <XMarkIcon class="h-6 w-6"></XMarkIcon>
        </button>
      </div>
      <div class="dialog__body">
        <form class="space-y-6" @submit.prevent="handleSignUpEmail">
          <p class="pb-1">We will send you code that is required to verify your email.</p>
          <div>
            <label for="email" class="block text-sm font-medium leading-6">Email address</label>
            <div class="mt-2">
              <input autocomplete="email" placeholder="Enter your email" v-model="signUpEmail" :required="true"
                     @keyup="errorSignUpEmail = validateEmail(signUpEmail)" class="glass-morphic-input"/>
              <small v-if="errorSignUpEmail !== 'valid'" class="text-red-600 dark:text-red-400"> {{ errorSignUpEmail }}</small>
            </div>
          </div>
          <div>
            <button type="submit" :disabled="errorSignUpEmail !== 'valid'" class="big-green-button"> Send email </button>
          </div>
        </form>
      </div>
    </div>
  </div>


  <!-- Sign up -->
  <div class="dialog fixed inset-0 flex items-start justify-center pt-20" v-if="signUp">
    <!-- Overlay with blur effect -->
    <div class="absolute inset-0 bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 backdrop-blur-sm"
         @click="signUp = false"></div>
    <!-- Dialog content -->
    <div class="model__content p-6 glass-morphic-window w-96 absolute top-1/5 left-1/2 transform -translate-x-1/2">
      <div class="dialog__header flex justify-between items-center mb-4">
        <h2 class="dialog__title text-2xl font-semibold"> Sign Up </h2>
        <button class="dialog__close p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" @click="signUp = false">
          <XMarkIcon class="h-6 w-6"></XMarkIcon>
        </button>
      </div>
      <div class="dialog__body">
        <form class="space-y-6" @submit.prevent="handleSignUp">
          <div>
            <label for="email" class="block text-sm font-medium leading-6">Email address</label>
            <div class="mt-2">
              <input disabled :value="signUpEmail" :required="true" class="glass-morphic-input"/>
            </div>
          </div>
          <div>
            <label for="username" class="block text-sm font-medium leading-6">Access code</label>
            <div class="mt-2">
              <input placeholder="Check your inbox for code" v-model="authCode" :required="true"
                     type="text" @keyup="handleNicknameKeyUp" class="glass-morphic-input"/>
              </div>
            </div>
          <div>
            <label for="username" class="block text-sm font-medium leading-6">Nickname</label>
            <div class="mt-2">
              <input autocomplete="username" placeholder="Choose your nickname" v-model="userName" :required="true"
                     type="text" @keyup="handleNicknameKeyUp" class="glass-morphic-input"/>
              <small v-if="userNameStatus !== 'valid'" class="text-red-600 dark:text-red-400"> {{ userNameStatus }}</small>
              <div v-else>
                <small class="text-green-600 dark:text-green-400"> Your websites will be hosted at: </small> <small><a
                  class="hover">{{ domain }}/{{ userName }}/</a></small>
              </div>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium leading-6">Password</label>
            <div class="mt-2">
              <input autocomplete="new-password" placeholder="Choose your password" v-model="newPassword"
                     :required="true"
                     type="password" @keyup="errorNewPassword = validatePassword(newPassword)"
                     class="glass-morphic-input"/>
              <small v-if="errorNewPassword !== 'valid'" class="text-red-600 dark:text-red-400"> {{ errorNewPassword }}</small>
            </div>

            <div class="mt-2">
              <input autocomplete="new-password" placeholder="Confirm your password" v-model="passwordConfirm"
                     :required="true" type="password" class="glass-morphic-input"/>
              <small v-if="(newPassword !== passwordConfirm) && errorNewPassword == 'valid'"
                     class="text-red-600 dark:text-red-400"> Password does not match! </small>
            </div>
          </div>
          <div>
            <button type="submit" :disabled="!signUpValid" class="big-green-button">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>


  <!-- Login form -->
  <div class="relative top-40">
    <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">

        <img v-if="darkMode" class="mx-auto h-10 w-auto" src="/src/assets/images/logo-dark.svg"
             alt="Organization logo dark version"/>
        <img v-else class="mx-auto h-10 w-auto" src="/src/assets/images/logo.svg" alt="Organization logo"/>

        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">Sign in to your account</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium leading-6">Email address</label>
            <div class="mt-2">
              <input autocomplete="email" placeholder="Enter your email" v-model="email" :required="true" type="email"
                     @keyup="errorEmail = validateEmail(email)" class="global-input"/>
              <small v-if="errorEmail !== 'valid'" class="text-red-600 dark:text-red-400"> {{ errorEmail }} </small>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6">Password</label>
              <div class="text-sm">
                <a href="#" @click="passwordReset = true">Forgot password?</a>
              </div>
            </div>
            <div class="mt-2">
              <input id="password" name="password" type="password" autocomplete="current-password" v-model="password"
                     :required="true" placeholder="Enter your password" class="global-input"/>
            </div>
          </div>

          <div>
            <button type="submit" :disabled="(errorEmail !== 'valid') || (password === '')" class="big-green-button">
              Sign in
            </button>
            <small v-if="passwordErrorMsg" class="text-red-600 dark:text-red-400"> {{ passwordErrorMsg }} </small>
          </div>
        </form>

        <p class="mt-10 text-center text-sm">
          Not a member? <a href="#" @click="verifyEmail = true">Sign up</a> with your {{ organizationName }} email!
        </p>
      </div>
    </div>
  </div>
</template>
