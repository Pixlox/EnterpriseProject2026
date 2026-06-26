<template>
  <div class="council-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1>Council Dashboard</h1>
          <p>Manage and track community issue reports</p>
        </div>
        <div class="header-stats">
          <div class="stat-pill pending">
            <span class="stat-count">{{ pendingCount }}</span>
            <span class="stat-text">Pending</span>
          </div>
          <div class="stat-pill progress">
            <span class="stat-count">{{ inProgressCount }}</span>
            <span class="stat-text">In Progress</span>
          </div>
          <div class="stat-pill resolved">
            <span class="stat-count">{{ resolvedCount }}</span>
            <span class="stat-text">Resolved</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-nav">
      <button 
        :class="['nav-item', { active: activeTab === 'reports' }]"
        @click="activeTab = 'reports'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        Reports
      </button>
      <button 
        :class="['nav-item', { active: activeTab === 'analytics' }]"
        @click="activeTab = 'analytics'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        Analytics
      </button>
      <button 
        :class="['nav-item', { active: activeTab === 'insights' }]"
        @click="activeTab = 'insights'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        Insights
      </button>
      <button 
        :class="['nav-item', { active: activeTab === 'map' }]"
        @click="activeTab = 'map'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
        Map View
      </button>
    </div>

    <div v-if="activeTab === 'reports'" class="reports-section">
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
            <select v-model="filters.priority" @change="applyFilters">
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="filter-group">
            <select v-model="filters.sort" @change="applyFilters">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority Order</option>
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
      </div>

      <div class="reports-table-wrapper">
        <table class="reports-table">
          <thead>
            <tr>
              <th class="th-id">ID</th>
              <th class="th-category">Category</th>
              <th class="th-title">Title</th>
              <th class="th-status">Status</th>
              <th class="th-priority">Priority</th>
              <th class="th-date">Submitted</th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="report in reports" 
              :key="report.id"
              :class="{ urgent: report.priority === 'urgent' }"
            >
              <td class="td-id">
                <span class="id-badge">{{ report.id.substring(0, 8) }}</span>
              </td>
              <td class="td-category">
                <span :class="['badge', `badge-${report.category}`]">
                  {{ formatCategory(report.category) }}
                </span>
              </td>
              <td class="td-title">
                <div class="title-cell">
                  <span class="title">{{ report.title }}</span>
                  <span v-if="report.photo_filename" class="has-photo" title="Has photo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    </svg>
                  </span>
                </div>
              </td>
              <td class="td-status">
                <select 
                  :value="report.status" 
                  @change="updateStatus(report.id, $event.target.value)"
                  :class="['status-select', `status-${report.status}`]"
                >
                  <option value="submitted">Submitted</option>
                  <option value="assigned">Assigned</option>
                  <option value="progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
              <td class="td-priority">
                <select 
                  :value="report.priority || 'normal'" 
                  @change="updatePriority(report.id, $event.target.value)"
                  :class="['priority-select', `priority-${report.priority || 'normal'}`]"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </td>
              <td class="td-date">
                {{ formatDate(report.created_at) }}
              </td>
              <td class="td-actions">
                <button class="action-btn view" @click="viewReport(report)" title="View Details">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button class="action-btn edit" @click="editReport(report)" title="Edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="action-btn delete" @click="deleteReport(report.id)" title="Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="reports.length === 0" class="empty-table">
          No reports found matching your filters
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'analytics'" class="analytics-section">
      <div class="analytics-header">
        <h2>Analytics Overview</h2>
        <button class="btn btn-secondary export-btn" @click="handleExport">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export CSV
        </button>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ store.analytics?.total || 0 }}</div>
            <div class="stat-label">Total Reports</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon resolved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ resolvedCount }}</div>
            <div class="stat-label">Resolved</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon time">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ avgResolution }}</div>
            <div class="stat-label">Avg. Days to Resolve</div>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <h3>Reports by Category</h3>
          <div class="chart-container">
            <Doughnut :data="categoryChartData" :options="chartOptions" />
          </div>
        </div>
        <div class="chart-card">
          <h3>Reports by Status</h3>
          <div class="chart-container">
            <Doughnut :data="statusChartData" :options="chartOptions" />
          </div>
        </div>
        <div class="chart-card full-width">
          <h3>Reports Over Time</h3>
          <div class="chart-container tall">
            <Bar :data="timelineChartData" :options="barChartOptions" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'map'" class="map-section">
      <div class="map-toolbar">
        <label class="checkbox-label">
          <input type="checkbox" v-model="showHeatmap" @change="toggleHeatmap" />
          Show density heatmap
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="showAllMarkers" @change="toggleMarkers" />
          Show all markers
        </label>
      </div>
      <div class="map-container">
        <ReportMap 
          :reports="showAllMarkers ? reports : urgentReports" 
          :showHeatmap="showHeatmap"
          :center="[-33.8688, 151.2093]"
          :zoom="12"
          @markerClick="viewReport"
        />
      </div>
    </div>

    <div v-if="activeTab === 'insights'" class="insights-section">
      <div class="insights-grid">
        <div class="insight-card">
          <h3>Trend Analysis</h3>
          <div class="trend-content">
            <div class="trend-stat">
              <span class="trend-label">Trend Direction</span>
              <span :class="['trend-value', trendData?.trend]">
                {{ trendData?.trend === 'increasing' ? 'Increasing' : trendData?.trend === 'decreasing' ? 'Decreasing' : 'Stable' }}
              </span>
            </div>
            <div class="trend-stat">
              <span class="trend-label">Monthly Change</span>
              <span class="trend-value">{{ trendData?.slope > 0 ? '+' : '' }}{{ trendData?.slope }} reports/month</span>
            </div>
            <div class="trend-stat">
              <span class="trend-label">Next Month Prediction</span>
              <span class="trend-value">{{ trendData?.prediction }} reports</span>
            </div>
          </div>
        </div>

        <div class="insight-card">
          <h3>Resolution Performance</h3>
          <div class="resolution-content">
            <div class="resolution-stat">
              <span class="resolution-label">Resolution Rate</span>
              <span class="resolution-value">{{ resolutionAnalytics?.resolutionRate }}%</span>
            </div>
            <div class="resolution-stat">
              <span class="resolution-label">Avg. Resolution Time</span>
              <span class="resolution-value">{{ resolutionAnalytics?.overall?.avg_days ? Math.round(resolutionAnalytics.overall.avg_days * 10) / 10 : 'N/A' }} days</span>
            </div>
            <div class="resolution-stat">
              <span class="resolution-label">Total Resolved</span>
              <span class="resolution-value">{{ resolutionAnalytics?.totalResolved }} / {{ resolutionAnalytics?.totalReports }}</span>
            </div>
          </div>
        </div>

        <div class="insight-card full-width">
          <h3>Geographic Hotspots</h3>
          <div class="clusters-list">
            <div v-if="geoClusters.length === 0" class="no-clusters">
              No geographic clusters detected yet
            </div>
            <div v-else class="cluster-items">
              <div v-for="(cluster, index) in geoClusters.slice(0, 5)" :key="index" class="cluster-item">
                <div class="cluster-rank">#{{ index + 1 }}</div>
                <div class="cluster-info">
                  <div class="cluster-location">{{ cluster.lat.toFixed(3) }}, {{ cluster.lng.toFixed(3) }}</div>
                  <div class="cluster-count">{{ cluster.count }} reports</div>
                </div>
                <div class="cluster-categories">
                  <span v-for="(count, cat) in cluster.categories" :key="cat" class="cluster-cat">
                    {{ formatCategory(cat) }}: {{ count }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedReport" class="modal-overlay" @click.self="selectedReport = null">
      <div class="modal report-detail-modal">
        <div class="modal-header">
          <div class="header-badges">
            <span :class="['badge', `badge-${selectedReport.category}`]">
              {{ formatCategory(selectedReport.category) }}
            </span>
            <span :class="['badge', `badge-${selectedReport.status}`]">
              {{ formatStatus(selectedReport.status) }}
            </span>
            <span :class="['badge', `badge-${selectedReport.priority || 'normal'}`]">
              {{ (selectedReport.priority || 'normal').charAt(0).toUpperCase() + (selectedReport.priority || 'normal').slice(1) }} Priority
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
              <span class="meta-label">Report ID</span>
              <span class="mono">{{ selectedReport.id }}</span>
            </div>
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

          <div class="quick-actions">
            <h3>Quick Actions</h3>
            <div class="action-buttons">
              <button 
                v-if="selectedReport.status !== 'resolved'"
                class="btn btn-success"
                @click="quickResolve"
              >
                Mark as Resolved
              </button>
              <button 
                v-if="selectedReport.priority !== 'urgent'"
                class="btn btn-warning"
                @click="quickUrgent"
              >
                Mark as Urgent
              </button>
            </div>
          </div>

          <div class="comments-section">
            <h3>Recent Updates</h3>
            
            <div class="comments-tabs">
              <button 
                :class="['tab', { active: commentTab === 'public' }]"
                @click="commentTab = 'public'"
              >
                Public Updates
              </button>
              <button 
                :class="['tab', { active: commentTab === 'internal' }]"
                @click="commentTab = 'internal'"
              >
                Internal Notes
              </button>
            </div>

            <div class="comments-content">
              <div v-if="commentTab === 'public'" class="comments-list">
                <div v-if="publicComments.length === 0" class="no-comments">
                  No public comments yet
                </div>
                <div 
                  v-for="comment in publicComments" 
                  :key="comment.id" 
                  class="comment public"
                >
                  <div class="comment-header">
                    <span class="comment-author">
                      {{ comment.author_type === 'council' ? 'Council' : 'Citizen' }}
                    </span>
                    <div class="comment-actions">
                      <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                      <button class="btn-delete" @click="deleteComment(comment.id)" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p>{{ comment.content }}</p>
                </div>
              </div>

              <div v-else class="comments-list">
                <div v-if="internalComments.length === 0" class="no-comments">
                  No internal notes yet
                </div>
                <div 
                  v-for="comment in internalComments" 
                  :key="comment.id" 
                  class="comment internal"
                >
                  <div class="comment-header">
                    <span class="comment-author">Council Staff</span>
                    <div class="comment-actions">
                      <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                      <button class="btn-delete" @click="deleteComment(comment.id)" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p>{{ comment.content }}</p>
                </div>
              </div>
            </div>

            <form @submit.prevent="addComment" class="comment-form">
              <textarea 
                v-model="newComment"
                :placeholder="commentTab === 'internal' ? 'Add internal note (not visible to citizens)...' : 'Add public update (visible to citizens)...'"
                rows="2"
              ></textarea>
              <button 
                type="submit" 
                class="btn"
                :class="commentTab === 'internal' ? 'btn-warning' : 'btn-primary'"
                :disabled="!newComment.trim()"
              >
                {{ commentTab === 'internal' ? 'Add Internal Note' : 'Post Public Update' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useReportsStore } from '../stores/reports';
import ReportMap from '../components/ReportMap.vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const store = useReportsStore();

// tab state
const activeTab = ref('reports');
const showHeatmap = ref(false);
const showAllMarkers = ref(true);
const selectedReport = ref(null);
const commentTab = ref('public');
const newComment = ref('');

// filters
const filters = ref({
  status: 'all',
  category: 'all',
  priority: 'all',
  sort: 'recent',
  search: ''
});

let searchTimeout = null;

const reports = computed(() => store.reports);

const urgentReports = computed(() => {
  return reports.value.filter(r => r.priority === 'urgent' || r.priority === 'high');
});

// counts for stat pills
const pendingCount = computed(() => {
  const status = store.analytics?.byStatus?.find(s => s.status === 'submitted');
  return status?.count || 0;
});

const inProgressCount = computed(() => {
  const assigned = store.analytics?.byStatus?.find(s => s.status === 'assigned')?.count || 0;
  const progress = store.analytics?.byStatus?.find(s => s.status === 'progress')?.count || 0;
  return assigned + progress;
});

const resolvedCount = computed(() => {
  const status = store.analytics?.byStatus?.find(s => s.status === 'resolved');
  return status?.count || 0;
});

const avgResolution = computed(() => {
  return store.analytics?.avgResolutionDays 
    ? Math.round(store.analytics.avgResolutionDays * 10) / 10 
    : 'N/A';
});

// comments
const publicComments = computed(() => {
  return store.comments.filter(c => !c.is_internal);
});

const internalComments = computed(() => {
  return store.comments.filter(c => c.is_internal);
});

// chart data for analytics
const categoryChartData = computed(() => {
  const data = store.analytics?.byCategory || [];
  return {
    labels: data.map(d => formatCategory(d.category)),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: ['#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#3b82f6', '#fbbf24', '#6b7280']
    }]
  };
});

const statusChartData = computed(() => {
  const data = store.analytics?.byStatus || [];
  return {
    labels: data.map(d => formatStatus(d.status)),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: ['#6366f1', '#f59e0b', '#3b82f6', '#10b981']
    }]
  };
});

const timelineChartData = computed(() => {
  const data = [...(store.analytics?.byMonth || [])].reverse();
  return {
    labels: data.map(d => d.month),
    datasets: [{
      label: 'Reports',
      data: data.map(d => d.count),
      backgroundColor: '#0d9488'
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

// load data on mount
onMounted(async () => {
  await store.fetchReports();
  await store.fetchAnalytics();
  await store.fetchTrendData();
  await store.fetchGeoClusters();
  await store.fetchResolutionAnalytics();
});

// insights data
const trendData = computed(() => store.trendData);
const geoClusters = computed(() => store.geoClusters);
const resolutionAnalytics = computed(() => store.resolutionAnalytics);

function applyFilters() {
  store.setFilters(filters.value);
  store.fetchReports();
}

function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyFilters, 300);
}

async function updateStatus(id, status) {
  await store.updateReport(id, { status });
  store.fetchAnalytics();
}

async function updatePriority(id, priority) {
  await store.updateReport(id, { priority });
}

async function deleteReport(id) {
  if (confirm('Are you sure you want to delete this report?')) {
    await store.deleteReport(id);
    store.fetchAnalytics();
  }
}

async function viewReport(report) {
  selectedReport.value = report;
  commentTab.value = 'public';
  await store.fetchReportById(report.id);
}

function editReport(report) {
  viewReport(report);
}

async function quickResolve() {
  if (!selectedReport.value) return;
  await store.updateReport(selectedReport.value.id, { status: 'resolved' });
  await store.fetchReportById(selectedReport.value.id);
  store.fetchAnalytics();
}

async function quickUrgent() {
  if (!selectedReport.value) return;
  await store.updateReport(selectedReport.value.id, { priority: 'urgent' });
  await store.fetchReportById(selectedReport.value.id);
}

async function addComment() {
  if (!newComment.value.trim() || !selectedReport.value) return;
  
  await store.addComment(
    selectedReport.value.id, 
    newComment.value, 
    commentTab.value === 'internal',
    'council'
  );
  newComment.value = '';
}

async function deleteComment(commentId) {
  if (!confirm('Are you sure you want to delete this update?')) return;
  await store.deleteComment(commentId);
}

async function handleExport() {
  await store.exportCSV();
}

function toggleHeatmap() {
  store.fetchReports();
}

function toggleMarkers() {
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// refresh data when tab changes
watch(activeTab, async (tab) => {
  if (tab === 'analytics') {
    await store.fetchAnalytics();
  }
  if (tab === 'reports') {
    await store.fetchReports();
  }
  if (tab === 'insights') {
    await store.fetchTrendData();
    await store.fetchGeoClusters();
    await store.fetchResolutionAnalytics();
  }
});
</script>

<style scoped>
.council-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  background: #1e293b;
  color: white;
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  color: white;
  margin-bottom: 4px;
}

.dashboard-header p {
  color: #94a3b8;
}

.header-stats {
  display: flex;
  gap: 12px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

.stat-pill .stat-count {
  font-size: 18px;
  font-weight: 700;
}

.stat-pill .stat-text {
  font-size: 12px;
  color: #94a3b8;
}

.stat-pill.pending .stat-count { color: #9ca3af; }
.stat-pill.progress .stat-count { color: #9ca3af; }
.stat-pill.resolved .stat-count { color: #9ca3af; }

.dashboard-nav {
  display: flex;
  gap: 2px;
  background: var(--bg);
  padding: 4px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 3px;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  color: var(--text-secondary);
}

.nav-item:hover {
  background: var(--bg-secondary);
}

.nav-item.active {
  background: var(--text);
  color: #fff;
}

.toolbar {
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-group select,
.filter-group input {
  min-width: 130px;
  padding: 6px 8px;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: var(--bg);
}

.filter-group.search {
  flex: 1;
  min-width: 180px;
}

.reports-table-wrapper {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th,
.reports-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.reports-table th {
  background: var(--bg-secondary);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reports-table tr:last-child td {
  border-bottom: none;
}

.reports-table tr.urgent {
  background: #fef3c7;
}

.reports-table tr.urgent:hover {
  background: #fef9c3;
}

.id-badge {
  font-family: monospace;
  font-size: 11px;
  background: var(--bg-secondary);
  padding: 3px 6px;
  border-radius: 3px;
  color: var(--text-secondary);
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-cell .title {
  font-weight: 500;
}

.has-photo {
  color: var(--text-secondary);
}

.status-select,
.priority-select {
  padding: 5px 8px;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: var(--bg);
  font-weight: 500;
}

.status-submitted { color: #64748b; }
.status-assigned { color: #64748b; }
.status-progress { color: #64748b; }
.status-resolved { color: #64748b; }

.priority-low { color: #9ca3af; }
.priority-normal { color: #64748b; }
.priority-high { color: #64748b; }
.priority-urgent { color: #dc2626; }

.td-date {
  font-size: 13px;
  color: var(--text-secondary);
}

.td-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 5px;
  border-radius: 3px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.action-btn:hover {
  background: var(--border);
}

.action-btn.view:hover {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.edit:hover {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

.empty-table {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.stat-icon.total { background: #f1f5f9; color: #64748b; }
.stat-icon.resolved { background: #f1f5f9; color: #64748b; }
.stat-icon.pending { background: #f1f5f9; color: #64748b; }
.stat-icon.time { background: #f1f5f9; color: #64748b; }

.stat-value {
  font-size: 22px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.analytics-header h2 {
  margin-bottom: 0;
}

.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.chart-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
}

.chart-card.full-width {
  grid-column: span 2;
}

.chart-card h3 {
  margin-bottom: 12px;
  font-size: 14px;
}

.chart-container {
  height: 250px;
}

.chart-container.tall {
  height: 300px;
}

.map-section {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
}

.map-toolbar {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
}

.map-container {
  height: calc(100vh - 380px);
  min-height: 400px;
  border-radius: 4px;
  overflow: hidden;
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.close-btn {
  background: transparent;
  color: var(--text-secondary);
  padding: 4px;
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
  height: 200px;
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
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.mono {
  font-family: monospace;
  font-size: 13px;
}

.quick-actions {
  margin-bottom: 24px;
}

.quick-actions h3 {
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-success {
  background: #16a34a;
  color: white;
}

.btn-success:hover {
  background: #15803d;
}

.btn-warning {
  background: #ca8a04;
  color: white;
}

.btn-warning:hover {
  background: #a16207;
}

.comments-section h3 {
  margin-bottom: 16px;
}

.comments-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.comments-tabs .tab {
  padding: 10px 16px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.comments-tabs .tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.comments-list {
  margin-bottom: 16px;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
}

.comments-list .comment {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.no-comments {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.comment {
  background: var(--bg-secondary);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
}

.comment.internal {
  border-left: 3px solid #9ca3af;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-delete {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 3px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

.btn-delete:hover {
  color: #dc2626;
  opacity: 1;
  background: #fef2f2;
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
  font-size: 14px;
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

@media (max-width: 900px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card.full-width {
    grid-column: span 1;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.insights-section {
  padding: 0;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.insight-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
}

.insight-card.full-width {
  grid-column: span 2;
}

.insight-card h3 {
  margin-bottom: 12px;
  font-size: 14px;
}

.trend-content,
.resolution-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-stat,
.resolution-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.trend-stat:last-child,
.resolution-stat:last-child {
  border-bottom: none;
}

.trend-label,
.resolution-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.trend-value,
.resolution-value {
  font-weight: 600;
  font-size: 14px;
}

.trend-value.increasing {
  color: #dc2626;
}

.trend-value.decreasing {
  color: #16a34a;
}

.trend-value.stable {
  color: #6b7280;
}

.clusters-list {
  max-height: 300px;
  overflow-y: auto;
}

.no-clusters {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.cluster-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cluster-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.cluster-rank {
  font-weight: 700;
  font-size: 14px;
  color: var(--accent);
  min-width: 30px;
}

.cluster-info {
  flex: 1;
}

.cluster-location {
  font-family: monospace;
  font-size: 13px;
  color: var(--text-secondary);
}

.cluster-count {
  font-weight: 500;
  font-size: 14px;
}

.cluster-categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cluster-cat {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg);
  padding: 2px 6px;
  border-radius: 3px;
}
</style>
