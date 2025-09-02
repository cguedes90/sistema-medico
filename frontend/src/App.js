import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Components
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import { NotificationProvider } from './components/NotificationProvider';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientList from './pages/Patients/PatientList';
import PatientCreate from './pages/Patients/PatientCreate';
import PatientDetail from './pages/Patients/PatientDetail';
import DocumentList from './pages/Documents/DocumentList';
import DocumentUpload from './pages/Documents/DocumentUpload';
import NoteList from './pages/Notes/NoteList';
import NoteCreate from './pages/Notes/NoteCreate';
import AppointmentList from './pages/Appointments/AppointmentList';
import AppointmentCreate from './pages/Appointments/AppointmentCreate';
import AppointmentDetail from './pages/Appointments/AppointmentDetail';
import AIDashboard from './pages/AI/AIDashboard';
import DiagnosisAssistant from './pages/AI/DiagnosisAssistant';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import CustomReport from './pages/Reports/CustomReport';
import Profile from './pages/Profile/Profile';
import PrescriptionList from './pages/Prescriptions/PrescriptionList';
import PrescriptionCreate from './pages/Prescriptions/PrescriptionCreate';
import TelemedicineList from './pages/Telemedicine/TelemedicineList';
import TelemedicineSession from './pages/Telemedicine/TelemedicineSession';
import MedicalCertificateList from './pages/MedicalCertificates/MedicalCertificateList';
import MedicalCertificateCreate from './pages/MedicalCertificates/MedicalCertificateCreate';
import MedicalCertificateView from './pages/MedicalCertificates/MedicalCertificateView';

// Store
import { checkAuthToken } from './store/authSlice';

function AuthCheck({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(checkAuthToken());
    }
  }, [dispatch, token, isAuthenticated]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
}

function MainApp() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated ? (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Patients Routes */}
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/new" element={<PatientCreate />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            
            {/* Documents Routes */}
            <Route path="/documents" element={<DocumentList />} />
            <Route path="/documents/upload" element={<DocumentUpload />} />
            
            {/* Notes Routes */}
            <Route path="/notes" element={<NoteList />} />
            <Route path="/notes/new" element={<NoteCreate />} />
            
            {/* Appointments Routes */}
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/appointments/new" element={<AppointmentCreate />} />
            <Route path="/appointments/:id" element={<AppointmentDetail />} />
            
            {/* AI Routes */}
            <Route path="/ai" element={<AIDashboard />} />
            <Route path="/ai/diagnosis" element={<DiagnosisAssistant />} />
            
            {/* Reports Routes */}
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/reports/custom" element={<CustomReport />} />
            
            {/* Prescriptions Routes */}
            <Route path="/prescriptions" element={<PrescriptionList />} />
            <Route path="/prescriptions/create" element={<PrescriptionCreate />} />
            
            {/* Telemedicine Routes */}
            <Route path="/telemedicine" element={<TelemedicineList />} />
            <Route path="/telemedicine/sessions/:id" element={<TelemedicineSession />} />
            
            {/* Medical Certificates Routes */}
            <Route path="/medical-certificates" element={<MedicalCertificateList />} />
            <Route path="/medical-certificates/create" element={<MedicalCertificateCreate />} />
            <Route path="/medical-certificates/:id" element={<MedicalCertificateView />} />
            
            {/* Profile Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/perfil" element={<Profile />} />
            
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </Box>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthCheck>
        <MainApp />
      </AuthCheck>
    </NotificationProvider>
  );
}

export default App;