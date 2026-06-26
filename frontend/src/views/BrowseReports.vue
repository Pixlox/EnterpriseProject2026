<template>
  <div class="browse-reports">
    <div class="page-header">
      <router-link to="/" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"></path>
        </svg>
        Back to Report Centre
      </router-link>
      <h1>Community Reports</h1>
      <p>View and track issues reported in your area</p>
    </div>

    <div class="toolbar">
      <div class="filters">
        <div class="filter-group">
          <select v-model="filters.status" @change="applyFilters">
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div class="filter-group">
          <select v-model="filters.category" @change="applyFilters">
            <option value="all">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="signage">Signage</option>
            <option value="graffiti">Graffiti</option>
            <option value="dumping">Dumping</option>
            <option value="maintenance">Maintenance</option>
            <option value="lighting">Lighting</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="filter-group">
          <select v-model="filters.sort" @change="applyFilters">
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div class="filter-group search">
          <input 
            v-model="filters.search" 
            type="text" 
            placeholder="Search reports..."
            @input="debouncedSearch"
          />
        </div>
      </div>

      <div class="view-toggle">
        <button 
          :class="['toggle-btn', { active: viewMode === 'list' }]"
          @click="viewMode = 'list'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          List
        </button>
        <button 
          :class="['toggle-btn', { active: viewMode === 'map' }]"
          @click="viewMode = 'map'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          Map
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading reports...</p>
    </div>

    <div v-else-if="reports.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>No reports found</h3>
      <p>Be the first to report an issue in your community!</p>
      <router-link to="/report/new" class="btn btn-primary">Submit a Report</router-link>
    </div>

    <template v-else>
      <div v-if="viewMode === 'list'" class="reports-list">
        <div 
          v-for="report in reports" 
          :key="report.id" 
          class="report-card"
          @click="openReportDetail(report)"
        >
          <div class="card-image" v-if="report.photo_filename">
            <img :src="`/content/photos/${report.photo_filename}`" :alt="report.title" />
          </div>
          <div class="card-content">
            <div class="card-header">
              <span :class="['badge', `badge-${report.category}`]">
                {{ formatCategory(report.category) }}
              </span>
              <span :class="['badge', `badge-${report.status}`]">
                {{ formatStatus(report.status) }}
              </span>
              <span v-if="report.priority === 'urgent' || report.priority === 'high'" :class="['badge', `badge-${report.priority}`]">
                {{ report.priority }}
              </span>
            </div>
            <h3>{{ report.title }}</h3>
            <p v-if="report.description" class="description">{{ truncate(report.description, 120) }}</p>
            <div class="card-meta">
              <span class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {{ formatDate(report.created_at) }}
              </span>
              <span v-if="report.comments_count" class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {{ report.comments_count }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="map-view">
        <ReportMap 
          :reports="reports" 
          :center="[-33.8688, 151.2093]"
          :zoom="12"
          @markerClick="openReportDetail"
        />
      </div>
    </template>

    <div v-if="selectedReport" class="modal-overlay" @click.self="selectedReport = null">
      <div class="modal report-detail-modal">
        <div class="modal-header">
          <div>
            <span :class="['badge', `badge-${selectedReport.category}`]">
              {{ formatCategory(selectedReport.category) }}
            </span>
            <span :class="['badge', `badge-${selectedReport.status}`]">
              {{ formatStatus(selectedReport.status) }}
            </span>
          </div>
          <button class="close-btn" @click="selectedReport = null">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <h2>{{ selectedReport.title }}</h2>
          <p v-if="selectedReport.description" class="detail-description">{{ selectedReport.description }}</p>

          <div v-if="selectedReport.photo_filename" class="detail-photo">
            <img :src="`/content/photos/${selectedReport.photo_filename}`" :alt="selectedReport.title" />
          </div>

          <div class="detail-map">
            <ReportMap 
              :reports="[selectedReport]"
              :center="[selectedReport.lat, selectedReport.lng]"
              :zoom="15"
              :interactive="false"
            />
          </div>

          <div class="detail-meta">
            <div class="meta-row">
              <span class="meta-label">Submitted</span>
              <span>{{ formatDate(selectedReport.created_at) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Location</span>
              <span>{{ selectedReport.lat.toFixed(5) }}, {{ selectedReport.lng.toFixed(5) }}</span>
            </div>
            <div v-if="selectedReport.status !== 'submitted'" class="meta-row">
              <span class="meta-label">Last Updated</span>
              <span>{{ formatDate(selectedReport.updated_at) }}</span>
            </div>
          </div>

          <div class="comments-section">
            <h3>Recent Updates</h3>
            
            <div v-if="publicComments.length === 0" class="no-comments">
              No updates yet
            </div>
            
            <div v-else class="comments-list">
              <div 
                v-for="comment in publicComments" 
                :key="comment.id" 
                :class="['comment', { internal: comment.is_internal }]"
              >
                <div class="comment-header">
                  <span class="comment-author">
                    {{ comment.author_type === 'council' ? 'Council' : 'Citizen' }}
                  </span>
                  <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                </div>
                <p>{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useReportsStore } from '../stores/reports';
import ReportMap from '../components/ReportMap.vue';

const store = useReportsStore();

const viewMode = ref('list');
const selectedReport = ref(null);

const filters = ref({
  status: 'all',
  category: 'all',
  sort: 'recent',
  search: ''
});

let searchTimeout = null;

const reports = computed(() => store.reports);
const loading = computed(() => store.loading);

const publicComments = computed(() => {
  return store.comments.filter(c => !c.is_internal);
});

onMounted(() => {
  store.fetchReports();
});

function applyFilters() {
  store.setFilters(filters.value);
  store.fetchReports();
}

function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyFilters, 300);
}

function openReportDetail(report) {
  selectedReport.value = report;
  store.fetchReportById(report.id);
}

function formatCategory(cat) {
  const map = {
    pothole: 'Pothole',
    signage: 'Signage',
    graffiti: 'Graffiti',
    dumping: 'Dumping',
    maintenance: 'Maintenance',
    lighting: 'Lighting',
    other: 'Other'
  };
  return map[cat] || cat;
}

function formatStatus(status) {
  const map = {
    submitted: 'Submitted',
    assigned: 'Assigned',
    progress: 'In Progress',
    resolved: 'Resolved'
  };
  return map[status] || status;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function truncate(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}
</script>

<style scoped>
.browse-reports {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent);
}

.page-header h1 {
  margin-bottom: 8px;
}

.page-header p {
  color: var(--text-secondary);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-group select,
.filter-group input {
  min-width: 140px;
}

.filter-group.search {
  flex: 1;
  min-width: 200px;
}

.view-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-secondary);
  padding: 3px;
  border-radius: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 4px;
  font-size: 13px;
  background: transparent;
  color: var(--text-secondary);
}

.toggle-btn.active {
  background: var(--bg);
  color: var(--text);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.empty-state svg {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.empty-state h3 {
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.reports-list {
  display: grid;
  gap: 16px;
}

.report-card {
  display: flex;
  gap: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.report-card:hover {
  border-color: var(--accent);
}

.card-image {
  width: 180px;
  flex-shrink: 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  flex: 1;
  padding: 14px;
}

.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.card-content h3 {
  font-size: 15px;
  margin-bottom: 4px;
}

.description {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.map-view {
  height: calc(100vh - 300px);
  min-height: 400px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.report-detail-modal {
  background: var(--bg);
  border-radius: 4px;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header .badge {
  margin-right: 8px;
}

.close-btn {
  background: transparent;
  color: var(--text-secondary);
  padding: 4px;
}

.close-btn:hover {
  color: var(--text);
}

.modal-body {
  padding: 24px;
}

.modal-body h2 {
  margin-bottom: 12px;
}

.detail-description {
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
}

.detail-photo {
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
  max-height: 400px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-photo img {
  max-width: 100%;
  max-height: 400px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.detail-map {
  height: 180px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.detail-meta {
  background: var(--bg-secondary);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-label {
  color: var(--text-secondary);
  font-size: 13px;
}

.comments-section h3 {
  margin-bottom: 16px;
}

.no-comments {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  overflow-x: hidden;
}

.comment {
  background: var(--bg-secondary);
  border-radius: 4px;
  padding: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.comment.internal {
  border-left: 3px solid var(--accent);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 13px;
  font-weight: 500;
}

.comment-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.comment p {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-form textarea {
  resize: none;
}

.comment-form .btn {
  align-self: flex-end;
}

@media (max-width: 600px) {
  .report-card {
    flex-direction: column;
  }
  
  .card-image {
    width: 100%;
    height: 180px;
  }
}
</style>
