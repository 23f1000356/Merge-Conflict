import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import TakeTest from './pages/TakeTest';
import VoiceTest from './pages/VoiceTest';
import TestResults from './pages/TestResults';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorDashboardEnhanced from './pages/DoctorDashboardEnhanced';
import DoctorPatients from './pages/DoctorPatients';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorHistory from './pages/DoctorHistory';
import DoctorReports from './pages/DoctorReports';
import DoctorAlerts from './pages/DoctorAlerts';
import DoctorSettings from './pages/DoctorSettings';
import PatientDetail from './pages/PatientDetail';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDoctors from './pages/AdminDoctors';
import AdminAIModel from './pages/AdminAIModel';
import AdminRiskAnalytics from './pages/AdminRiskAnalytics';
import AdminAppointments from './pages/AdminAppointments';
import AdminReports from './pages/AdminReports';
import AdminSystemHealth from './pages/AdminSystemHealth';
import AdminSecurity from './pages/AdminSecurity';
import AdminSettings from './pages/AdminSettings';
import AdminDoctorDetail from './pages/AdminDoctorDetail';
import Appointments from './pages/Appointments';
import DocDocuments from './pages/DocDocuments';
import History from './pages/History';
import AdminDoctorsList from './pages/AdminDoctorsList';
import AdminPatientsList from './pages/AdminPatientsList';
import BrainGym from './pages/BrainGym';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/brain-gym',
    Component: BrainGym,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/dashboard/patient',
    Component: PatientDashboard,
  },
  {
    path: '/test',
    Component: TakeTest,
  },
  {
    path: '/test/voice',
    Component: VoiceTest,
  },
  {
    path: '/test/results',
    Component: TestResults,
  },
  {
    path: '/progress',
    Component: Progress,
  },
  {
    path: '/profile',
    Component: Profile,
  },
  {
    path: '/dashboard/doctor',
    Component: DoctorDashboardEnhanced,
  },
  {
    path: '/dashboard/doctor/patients',
    Component: DoctorPatients,
  },
  {
    path: '/dashboard/doctor/appointments',
    Component: DoctorAppointments,
  },
  {
    path: '/dashboard/doctor/history',
    Component: DoctorHistory,
  },
  {
    path: '/dashboard/doctor/reports',
    Component: DoctorReports,
  },
  {
    path: '/dashboard/doctor/alerts',
    Component: DoctorAlerts,
  },
  {
    path: '/dashboard/doctor/settings',
    Component: DoctorSettings,
  },
  {
    path: '/dashboard/patient/:id',
    Component: PatientDetail,
  },
  {
    path: '/patient/:id',
    Component: PatientDetail,
  },
  {
    path: '/reports',
    Component: Reports,
  },
  {
    path: '/dashboard/admin',
    Component: AdminDashboard,
  },
  {
    path: '/appointments',
    Component: Appointments,
  },
  {
    path: '/documents',
    Component: DocDocuments,
  },
  {
    path: '/history',
    Component: History,
  },
  {
    path: '/doctors-list',
    Component: AdminDoctorsList,
  },
  {
    path: '/admin/patients',
    Component: AdminPatientsList,
  },
  {
    path: '/admin/users',
    Component: AdminUsers,
  },
  {
    path: '/admin/doctors',
    Component: AdminDoctors,
  },
  {
    path: '/admin/ai-model',
    Component: AdminAIModel,
  },
  {
    path: '/admin/risk-analytics',
    Component: AdminRiskAnalytics,
  },
  {
    path: '/admin/appointments',
    Component: AdminAppointments,
  },
  {
    path: '/admin/reports',
    Component: AdminReports,
  },
  {
    path: '/admin/system-health',
    Component: AdminSystemHealth,
  },
  {
    path: '/admin/security',
    Component: AdminSecurity,
  },
  {
    path: '/admin/settings',
    Component: AdminSettings,
  },
  {
    path: '/doctor/:doctorId',
    Component: AdminDoctorDetail,
  },
]);
