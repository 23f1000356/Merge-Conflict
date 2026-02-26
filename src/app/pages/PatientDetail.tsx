import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertTriangle, FileText, Calendar, Activity, TrendingDown, TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  doctorService, 
  metricsService, 
  clinicalNoteService, 
  appointmentService,
  riskAlertService,
  reportService 
} from '../services/api';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch all patient data in parallel
      const [overviewRes, trendsRes, alertsRes, appointmentsRes, notesRes] = await Promise.all([
        doctorService.getPatientOverview(id),
        metricsService.getPatientTrends(id),
        riskAlertService.getPatientAlerts(id),
        appointmentService.getPatientAppointments(id),
        clinicalNoteService.getPatientNotes(id)
      ]);

      setPatient(overviewRes.data.patient);
      setMetrics(overviewRes.data.metrics);
      setTrends(trendsRes.data);
      setAlerts(alertsRes.data.alerts || []);
      setAppointments(appointmentsRes.data.appointments || []);
      setClinicalNotes(notesRes.data.notes || []);
    } catch (error) {
      console.error('Failed to fetch patient data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle || !newNote) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      await clinicalNoteService.create({
        patientId: id,
        noteType: 'observation',
        title: noteTitle,
        content: newNote,
        severity: 'low',
        actionRequired: false
      });

      setNoteTitle('');
      setNewNote('');
      fetchPatientData();
    } catch (error) {
      console.error('Failed to save note', error);
      alert('Failed to save note');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await reportService.generatePDF(id, true);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patient-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (error) {
      console.error('Failed to download report', error);
      alert('Failed to download report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading patient data...</div>
      </div>
    );
  }

  const latestMetrics = metrics || {};
  const riskTrend = trends?.trends?.risk || {};
  const perfTrend = trends?.trends?.performance || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/doctor')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Patient Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                {patient?.fullName?.split(' ').map((n: string) => n[0]).join('') || '??'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{patient?.fullName}</h1>
                <p className="text-gray-600 mt-1">Age: {patient?.age} | Email: {patient?.email}</p>
              </div>
            </div>
            <div className="text-right space-y-3">
              <div>
                <div className="text-4xl font-bold text-gray-900">{latestMetrics.biologicalAge?.toFixed(0) || 'N/A'}</div>
                <p className="text-sm text-gray-600">Brain Age</p>
              </div>
              {latestMetrics.brainAgeGap !== undefined && (
                <div className={`p-2 rounded ${latestMetrics.brainAgeGap > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  <p className="text-sm font-semibold">Gap: {latestMetrics.brainAgeGap.toFixed(1)} years</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Overall Score</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{latestMetrics.overallScore?.toFixed(1) || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Weekly Trend</p>
            <p className="text-lg font-bold mt-1">
              {latestMetrics.weeklyTrend === 'improving' && '📈 Improving'}
              {latestMetrics.weeklyTrend === 'declining' && '📉 Declining'}
              {latestMetrics.weeklyTrend === 'stable' && '➡️ Stable'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Consistency</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{latestMetrics.consistencyScore?.toFixed(0) || 'N/A'}%</p>
            <p className="text-xs text-gray-500 mt-1">Performance consistency</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Total Tests</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{latestMetrics.testCount || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
        </div>

        {/* Active Alerts Section */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Active Risk Alerts</h2>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{alert.alertType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Performance Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Trend</h3>
            {perfTrend.dataPoints && perfTrend.dataPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={perfTrend.dataPoints.map((score: number, idx: number) => ({
                  test: idx + 1,
                  score: score
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="test" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No trend data available</p>
            )}
          </div>

          {/* Risk History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Score History</h3>
            {riskTrend.dataPoints && riskTrend.dataPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={riskTrend.dataPoints.map((risk: number, idx: number) => ({
                  assessment: idx + 1,
                  risk: risk
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="assessment" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No risk data available</p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-gray-900">Upcoming Appointments</h3>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-900">{new Date(apt.appointmentDate).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{apt.appointmentType}</p>
                    {apt.reason && <p className="text-sm text-gray-600 mt-1">{apt.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No upcoming appointments</p>
          )}
        </div>

        {/* Clinical Notes Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              <h3 className="text-lg font-bold text-gray-900">Clinical Notes</h3>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          {/* Add New Note */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Add New Clinical Note</p>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Clinical observation or recommendation..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSaveNote}
              className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium text-sm"
            >
              Save Note
            </button>
          </div>

          {/* Existing Notes */}
          <div className="space-y-3">
            {clinicalNotes.length > 0 ? (
              clinicalNotes.map((note) => (
                <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{note.title}</p>
                      <p className="text-sm text-gray-700 mt-1">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${note.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {note.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No clinical notes yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
