import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, Download, Share2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { testService } from '../services/api';

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const fetchHistory = async () => {
      try {
        const response = await testService.getHistory();
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      }
    };
    fetchHistory();
  }, []);

  const reports = history.map((item, idx) => ({
    id: item.id,
    date: new Date(item.createdAt).toLocaleDateString(),
    type: 'Comprehensive Assessment',
    score: Math.round(item.cognitiveIndex),
    status: 'completed'
  }));

  const handleDownload = (id: number) => {
    toast.success('Downloading report...');
  };

  const handleShare = (id: number) => {
    toast.success('Report shared successfully!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">View and download your cognitive assessment reports</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Report History</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{report.type}</h3>
                      <p className="text-sm text-gray-600">Date: {report.date}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-sm text-gray-700">Score: <strong>{report.score}%</strong></span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Download PDF"
                    >
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleShare(report.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Share Report"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
