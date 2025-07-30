import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في الطلب');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error.message || 'حدث خطأ في الاتصال');
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Authentication endpoints
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
    }
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async refreshToken() {
    const response = await this.post('/auth/refresh');
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // Notes endpoints
  async getNotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/notes?${queryString}` : '/notes';
    return this.get(endpoint);
  }

  async getNote(id) {
    return this.get(`/notes/${id}`);
  }

  async createNote(noteData) {
    return this.post('/notes', noteData);
  }

  async updateNote(id, noteData) {
    return this.put(`/notes/${id}`, noteData);
  }

  async deleteNote(id) {
    return this.delete(`/notes/${id}`);
  }

  async toggleNoteFavorite(id) {
    return this.patch(`/notes/${id}/favorite`);
  }

  async toggleNotePin(id) {
    return this.patch(`/notes/${id}/pin`);
  }

  async getNotesByWeek(weekId, dayKey) {
    return this.get(`/notes/week/${weekId}/day/${dayKey}`);
  }

  async getNotesByTask(taskId) {
    return this.get(`/notes/task/${taskId}`);
  }

  // Journal endpoints
  async getJournalEntries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/journal?${queryString}` : '/journal';
    return this.get(endpoint);
  }

  async getJournalEntry(id) {
    return this.get(`/journal/${id}`);
  }

  async createJournalEntry(entryData) {
    return this.post('/journal', entryData);
  }

  async updateJournalEntry(id, entryData) {
    return this.put(`/journal/${id}`, entryData);
  }

  async deleteJournalEntry(id) {
    return this.delete(`/journal/${id}`);
  }

  async getJournalByWeek(weekId, dayKey) {
    return this.get(`/journal/week/${weekId}/day/${dayKey}`);
  }

  // Progress endpoints
  async getProgress(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/progress?${queryString}` : '/progress';
    return this.get(endpoint);
  }

  async updateProgress(progressData) {
    return this.post('/progress', progressData);
  }

  async getProgressByWeek(weekId) {
    return this.get(`/progress/week/${weekId}`);
  }

  async getProgressByDay(weekId, dayKey) {
    return this.get(`/progress/week/${weekId}/day/${dayKey}`);
  }

  async completeTask(taskData) {
    return this.post('/progress/complete', taskData);
  }

  // Resources endpoints
  async getResources(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/resources?${queryString}` : '/resources';
    return this.get(endpoint);
  }

  async getResource(id) {
    return this.get(`/resources/${id}`);
  }

  async createResource(resourceData) {
    return this.post('/resources', resourceData);
  }

  async updateResource(id, resourceData) {
    return this.put(`/resources/${id}`, resourceData);
  }

  async deleteResource(id) {
    return this.delete(`/resources/${id}`);
  }

  async getResourcesByWeek(weekId, dayIndex) {
    return this.get(`/resources/week/${weekId}/day/${dayIndex}`);
  }

  // Analytics endpoints
  async getAnalytics(type, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/${type}?${queryString}` : `/analytics/${type}`;
    return this.get(endpoint);
  }

  async getUserAnalytics() {
    return this.get('/analytics/user');
  }

  async getProgressAnalytics() {
    return this.get('/analytics/progress');
  }

  async getAchievements() {
    return this.get('/analytics/achievements');
  }

  // User settings endpoints
  async getUserSettings() {
    return this.get('/users/settings');
  }

  async updateUserSettings(settings) {
    return this.put('/users/settings', settings);
  }

  async updateProfile(profileData) {
    return this.put('/users/profile', profileData);
  }

  async changePassword(passwordData) {
    return this.put('/users/password', passwordData);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'Connection failed' };
    }
  }

  // File upload
  async uploadFile(file, type = 'general') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في رفع الملف');
      }

      return data;
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.message || 'فشل في رفع الملف');
      throw error;
    }
  }

  // Export data
  async exportData(format = 'json') {
    return this.get(`/export?format=${format}`);
  }

  // Import data
  async importData(data, format = 'json') {
    return this.post(`/import?format=${format}`, data);
  }

  // Search
  async search(query, type = 'all') {
    return this.get(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  }

  // Notifications
  async getNotifications() {
    return this.get('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.patch(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead() {
    return this.patch('/notifications/read-all');
  }

  // WebSocket connection helper
  getWebSocketUrl() {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return baseUrl.replace('http', 'ws');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;