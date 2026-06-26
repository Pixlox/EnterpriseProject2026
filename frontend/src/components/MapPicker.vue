<template>
  <div class="map-picker">
    <div ref="mapContainer" class="map"></div>
    <p class="hint" v-if="!selectedLocation">Click on the map to pin the issue location</p>
    <p class="hint success" v-else>Location pinned</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const maxBounds = [[-34.0, 150.5], [-33.6, 152.0]];

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const mapContainer = ref(null);
const selectedLocation = ref(props.modelValue);
let map = null;
let marker = null;

onMounted(() => {
  map = L.map(mapContainer.value, {
    center: [-33.8688, 151.2093],
    zoom: 12,
    maxBounds: maxBounds,
    maxBoundsViscosity: 1.0
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  if (selectedLocation.value) {
    addMarker(selectedLocation.value);
  }

  map.on('click', (e) => {
    const location = { lat: e.latlng.lat, lng: e.latlng.lng };
    selectedLocation.value = location;
    addMarker(location);
    emit('update:modelValue', location);
  });
});

function addMarker(location) {
  if (marker) {
    map.removeLayer(marker);
  }
  marker = L.marker([location.lat, location.lng]).addTo(map);
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && !selectedLocation.value) {
    selectedLocation.value = newVal;
    addMarker(newVal);
  }
});
</script>

<style scoped>
.map-picker {
  position: relative;
}

.map {
  height: 300px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.hint.success {
  color: var(--accent);
}
</style>
