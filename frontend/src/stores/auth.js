import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const userType = ref(null);
  const username = ref(null);
  const isAuthenticated = computed(() => userType.value !== null);
  const isCouncil = computed(() => userType.value === 'council');
  const isCitizen = computed(() => userType.value === 'citizen');

  function login(user, type) {
    username.value = user;
    userType.value = type;
    sessionStorage.setItem('civictrack_user', JSON.stringify({ username: user, type }));
  }

  function logout() {
    username.value = null;
    userType.value = null;
    sessionStorage.removeItem('civictrack_user');
  }

  function restoreSession() {
    const stored = sessionStorage.getItem('civictrack_user');
    if (stored) {
      try {
        const { username: user, type } = JSON.parse(stored);
        username.value = user;
        userType.value = type;
      } catch (e) {
        sessionStorage.removeItem('civictrack_user');
      }
    }
  }

  restoreSession();

  return { 
    userType, username, isAuthenticated, isCouncil, isCitizen,
    login, logout, restoreSession
  };
});
