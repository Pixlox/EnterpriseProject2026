<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const props = defineProps({
  reports: {
    type: Array,
    default: () => []
  },
  center: {
    type: Array,
    default: () => [-33.8688, 151.2093]
  },
  zoom: {
    type: Number,
    default: 12
  },
  showHeatmap: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['markerClick']);

const mapContainer = ref(null);
let map = null;
let markers = [];
let heatmapLayer = null;

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});

const maxBounds = [[-34.0, 150.5], [-33.6, 152.0]];

function initMap() {
  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    dragging: props.interactive,
    zoomControl: props.interactive,
    scrollWheelZoom: props.interactive,
    maxBounds: maxBounds,
    maxBoundsViscosity: 1.0
  });

  console.log('map loaded');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  updateMarkers();
}

function updateMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  if (heatmapLayer) {
    map.removeLayer(heatmapLayer);
    heatmapLayer = null;
  }

  if (props.showHeatmap && props.reports.length > 0) {
    const heatmapData = props.reports
      .filter(r => r.lat && r.lng)
      .map(r => [r.lat, r.lng, 1]);
    
    if (heatmapData.length > 0) {
      heatmapLayer = L.heatLayer(heatmapData, {
        radius: 40,
        blur: 25,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: '#3b82f6',
          0.3: '#10b981',
          0.5: '#84cc16',
          0.7: '#eab308',
          0.85: '#f97316',
          1.0: '#ef4444'
        }
      }).addTo(map);
    }
  } else {
    props.reports.forEach(report => {
      if (report.lat && report.lng) {
        addMarker(report);
      }
    });
  }
}

function addMarker(report) {
  const categoryColors = {
    pothole: '#f59e0b',
    signage: '#8b5cf6',
    graffiti: '#ec4899',
    dumping: '#ef4444',
    maintenance: '#3b82f6',
    lighting: '#fbbf24',
    other: '#6b7280'
  };

  const color = categoryColors[report.category] || '#6b7280';
  
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-dot" style="background-color: ${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  const marker = L.marker([report.lat, report.lng], { icon })
    .addTo(map);
  
  if (props.interactive) {
    marker.on('click', () => emit('markerClick', report));
  }
  
  markers.push(marker);
}

watch(() => props.reports, updateMarkers, { deep: true });
watch(() => props.showHeatmap, updateMarkers);
watch(() => props.center, (newCenter) => {
  if (map) {
    map.setView(newCenter, props.zoom);
  }
});
</script>

<style scoped>
.map {
  height: 100%;
  width: 100%;
  min-height: 400px;
  border-radius: 8px;
}

:deep(.custom-marker) {
  background: transparent;
}

:deep(.marker-dot) {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  transition: transform 0.15s ease;
}

:deep(.marker-dot:hover) {
  transform: scale(1.3);
}
</style>
