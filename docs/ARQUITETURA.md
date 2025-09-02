# 🏗️ Arquitetura do Sistema Médico

## 📊 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA MÉDICO                          │
│                   (Medical System)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   FRONTEND      │  │    BACKEND      │  │   DATABASE      │
│   (React.js)    │◄─┤  (Node.js/API)  │◄─┤  (PostgreSQL)   │
│   Port: 3002    │  │   Port: 3001    │  │  (Neon Cloud)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   COMPONENTS    │  │   SERVICES      │  │    TABLES       │
│   - Dashboard   │  │   - Auth        │  │   - users       │
│   - Patients    │  │   - Patients    │  │   - patients    │
│   - Documents   │  │   - Documents   │  │   - documents   │
│   - Notes       │  │   - Notes       │  │   - notes       │
│   - Appointments│  │   - AI          │  │   - appointments│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🎯 Arquitetura de Camadas

### **1. Presentation Layer (Frontend)**
```
React.js Application
├── 📱 Pages
│   ├── Dashboard
│   ├── Patients (List, Detail, Create, Edit)
│   ├── Documents (List, Upload, View)
│   ├── Notes (List, Create, Edit)
│   └── Appointments (Calendar, Schedule)
│
├── 🧩 Components
│   ├── Layout (Sidebar, Topbar, MainLayout)
│   ├── Forms (Patient Form, Document Upload)
│   ├── Tables (Data grids with pagination)
│   └── UI (Modals, Loading, Notifications)
│
├── 🔄 State Management
│   ├── Redux Store
│   ├── Slices (auth, patients, documents, notes)
│   └── API Integration (RTK Query)
│
└── 🔌 Services
    ├── API Client (Axios)
    ├── Authentication
    └── File Upload
```

### **2. Business Logic Layer (Backend)**
```
Node.js/Express API
├── 🛡️ Security & Middleware
│   ├── JWT Authentication
│   ├── CORS Configuration
│   ├── Rate Limiting
│   ├── Input Validation
│   └── Error Handling
│
├── 📋 Controllers
│   ├── AuthController (login, register, profile)
│   ├── PatientController (CRUD operations)
│   ├── DocumentController (upload, download, analyze)
│   ├── NoteController (medical notes management)
│   ├── AppointmentController (scheduling)
│   └── DashboardController (metrics, stats)
│
├── 🔧 Services
│   ├── Authentication Service
│   ├── File Upload Service (AWS S3)
│   ├── AI Analysis Service (OpenAI/Anthropic)
│   ├── Email Service (notifications)
│   └── Report Generation Service
│
└── 📊 Models & Database
    ├── Sequelize ORM
    ├── Model Definitions
    └── Database Migrations
```

### **3. Data Layer (Database)**
```
PostgreSQL (Neon Cloud)
├── 👥 Users Table
│   ├── Authentication info
│   ├── Roles (admin, doctor, nurse)
│   └── Profile data
│
├── 🏥 Patients Table
│   ├── Personal information
│   ├── Medical history
│   └── Emergency contacts
│
├── 📄 Documents Table
│   ├── File metadata
│   ├── Category classification
│   └── AI analysis results
│
├── 📝 Notes Table
│   ├── Medical observations
│   ├── Treatment plans
│   └── Doctor's annotations
│
└── 📅 Appointments Table
    ├── Scheduling information
    ├── Patient-Doctor relationship
    └── Status tracking
```

## 🔄 Fluxos de Dados Principais

### **1. Autenticação e Autorização**
```
User → Frontend → Backend → Database
     ← JWT Token ← Validate ← User Record
```

1. **Login Flow:**
   - User submits credentials
   - Backend validates against database
   - JWT token generated and returned
   - Frontend stores token for subsequent requests

2. **Protected Routes:**
   - Frontend checks token validity
   - Backend middleware validates JWT
   - Database queries filtered by user role

### **2. Gestão de Pacientes**
```
Doctor → Patient Form → API → Database
       ← Patient Data ← JSON ← Patient Record
```

1. **Create Patient:**
   - Doctor fills patient form
   - Frontend validates input
   - API creates database record
   - Success confirmation returned

2. **View Patient:**
   - Request patient data
   - API fetches from database
   - Return patient details + timeline
   - Frontend renders patient profile

### **3. Upload de Documentos**
```
User → File Upload → File Service → Storage
     ← Confirmation ← Metadata  ← S3/Local
```

1. **Document Upload:**
   - User selects files (drag & drop)
   - Frontend uploads to backend
   - Backend processes and stores
   - Metadata saved to database
   - Optional AI analysis triggered

### **4. Análise de IA (Futuro)**
```
Document → AI Service → Analysis → Database
         ← Results   ← Process  ← Storage
```

1. **AI Analysis Flow:**
   - Document uploaded and processed
   - AI service analyzes content
   - Results stored in database
   - Notifications sent to relevant users

## 🛡️ Segurança e Conformidade

### **Autenticação e Autorização**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JWT Token     │    │   Role-Based    │    │   Data Access   │
│   - Expires 7d  │    │   - Admin       │    │   - User data   │
│   - Secure      │    │   - Doctor      │    │   - Patient data│
│   - HttpOnly    │    │   - Nurse       │    │   - Medical rec │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Proteção de Dados**
- **Encryption:** Dados sensíveis criptografados
- **HTTPS:** Todas as comunicações seguras
- **Validation:** Input sanitization em todas as camadas
- **Audit Log:** Log de todas as ações críticas
- **LGPD/HIPAA:** Conformidade com regulamentações

## 📊 Modelos de Dados

### **User Model**
```javascript
{
  id: UUID,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['admin', 'doctor', 'nurse'],
  crm: String (optional),
  specialty: String (optional),
  phone: String,
  is_active: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

### **Patient Model**
```javascript
{
  id: UUID,
  name: String,
  email: String,
  phone: String,
  birth_date: Date,
  gender: Enum ['male', 'female', 'other'],
  blood_type: Enum ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  address: Text,
  emergency_contact: JSON,
  medical_history: Text,
  allergies: Text,
  medications: Text,
  status: Enum ['active', 'inactive'],
  created_at: DateTime,
  updated_at: DateTime
}
```

### **Document Model**
```javascript
{
  id: UUID,
  title: String,
  original_name: String,
  file_url: String,
  file_size: Integer,
  category: Enum ['exame', 'receita', 'laudo', 'outros'],
  patient_id: UUID (FK),
  uploaded_by: UUID (FK),
  extraction_status: Enum ['pending', 'processing', 'completed', 'failed'],
  extracted_text: Text,
  ai_analysis: JSON,
  access_level: Enum ['public', 'restricted', 'private'],
  created_at: DateTime,
  updated_at: DateTime
}
```

## 🔄 APIs e Endpoints

### **Authentication APIs**
```
POST   /api/auth/login       # User login
POST   /api/auth/register    # User registration
GET    /api/auth/me          # Get current user
PUT    /api/auth/profile     # Update profile
POST   /api/auth/logout      # User logout
```

### **Patient APIs**
```
GET    /api/patients         # List patients
GET    /api/patients/:id     # Get patient details
POST   /api/patients         # Create patient
PUT    /api/patients/:id     # Update patient
DELETE /api/patients/:id     # Delete patient
GET    /api/patients/:id/timeline  # Patient timeline
```

### **Document APIs**
```
GET    /api/documents        # List documents
POST   /api/documents/upload # Upload document
GET    /api/documents/:id    # Get document details
PUT    /api/documents/:id    # Update document
DELETE /api/documents/:id    # Delete document
GET    /api/documents/:id/download  # Download file
```

### **AI APIs (Futuro)**
```
POST   /api/ai/analyze-document/:id    # Analyze document
POST   /api/ai/generate-insights/:patientId  # Generate insights
POST   /api/ai/recommendations/:patientId    # Get recommendations
```

## 🚀 Deployment e Infrastructure

### **Current Setup**
```
Development Environment:
├── Frontend: localhost:3002 (React Dev Server)
├── Backend: localhost:3001 (Nodemon)
└── Database: Neon PostgreSQL (Cloud)
```

### **Production Ready Setup (Futuro)**
```
Production Environment:
├── Frontend: Vercel/Netlify (Static hosting)
├── Backend: Railway/Heroku (Container deployment)
├── Database: Neon PostgreSQL (Production tier)
├── Storage: AWS S3 (File storage)
├── Monitoring: New Relic/DataDog
└── CDN: CloudFlare (Global distribution)
```

## 📈 Escalabilidade e Performance

### **Current Limitations**
- Single instance backend
- No caching layer
- No load balancing
- File storage on local filesystem

### **Scaling Strategy**
```
Phase 1: Optimization
├── Implement Redis caching
├── Database query optimization
├── Frontend code splitting
└── Image compression

Phase 2: Horizontal Scaling
├── Load balancer (nginx)
├── Multiple backend instances
├── Database read replicas
└── CDN for static assets

Phase 3: Microservices
├── Auth service
├── Patient service
├── Document service
└── AI service
```

## 🔧 Tecnologias e Dependencies

### **Frontend Stack**
- **React 18** - UI Framework
- **Material-UI** - Component library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling

### **Backend Stack**
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File upload
- **Winston** - Logging

### **Database & Storage**
- **PostgreSQL** - Primary database
- **Neon** - Database hosting
- **AWS S3** - File storage (future)
- **Redis** - Caching (future)

---

*Esta documentação deve ser atualizada conforme a evolução do sistema.*