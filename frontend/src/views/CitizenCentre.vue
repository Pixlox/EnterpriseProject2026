<template>
  <div class="citizen-centre">
    <div class="hero">
      <h1>Citizen's Report Centre</h1>
      <p>Report local issues and track their progress</p>
    </div>
    
    <div class="action-cards">
      <router-link to="/report/new" class="action-card">
        <div class="card-content">
          <h2>Submit a Report</h2>
          <p>Report potholes, graffiti, dumping, and more</p>
        </div>
      </router-link>

      <router-link to="/reports" class="action-card">
        <div class="card-content">
          <h2>View Reports</h2>
          <p>Browse community reports and track progress</p>
        </div>
      </router-link>
    </div>

    <div class="stats-section">
      <div class="stat-item">
        <div class="stat-number">{{ stats.total || 0 }}</div>
        <div class="stat-label">Total Reports</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.resolved || 0 }}</div>
        <div class="stat-label">Resolved</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.pending || 0 }}</div>
        <div class="stat-label">In Progress</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useReportsStore } from '../stores/reports';

const store = useReportsStore();

const stats = computed(() => ({
  total: store.analytics?.total || 0,
  resolved: store.analytics?.byStatus?.find(s => s.status === 'resolved')?.count || 0,
  pending: (store.analytics?.byStatus?.find(s => s.status === 'progress')?.count || 0) +
           (store.analytics?.byStatus?.find(s => s.status === 'assigned')?.count || 0)
}));

onMounted(() => {
  store.fetchAnalytics();
});
</script>

<style scoped>
.citizen-centre {
  max-width: 800px;
  margin: 0 auto;
}

.hero {
  padding: 32px 0;
  margin-bottom: 20px;
}

.hero h1 {
  margin-bottom: 4px;
}

.hero p {
  color: var(--text-secondary);
  font-size: 14px;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

@media (max-width: 600px) {
  .action-cards {
    grid-template-columns: 1fr;
  }
}

.action-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
  text-decoration: none;
  color: var(--text);
}

.action-card:hover {
  border-color: var(--accent);
  text-decoration: none;
}

.card-content h2 {
  font-size: 15px;
  margin-bottom: 2px;
}

.card-content p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #fff;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}
</style>
