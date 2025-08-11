  import { useState, useEffect } from 'react';
  import { useAuth } from '../context/AuthContext';
  import axiosInstance from '../axiosConfig';

  const AppointmentForm = ({ appointments, setAppointments, editingAppointment, setEditingAppointment }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ petName: '', ownerName: '', ownerPhone: '', date: '', description: '' });

    useEffect(() => {
      if (editingAppointment) {
        setFormData({
          petName: editingAppointment.petName,
          ownerName: editingAppointment.ownerName,
          ownerPhone: editingAppointment.ownerPhone,
          date: editingAppointment.date,
          description: editingAppointment.description,
        });
      } else {
        setFormData({ petName: '', ownerName: '', ownerPhone: '', date: '', description: '' });
      }
    }, [editingAppointment]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // if edit appointment, send PUT request (update)
        if (editingAppointment) {
          const response = await axiosInstance.put(`/api/appointments/${editingAppointment._id}`, formData, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setAppointments(appointments.map((apt) => (apt._id === response.data._id ? response.data : apt)));
        } 
        // if not, send POST request (create)
        else {
          const response = await axiosInstance.post('/api/appointments', formData, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setAppointments([...appointments, response.data]);
        }
        setEditingAppointment(null);
        setFormData({ petName: '', ownerName: '', ownerPhone: '', date: '', description: '' });
      } catch (error) {
        alert('Failed to save appointment.');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
        <h1 className="text-2xl font-bold mb-4">{editingAppointment ? 'Edit Appointment' : 'Add Appointment'}</h1>
        <input
          type="text"
          placeholder="Pet Name"
          value={formData.petName}
          onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Owner Name"
          value={formData.ownerName}
          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Owner Phone"
          value={formData.ownerPhone}
          onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
          {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
        </button>
      </form>
    );
  };

  export default AppointmentForm;
