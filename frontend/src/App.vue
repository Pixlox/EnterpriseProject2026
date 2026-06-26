<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>CivicTrack</span>
        </router-link>
        
        <nav class="nav">
          <router-link 
            to="/" 
            :class="['nav-link', { active: $route.path === '/' }]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            Home
          </router-link>
          <router-link 
            to="/reports" 
            :class="['nav-link', { active: $route.path === '/reports' }]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            Reports
          </router-link>
          <router-link 
            v-if="authStore.isCitizen"
            to="/report/new" 
            :class="['nav-link', 'submit-link', { active: $route.path === '/report/new' }]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            New Report
          </router-link>
          
          <div class="divider"></div>
          
          <router-link 
            v-if="authStore.isCouncil"
            to="/council" 
            :class="['nav-link', 'council-btn', { active: isCouncilRoute }]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            Council
          </router-link>

          <div class="user-info" v-if="authStore.isAuthenticated">
            <span class="user-badge">{{ authStore.username }}</span>
            <button class="nav-link logout-btn" @click="handleLogout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
    
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isCouncilRoute = computed(() => route.path === '/council');

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.header {
  position: sticky;
  top: 0;
  background: #fff;
  border-bottom: 1px solid var(--border);
  z-index: 2000;
}

.header-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: var(--text);
  text-decoration: none;
}

.logo:hover {
  text-decoration: none;
}

.logo svg {
  color: var(--accent);
}

.nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  background: transparent;
}

.nav-link:hover {
  background: var(--bg-secondary);
  color: var(--text);
  text-decoration: none;
}

.nav-link.active {
  background: var(--accent-light);
  color: var(--accent);
}

.submit-link {
  background: var(--accent);
  color: white;
}

.submit-link:hover {
  background: var(--accent-hover);
  color: white;
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 6px;
}

.council-btn {
  border: 1px solid var(--border);
}

.council-btn:hover {
  border-color: var(--accent);
}

.council-btn.active {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
}

.user-badge {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.logout-btn {
  color: var(--text-secondary) !important;
}

.logout-btn:hover {
  background: #fef2f2 !important;
  color: #dc2626 !important;
}

.main {
  flex: 1;
  padding: 24px 20px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-link {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .divider {
    display: none;
  }
}
</style>
