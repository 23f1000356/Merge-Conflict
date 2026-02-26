import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, Calendar, FileText, TrendingUp } from 'lucide-react';
import { testService } from '../services/api';

export default function History() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'appointments'>('tests');
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchHistory = async () => {
      try {
        const response = await testService.getHistory();
        setTestHistory(response.data || []);
      } catch (error) {
        console.error('Failed to fetch history', error);
      }
    };

    fetchHistory();
  }, []);

  // Mock appointments data
  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Sharma',
      date: '2026-02-20',
      time: '2:00 PM',
      diagnosis: 'Cognitive Assessment Follow-up',
      nextVisit: '2026-03-20',
      status: 'completed',
    },
    {
      id: 2,
      doctor: 'Dr. Patel',
      date: '2026-02-10',
      time: '10:30 AM',
      diagnosis: 'Initial Baseline Test',
      nextVisit: '2026-03-10',
      status: 'completed',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">History</h1>
            <p className="text-gray-600 mt-1">Your tests and appointments timeline</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tests'
                ? 'text-cyan-600 border-cyan-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            Test History ({testHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'text-cyan-600 border-cyan-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Appointments ({appointments.length})
          </button>
        </div>

        {/* Test History */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            {testHistory.length > 0 ? (
              testHistory.map((test, idx) => (
                <div key={test.id || idx} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Date & Score */}
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-2">Test Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(test.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(test.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Scores */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-semibold">Scores</p>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-cyan-600 rounded-full"></div>
                        <div>
                          <p className="text-xs text-gray-600">Cognitive Index</p>
                          <p className="text-lg font-bold text-gray-900">{Math.round(test.cognitiveIndex)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        <div>
                          <p className="text-xs text-gray-600">Brain Age</p>
                          <p className="text-lg font-bold text-gray-900">{Math.round(test.brainAge)} yrs</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk & Actions */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-2">Risk Assessment</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            test.riskProbability < 30
                              ? 'bg-green-100 text-green-700'
                              : test.riskProbability < 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {test.riskLevel || 'Low'} ({Math.round(test.riskProbability)}%)
                        </span>
                      </div>
                      <Link
                        to="/test/results"
                        state={{ testData: test }}
                        className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No test history yet</p>
                <Link
                  to="/test"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 inline-block"
                >
                  Take Your First Test
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-2">Doctor</p>
                      <p className="text-lg font-bold text-gray-900">{apt.doctor}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-2">Date & Time</p>
                      <p className="text-gray-900 font-semibold">
                        {new Date(apt.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{apt.time}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-2">Assessment</p>
                      <p className="text-gray-900">{apt.diagnosis}</p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 mb-2">
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                      <p className="text-xs text-gray-600">Next: {new Date(apt.nextVisit).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No appointments scheduled</p>
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 inline-block">
                  Book an Appointment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timeline Visualization */}
        {testHistory.length > 0 && activeTab === 'tests' && (
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Cognitive Trend Over Time</h2>
            <div className="space-y-6">
              {testHistory.slice().reverse().map((test, idx) => (
                <div key={test.id || idx} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    {idx < testHistory.length - 1 && (
                      <div className="w-1 h-12 bg-gray-300 my-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold text-gray-900">
                      {new Date(test.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Score: <span className="font-bold text-cyan-600">{Math.round(test.cognitiveIndex)}%</span>
                      {' '} • Brain Age: <span className="font-bold text-blue-600">{Math.round(test.brainAge)}</span>
                      {' '} • Risk: <span className="font-bold">{test.riskLevel}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
