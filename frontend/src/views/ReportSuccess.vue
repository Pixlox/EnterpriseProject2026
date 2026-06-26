<template>
  <div class="success-page">
    <div class="success-card">
      <div class="check-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h1>Report Submitted</h1>
      <p class="subtitle">Thank you for helping improve your community.</p>

      <div class="report-details">
        <div class="detail-row">
          <span class="label">Report ID</span>
          <span class="value mono">{{ reportId }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Category</span>
          <span class="value">{{ formatCategory(reportData.category) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Status</span>
          <span class="value">Submitted</span>
        </div>
        <div v-if="reportData.priority" class="detail-row">
          <span class="label">Priority</span>
          <span class="value">{{ reportData.priority }}</span>
        </div>
      </div>

      <div v-if="reportData.duplicateWarning" class="notice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>A similar report was found nearby. Council will review both.</span>
      </div>

      <div class="actions">
        <router-link to="/reports" class="btn btn-primary">View All Reports</router-link>
        <router-link to="/report/new" class="btn btn-secondary">Submit Another</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const reportId = ref('');
const reportData = ref({});

function formatCategory(cat) {
  const map = { pothole: 'Pothole', signage: 'Signage', graffiti: 'Graffiti', dumping: 'Dumping', maintenance: 'Maintenance', lighting: 'Lighting', other: 'Other' };
  return map[cat] || cat;
}

onMounted(() => {
  reportId.value = route.query.id || 'N/A';
  try {
    reportData.value = JSON.parse(route.query.data || '{}');
  } catch {
    reportData.value = {};
  }
});
</script>

<style scoped>
.success-page {
  max-width: 500px;
  margin: 40px auto;
}

.success-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 40px 32px;
  text-align: center;
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 50%;
  margin-bottom: 20px;
}

h1 {
  margin-bottom: 6px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 28px;
}

.report-details {
  background: var(--bg-secondary);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  color: var(--text-secondary);
}

.value {
  font-weight: 500;
}

.mono {
  font-family: monospace;
  font-size: 12px;
}

.notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  font-size: 12px;
  color: #1e40af;
  margin-bottom: 24px;
  text-align: left;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
