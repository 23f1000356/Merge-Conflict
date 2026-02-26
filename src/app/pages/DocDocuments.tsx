import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, FileText, Plus, Edit, Trash2, Download } from 'lucide-react';

export default function DocDocuments() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'prescriptions'>('diagnosis');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: 'Memory Decline Assessment',
      patient: 'Rajesh Kumar',
      date: '2026-02-26',
      type: 'diagnosis',
      content: 'Patient shows signs of early-stage memory decline. Recommending cognitive therapy.',
    },
    {
      id: 2,
      title: 'Normal Cognitive Function Report',
      patient: 'Priya Singh',
      date: '2026-02-25',
      type: 'diagnosis',
      content: 'Patient demonstrates normal cognitive function across all assessment areas.',
    },
  ]);

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patient: 'Rajesh Kumar',
      medication: 'Memantine 10mg',
      dosage: 'Once daily',
      duration: '3 months',
      date: '2026-02-26',
    },
    {
      id: 2,
      patient: 'Sharma Desai',
      medication: 'Donepezil 5mg',
      dosage: 'Twice daily',
      duration: '6 months',
      date: '2026-02-24',
    },
  ]);

  const tabDocuments = activeTab === 'diagnosis' ? documents : prescriptions;

  const handleDelete = (id: number) => {
    if (activeTab === 'diagnosis') {
      setDocuments(documents.filter(d => d.id !== id));
    } else {
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="doctor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
            <h1 className="text-3xl font-bold text-gray-900">Documents & Reports</h1>
            <p className="text-gray-600 mt-1">Manage patient diagnoses and prescriptions</p>
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
            onClick={() => setActiveTab('diagnosis')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'diagnosis'
                ? 'text-cyan-600 border-cyan-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Diagnosis & Treatment
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'prescriptions'
                ? 'text-cyan-600 border-cyan-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Prescriptions
          </button>
        </div>

        {/* Add Document Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingId(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New {activeTab === 'diagnosis' ? 'Diagnosis' : 'Prescription'}
          </button>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {activeTab === 'diagnosis' ? (
            documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-cyan-600" />
                        <h3 className="text-lg font-bold text-gray-900">{doc.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Patient: <span className="font-semibold">{doc.patient}</span></p>
                      <p className="text-gray-700 mb-3">{doc.content}</p>
                      <p className="text-sm text-gray-500">Created on {new Date(doc.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingId(doc.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">No diagnoses recorded yet</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700"
                >
                  Add First Diagnosis
                </button>
              </div>
            )
          ) : (
            prescriptions.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Patient</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Medication</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Dosage</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Duration</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {prescriptions.map((rx) => (
                        <tr key={rx.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium">{rx.patient}</td>
                          <td className="py-3 px-4 text-gray-700">{rx.medication}</td>
                          <td className="py-3 px-4 text-gray-700">{rx.dosage}</td>
                          <td className="py-3 px-4 text-gray-700">{rx.duration}</td>
                          <td className="py-3 px-4 text-gray-700">{new Date(rx.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingId(rx.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(rx.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">No prescriptions recorded yet</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700"
                >
                  Add First Prescription
                </button>
              </div>
            )
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingId ? 'Edit' : 'Add New'} {activeTab === 'diagnosis' ? 'Diagnosis' : 'Prescription'}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={activeTab === 'diagnosis' ? 'Title' : 'Medication Name'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Patient Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                {activeTab === 'prescriptions' && (
                  <>
                    <input
                      type="text"
                      placeholder="Dosage"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </>
                )}
                {activeTab === 'diagnosis' && (
                  <textarea
                    placeholder="Diagnosis Details"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                    }}
                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
