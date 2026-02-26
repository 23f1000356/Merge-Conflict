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
import PatientDetail from './pages/PatientDetail';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import SystemHealth from './pages/SystemHealth';
import UserManagement from './pages/UserManagement';
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
    Component: DoctorDashboard,
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
    path: '/admin/system-health',
    Component: SystemHealth,
  },
  {
    path: '/admin/users',
    Component: UserManagement,
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
]);
