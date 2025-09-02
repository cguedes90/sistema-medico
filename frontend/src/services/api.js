import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Mock data for development
const mockData = {
  patients: [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-1111',
      birth_date: '1985-03-15',
      gender: 'Masculino',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      created_at: '2025-01-15T10:30:00Z',
      updated_at: '2025-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 99999-2222',
      birth_date: '1990-07-22',
      gender: 'Feminino',
      address: 'Av. Paulista, 456 - São Paulo, SP',
      created_at: '2025-01-16T14:20:00Z',
      updated_at: '2025-01-16T14:20:00Z'
    }
  ],
  documents: [
    {
      id: 1,
      title: 'Exame de Sangue',
      original_name: 'exame_sangue.pdf',
      file_url: 'https://example.com/files/exame_sangue.pdf',
      file_size: 2048576,
      category: 'exame',
      patient_id: 1,
      patient_name: 'João Silva',
      extraction_status: 'completed',
      created_at: '2025-01-15T11:00:00Z'
    },
    {
      id: 2,
      title: 'Receita Médica',
      original_name: 'receita_medica.pdf',
      file_url: 'https://example.com/files/receita_medica.pdf',
      file_size: 1024000,
      category: 'receita',
      patient_id: 2,
      patient_name: 'Maria Santos',
      extraction_status: 'processing',
      created_at: '2025-01-16T15:30:00Z'
    }
  ],
  notes: [
    {
      id: 1,
      title: 'Consulta Inicial',
      content: 'Paciente queixa-se de dor de cabeça há 3 dias.',
      patient_id: 1,
      patient_name: 'João Silva',
      author_id: 1,
      author_name: 'Dr. Carlos',
      type: 'consulta',
      created_at: '2025-01-15T12:00:00Z'
    },
    {
      id: 2,
      title: 'Acompanhamento',
      content: 'Paciente em tratamento, evolução positiva.',
      patient_id: 2,
      patient_name: 'Maria Santos',
      author_id: 1,
      author_name: 'Dr. Carlos',
      type: 'acompanhamento',
      created_at: '2025-01-16T16:00:00Z'
    }
  ],
  dashboard: {
    total_patients: 2,
    total_documents: 2,
    total_notes: 2,
    patient_growth: 15,
    document_growth: 25,
    note_growth: 10
  }
};

// Mock API responses
const mockAPI = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  login: async (credentials) => {
    await mockAPI.delay(500);
    if (credentials.email === 'admin@sistema-medico.com' && credentials.password === 'admin123') {
      return {
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            name: 'Administrador',
            email: 'admin@sistema-medico.com',
            role: 'admin',
            crm: null,
            specialty: null,
            phone: null,
            profile_image: null
          }
        }
      };
    }
    throw new Error('Credenciais inválidas');
  },
  
  getPatients: async (params = {}) => {
    await mockAPI.delay(300);
    const patients = mockData.patients;
    return {
      data: {
        patients: patients.slice(0, params.limit || 10),
        total: patients.length
      }
    };
  },
  
  getDocuments: async (params = {}) => {
    await mockAPI.delay(300);
    const documents = mockData.documents;
    return {
      data: {
        documents: documents.slice(0, params.limit || 10),
        total: documents.length
      }
    };
  },
  
  getNotes: async (params = {}) => {
    await mockAPI.delay(300);
    const notes = mockData.notes;
    return {
      data: {
        notes: notes.slice(0, params.limit || 10),
        total: notes.length
      }
    };
  },
  
  getDashboardStats: async () => {
    await mockAPI.delay(500);
    return {
      data: mockData.dashboard
    };
  },
  
  getProfile: async () => {
    await mockAPI.delay(300);
    return {
      data: {
        id: 1,
        name: 'Administrador',
        email: 'admin@sistema-medico.com',
        role: 'admin',
        crm: null,
        specialty: null,
        phone: '(11) 99999-0000',
        profile_image: null,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    };
  }
};

// Use mock API in development
const useMockAPI = true; // Temporariamente ativar mock para testar

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    if (useMockAPI) {
      return mockAPI.login(credentials);
    }
    return api.post('/auth/login', credentials);
  },
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getProfile: () => {
    if (useMockAPI) {
      return mockAPI.getProfile();
    }
    return api.get('/auth/me');
  },
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Patients API
export const patientsAPI = {
  getAll: (params = {}) => {
    if (useMockAPI) {
      return mockAPI.getPatients(params);
    }
    return api.get('/patients', { params });
  },
  getById: (id) => api.get(`/patients/${id}`),
  create: (patientData) => api.post('/patients', patientData),
  update: (id, patientData) => api.put(`/patients/${id}`, patientData),
  delete: (id) => api.delete(`/patients/${id}`),
  search: (query) => api.get('/patients/search', { params: { q: query } }),
  getTimeline: (id) => api.get(`/patients/${id}/timeline`),
  getDocuments: (id, params = {}) => api.get(`/patients/${id}/documents`, { params }),
  getNotes: (id, params = {}) => api.get(`/patients/${id}/notes`, { params }),
  getAppointments: (id, params = {}) => api.get(`/patients/${id}/appointments`, { params }),
};

// Documents API
export const documentsAPI = {
  getAll: (params = {}) => {
    if (useMockAPI) {
      return mockAPI.getDocuments(params);
    }
    return api.get('/documents', { params });
  },
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, documentData) => api.put(`/documents/${id}`, documentData),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  extractText: (id) => api.post(`/documents/${id}/extract-text`),
  analyzeWithAI: (id) => api.post(`/documents/${id}/analyze-ai`),
  getByCategory: (category, params = {}) => api.get(`/documents/category/${category}`, { params }),
  getByPatient: (patientId, params = {}) => api.get(`/documents/patient/${patientId}`, { params }),
};

// Notes API
export const notesAPI = {
  getAll: (params = {}) => {
    if (useMockAPI) {
      return mockAPI.getNotes(params);
    }
    return api.get('/notes', { params });
  },
  getById: (id) => api.get(`/notes/${id}`),
  create: (noteData) => api.post('/notes', noteData),
  update: (id, noteData) => api.put(`/notes/${id}`, noteData),
  delete: (id) => api.delete(`/notes/${id}`),
  getByPatient: (patientId, params = {}) => api.get(`/notes/patient/${patientId}`, { params }),
  getByAuthor: (authorId, params = {}) => api.get(`/notes/author/${authorId}`, { params }),
  search: (query) => api.get('/notes/search', { params: { q: query } }),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params = {}) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id) => api.delete(`/appointments/${id}`),
  getByPatient: (patientId, params = {}) => api.get(`/appointments/patient/${patientId}`, { params }),
  getByDoctor: (doctorId, params = {}) => api.get(`/appointments/doctor/${doctorId}`, { params }),
  getUpcoming: (params = {}) => api.get('/appointments/upcoming', { params }),
  getAvailableSlots: (date, doctorId) => api.get(`/appointments/available-slots`, { params: { date, doctorId } }),
  cancel: (id, reason) => api.post(`/appointments/${id}/cancel`, { reason }),
  reschedule: (id, newDate, newTime) => api.post(`/appointments/${id}/reschedule`, { newDate, newTime }),
  getDaySchedule: (date) => {
    // Mock data para demonstração da agenda médica
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              scheduled_at: `${date}T08:00:00Z`,
              appointment_type: 'primeira_vez',
              status: 'confirmado',
              observations: 'Paciente novo, relatou dores de cabeça recorrentes nos últimos 2 meses. Histórico familiar de hipertensão. Solicitados exames: hemograma completo, glicemia.',
              patient: {
                id: 1,
                name: 'Maria Silva',
                age: 45,
                phone: '(11) 98765-4321',
                last_visit: null,
                conditions: ['Hipertensão']
              }
            },
            {
              id: 2,
              scheduled_at: `${date}T09:30:00Z`,
              appointment_type: 'retorno',
              status: 'agendado',
              observations: 'Retorno para acompanhamento de diabetes. Paciente apresentou melhora nos níveis glicêmicos com a nova medicação. Solicitado ajuste na dieta.',
              patient: {
                id: 2,
                name: 'João Santos',
                age: 62,
                phone: '(11) 94567-8901',
                last_visit: '2024-12-15',
                conditions: ['Diabetes Tipo 2', 'Colesterol Alto']
              }
            },
            {
              id: 3,
              scheduled_at: `${date}T11:00:00Z`,
              appointment_type: 'acompanhamento',
              status: 'confirmado',
              observations: 'Acompanhamento pós-cirúrgico. Cicatrização dentro do esperado. Paciente sem dor significativa. Orientado sobre exercícios de reabilitação.',
              patient: {
                id: 3,
                name: 'Ana Costa',
                age: 38,
                phone: '(11) 91234-5678',
                last_visit: '2024-12-10',
                conditions: ['Pós-operatório']
              }
            },
            {
              id: 4,
              scheduled_at: `${date}T14:00:00Z`,
              appointment_type: 'urgencia',
              status: 'em_andamento',
              observations: 'Paciente com quadro de dor torácica. Chegou pela manhã com sintomas. ECG normal, aguardando resultado de enzimas cardíacas.',
              patient: {
                id: 4,
                name: 'Carlos Oliveira',
                age: 55,
                phone: '(11) 99876-5432',
                last_visit: '2024-10-22',
                conditions: ['Arritmia']
              }
            },
            {
              id: 5,
              scheduled_at: `${date}T16:30:00Z`,
              appointment_type: 'retorno',
              status: 'agendado',
              observations: 'Retorno para avaliação de tratamento para ansiedade. Paciente relatou melhora significativa após início da terapia. Medicação bem tolerada.',
              patient: {
                id: 5,
                name: 'Fernanda Lima',
                age: 29,
                phone: '(11) 95432-1098',
                last_visit: '2024-11-28',
                conditions: ['Ansiedade', 'Insônia']
              }
            }
          ]
        });
      }, 300);
    });
  }
};

// AI API
export const aiAPI = {
  analyzeDocument: (documentId) => api.post(`/ai/analyze-document/${documentId}`),
  generateInsights: (patientId) => api.post(`/ai/generate-insights/${patientId}`),
  getRecommendations: (patientId) => api.post(`/ai/recommendations/${patientId}`),
  analyzeText: (text) => api.post('/ai/analyze-text', { text }),
  summarizeDocument: (documentId) => api.post(`/ai/summarize-document/${documentId}`),
  extractMedicalInfo: (text) => api.post('/ai/extract-medical-info', { text }),
  generateReport: (patientId, type) => api.post(`/ai/generate-report/${patientId}`, { type }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => {
    if (useMockAPI) {
      return mockAPI.getDashboardStats();
    }
    return api.get('/dashboard/stats');
  },
  getRecentPatients: () => api.get('/dashboard/recent-patients'),
  getRecentAppointments: () => api.get('/dashboard/recent-appointments'),
  getDocumentsByCategory: () => api.get('/dashboard/documents-by-category'),
  getMonthlyStats: (year, month) => api.get('/dashboard/monthly-stats', { params: { year, month } }),
  getTopPatients: (limit = 10) => api.get('/dashboard/top-patients', { params: { limit } }),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, password) => api.post(`/users/${id}/change-password`, { password }),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
};

// Upload API
export const uploadAPI = {
  uploadFile: (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (fileId) => api.delete(`/upload/${fileId}`),
  getSignedUrl: (fileId) => api.get(`/upload/signed-url/${fileId}`),
};

// Export API instance
export { api };

// Helper functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      status,
      message: data.error || data.message || 'Erro na requisição',
      details: data.details || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      status: 0,
      message: 'Erro de conexão. Verifique sua internet.',
      details: null,
    };
  } else {
    // Something else happened
    return {
      status: 0,
      message: error.message || 'Erro desconhecido',
      details: null,
    };
  }
};

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageExtensions.includes(getFileExtension(filename).toLowerCase());
};

export const isPdfFile = (filename) => {
  return getFileExtension(filename).toLowerCase() === 'pdf';
};

export const isDocumentFile = (filename) => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  return documentExtensions.includes(getFileExtension(filename).toLowerCase());
};