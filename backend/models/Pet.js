const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true }, 
    vet: { type: String, required: true },
    treatmentCost: { type: Number, required: true },
    medicineCost: { type: Number },
    totalCost: { type: Number }
});


const vaccinationSchema = new mongoose.Schema({
  name: String,
  date: { type: Date, default: Date.now },
  expiryDate: Date
});

const petSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    age: { type: Number },
    gender: { type: String, enum: ["Female", "Male"] },
    species: { type: String , required: true},
    breed: { type: String },
    owner: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }
            },
    treatments: [treatmentSchema],
    vaccinations: [vaccinationSchema]
});

module.exports = mongoose.model('Pet', petSchema);
