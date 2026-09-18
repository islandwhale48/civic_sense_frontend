import { apiRequest } from './api';

export const issueService = {
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
  }
};

export default issueService;
