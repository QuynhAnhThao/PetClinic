const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPet, getPets, getPetById, updatePet, deletePet, getTreatments, addTreatment, deleteTreatment } = require('../controllers/petController');

// route for pets
router.route('/').get(protect, getPets).post(protect, createPet);
router.route('/:id').get(protect, getPetById).put(protect, updatePet).delete(protect, deletePet);

// route for treatment of pet
router.route('/:id/treatment').get(protect, getTreatments).post(protect, addTreatment);
router.route('/:id/treatment/:treatId').delete(protect, deleteTreatment);

module.exports = router;