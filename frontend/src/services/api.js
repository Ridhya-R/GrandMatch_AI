/**
 * API Client for GrantMatch
 * Centralizes all REST endpoints and handles JWT tokens
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('grantmatch_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || 'An unexpected error occurred.';
    throw new Error(message);
  }
  return data;
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateProfile: async (profileData) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  demoLogin: async (role = 'user') => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  // Opportunities & Rule-Based Match
  getOpportunities: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        params.append(key, val);
      }
    });
    const res = await fetch(`/api/opportunities?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getOpportunityById: async (id) => {
    const res = await fetch(`/api/opportunities/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  calculateMatch: async (criteria = {}) => {
    const res = await fetch('/api/opportunities/match', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(criteria),
    });
    return handleResponse(res);
  },

  // Saved Opportunities / Bookmarks
  getSavedOpportunities: async () => {
    const res = await fetch('/api/saved', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  toggleSaveOpportunity: async (opportunityId) => {
    const res = await fetch(`/api/saved/${opportunityId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  removeSavedOpportunity: async (opportunityId) => {
    const res = await fetch(`/api/saved/${opportunityId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Applications
  getApplications: async () => {
    const res = await fetch('/api/applications', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  saveApplication: async (data) => {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateApplication: async (id, data) => {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteApplication: async (id) => {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch('/api/notifications', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Operations
  getAdminStats: async () => {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getAdminOpportunities: async () => {
    const res = await fetch('/api/admin/opportunities', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  addOpportunity: async (oppData) => {
    const res = await fetch('/api/admin/opportunities', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(oppData),
    });
    return handleResponse(res);
  },

  updateOpportunity: async (id, oppData) => {
    const res = await fetch(`/api/admin/opportunities/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(oppData),
    });
    return handleResponse(res);
  },

  deleteOpportunity: async (id) => {
    const res = await fetch(`/api/admin/opportunities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  autoExpireOpportunities: async () => {
    const res = await fetch('/api/admin/auto-expire', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getAdminUsers: async () => {
    const res = await fetch('/api/admin/users', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },


  // AI Scholarship Recommendations
  getAIRecommendations: async () => {
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    return handleResponse(res);
  },

  resetSeedData: async () => {

    const res = await fetch('/api/admin/seed-reset', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
