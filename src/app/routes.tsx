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

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
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
]);
