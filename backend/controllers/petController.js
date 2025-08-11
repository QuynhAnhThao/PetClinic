const Pet = require('../models/Pet');

// -------- Pets --------
const createPet = async (req, res) => {
  // request from frontend
  const { name, age, gender, species, breed, owner } = req.body; 
  try {
    // Check if pet name exist
    const petExist = await Pet.findOne({ name });
    if (petExist) return res.status(400).json({ message: 'Pet name already exists.' });
    
    // create new record in db
    const pet = await Pet.create({
      name, age, gender, species, breed, 
      owner: 
        {name: owner.name, 
         phone: owner.phone, 
         email: owner.email}
    });

    // response to frontend
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pets
const getPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pet
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get pet' });
  }
};

// Update pet
const updatePet = async (req, res) => {
  // request from frontend
  const id = req.params.id;
  const { name, age, gender, species, breed, owner } = req.body;

  try {
    // find pet from db
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    // check if new name is exist
    const newName = name.trim();
    if (newName && newName !== pet.name) {
        // check if newName is duplicated (not check itself)
        const dupName = await Pet.exists({ name: newName, _id: { $ne: id } });
        if (dupName) return res.status(409).json({ message: 'Pet name already exists.' });
        pet.name = newName;
    };

    // update record
    if (age !== undefined)    pet.age = Number(age);
    if (gender !== undefined) pet.gender = gender;
    if (species !== undefined)pet.species = species;
    if (breed !== undefined)  pet.breed = breed;
    if (owner) {
      pet.owner = { ...(pet.owner?.toObject?.() || pet.owner), ...owner };
    }
    // save to db
    const updated = await pet.save();
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) { 
      return res.status(409).json({ message: 'Pet name already exists.' });
    }
    res.status(500).json({ message: err.message });
  }
};


// Delete pet 
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    await pet.remove();
    res.json({ message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------- Treatments --------
// Get all treatments of pet
const getTreatments = async (req, res) => {
  try {
    // get pet treatment from db
    const pet = await Pet.findById(req.params.petId, { treatments: 1, _id: 0 }); // projection only get treatments
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    
    // return treatments
    res.json(pet.treatments || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new treatment
const addTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const { date, description, vet, treatmentCost, medicineCost } = req.body;

    // validate null value
    if (!date || !description || !vet || treatmentCost === undefined || treatmentCost === '') {
      return res.status(400).json({ message: 'date, description, vet, treatmentCost are required.' });
    };

    // add new treatment and save
    pet.treatments.push({
    date,
    description,
    vet,
    treatmentCost: Number(treatmentCost),
    medicineCost: Number(medicineCost || 0),
    totalCost: Number(treatmentCost) + Number(medicineCost || 0),
    });
    await pet.save();

    const added = pet.treatments[pet.treatments.length - 1];
    return res.status(201).json(added);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};


// Delete Treatment
const deleteTreatment = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id); 
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const treatment = pet.treatments.id(req.params.treatId);
    if (!treatment) return res.status(404).json({ message: 'Treatment not found' });

    treatment.remove(); 
    await pet.save();
    res.json({ treatments: pet.treatments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  getTreatments,
  addTreatment,
  deleteTreatment
};
