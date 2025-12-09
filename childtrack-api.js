// api-config.js - API Configuration and Helper Functions
// Place this file in the same directory as your HTML files

const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api', // Change this to your Django server URL
  ENDPOINTS: {
    REGISTER: '/register/',
    LOGIN: '/login/',
    ATTENDANCE: '/attendance/',
    ABSENCES: '/absences/',
    DROPOUTS: '/dropouts/',
    UNAUTHORIZED: '/unauthorized/',
  }
};

// API Helper Class
class APIHelper {
  constructor() {
    this.token = this.getToken();
    this.teacherId = this.getTeacherId();
  }

  // Token Management
  getToken() {
    return sessionStorage.getItem('auth_token');
  }

  setToken(token) {
    sessionStorage.setItem('auth_token', token);
    this.token = token;
  }

  removeToken() {
    sessionStorage.removeItem('auth_token');
    this.token = null;
  }

  // Teacher ID Management
  getTeacherId() {
    return sessionStorage.getItem('teacher_id');
  }

  setTeacherId(id) {
    sessionStorage.setItem('teacher_id', id);
    this.teacherId = id;
  }

  removeTeacherId() {
    sessionStorage.removeItem('teacher_id');
    this.teacherId = null;
  }

  // Get Headers with Auth Token
  getHeaders(includeContentType = true) {
    const headers = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  // Generic API Request
  async request(endpoint, method = 'GET', data = null) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('Unauthorized. Please login again.');
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Request failed');
      }

      return responseData;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Handle Unauthorized Access
  handleUnauthorized() {
    this.removeToken();
    this.removeTeacherId();
    alert('Your session has expired. Please login again.');
    window.location.href = 'Teacher_s login.html';
  }

  // Authentication APIs
  async register(teacherData) {
    return await this.request(API_CONFIG.ENDPOINTS.REGISTER, 'POST', teacherData);
  }

  async login(credentials) {
    const response = await this.request(API_CONFIG.ENDPOINTS.LOGIN, 'POST', credentials);
    
    if (response.token) {
      this.setToken(response.token);
      this.setTeacherId(response.teacher_id);
    }
    
    return response;
  }

  logout() {
    this.removeToken();
    this.removeTeacherId();
    window.location.href = 'Teacher_s login.html';
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Attendance APIs
  async getAttendance() {
    return await this.request(API_CONFIG.ENDPOINTS.ATTENDANCE);
  }

  async createAttendance(data) {
    return await this.request(API_CONFIG.ENDPOINTS.ATTENDANCE, 'POST', data);
  }

  async updateAttendance(id, data) {
    return await this.request(`${API_CONFIG.ENDPOINTS.ATTENDANCE}${id}/`, 'PUT', data);
  }

  async deleteAttendance(id) {
    return await this.request(`${API_CONFIG.ENDPOINTS.ATTENDANCE}${id}/`, 'DELETE');
  }

  // Absence APIs
  async getAbsences() {
    return await this.request(API_CONFIG.ENDPOINTS.ABSENCES);
  }

  async createAbsence(data) {
    return await this.request(API_CONFIG.ENDPOINTS.ABSENCES, 'POST', data);
  }

  async updateAbsence(id, data) {
    return await this.request(`${API_CONFIG.ENDPOINTS.ABSENCES}${id}/`, 'PUT', data);
  }

  async deleteAbsence(id) {
    return await this.request(`${API_CONFIG.ENDPOINTS.ABSENCES}${id}/`, 'DELETE');
  }

  // Dropout APIs
  async getDropouts() {
    return await this.request(API_CONFIG.ENDPOINTS.DROPOUTS);
  }

  async createDropout(data) {
    return await this.request(API_CONFIG.ENDPOINTS.DROPOUTS, 'POST', data);
  }

  async updateDropout(id, data) {
    return await this.request(`${API_CONFIG.ENDPOINTS.DROPOUTS}${id}/`, 'PUT', data);
  }

  async deleteDropout(id) {
    return await this.request(`${API_CONFIG.ENDPOINTS.DROPOUTS}${id}/`, 'DELETE');
  }

  // Unauthorized Person APIs
  async getUnauthorizedPersons() {
    return await this.request(API_CONFIG.ENDPOINTS.UNAUTHORIZED);
  }

  async createUnauthorizedPerson(data) {
    return await this.request(API_CONFIG.ENDPOINTS.UNAUTHORIZED, 'POST', data);
  }

  async updateUnauthorizedPerson(id, data) {
    return await this.request(`${API_CONFIG.ENDPOINTS.UNAUTHORIZED}${id}/`, 'PUT', data);
  }

  async deleteUnauthorizedPerson(id) {
    return await this.request(`${API_CONFIG.ENDPOINTS.UNAUTHORIZED}${id}/`, 'DELETE');
  }
}

// Create global API instance
const api = new APIHelper();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { api, APIHelper, API_CONFIG };
}