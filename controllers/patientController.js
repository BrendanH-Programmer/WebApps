const Patient = require("../models/Patient");
const Room = require("../models/Room");
const Symptom = require("../models/Symptom");
const { assignRoomToPatient } = require("../utils/roomAssigner");

// List all patients
exports.index = async (req, res) => {
  try {
    const patients = await Patient.find().populate("roomAssigned");
    res.render("patients/index", { patients, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving patients");
  }
};

// Render new patient form
exports.new = async (req, res) => {
  try {
    const symptomList = await Symptom.find();
    res.render("patients/new", { symptomList, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading form");
  }
};

// Render edit form
exports.edit = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    const symptomList = await Symptom.find();
    res.render("patients/edit", { patient, symptomList, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit form");
  }
};

// Create new patient and assign room
exports.create = async (req, res) => {
  try {
    const selectedSymptoms = Array.isArray(req.body.symptoms)
      ? req.body.symptoms
      : req.body.symptoms ? [req.body.symptoms] : [];

    const symptomsData = await Symptom.find({ name: { $in: selectedSymptoms } });
    const infectionRisk = symptomsData.reduce((sum, s) => sum + s.riskValue, 0);

    const newPatient = new Patient({
      title: req.body.title,
      firstName: capitalize(req.body.firstName),
      surname: capitalize(req.body.surname),
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      emergencyContact: {
        name: req.body.emergencyContactName,
        relationship: req.body.emergencyContactRelationship,
        phone: req.body.emergencyContactPhone,
      },
      symptoms: selectedSymptoms,
      infectionRisk
    });


    const assignedRoom = await assignRoomToPatient(newPatient);

    if (assignedRoom) {
      newPatient.roomAssigned = assignedRoom._id;
      await newPatient.save();

      assignedRoom.currentPatients.push(newPatient._id);
      await assignedRoom.save();

      res.redirect("/patients");
    } else {
      await newPatient.save(); // Save unassigned
      res.send("No suitable room available. Patient added without room assignment.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating patient");
  }
};

// Update patient info and recalculate infection risk
exports.update = async (req, res) => {
  try {
    const selectedSymptoms = Array.isArray(req.body.symptoms)
      ? req.body.symptoms
      : req.body.symptoms ? [req.body.symptoms] : [];

    const symptomsData = await Symptom.find({ name: { $in: selectedSymptoms } });
    const infectionRisk = symptomsData.reduce((sum, s) => sum + s.riskValue, 0);

    await Patient.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      firstName: capitalize(req.body.firstName),
      surname: capitalize(req.body.surname),
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      emergencyContact: {
        name: req.body.emergencyContactName,
        relationship: req.body.emergencyContactRelationship,
        phone: req.body.emergencyContactPhone,
      },
      symptoms: selectedSymptoms,
      infectionRisk
    });

    res.redirect("/patients");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating patient");
  }
};

// Delete patient and remove from room
exports.remove = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (patient && patient.roomAssigned) {
      const room = await Room.findById(patient.roomAssigned);
      if (room) {
        room.currentPatients.pull(patient._id);
        await room.save();
      }
    }

    await Patient.findByIdAndDelete(req.params.id);
    res.redirect("/patients");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting patient");
  }
};

// View patient details
exports.show = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("roomAssigned");
    if (!patient) return res.status(404).send("Patient not found");
    res.render("patients/view", { patient, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving patient details");
  }
};

// Capitalize string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}