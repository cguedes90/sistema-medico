import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

// Async thunks
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erro ao buscar pacientes');
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchPatientById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erro ao buscar paciente');
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erro ao criar paciente');
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, ...patientData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erro ao atualizar paciente');
    }
  }
);

export const deletePatient = createAsyncThunk(
  'patients/deletePatient',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erro ao deletar paciente');
    }
  }
);

export const searchPatients = createAsyncThunk(
  'patients/searchPatients',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients/search', { params: { q: searchTerm } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erro ao buscar pacientes');
    }
  }
);

const initialState = {
  patients: [],
  currentPatient: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  searchQuery: '',
  filters: {
    status: 'active',
    specialty: '',
    dateRange: null,
  },
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPatientFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCurrentPatient: (state, action) => {
      state.currentPatient = action.payload;
    },
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
    resetPatients: (state) => {
      state.patients = [];
      state.currentPatient = null;
      state.total = 0;
      state.page = 1;
      state.searchQuery = '';
      state.filters = {
        status: 'active',
        specialty: '',
        dateRange: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.data.patients || [];
        state.total = action.data.total || 0;
        state.page = action.data.page || 1;
        state.limit = action.data.limit || 10;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Patient by ID
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.data;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Patient
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.unshift(action.data);
        state.total += 1;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Patient
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.patients.findIndex(p => p.id === action.data.id);
        if (index !== -1) {
          state.patients[index] = action.data;
        }
        if (state.currentPatient && state.currentPatient.id === action.data.id) {
          state.currentPatient = action.data;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Patient
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.filter(p => p.id !== action.payload);
        state.total -= 1;
        if (state.currentPatient && state.currentPatient.id === action.payload) {
          state.currentPatient = null;
        }
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Patients
      .addCase(searchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.data.patients || [];
        state.total = action.data.total || 0;
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setPatientFilters,
  setSearchQuery,
  setCurrentPatient,
  clearCurrentPatient,
  resetPatients,
} = patientSlice.actions;

export default patientSlice.reducer;