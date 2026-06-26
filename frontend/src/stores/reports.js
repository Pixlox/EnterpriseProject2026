// reports.js - Pinia store for reports
import { defineStore } from 'pinia';
import { ref } from 'vue';

const API_URL = '/api';

export const useReportsStore = defineStore('reports', () => {
  const reports = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const filters = ref({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
    sort: 'recent'
  });
  
  const analytics = ref(null);
  const heatmapData = ref([]);
  const currentReport = ref(null);
  const comments = ref([]);

  async function fetchReports() {
    console.log('fetching reports...');
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      if (filters.value.status !== 'all') params.append('status', filters.value.status);
      if (filters.value.category !== 'all') params.append('category', filters.value.category);
      if (filters.value.priority !== 'all') params.append('priority', filters.value.priority);
      if (filters.value.search) params.append('search', filters.value.search);
      if (filters.value.sort) params.append('sort', filters.value.sort);
      
      const res = await fetch(`${API_URL}/reports?${params}`);
      reports.value = await res.json();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchReportById(id) {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${API_URL}/reports/${id}`);
      currentReport.value = await res.json();
      await fetchComments(id);
      return currentReport.value;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createReport(formData) {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        body: formData
      });
      const newReport = await res.json();
      reports.value.unshift(newReport);
      return newReport;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateReport(id, data) {
    try {
      const res = await fetch(`${API_URL}/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const updated = await res.json();
      const index = reports.value.findIndex(r => r.id === id);
      if (index !== -1) {
        reports.value[index] = updated;
      }
      if (currentReport.value && currentReport.value.id === id) {
        currentReport.value = updated;
      }
      return updated;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function deleteReport(id) {
    try {
      await fetch(`${API_URL}/reports/${id}`, { method: 'DELETE' });
      reports.value = reports.value.filter(r => r.id !== id);
      if (currentReport.value && currentReport.value.id === id) {
        currentReport.value = null;
      }
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function fetchComments(reportId) {
    try {
      const res = await fetch(`${API_URL}/reports/${reportId}/comments`);
      comments.value = await res.json();
    } catch (e) {
      error.value = e.message;
    }
  }

  async function addComment(reportId, content, isInternal = false, authorType = 'citizen') {
    try {
      const res = await fetch(`${API_URL}/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, is_internal: isInternal, author_type: authorType })
      });
      const newComment = await res.json();
      comments.value.unshift(newComment);
      return newComment;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function deleteComment(commentId) {
    try {
      await fetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE' });
      comments.value = comments.value.filter(c => c.id !== commentId);
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function fetchAnalytics() {
    try {
      const res = await fetch(`${API_URL}/analytics`);
      analytics.value = await res.json();
    } catch (e) {
      error.value = e.message;
    }
  }

  async function fetchHeatmapData() {
    try {
      const res = await fetch(`${API_URL}/heatmap-data`);
      heatmapData.value = await res.json();
    } catch (e) {
      error.value = e.message;
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters };
  }

  // intelligence functions
  async function fetchTrendData() {
    try {
      const res = await fetch(`${API_URL}/intelligence/trend`);
      return await res.json();
    } catch (e) {
      error.value = e.message;
      return null;
    }
  }

  async function fetchGeoClusters() {
    try {
      const res = await fetch(`${API_URL}/intelligence/clusters`);
      return await res.json();
    } catch (e) {
      error.value = e.message;
      return [];
    }
  }

  async function fetchResolutionAnalytics() {
    try {
      const res = await fetch(`${API_URL}/intelligence/resolution`);
      return await res.json();
    } catch (e) {
      error.value = e.message;
      return null;
    }
  }

  async function autoCategorise(title, description) {
    try {
      const res = await fetch(`${API_URL}/intelligence/categorise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      return await res.json();
    } catch (e) {
      error.value = e.message;
      return { category: 'other', confidence: 0 };
    }
  }

  async function checkDuplicates(lat, lng, category) {
    try {
      const res = await fetch(`${API_URL}/intelligence/check-duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, category })
      });
      return await res.json();
    } catch (e) {
      error.value = e.message;
      return { isDuplicate: false, duplicates: [] };
    }
  }

  async function exportCSV() {
    try {
      const res = await fetch(`${API_URL}/export/csv`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'civictrack-reports.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      error.value = e.message;
    }
  }

  return {
    reports, loading, error, filters, analytics, heatmapData,
    currentReport, comments,
    fetchReports, fetchReportById, createReport,
    updateReport, deleteReport, fetchComments, addComment, deleteComment,
    fetchAnalytics, fetchHeatmapData, setFilters, fetchTrendData,
    fetchGeoClusters, fetchResolutionAnalytics, autoCategorise,
    checkDuplicates, exportCSV
  };
});
