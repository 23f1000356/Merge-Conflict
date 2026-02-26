import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, Download, Share2, FileText, Eye, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { testService } from '../services/api';

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const handleDownloadPDF = (testId: number) => {
    const report = history.find(h => h.id === testId);
    if (!report) return;

    // Create PDF content
    const pdfContent = `
COGNITIVE HEALTH ASSESSMENT REPORT
=====================================

Date: ${new Date(report.createdAt).toLocaleDateString()}
Patient: ${user?.fullName || 'Unknown'}
Test ID: ${testId}

OVERALL RESULTS
===============
Cognitive Score: ${Math.round(report.cognitiveIndex)}%
Brain Age: ${Math.round(report.brainAge)} years
Risk Level: ${report.riskLevel || 'Low'}
Risk Probability: ${Math.round(report.riskProbability)}%

INDIVIDUAL COMPONENT SCORES
============================
Memory Score: ${Math.round(report.memoryScore || 0)}%
Reaction Score: ${Math.round(report.reactionScore || 0)}%
Attention Score: ${Math.round(report.attentionScore || 0)}%
Typing Speed: ${Math.round(report.typingSpeed || 0)} WPM
Voice Score: ${Math.round(report.voiceScore || 0)}%

ASSESSMENT SUMMARY
==================
This report provides a comprehensive assessment of your cognitive performance
across multiple dimensions including memory, reaction time, attention span,
typing speed, and voice analysis.

Higher scores indicate better cognitive performance. Regular assessments help
track cognitive trends and identify areas for improvement.

RECOMMENDATIONS
================
- Continue regular cognitive assessments
- Maintain healthy sleep patterns (7-8 hours)
- Engage in daily brain exercises
- Stay physically active
- Reduce stress and anxiety

Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
    `;

    // Download as text/plain
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(pdfContent));
    element.setAttribute('download', `cognitive-report-${testId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded as PDF!');
  };

  const handleDownloadDOC = (testId: number) => {
    const report = history.find(h => h.id === testId);
    if (!report) return;

    const docContent = `
    <html>
    <head>
      <title>Cognitive Health Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; }
        h2 { color: #0891b2; margin-top: 20px; }
        .score { font-size: 18px; font-weight: bold; margin: 10px 0; }
        .metric { margin: 10px 0; padding-left: 20px; }
        .footer { margin-top: 40px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Cognitive Health Assessment Report</h1>
      <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
      <p><strong>Patient:</strong> ${user?.fullName || 'Unknown'}</p>
      <p><strong>Test ID:</strong> ${testId}</p>

      <h2>Overall Results</h2>
      <div class="metric">
        <div class="score">Cognitive Score: ${Math.round(report.cognitiveIndex)}%</div>
        <div class="score">Brain Age: ${Math.round(report.brainAge)} years</div>
        <div class="score">Risk Level: ${report.riskLevel || 'Low'}</div>
      </div>

      <h2>Individual Component Scores</h2>
      <div class="metric">
        <p>Memory Score: <strong>${Math.round(report.memoryScore || 0)}%</strong></p>
        <p>Reaction Score: <strong>${Math.round(report.reactionScore || 0)}%</strong></p>
        <p>Attention Score: <strong>${Math.round(report.attentionScore || 0)}%</strong></p>
        <p>Typing Speed: <strong>${Math.round(report.typingSpeed || 0)} WPM</strong></p>
        <p>Voice Score: <strong>${Math.round(report.voiceScore || 0)}%</strong></p>
      </div>

      <h2>Recommendations</h2>
      <ul>
        <li>Continue regular cognitive assessments</li>
        <li>Maintain healthy sleep patterns (7-8 hours)</li>
        <li>Engage in daily brain exercises</li>
        <li>Stay physically active</li>
        <li>Reduce stress and anxiety</li>
      </ul>

      <div class="footer">
        <p>Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(docContent));
    element.setAttribute('download', `cognitive-report-${testId}.doc`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded as DOC!');
  };

  const handleDownloadImage = (testId: number) => {
    const report = history.find(h => h.id === testId);
    if (!report) return;

    // Create canvas for image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 600);

      // Title
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 28px Arial';
      ctx.fillText('Cognitive Health Report', 50, 50);

      // Divider
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 60);
      ctx.lineTo(750, 60);
      ctx.stroke();

      // Content
      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      let yPos = 100;

      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, 50, yPos);
      yPos += 30;
      ctx.fillText(`Patient: ${user?.fullName || 'Unknown'}`, 50, yPos);
      yPos += 40;

      ctx.fillText('Overall Results', 50, yPos);
      yPos += 25;
      ctx.font = '14px Arial';
      ctx.fillText(`Cognitive Score: ${Math.round(report.cognitiveIndex)}%`, 70, yPos);
      yPos += 25;
      ctx.fillText(`Brain Age: ${Math.round(report.brainAge)} years`, 70, yPos);
      yPos += 25;
      ctx.fillText(`Risk Level: ${report.riskLevel || 'Low'}`, 70, yPos);
      yPos += 40;

      ctx.font = 'bold 16px Arial';
      ctx.fillText('Component Scores', 50, yPos);
      yPos += 25;
      ctx.font = '14px Arial';
      ctx.fillText(`Memory: ${Math.round(report.memoryScore || 0)}% | Reaction: ${Math.round(report.reactionScore || 0)}% | Attention: ${Math.round(report.attentionScore || 0)}%`, 70, yPos);
      yPos += 25;
      ctx.fillText(`Typing: ${Math.round(report.typingSpeed || 0)} WPM | Voice: ${Math.round(report.voiceScore || 0)}%`, 70, yPos);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', `cognitive-report-${testId}.png`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
        toast.success('Report downloaded as Image!');
      }
    });
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
                    <Link
                      to="/test/results"
                      state={{ testData: history.find(h => h.id === report.id) }}
                      className="p-2 border border-cyan-300 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-5 h-5 text-cyan-600" />
                    </Link>
                    
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === report.id ? null : report.id)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                        title="Download Report"
                      >
                        <Download className="w-5 h-5 text-gray-600" />
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>

                      {openDropdown === report.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              handleDownloadPDF(report.id);
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-sm"
                          >
                            <FileText className="w-4 h-4 text-red-500" />
                            Download as PDF
                          </button>
                          <button
                            onClick={() => {
                              handleDownloadDOC(report.id);
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-sm"
                          >
                            <FileText className="w-4 h-4 text-blue-500" />
                            Download as DOC
                          </button>
                          <button
                            onClick={() => {
                              handleDownloadImage(report.id);
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <FileText className="w-4 h-4 text-green-500" />
                            Download as Image
                          </button>
                        </div>
                      )}
                    </div>

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
