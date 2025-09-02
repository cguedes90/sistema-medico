const { sequelize } = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Document = require('./Document');
const Note = require('./Note');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const TelemedicineSession = require('./TelemedicineSession');
const TelemedicineChat = require('./TelemedicineChat');
const MedicalCertificate = require('./MedicalCertificate');

// Definir associações
User.hasMany(Patient, { foreignKey: 'primary_care_physician', as: 'patients' });
Patient.belongsTo(User, { foreignKey: 'primary_care_physician', as: 'primaryPhysician' });

User.hasMany(Document, { foreignKey: 'uploaded_by', as: 'uploadedDocuments' });
Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

User.hasMany(Note, { foreignKey: 'author_id', as: 'authoredNotes' });
Note.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

Patient.hasMany(Document, { foreignKey: 'patient_id', as: 'documents' });
Document.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Patient.hasMany(Note, { foreignKey: 'patient_id', as: 'medicalNotes' });
Note.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Appointment.hasMany(Note, { foreignKey: 'appointment_id', as: 'appointmentNotes' });
Note.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

Appointment.hasMany(Appointment, { foreignKey: 'rescheduled_from', as: 'rescheduledAppointments' });
Appointment.belongsTo(Appointment, { foreignKey: 'rescheduled_from', as: 'originalAppointment' });

// Associações para Prescription
User.hasMany(Prescription, { foreignKey: 'doctor_id', as: 'prescriptions' });
Prescription.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Appointment.hasMany(Prescription, { foreignKey: 'appointment_id', as: 'prescriptions' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

// Associações para TelemedicineSession
User.hasMany(TelemedicineSession, { foreignKey: 'doctor_id', as: 'telemedicineSessions' });
TelemedicineSession.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

Patient.hasMany(TelemedicineSession, { foreignKey: 'patient_id', as: 'telemedicineSessions' });
TelemedicineSession.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Appointment.hasOne(TelemedicineSession, { foreignKey: 'appointment_id', as: 'telemedicineSession' });
TelemedicineSession.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

// Associações para TelemedicineChat
TelemedicineSession.hasMany(TelemedicineChat, { foreignKey: 'session_id', as: 'chatMessages' });
TelemedicineChat.belongsTo(TelemedicineSession, { foreignKey: 'session_id', as: 'session' });

User.hasMany(TelemedicineChat, { foreignKey: 'sender_id', as: 'chatMessages' });
TelemedicineChat.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Associações para MedicalCertificate
User.hasMany(MedicalCertificate, { foreignKey: 'doctor_id', as: 'medicalCertificates' });
MedicalCertificate.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

User.hasMany(MedicalCertificate, { foreignKey: 'patient_id', as: 'patientCertificates' });
MedicalCertificate.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });

Appointment.hasMany(MedicalCertificate, { foreignKey: 'appointment_id', as: 'medicalCertificates' });
MedicalCertificate.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

module.exports = {
  sequelize,
  User,
  Patient,
  Document,
  Note,
  Appointment,
  Prescription,
  TelemedicineSession,
  TelemedicineChat,
  MedicalCertificate
};