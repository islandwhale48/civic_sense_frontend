import { apiRequest } from './api';

const ADMIN_PIN_HEADER = (pin) => ({ 'x-admin-pin': pin });

export const issueService = {
  // Citizen Registration & Login
  async registerCitizen(name, email, password) {
    return apiRequest('/users/register', {
      method: 'POST',
      body: { name, email, password }
    });
  },

  async loginCitizen(email, password) {
    return apiRequest('/users/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  // Get all issues with filters (status, category, search, sort)

  async getIssues(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    if (params.ward) query.append('ward', params.ward);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/issues${queryString}`);
  },

  // Get single issue
  async getIssueById(id) {
    return apiRequest(`/issues/${id}`);
  },

  // Create new issue with multipart form (image, location, title, desc)
  async createIssue(formData) {
    return apiRequest('/issues', {
      method: 'POST',
      body: formData
    });
  },

  // Toggle support / upvote
  async toggleSupport(id) {
    return apiRequest(`/issues/${id}/support`, {
      method: 'POST'
    });
  },

  // Preview jurisdiction, ward, and department routing before submit
  async previewRouting(lat, lng, category) {
    return apiRequest('/issues/route-authority', {
      method: 'POST',
      body: { latitude: lat, longitude: lng, category }
    });
  },

  // AI Description Refiner
  async refineDescription(description, category, title) {
    return apiRequest('/issues/ai-refine', {
      method: 'POST',
      body: { description, category, title }
    });
  },

  // ── Authority Panel & Login ──────────────────────────────────────────────────

  // Ward Authority Login
  async loginAuthority(ward_id, password) {
    return apiRequest('/authority/login', {
      method: 'POST',
      body: { ward_id, password }
    });
  },

  // Get list of registered Ward Authority accounts (for demo testing & selection)
  async getAuthorityAccounts() {
    return apiRequest('/authority/accounts');
  },

  // Get issues assigned to a specific local body / authority / ward_id
  async getIssuesByAuthority(params = {}) {
    const query = new URLSearchParams();
    if (params.ward_id) query.append('ward_id', params.ward_id);
    if (params.authority) query.append('authority', params.authority);
    if (params.ward) query.append('ward', params.ward);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/issues/by-authority${queryString}`);
  },


  // Update issue status (authority action)
  async updateIssueStatus(id, status, note = '', authorityName = '') {
    return apiRequest(`/issues/${id}/status`, {
      method: 'PATCH',
      body: { status, note, authorityName }
    });
  },

  // Submit resolution with completion photo
  async submitResolution(id, formData) {
    return apiRequest(`/issues/${id}/resolution`, {
      method: 'POST',
      body: formData
    });
  },

  // ── Admin Panel ──────────────────────────────────────────────────────────────

  // Get all pending resolutions for admin review
  async getPendingResolutions(adminPin) {
    return apiRequest('/admin/pending-resolutions', {
      headers: ADMIN_PIN_HEADER(adminPin)
    });
  },

  // Admin approve or reject a resolution
  async reviewResolution(id, decision, adminNotes = '', adminPin, adminName = 'Admin') {
    return apiRequest(`/issues/${id}/resolution/review`, {
      method: 'POST',
      body: { decision, adminNotes, adminName, adminPin }
    });
  }
};

export default issueService;
