import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, Search, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { userService, testService } from '../services/api';

export default function AdminPatientsList() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await userService.getAllUsers();
        const patientsList = usersResponse.data?.filter((u: any) => u.role === 'patient') || [];
        setPatients(patientsList);
        setFilteredPatients(patientsList);

        const testsResponse = await testService.getHistory();
        setTestHistory(testsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = patients;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(patient =>
        (patient.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(patient => {
        const patientTests = testHistory.filter(t => t.userId === patient.id);
        const latestTest = patientTests[0];
        if (!latestTest) return riskFilter === 'no-test';

        const risk = latestTest.riskProbability || 0;
        if (riskFilter === 'high') return risk > 60;
        if (riskFilter === 'moderate') return risk >= 30 && risk < 60;
        if (riskFilter === 'low') return risk < 30;
        return true;
      });
    }

    setFilteredPatients(filtered);
  }, [searchQuery, riskFilter, patients, testHistory]);

  const getPatientLatestTest = (patientId: number) => {
    return testHistory.find(t => t.userId === patientId);
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-green-100 text-green-800';
    if (risk < 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
            <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-600 mt-1">Monitor patient health profiles and assessments</p>
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

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="moderate">Moderate Risk</option>
            <option value="high">High Risk</option>
            <option value="no-test">No Test Completed</option>
          </select>
        </div>

        {/* Patients Table - Responsive */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Patient Name</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold hidden sm:table-cell">Age</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Cognitive Score</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Brain Age</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Risk Level</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold hidden md:table-cell">Last Test</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPatients.map((patient) => {
                    const latestTest = getPatientLatestTest(patient.id);
                    const cognitiveScore = latestTest ? Math.round(latestTest.cognitiveIndex) : 'N/A';
                    const brainAge = latestTest ? Math.round(latestTest.brainAge) : 'N/A';
                    const riskLevel = latestTest ? latestTest.riskLevel : 'No Test';
                    const riskProbability = latestTest ? latestTest.riskProbability : 0;
                    const lastTestDate = latestTest
                      ? new Date(latestTest.createdAt).toLocaleDateString()
                      : 'Never';

                    return (
                      <tr
                        key={patient.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {patient.fullName || 'Unknown'}
                        </td>
                        <td className="py-4 px-4 text-gray-700 hidden sm:table-cell">
                          {patient.age || 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          {typeof cognitiveScore === 'number' ? (
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                                <div
                                  className="bg-cyan-600 h-2 rounded-full"
                                  style={{ width: `${cognitiveScore}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-900 whitespace-nowrap">
                                {cognitiveScore}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">{cognitiveScore}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {brainAge !== 'N/A' ? `${brainAge} yrs` : brainAge}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(riskProbability)}`}>
                            {riskLevel}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-700 hidden md:table-cell text-xs">
                          {lastTestDate}
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No patients found</p>
              {searchQuery && <p className="text-sm text-gray-400">Try a different search term</p>}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-2">Total Patients</p>
            <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">High Risk</p>
                <p className="text-3xl font-bold text-red-600">
                  {testHistory.filter(t => (t.riskProbability || 0) > 60).length}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-300" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Low Risk</p>
                <p className="text-3xl font-bold text-green-600">
                  {testHistory.filter(t => (t.riskProbability || 0) < 30).length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-300" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Tests Done</p>
                <p className="text-3xl font-bold text-cyan-600">{testHistory.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-cyan-300" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
