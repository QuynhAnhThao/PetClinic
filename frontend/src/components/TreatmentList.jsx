import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const TreatmentList = ({ petId, treatments, setTreatments }) => {
  const { user } = useAuth();

  const handleDelete = async (treatId) => {
    if (!window.confirm('Delete this treatment?')) return;
    try {
      const res = await axiosInstance.delete(`/api/pets/${petId}/treatment/${treatId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTreatments(res.data.treatments);
    } catch (err) {
      console.error('DELETE treatment error:', err);
      alert('Failed to delete treatment.');
    }
  };

  if (!treatments || treatments.length === 0) {
    return <p>No treatments yet.</p>;
  };
  


  return (
    <div>
      {treatments.map((t) => (
        <div key={t._id} className="bg-gray-100 p-3 mb-2 rounded flex justify-between">
          <div>
            <p><strong>Date:</strong> {new Date(t.date).toLocaleDateString()}</p>
            <p><strong>Description:</strong> {t.description}</p>
            <p><strong>Vet:</strong> {t.vet}</p>
            <p><strong>Treatment Cost:</strong> ${t.treatmentCost}</p>
            {t.medicineCost !== undefined && (
              <p><strong>Medicine Cost:</strong> ${t.medicineCost}</p>
            )}
            <p><strong>Total Cost:</strong> ${t.totalCost}</p>
          </div>
          <button
            onClick={() => handleDelete(t._id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 h-fit"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default TreatmentList;
