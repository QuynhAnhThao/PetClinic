// Pets.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Pets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    owner: { name: '', phone: '', email: '' },
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await axiosInstance.get('/api/pets', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPets(res.data);
      } catch {
        alert('Failed to fetch pets.');
      }
    };
    if (user?.token) fetchPets();
  }, [user]);

  const handleDelete = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return;
    try {
      await axiosInstance.delete(`/api/pets/${petId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPets((prev) => prev.filter((p) => p._id !== petId));
    } catch {
      alert('Failed to delete pet.');
    }
  };

  const handleEdit = (petId) => navigate(`/pets/edit/${petId}`);
  const handleView = (petId) => navigate(`/pets/${petId}`);

  // --- Create inline ---
  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('owner.')) {
      const key = name.split('.')[1];
      setForm((f) => ({ ...f, owner: { ...f.owner, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const resetForm = () =>
    setForm({
      name: '',
      species: '',
      breed: '',
      age: '',
      gender: '',
      owner: { name: '', phone: '', email: '' },
    });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.species || !form.owner.name || !form.owner.phone) {
      return alert('Please fill required fields: Pet name, Species, Owner name, Owner phone.');
    }
    try {
      const payload = {
        name: form.name.trim(),
        species: form.species.trim(),
        breed: form.breed.trim() || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        owner: {
          name: form.owner.name.trim(),
          phone: form.owner.phone.trim(),
          email: form.owner.email.trim() || undefined,
        },
      };
      const res = await axiosInstance.post('/api/pets', payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPets((prev) => [res.data, ...prev]); // add new pet to top
      resetForm();
      setCreating(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||        // <-- backend message
        err?.response?.data?.error ||
        'Create failed. Please try again.';
      alert(msg);
      console.log('Create pet error:', err?.response?.data);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-5 mt-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">All Pets</h1>
        <button
          onClick={() => setCreating((s) => !s)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {creating ? 'Close' : 'Create Pet'}
        </button>
      </div>

      {!pets?.length && !creating ? (
        <p>No pets found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creating && (
            <form
              onSubmit={handleCreateSubmit}
              className="bg-white border border-gray-200 rounded-xl shadow p-5 flex flex-col gap-3"
            >
              <h2 className="text-xl font-bold">Add New Pet</h2>

              {/* Pet info */}
              <input
                className="border rounded px-3 py-2"
                placeholder="Pet Name *"
                name="name"
                value={form.name}
                onChange={onChange}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Species *"
                name="species"
                value={form.species}
                onChange={onChange}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Breed"
                name="breed"
                value={form.breed}
                onChange={onChange}
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-1/2"
                  placeholder="Age"
                  name="age"
                  value={form.age}
                  onChange={onChange}
                />
                <select
                  className="border rounded px-3 py-2 w-1/2"
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Owner info */}
              <div className="mt-1">
                <h3 className="font-semibold mb-1">Owner Information</h3>
                <input
                  className="border rounded px-3 py-2 mb-2 w-full"
                  placeholder="Owner Name *"
                  name="owner.name"
                  value={form.owner.name}
                  onChange={onChange}
                />
                <input
                  className="border rounded px-3 py-2 mb-2 w-full"
                  placeholder="Owner Phone *"
                  name="owner.phone"
                  value={form.owner.phone}
                  onChange={onChange}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Owner Email"
                  name="owner.email"
                  value={form.owner.email}
                  onChange={onChange}
                />
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setCreating(false);
                  }}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {pets.map((pet) => (
            <div
              key={pet._id}
              className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition-shadow p-5 flex flex-col justify-between"
            >
              <div className="rounded-xl bg-white p-5">
              {/* 3 cột: Pet | Owner | Image */}
              <div className="flex flex-col md:flex-row md:flex-nowrap items-start gap-6">
                {/* Pet info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg">{pet.name}</h2>
                  <p><strong>Species:</strong> {pet.species}</p>
                  <p><strong>Breed:</strong> {pet.breed}</p>
                  <p><strong>Age:</strong> {pet.age}</p>
                </div>

                {/* Image (cột cố định, không co) */}
                <div className="shrink-0">
                  <div className="w-28 h-28 overflow-hidden rounded-lg">
                    <img
                      src={`/images/pet2.png` || 'https://via.placeholder.com/150'}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => handleView(pet._id)}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 text-sm rounded hover:bg-yellow-600"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(pet._id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pets;
