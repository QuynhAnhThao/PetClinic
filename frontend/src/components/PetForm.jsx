// PetForm.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const PetForm = ({ pets, setPets, editingPet, setEditingPet }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    owner: {
      name: '',
      phone: '',
      email: '',
      address: ''
    }
  });

  useEffect(() => {
    if (editingPet) {
      setFormData({
        name: editingPet.name || '',
        species: editingPet.species || '',
        breed: editingPet.breed || '',
        age: editingPet.age || '',
        owner: editingPet.owner || { name: '', phone: '', email: '', address: '' }
      });
    } else {
      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        owner: {
          name: '',
          phone: '',
          email: '',
          address: ''
        }
      });
    }
  }, [editingPet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPet) {
        const response = await axiosInstance.put(`/api/pets/${editingPet._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPets(pets.map((pet) => (pet._id === response.data._id ? response.data : pet)));
      } else {
        const response = await axiosInstance.post('/api/pets', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPets([...pets, response.data]);
      }
      setEditingPet(null);
      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        owner: { name: '', phone: '', email: '', address: '' }
      });
    } catch (error) {
      alert('Failed to save pet.');
    }
  };

  const handleOwnerChange = (e) => {
    setFormData({
      ...formData,
      owner: { ...formData.owner, [e.target.name]: e.target.value },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingPet ? 'Edit Pet' : 'Add Pet'}</h1>
      <input
        type="text"
        placeholder="Pet Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Species"
        value={formData.species}
        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Breed"
        value={formData.breed}
        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Age"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        name="name"
        placeholder="Owner Name"
        value={formData.owner.name}
        onChange={handleOwnerChange}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        name="phone"
        placeholder="Owner Phone"
        value={formData.owner.phone}
        onChange={handleOwnerChange}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Owner Email"
        value={formData.owner.email}
        onChange={handleOwnerChange}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        name="address"
        placeholder="Owner Address"
        value={formData.owner.address}
        onChange={handleOwnerChange}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingPet ? 'Update Pet' : 'Add Pet'}
      </button>
    </form>
  );
};

export default PetForm;