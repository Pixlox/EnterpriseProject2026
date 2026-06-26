<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <h1>CivicTrack</h1>
        <p>Sign in to continue</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Username</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="Enter username"
            required
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Enter password"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="login-footer">
        <p>Demo accounts:</p>
        <div class="demo-accounts">
          <button type="button" class="demo-btn" @click="fillDemo('citizen')">
            Citizen: citizen / password
          </button>
          <button type="button" class="demo-btn" @click="fillDemo('admin')">
            Admin: admin / password
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

// Hardcoded credentials
const VALID_CREDENTIALS = {
  citizen: { password: 'password', type: 'citizen' },
  admin: { password: 'password', type: 'council' }
};

function fillDemo(type) {
  if (type === 'citizen') {
    username.value = 'citizen';
    password.value = 'password';
  } else {
    username.value = 'admin';
    password.value = 'password';
  }
}

function handleLogin() {
  error.value = '';
  loading.value = true;

  // Simulate network delay
  setTimeout(() => {
    const cred = VALID_CREDENTIALS[username.value];
    
    if (!cred || cred.password !== password.value) {
      error.value = 'Invalid username or password';
      loading.value = false;
      return;
    }

    authStore.login(username.value, cred.type);
    loading.value = false;

    // Redirect based on user type
    if (cred.type === 'council') {
      router.push('/council');
    } else {
      router.push('/');
    }
  }, 500);
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--accent-light);
  color: var(--accent);
  border-radius: 50%;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-form .form-group {
  margin-bottom: 0;
}

.login-form input {
  width: 100%;
}

.error-message {
  padding: 10px 14px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
}

.login-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  text-align: center;
}

.login-footer p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.demo-accounts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-btn {
  padding: 8px 12px;
  font-size: 12px;
  font-family: monospace;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
}

.demo-btn:hover {
  background: var(--border);
  color: var(--text);
}
</style>
