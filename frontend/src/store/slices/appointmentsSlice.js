import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ page = 1, limit = 10, patient_id, doctor_id, status, type, start_date, end_date, sort = 'scheduled_for', order = 'ASC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        patient_id,
        doctor_id,
        status,
        type,
        start_date,
        end_date,
        sort,
        order
      });
      
      const response = await axios.get(`/api/appointments?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar agendamentos');
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar agendamento');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/appointments', appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar agendamento');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, ...appointmentData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar agendamento');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/appointments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar agendamento');
    }
  }
);

export const fetchPatientAppointments = createAsyncThunk(
  'appointments/fetchPatientAppointments',
  async ({ patient_id, status, type, start_date, end_date, sort = 'scheduled_for', order = 'ASC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        patient_id,
        status,
        type,
        start_date,
        end_date,
        sort,
        order
      });
      
      const response = await axios.get(`/api/appointments/patient/${patient_id}?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar agendamentos do paciente');
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  'appointments/fetchDoctorAppointments',
  async ({ doctor_id, status, type, start_date, end_date, sort = 'scheduled_for', order = 'ASC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        doctor_id,
        status,
        type,
        start_date,
        end_date,
        sort,
        order
      });
      
      const response = await axios.get(`/api/appointments/doctor/${doctor_id}?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar agendamentos do médico');
    }
  }
);

export const fetchUpcomingAppointments = createAsyncThunk(
  'appointments/fetchUpcomingAppointments',
  async ({ limit = 5 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        limit
      });
      
      const response = await axios.get(`/api/appointments/upcoming?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar próximos agendamentos');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/appointments/${id}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao cancelar agendamento');
    }
  }
);

export const confirmAppointment = createAsyncThunk(
  'appointments/confirmAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/appointments/${id}/confirm`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao confirmar agendamento');
    }
  }
);

const initialState = {
  appointments: [],
  currentAppointment: null,
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
    doctor_id: '',
    status: '',
    type: '',
    start_date: '',
    end_date: ''
  },
  upcomingAppointments: []
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointmentsState: (state) => {
      state.appointments = [];
      state.currentAppointment = null;
      state.error = null;
      state.success = null;
      state.upcomingAppointments = [];
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
        doctor_id: '',
        status: '',
        type: '',
        start_date: '',
        end_date: ''
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.data.appointments;
        state.pagination = action.data.pagination;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch appointment by ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.data.appointment;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.unshift(action.data.appointment);
        state.success = 'Agendamento criado com sucesso!';
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a.id === action.data.appointment.id);
        if (index !== -1) {
          state.appointments[index] = action.data.appointment;
        }
        if (state.currentAppointment && state.currentAppointment.id === action.data.appointment.id) {
          state.currentAppointment = action.data.appointment;
        }
        state.success = 'Agendamento atualizado com sucesso!';
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = state.appointments.filter(a => a.id !== action.payload);
        if (state.currentAppointment && state.currentAppointment.id === action.payload) {
          state.currentAppointment = null;
        }
        state.success = 'Agendamento deletado com sucesso!';
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch patient appointments
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.data.appointments;
      })
      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch doctor appointments
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.data.appointments;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch upcoming appointments
      .addCase(fetchUpcomingAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchUpcomingAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingAppointments = action.data.appointments;
      })
      .addCase(fetchUpcomingAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a.id === action.data.appointment.id);
        if (index !== -1) {
          state.appointments[index] = action.data.appointment;
        }
        if (state.currentAppointment && state.currentAppointment.id === action.data.appointment.id) {
          state.currentAppointment = action.data.appointment;
        }
        state.success = 'Agendamento cancelado com sucesso!';
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm appointment
      .addCase(confirmAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a.id === action.data.appointment.id);
        if (index !== -1) {
          state.appointments[index] = action.data.appointment;
        }
        if (state.currentAppointment && state.currentAppointment.id === action.data.appointment.id) {
          state.currentAppointment = action.data.appointment;
        }
        state.success = 'Agendamento confirmado com sucesso!';
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAppointmentsState, clearError, clearSuccess, setFilters, resetFilters } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;