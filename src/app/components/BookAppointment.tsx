import { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { doctorService, appointmentService } from '../services/api';

interface BookAppointmentProps {
  onClose?: () => void;
}

export default function BookAppointment({ onClose }: BookAppointmentProps) {
  const [showForm, setShowForm] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    timeSlot: '',
    reason: '',
    description: '',
  });

  // Fetch available doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getAvailableDoctors();
        setAvailableDoctors(res.data || []);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch doctors';
        toast.error(errorMsg);
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch available slots when doctor and date change
  useEffect(() => {
    if (formData.doctorId && formData.date) {
      const fetchSlots = async () => {
        try {
          setSlotLoading(true);
          const res = await appointmentService.getAvailableSlots(formData.doctorId, formData.date);
          setAvailableSlots(res.data || []);
          // Reset time slot when date changes
          setFormData(prev => ({ ...prev, timeSlot: '' }));
        } catch (err: any) {
          const errorMsg = err.response?.data?.message || 'Failed to fetch available slots';
          toast.error(errorMsg);
          setAvailableSlots([]);
        } finally {
          setSlotLoading(false);
        }
      };
      fetchSlots();
    }
  }, [formData.doctorId, formData.date]);

  // Fetch upcoming appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await appointmentService.getPatientAppointments('');
        setUpcomingAppointments(res.data || []);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };
    fetchAppointments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doctorId || !formData.date || !formData.timeSlot || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setBookingLoading(true);
      
      // Prepare appointment data for API
      const appointmentData = {
        doctorId: formData.doctorId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        description: formData.description,
      };

      // Call API to book appointment
      const res = await appointmentService.bookAppointment(appointmentData);
      
      if (res.data) {
        const newAppointment = res.data;
        
        // Add to local state for immediate display
        setUpcomingAppointments([...upcomingAppointments, newAppointment]);
        setShowForm(false);
        toast.success('Appointment booked successfully!');

        // Reset form
        setFormData({
          doctorId: '',
          date: '',
          timeSlot: '',
          reason: '',
          description: '',
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      toast.error(errorMsg);
      console.error('Error booking appointment:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = (appointmentId: string) => {
    setUpcomingAppointments(upcomingAppointments.filter(apt => apt.id !== appointmentId));
    toast.success('Appointment cancelled');
  };

  return (
    <div>
      {showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Book an Appointment</h2>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select a Doctor *</label>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-cyan-600 mr-2" />
                  <span className="text-gray-600">Loading doctors...</span>
                </div>
              ) : availableDoctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p>No doctors available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, doctorId: doctor.id })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.doctorId === doctor.id
                          ? 'border-cyan-600 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                          {doctor.fullName?.charAt(0) || doctor.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{doctor.fullName || doctor.name}</p>
                          <p className="text-xs text-gray-600">{doctor.specialty}</p>
                          {doctor.availableHours && (
                            <p className="text-xs text-cyan-600 mt-1">Available: {doctor.availableHours}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                Select a Date *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={!formData.doctorId}
              />
              {!formData.doctorId && (
                <p className="text-xs text-gray-500 mt-1">Please select a doctor first</p>
              )}
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select a Time Slot *</label>
              {slotLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader className="w-5 h-5 animate-spin text-cyan-600 mr-2" />
                  <span className="text-gray-600 text-sm">Loading available slots...</span>
                </div>
              ) : !formData.date ? (
                <div className="text-center py-6">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500 text-sm">Select a date to see available time slots</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-gray-600 text-sm">No available time slots for this date. Please choose another date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: slot })}
                      className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        formData.timeSlot === slot
                          ? 'border-cyan-600 bg-cyan-600 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-cyan-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <select
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Select a reason...</option>
                <option value="routine-checkup">Routine Checkup</option>
                <option value="cognitive-assessment">Cognitive Assessment</option>
                <option value="follow-up">Follow-up Visit</option>
                <option value="test-results">Discuss Test Results</option>
                <option value="memory-concerns">Memory Concerns</option>
                <option value="cognitive-decline">Cognitive Decline</option>
                <option value="medication-review">Medication Review</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Any specific concerns or symptoms you'd like to discuss..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={bookingLoading}
                className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Book Appointment
                  </>
                )}
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Another
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
              <p className="text-gray-600 mb-4">You don't have any scheduled appointments yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-block"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Doctor Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {appointment.doctorAvatar}
                      </div>

                      {/* Appointment Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-cyan-600 font-medium mb-2">{appointment.specialty}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm">{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm">{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <FileText className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm capitalize">{appointment.reason.replace(/-/g, ' ')}</span>
                          </div>
                        </div>

                        {appointment.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Notes:</span> {appointment.description}
                          </p>
                        )}

                        <p className="text-xs text-gray-500">{appointment.location}</p>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        {appointment.status}
                      </span>

                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
