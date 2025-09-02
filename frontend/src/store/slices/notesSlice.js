import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async ({ page = 1, limit = 10, patient_id, author_id, type, priority, status, search = '', sort = 'created_at', order = 'DESC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        patient_id,
        author_id,
        type,
        priority,
        status,
        search,
        sort,
        order
      });
      
      const response = await axios.get(`/api/notes?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar anotações');
    }
  }
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/notes/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar anotação');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/notes', noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar anotação');
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, ...noteData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/notes/${id}`, noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar anotação');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar anotação');
    }
  }
);

export const fetchPatientNotes = createAsyncThunk(
  'notes/fetchPatientNotes',
  async ({ patient_id, type, priority, status, sort = 'created_at', order = 'DESC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        patient_id,
        type,
        priority,
        status,
        sort,
        order
      });
      
      const response = await axios.get(`/api/notes/patient/${patient_id}?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar anotações do paciente');
    }
  }
);

export const fetchAuthorNotes = createAsyncThunk(
  'notes/fetchAuthorNotes',
  async ({ author_id, type, priority, status, sort = 'created_at', order = 'DESC' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        author_id,
        type,
        priority,
        status,
        sort,
        order
      });
      
      const response = await axios.get(`/api/notes/author/${author_id}?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar anotações do autor');
    }
  }
);

export const searchNotes = createAsyncThunk(
  'notes/searchNotes',
  async ({ q, patient_id, type, priority, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        q,
        patient_id,
        type,
        priority,
        limit
      });
      
      const response = await axios.get(`/api/notes/search?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar anotações');
    }
  }
);

const initialState = {
  notes: [],
  currentNote: null,
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
    author_id: '',
    type: '',
    priority: '',
    status: '',
    search: ''
  }
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNotesState: (state) => {
      state.notes = [];
      state.currentNote = null;
      state.error = null;
      state.success = null;
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
        author_id: '',
        type: '',
        priority: '',
        status: '',
        search: ''
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.data.notes;
        state.pagination = action.data.pagination;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch note by ID
      .addCase(fetchNoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNote = action.data.note;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create note
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes.unshift(action.data.note);
        state.success = 'Anotação criada com sucesso!';
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notes.findIndex(n => n.id === action.data.note.id);
        if (index !== -1) {
          state.notes[index] = action.data.note;
        }
        if (state.currentNote && state.currentNote.id === action.data.note.id) {
          state.currentNote = action.data.note;
        }
        state.success = 'Anotação atualizada com sucesso!';
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = state.notes.filter(n => n.id !== action.payload);
        if (state.currentNote && state.currentNote.id === action.payload) {
          state.currentNote = null;
        }
        state.success = 'Anotação deletada com sucesso!';
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch patient notes
      .addCase(fetchPatientNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchPatientNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.data.notes;
      })
      .addCase(fetchPatientNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch author notes
      .addCase(fetchAuthorNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchAuthorNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.data.notes;
      })
      .addCase(fetchAuthorNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search notes
      .addCase(searchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(searchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.data.notes;
      })
      .addCase(searchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotesState, clearError, clearSuccess, setFilters, resetFilters } = notesSlice.actions;
export default notesSlice.reducer;