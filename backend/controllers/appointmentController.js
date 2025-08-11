const Appointment = require('../models/Appointment');

// Get all appointments
const getAppointments = async (req, res) => {
  try {
    // find appointment from user in db
    const appointments = await Appointment.find({ userId: req.user.id }); 

    // response to frontend
    res.json(appointments); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new appointment
const addAppointment = async (req, res) => {
  const { petName, ownerName, ownerPhone, date, description } = req.body; // request from frontend
  try {
    // create new record in db
    const appointment = await Appointment.create({
      userId: req.user.id,
      petName,
      ownerName,
      ownerPhone,
      date,
      description
    });

    // response to frontend
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update existing appointment
const updateAppointment = async (req, res) => {
  const { petName, ownerName, ownerPhone, date, description } = req.body;
  try {
    // find record in db by id
    const appointment = await Appointment.findById(req.params.id);

    // if not found, show error
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    // if found, update each field
    appointment.petName = petName || appointment.petName;
    appointment.ownerName = ownerName || appointment.ownerName;
    appointment.ownerPhone = ownerPhone || appointment.ownerPhone;
    appointment.date = date || appointment.date;
    appointment.description = description || appointment.description;

    // save to db
    const updatedAppointment = await appointment.save();

    // response to frontend
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    // find record in db by id
    const appointment = await Appointment.findById(req.params.id);

    // if not found, show error
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    // if found, remove record from db
    await appointment.remove();

    // response to frontend
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
};
