import axios from "axios";

// Use environment variable for production, fallback to proxy for development
//const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://school-health.onrender.com/api");

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];

      // Only redirect if not already on auth page
      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

// Nurse API endpoints
export const nurseAPI = {
  // Dashboard statistics
  getDashboardStats: () => api.get("/nurse/dashboard/stats"),

  // Recent medical events
  getRecentMedicalEvents: () => api.get("/nurse/dashboard/recent-events"),
  // All medical events for chart
  getAllMedicalEvents: () => api.get("/nurse/medical-events"),

  // Upcoming vaccinations
  getUpcomingVaccinations: () =>
    api.get("/nurse/dashboard/upcoming-vaccinations"),

  // Medical inventory
  getMedicalInventory: (params) => api.get("/nurse/inventory", { params }),
  createMedicalInventory: (data) => api.post("/nurse/inventory", data),
  updateMedicalInventory: (id, data) => api.put(`/nurse/inventory/${id}`, data),
  deleteMedicalInventory: (id) => api.delete(`/nurse/inventory/${id}`),
  getInventoryCategories: () => api.get("/nurse/inventory/categories"),

  // Pending medications
  getPendingMedicines: () => api.get("/nurse/medication-requests"),

  // Medicine statistics
  getMedicineStats: () => api.get("/medicines/statistics"),

  // Medical events
  getAllMedicalEvents: () => api.get("/nurse/medical-events"),
  createMedicalEvent: (data) => api.post("/nurse/medical-events", data),
  getMedicalEventById: (id) => api.get(`/nurse/medical-events/${id}`),
  updateMedicalEvent: (id, data) =>
    api.put(`/nurse/medical-events/${id}`, data),
  deleteMedicalEvent: (id) => api.delete(`/nurse/medical-events/${id}`),
  updateMedicalEventStatus: (id, data) =>
    api.patch(`/nurse/medical-events/${id}/status`, data),

  // Students for nurse
  getStudentsForNurse: () => api.get("/admin/students-for-nurse"),

  // Blog management
  getBlogs: (params) => api.get(`/nurse/blogs?${params}`),
  createBlog: (data) => api.post("/nurse/blogs", data),
  getBlogById: (id) => api.get(`/nurse/blogs/${id}`),
  updateBlog: (id, data) => api.put(`/nurse/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/nurse/blogs/${id}`),
  getBlogCategories: () => api.get("/nurse/blogs/categories"),
  uploadBlogImage: (formData) =>
    api.post("/upload/blog-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// User API endpoints
export const userAPI = {
  // Get current user profile
  getProfile: () => api.get("/auth/profile"),

  // Update current user profile
  updateProfile: (data) => api.put("/auth/profile", data),

  // Upload profile photo
  uploadProfilePhoto: (formData) =>
    api.post("/auth/profile/upload-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Admin API endpoints
export const adminAPI = {
  // Dashboard statistics
  getDashboardStats: () => api.get("/admin/dashboard/stats"),
};

export const parentAPI = {
  // Get children of logged-in parent
  getChildren: () => api.get("/parents/my-children"),

  // Get student details by ID
  getStudentById: (studentId) => api.get(`/parents/students/${studentId}`),

  // Health profile operations
  getHealthProfile: (studentId) =>
    api.get(`/parents/health-profile/${studentId}`),
  upsertHealthProfile: (studentId, data) =>
    api.post(`/parents/health-profile/${studentId}`, data),

  // Medicine operations
  getStudentMedicines: (studentId) =>
    api.get(`/parents/students/${studentId}/medicines`),
  requestMedication: (studentId, data) =>
    api.post(`/parents/request-medication/${studentId}`, data),

  // Get students by parent ID (for non-authenticated access)
  getStudentsByParentId: (parentId) =>
    api.get(`/parents/students?parentId=${parentId}`),

  // Vaccination operations
  getVaccinationHistory: (studentId) =>
    studentId
      ? api.get(`/parents/vaccination-history/${studentId}`)
      : api.get("/parents/vaccination-history"),
  getVaccinationDetail: (campaignId, studentId) =>
    api.get(`/parents/vaccination-detail/${campaignId}/${studentId}`),
  getVaccinationCampaigns: (studentId) =>
    api.get(`/parents/students/${studentId}/vaccination-campaigns`),

  // Notification operations
  getNotifications: (params) => api.get("/parents/notifications", { params }),
  getNotificationById: (notificationId) =>
    api.get(`/notifications/${notificationId}`),
  updateNotificationStatus: (notificationId, status) =>
    api.patch(`/parents/notifications/${notificationId}/status`, {
      status,
    }),
  archiveNotification: (notificationId) =>
    api.patch(`/parents/notifications/${notificationId}/archive`),
  restoreNotification: (notificationId) =>
    api.patch(`/parents/notifications/${notificationId}/restore`),
  getUnreadNotificationCount: (userId) =>
    api.get(`/notifications/user/${userId}/unread-count`),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
  markAllNotificationsAsRead: (userId) =>
    api.patch(`/notifications/user/${userId}/read-all`),
};

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  verify: async () => {
    const response = await api.get("/auth/verify");
    return response.data;
  },
};

export const managerAPI = {
  getAllManagerStudents: () => api.get("/manager/students"),
  addManagerStudent: (data) => api.post("/manager/students", data),
  updateManagerStudent: (id, data) => api.put(`/manager/students/${id}`, data),
  deleteManagerStudent: (id) => api.delete(`/manager/students/${id}`),
  filterManagerStudents: (params) =>
    api.get("/manager/students/filter", { params }),
  getAllParents: () => api.get("/manager/students/parents"),
  createParent: (data) => api.post("/manager/students/parents", data),
  getDashboardStats: () => api.get("/manager/students/dashboard-stats"),
};

export default api;

// Public API endpoints (no authentication required)
export const publicAPI = {
  // Get published blog posts for homepage
  getPublishedBlogs: (params) => api.get(`/blogs/published?${params}`),
  getBlogCategories: () => api.get("/blogs/categories"),
  getBlogById: (id) => api.get(`/blogs/${id}`),
};

// Token utilities
export const tokenUtils = {
  getToken: () => localStorage.getItem("token"),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
      // Optionally set default header for axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
  removeToken: () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  },
};
