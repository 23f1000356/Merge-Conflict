import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  ClipboardList,
  Mic,
  TrendingUp,
  FileText,
  Settings,
  Users,
  Activity,
  BarChart3,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  role: 'patient' | 'doctor' | 'admin';
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();

  const patientLinks = [
    { to: '/dashboard/patient', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/test', icon: ClipboardList, label: 'Take Test' },
    { to: '/test/voice', icon: Mic, label: 'Voice Analysis' },
    { to: '/progress', icon: TrendingUp, label: 'Progress & Trends' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/profile', icon: Settings, label: 'Settings' },
  ];

  const doctorLinks = [
    { to: '/dashboard/doctor', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/doctor', icon: Users, label: 'My Patients' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/dashboard/doctor', icon: Activity, label: 'Alerts' },
    { to: '/profile', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/system-health', icon: Activity, label: 'System Health' },
    { to: '/reports', icon: BarChart3, label: 'Analytics' },
    { to: '/profile', icon: Shield, label: 'Settings' },
  ];

  const links = role === 'patient' ? patientLinks : role === 'doctor' ? doctorLinks : adminLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">CogniHealth</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-cyan-50 text-cyan-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2026 CogniHealth
            <br />
            All rights reserved
          </div>
        </div>
      </aside>
    </>
  );
}
