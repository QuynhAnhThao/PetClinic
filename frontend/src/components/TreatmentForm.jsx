import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const TreatmentForm = ({ petId, setTreatments }) => {
  const { user } = useAuth();

  const empty = { date: '', description: '', vet: '', treatmentCost: '', medicineCost: '' };
  const [form, setForm] = useState(empty);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: form.date,
        description: form.description,
        vet: form.vet,
        treatmentCost: Number(form.treatmentCost),
        ...(form.medicineCost !== '' ? { medicineCost: Number(form.medicineCost) } : {}),
      };

      // ✅ đúng endpoint (số nhiều)
      const { data: added } = await axiosInstance.post(
        `/api/pets/${petId}/treatment`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // ✅ backend trả subdoc vừa thêm -> append vào state hiện tại
      setTreatments((prev) => ([...(prev || []), added]));

      setForm(empty);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add treatment.';
      console.error('ADD treatment error:', err?.response ?? err);
      alert(msg);
    }
  };

  return (
  <form
    onSubmit={handleSubmit}
    className="bg-gray-50 p-4 rounded border mb-4 grid gap-2 md:grid-cols-6"
  >
    <input
      type="date"
      name="date"
      value={form.date}
      onChange={onChange}
    />
    <input
      type="text"
      name="description"
      placeholder="Description"
      value={form.description}
      onChange={onChange}
    />
    <input
      type="text"
      name="vet"
      placeholder="Vet Name"
      value={form.vet}
      onChange={onChange}
    />
    <input
      type="number"
      step="0.01"
      name="treatmentCost"
      placeholder="Treatment Cost"
      value={form.treatmentCost}
      onChange={onChange}
    />
    <input
      type="number"
      step="0.01"
      name="medicineCost"
      placeholder="Medicine Cost"
      value={form.medicineCost}
      onChange={onChange}
    />

    {/* Cột nút riêng */}
    <button
      type="submit"
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Add
    </button>
  </form>
);

};

export default TreatmentForm;
