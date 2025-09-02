import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  loading: false,
  darkMode: false,
  theme: 'light',
  notifications: [],
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 5000
  },
  modal: {
    open: false,
    title: '',
    content: null,
    actions: [],
    maxWidth: 'sm'
  },
  drawer: {
    open: false,
    anchor: 'right',
    content: null
  },
  dialog: {
    open: false,
    title: '',
    content: null,
    actions: [],
    maxWidth: 'md'
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      state.theme = state.darkMode ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      state.darkMode = action.payload === 'dark';
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.notifications.unshift(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    showSnackbar: (state, action) => {
      state.snackbar = {
        open: true,
        ...action.payload
      };
    },
    hideSnackbar: (state) => {
      state.snackbar = {
        ...state.snackbar,
        open: false
      };
    },
    showModal: (state, action) => {
      state.modal = {
        open: true,
        ...action.payload
      };
    },
    hideModal: (state) => {
      state.modal = {
        ...state.modal,
        open: false
      };
    },
    showDrawer: (state, action) => {
      state.drawer = {
        open: true,
        ...action.payload
      };
    },
    hideDrawer: (state) => {
      state.drawer = {
        ...state.drawer,
        open: false
      };
    },
    showDialog: (state, action) => {
      state.dialog = {
        open: true,
        ...action.payload
      };
    },
    hideDialog: (state) => {
      state.dialog = {
        ...state.dialog,
        open: false
      };
    },
    resetUI: (state) => {
      state.sidebarOpen = true;
      state.loading = false;
      state.darkMode = false;
      state.theme = 'light';
      state.notifications = [];
      state.snackbar = {
        open: false,
        message: '',
        severity: 'info',
        autoHideDuration: 5000
      };
      state.modal = {
        open: false,
        title: '',
        content: null,
        actions: [],
        maxWidth: 'sm'
      };
      state.drawer = {
        open: false,
        anchor: 'right',
        content: null
      };
      state.dialog = {
        open: false,
        title: '',
        content: null,
        actions: [],
        maxWidth: 'md'
      };
    }
  }
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  toggleDarkMode,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  showSnackbar,
  hideSnackbar,
  showModal,
  hideModal,
  showDrawer,
  hideDrawer,
  showDialog,
  hideDialog,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;