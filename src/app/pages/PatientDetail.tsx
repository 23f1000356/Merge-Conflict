import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { userService } from '../services/api';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      try {
        const response = await userService.getPatientDetail(id);
        setPatient(response.data);
      } catch (error) {
        console.error('Failed to fetch patient', error);
      }
    };
    fetchPatient();
  }, [id]);

  const scores = patient?.RiskScores || [];

  const memoryData = scores.slice().reverse().map((s: any) => ({
    date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short' }),
    memory: s.cognitiveIndex, // Placeholder for actual memory score if available
    reaction: 100 - (s.riskProbability / 2) // Placeholder
  }));

  const voiceData: any[] = []; // Real voice metrics integration pending

  const riskHistory = scores.slice().reverse().map((s: any) => ({
    date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short' }),
    risk: s.riskProbability,
  }));

  const latestStats = scores[0] || { brainAge: 0, riskProbability: 0, riskLevel: 'N/A' };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/doctor')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Patients
        </button>

        {/* Patient Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                {patient?.fullName?.split(' ').map((n: any) => n[0]).join('') || '??'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{patient?.fullName || 'Loading...'}</h1>
                <p className="text-gray-600 mt-1">Age: {patient?.age || '-'} | Gender: {patient?.gender || '-'} | Last Test: {scores[0] ? new Date(scores[0].createdAt).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 mb-1">{Math.round(latestStats.brainAge)}</div>
              <p className="text-sm text-gray-600">Brain Age</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${latestStats.riskProbability < 30 ? 'bg-green-100 text-green-700' :
                  latestStats.riskProbability < 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                }`}>
                {latestStats.riskLevel} ({Math.round(latestStats.riskProbability)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Memory & Reaction Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Memory & Reaction Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="memory" stroke="#06b6d4" strokeWidth={3} name="Memory Score" />
              <Line type="monotone" dataKey="reaction" stroke="#f59e0b" strokeWidth={3} name="Reaction Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Voice Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Voice Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={voiceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="metric" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Risk History</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={riskHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="risk" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Clinical Notes</h3>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={6}
            placeholder="Add your clinical observations and recommendations..."
          />
          <button className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold">
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
