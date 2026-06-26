// Main entry point for the Vue application
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

// Create and configure the Vue application
const app = createApp(App);

// Install Pinia for state management
app.use(createPinia());

// Install Vue Router
app.use(router);

// Mount the app to the DOM element with id="app"
app.mount('#app');
