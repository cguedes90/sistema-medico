import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async ({ page = 1, limit = 10, patient_id, category, search = '', sort = 'created_at', order = 'DESC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        patient_id,
        category,
        search,
        sort,
        order
      });
      
      const response = await axios.get(`/api/documents?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar documentos');
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/documents/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar documento');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ formData, patient_id, category, title, description, tags, is_sensitive }, { rejectWithValue }) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData);
      formDataToSend.append('patient_id', patient_id);
      formDataToSend.append('category', category);
      formDataToSend.append('title', title);
      if (description) formDataToSend.append('description', description);
      if (tags) formDataToSend.append('tags', JSON.stringify(tags));
      if (is_sensitive) formDataToSend.append('is_sensitive', is_sensitive);

      const response = await axios.post('/api/documents/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao fazer upload do documento');
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, ...documentData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/documents/${id}`, documentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar documento');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/documents/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar documento');
    }
  }
);

export const downloadDocument = createAsyncThunk(
  'documents/downloadDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/documents/${id}/download`, {
        responseType: 'blob'
      });
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao baixar documento');
    }
  }
);

export const fetchPatientDocuments = createAsyncThunk(
  'documents/fetchPatientDocuments',
  async ({ patient_id, category, sort = 'created_at', order = 'DESC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        patient_id,
        category,
        sort,
        order
      });
      
      const response = await axios.get(`/api/documents/patient/${patient_id}?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar documentos do paciente');
    }
  }
);

const initialState = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    patient_id: '',
    category: '',
    search: ''
  },
  uploadProgress: 0
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocumentsState: (state) => {
      state.documents = [];
      state.currentDocument = null;
      state.error = null;
      state.success = null;
      state.uploadProgress = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        patient_id: '',
        category: '',
        search: ''
      };
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.data.documents;
        state.pagination = action.data.pagination;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.data.document;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.data.document);
        state.success = 'Documento enviado com sucesso!';
        state.uploadProgress = 100;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(d => d.id === action.data.document.id);
        if (index !== -1) {
          state.documents[index] = action.data.document;
        }
        if (state.currentDocument && state.currentDocument.id === action.data.document.id) {
          state.currentDocument = action.data.document;
        }
        state.success = 'Documento atualizado com sucesso!';
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(d => d.id !== action.payload);
        if (state.currentDocument && state.currentDocument.id === action.payload) {
          state.currentDocument = null;
        }
        state.success = 'Documento deletado com sucesso!';
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Download document
      .addCase(downloadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(downloadDocument.fulfilled, (state, action) => {
        state.loading = false;
        const { id, data } = action.payload;
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `documento_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        state.success = 'Documento baixado com sucesso!';
      })
      .addCase(downloadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch patient documents
      .addCase(fetchPatientDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchPatientDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.data.documents;
      })
      .addCase(fetchPatientDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDocumentsState, clearError, clearSuccess, setFilters, resetFilters, setUploadProgress } = documentsSlice.actions;
export default documentsSlice.reducer;