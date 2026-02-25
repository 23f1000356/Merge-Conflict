import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import { Menu } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { userService } from '../services/api';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const patientsCount = users.filter(u => u.role === 'patient').length;
  const doctorsCount = users.filter(u => u.role === 'doctor').length;
  const activeUsers = users.filter(u => u.baselineCompleted).length;

  const userGrowthData: any[] = [];
  const riskDistribution: any[] = [];
  const testAnalytics: any[] = [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and analytics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Total Users" value={totalUsers.toString()} icon="👥" trend={`${patientsCount} Patients`} />
          <StatsCard title="Active Users" value={activeUsers.toString()} icon="✅" trend="Baseline Completed" />
          <StatsCard title="Medical Staff" value={doctorsCount.toString()} icon="🏥" trend="Doctors onboarded" />
          <StatsCard title="AI Accuracy" value="94%" icon="🤖" trend="↑ +2% improvement" trendUp />
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} name="Total Users" dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              📈 <strong>Growth Insight:</strong> User base increased by 100% over the past 6 months.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Risk Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Test Analytics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Test Analytics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="tests" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Snapshot */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Snapshot</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-cyan-200">
              <p className="text-sm text-gray-600 mb-1">Server Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-cyan-200">
              <p className="text-sm text-gray-600 mb-1">API Response</p>
              <p className="text-2xl font-bold text-gray-900">120ms</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-cyan-200">
              <p className="text-sm text-gray-600 mb-1">Last Model Retrain</p>
              <p className="text-2xl font-bold text-gray-900">Feb 20</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-cyan-200">
              <p className="text-sm text-gray-600 mb-1">Dataset Size</p>
              <p className="text-2xl font-bold text-gray-900">15.2K</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
