<template>
  <div class="new-report">
    <div class="page-header">
      <router-link to="/" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"></path>
        </svg>
        Back to Report Centre
      </router-link>
      <h1>Submit a New Report</h1>
      <p>Help us improve your community by reporting local issues</p>
    </div>

    <div class="form-container">
      <form @submit.prevent="submitReport" class="report-form">
        <div class="form-section">
          <h2>Issue Details</h2>
          
          <div class="form-group">
            <label>Category <span class="required">*</span></label>
            <div class="category-grid">
              <button
                v-for="cat in categories"
                :key="cat.value"
                type="button"
                :class="['category-btn', { active: form.category === cat.value }]"
                @click="form.category = cat.value"
              >
                <span class="cat-label">{{ cat.label }}</span>
              </button>
            </div>
            
            <div v-if="autoCategorySuggestion" class="auto-suggestion">
              <span>Suggested: <strong>{{ formatCategory(autoCategorySuggestion.category) }}</strong> ({{ autoCategorySuggestion.confidence }}% confidence)</span>
              <button type="button" class="apply-btn" @click="applySuggestedCategory">Apply</button>
            </div>
          </div>

          <div class="form-group">
            <label>Title <span class="required">*</span></label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="Brief description of the issue"
              required 
              maxlength="100"
            />
            <span class="char-count">{{ form.title.length }}/100</span>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="form.description" 
              placeholder="Provide more details about the issue (optional)..."
              rows="4"
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ form.description.length }}/500</span>
          </div>
        </div>

        <div class="form-section">
          <h2>Location</h2>
          <p class="section-hint">Click on the map to pin the exact location of the issue</p>
          
          <div class="form-group">
            <MapPicker v-model="form.location" />
          </div>
          
          <div v-if="duplicateWarning" class="duplicate-warning">
            <div class="warning-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="warning-content">
              <strong>Similar report found nearby</strong>
              <p>{{ duplicateWarning.duplicates[0].title }} ({{ duplicateWarning.nearestDistance }}m away)</p>
              <p class="warning-hint">Consider checking existing reports before submitting</p>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Photo Evidence</h2>
          <p class="section-hint">Add a photo to help us understand the issue better (optional)</p>
          
          <div class="photo-upload">
            <div v-if="!form.photo" class="upload-zone" @click="triggerFileInput">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>Click to upload a photo</p>
              <span>PNG, JPG up to 10MB</span>
            </div>
            <div v-else class="photo-preview">
              <img :src="photoPreview" alt="Preview" />
              <button type="button" class="remove-photo" @click="removePhoto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*" 
              @change="handlePhotoChange"
              class="hidden-input"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$router.push('/')">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="!canSubmit || submitting"
          >
            <svg v-if="submitting" class="spinner" width="18" height="18" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-dashoffset="32"></circle>
            </svg>
            {{ submitting ? 'Submitting...' : 'Submit Report' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useReportsStore } from '../stores/reports';
import MapPicker from '../components/MapPicker.vue';

const router = useRouter();
const store = useReportsStore();

const categories = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'signage', label: 'Signage' },
  { value: 'graffiti', label: 'Graffiti' },
  { value: 'dumping', label: 'Dumping' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'other', label: 'Other' }
];

const form = ref({
  category: '',
  title: '',
  description: '',
  location: null,
  photo: null
});

const fileInput = ref(null);
const photoPreview = ref(null);
const submitting = ref(false);
const autoCategorySuggestion = ref(null);
const duplicateWarning = ref(null);

const canSubmit = computed(() => {
  return form.value.category && form.value.title && form.value.location;
});

// Watch title and description for auto-categorisation
let categoriseTimeout = null;
watch([() => form.value.title, () => form.value.description], async ([title, description]) => {
  if (categoriseTimeout) clearTimeout(categoriseTimeout);
  if (!title || title.length < 5) {
    autoCategorySuggestion.value = null;
    return;
  }
  
  categoriseTimeout = setTimeout(async () => {
    const result = await store.autoCategorise(title, description);
    if (result.confidence > 30 && result.category !== form.value.category) {
      autoCategorySuggestion.value = result;
    } else {
      autoCategorySuggestion.value = null;
    }
  }, 500);
});

// Watch location for duplicate detection
let duplicateTimeout = null;
watch(() => form.value.location, async (location) => {
  if (duplicateTimeout) clearTimeout(duplicateTimeout);
  if (!location || !form.value.category) {
    duplicateWarning.value = null;
    return;
  }
  
  duplicateTimeout = setTimeout(async () => {
    const result = await store.checkDuplicates(location.lat, location.lng, form.value.category);
    if (result.isDuplicate) {
      duplicateWarning.value = result;
    } else {
      duplicateWarning.value = null;
    }
  }, 300);
});

function applySuggestedCategory() {
  if (autoCategorySuggestion.value) {
    form.value.category = autoCategorySuggestion.value.category;
    autoCategorySuggestion.value = null;
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handlePhotoChange(e) {
  const file = e.target.files[0];
  if (file) {
    form.value.photo = file;
    photoPreview.value = URL.createObjectURL(file);
  }
}

function removePhoto() {
  form.value.photo = null;
  photoPreview.value = null;
  if (fileInput.value) fileInput.value.value = '';
}

async function submitReport() {
  if (!canSubmit.value || submitting.value) return;

  submitting.value = true;
  console.log('submitting report...');

  try {
    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('category', form.value.category);
    formData.append('lat', form.value.location.lat);
    formData.append('lng', form.value.location.lng);
    if (form.value.photo) {
      formData.append('photo', form.value.photo);
    }

    const res = await fetch('/api/reports', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Failed to submit');

    const result = await res.json();

    const data = {
      category: result.category,
      priority: result.priority,
      duplicateWarning: result.intelligence?.duplicateCheck?.isDuplicate || false
    };

    router.push({
      name: 'report-success',
      query: { id: result.id, data: JSON.stringify(data) }
    });
  } catch (e) {
    console.error(e);
    alert('Failed to submit report. Please try again.');
  } finally {
    submitting.value = false;
  }
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
</script>

<style scoped>
.new-report {
  max-width: 640px;
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
  font-size: 13px;
  margin-bottom: 12px;
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent);
}

.page-header h1 {
  margin-bottom: 4px;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 13px;
}

.form-container {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 24px;
}

.report-form input[type="text"],
.report-form textarea {
  width: 100%;
}

.report-form textarea {
  resize: none;
}

.form-section {
  margin-bottom: 28px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h2 {
  font-size: 15px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.section-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

@media (max-width: 600px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  text-align: center;
}

.category-btn:hover {
  border-color: var(--accent);
}

.category-btn.active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}

.cat-label {
  font-size: 13px;
}

.required {
  color: #dc2626;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 3px;
}

.photo-upload {
  margin-top: 6px;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border: 1px dashed var(--border);
  border-radius: 4px;
  cursor: pointer;
}

.upload-zone:hover {
  border-color: var(--accent);
  background: var(--accent-light);
}

.upload-zone svg {
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.upload-zone p {
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 2px;
}

.upload-zone span {
  font-size: 12px;
  color: var(--text-secondary);
}

.hidden-input {
  display: none;
}

.photo-preview {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.photo-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-photo:hover {
  background: rgba(0, 0, 0, 0.8);
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auto-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 6px 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  font-size: 12px;
}

.apply-btn {
  padding: 3px 8px;
  background: var(--accent);
  color: white;
  border-radius: 3px;
  font-size: 11px;
}

.apply-btn:hover {
  background: var(--accent-hover);
}

.duplicate-warning {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 4px;
  margin-top: 10px;
}

.warning-icon {
  color: #a16207;
  flex-shrink: 0;
}

.warning-content {
  font-size: 12px;
}

.warning-content strong {
  display: block;
  margin-bottom: 2px;
  color: #854d0e;
}

.warning-content p {
  margin: 2px 0;
  color: #854d0e;
}

.warning-hint {
  font-size: 11px;
  color: #a16207;
}
</style>
