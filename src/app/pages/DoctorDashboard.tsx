import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import { Menu, Search, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { userService } from '../services/api';

export default function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [patients, setPatients] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setDoctor(JSON.parse(userData));
    }

    const fetchPatients = async () => {
      try {
        const response = await userService.getPatients();
        setPatients(response.data);
      } catch (error) {
        console.error('Failed to fetch patients', error);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const name = p.fullName || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const latestRisk = p.RiskScores?.[0]?.riskProbability || 0;
    const matchesRisk =
      riskFilter === 'all' ||
      (riskFilter === 'high' && latestRisk > 60) ||
      (riskFilter === 'moderate' && latestRisk >= 30 && latestRisk <= 60) ||
      (riskFilter === 'low' && latestRisk < 30);
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: number) => {
    if (risk < 30) return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">{risk}% - Low</span>;
    if (risk < 60) return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">{risk}% - Moderate</span>;
    return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">{risk}% - High</span>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <span className="w-5 h-5">→</span>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="doctor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Hello Dr. {doctor?.fullName?.split(' ')[1] || 'Smith'}!</h1>
          <p className="text-gray-600">Here's what's happening with your patients today</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Total Patients" value="124" icon="👥" />
          <StatsCard title="High Risk" value="18" icon="⚠️" trend="↑ 2 this week" />
          <StatsCard title="Moderate Risk" value="37" icon="📊" />
          <StatsCard title="Low Risk" value="69" icon="✅" />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk Only</option>
              <option value="moderate">Moderate Risk</option>
              <option value="low">Low Risk</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">2 patients require immediate review</h3>
            <p className="text-sm text-red-800">Significant cognitive decline detected in the past week.</p>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Patient Analytics</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brain Age Gap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  const latestRisk = patient.RiskScores?.[0] || { riskProbability: 0, brainAge: patient.age, riskLevel: 'Low' };
                  const brainAgeGap = Math.round(latestRisk.brainAge - patient.age);
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/patient/${patient.id}`} className="font-medium text-cyan-600 hover:text-cyan-700">
                          {patient.fullName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{patient.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRiskBadge(Math.round(latestRisk.riskProbability))}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${brainAgeGap > 5 ? 'text-red-600' : brainAgeGap < 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {brainAgeGap > 0 ? '+' : ''}{brainAgeGap} years
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {latestRisk.createdAt ? new Date(latestRisk.createdAt).toLocaleDateString() : 'No tests'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getTrendIcon('stable')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/patient/${patient.id}`}
                          className="text-cyan-600 hover:text-cyan-700 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing {filteredPatients.length} of {patients.length} patients</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
