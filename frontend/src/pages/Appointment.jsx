import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../axiosConfig';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentList from '../components/AppointmentList';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/appointments', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAppointments(response.data || []);
    } catch (error) {
      alert('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="container mx-auto px-4 py-8 mb-5 mt-5">
      <AppointmentForm
        appointments={appointments}
        setAppointments={setAppointments}
        editingAppointment={editingAppointment}
        setEditingAppointment={setEditingAppointment}
        onSaved={fetchAppointments} // <— refetch sau khi lưu
      />

      {loading && (
        <p className="text-sm text-gray-500 mb-3">Loading appointments…</p>
      )}

      <AppointmentList
        appointments={appointments}
        setAppointments={setAppointments}
        setEditingAppointment={setEditingAppointment}
      />
    </div>
  );
};

export default Appointments;
