import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  FileText,
  AlertCircle,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';

interface DoctorSidebarProps {
  doctorName?: string;
  onLogout?: () => void;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ 
  doctorName = 'Dr. Sarah Johnson',
  onLogout 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const menuSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard/doctor',
      badge: null
    },
    {
      id: 'patients',
      label: 'My Patients',
      icon: Users,
      path: '/dashboard/doctor/patients',
      badge: null,
      submenu: [
        { label: 'Patient List', path: '/dashboard/doctor/patients' },
        { label: 'High Risk', path: '/dashboard/doctor/patients?risk=High' },
        { label: 'Moderate Risk', path: '/dashboard/doctor/patients?risk=Moderate' }
      ]
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      path: '/dashboard/doctor/appointments',
      badge: null,
      submenu: [
        { label: "Today's Appointments", path: '/dashboard/doctor/appointments?view=today' },
        { label: 'Upcoming', path: '/dashboard/doctor/appointments?view=upcoming' },
        { label: 'Schedule New', path: '/dashboard/doctor/appointments/new' }
      ]
    },
    {
      id: 'history',
      label: 'Past History',
      icon: History,
      path: '/dashboard/doctor/history',
      badge: null,
      submenu: [
        { label: 'Patient Records', path: '/dashboard/doctor/history' },
        { label: 'Past Tests', path: '/dashboard/doctor/history?view=tests' },
        { label: 'Clinical Notes', path: '/dashboard/doctor/history?view=notes' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/dashboard/doctor/reports',
      badge: null,
      submenu: [
        { label: 'Generate Report', path: '/dashboard/doctor/reports/new' },
        { label: 'Cohort Analysis', path: '/dashboard/doctor/reports/cohort' },
        { label: 'My Reports', path: '/dashboard/doctor/reports' }
      ]
    },
    {
      id: 'alerts',
      label: 'Alerts & Follow-ups',
      icon: AlertCircle,
      path: '/dashboard/doctor/alerts',
      badge: 3,
      submenu: [
        { label: 'Active Alerts', path: '/dashboard/doctor/alerts?status=active' },
        { label: 'Follow-ups Due', path: '/dashboard/doctor/alerts?view=followups' },
        { label: 'Acknowledge', path: '/dashboard/doctor/alerts?status=acknowledged' }
      ]
    },
    {
      id: 'settings',
      label: 'Profile & Settings',
      icon: Settings,
      path: '/dashboard/doctor/settings',
      badge: null,
      submenu: [
        { label: 'My Profile', path: '/dashboard/doctor/settings/profile' },
        { label: 'Preferences', path: '/dashboard/doctor/settings/preferences' },
        { label: 'Security', path: '/dashboard/doctor/settings/security' }
      ]
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '?');
  };

  const toggleMenu = (id: string) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile sidebar after navigation
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-blue-600">Cognitive Health</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static md:translate-x-0 left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg transition-transform duration-300 z-30 overflow-y-auto md:mt-0 mt-16`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 mt-4 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              {doctorName.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-white text-sm truncate">
                {doctorName}
              </h2>
              <p className="text-xs text-slate-400">Doctor</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 space-y-2">
          {menuSections.map((section) => (
            <div key={section.id}>
              <Button
                onClick={() => {
                  if (section.submenu) {
                    toggleMenu(section.id);
                  } else {
                    handleNavigation(section.path);
                  }
                }}
                variant="ghost"
                className={`w-full justify-between h-11 px-4 rounded-lg transition-colors ${
                  isActive(section.path)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-slate-200 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <section.icon size={18} />
                  <span className="font-medium">{section.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {section.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {section.badge}
                    </span>
                  )}
                  {section.submenu && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        expandedMenu === section.id ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </div>
              </Button>

              {/* Submenu */}
              {section.submenu && expandedMenu === section.id && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-700 pl-4">
                  {section.submenu.map((item, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleNavigation(item.path)}
                      variant="ghost"
                      className={`w-full justify-start h-9 px-3 text-sm rounded transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer - Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-center h-10 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
