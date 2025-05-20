const Patient = require("../models/Patient");
const Room = require("../models/Room");
const Symptom = require("../models/Symptom");
const { assignRoomToPatient } = require("../utils/roomAssigner");

// List all patients
exports.index = async (req, res) => {
  const patients = await Patient.find().populate("roomAssigned");
  res.render("patients/index", { patients });
};

// Render new patient form with symptoms from DB
exports.new = async (req, res) => {
  const symptomList = await Symptom.find();
  res.render("patients/new", { symptomList });
};

// Render edit form with symptoms from DB
exports.edit = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  const symptomList = await Symptom.find();
  res.render("patients/edit", { patient, symptomList });
};

// Create a new patient and calculate infection risk
exports.create = async (req, res) => {
  try {
    const selectedSymptoms = Array.isArray(req.body.symptoms)
      ? req.body.symptoms
      : [req.body.symptoms];

    const symptomsData = await Symptom.find({ name: { $in: selectedSymptoms } });
    const infectionRisk = symptomsData.reduce((sum, s) => sum + s.riskValue, 0);

    const patient = new Patient({
      title: req.body.title,
      firstName: req.body.firstName,
      surname: req.body.surname,
      age: req.body.age,
      symptoms: selectedSymptoms,
      infectionRisk
    });

    const assignedRoom = await assignRoomToPatient(patient);
    if (assignedRoom) {
      patient.roomAssigned = assignedRoom._id;
      await patient.save();

      assignedRoom.currentPatients.push(patient._id);
      await assignedRoom.save();

      res.redirect("/patients");
    } else {
      res.send("No suitable room available");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating patient");
  }
};

// Update patient info (optional: recalculate infection risk if symptoms changed)
exports.update = async (req, res) => {
  try {
    const selectedSymptoms = Array.isArray(req.body.symptoms)
      ? req.body.symptoms
      : [req.body.symptoms];

    const symptomsData = await Symptom.find({ name: { $in: selectedSymptoms } });
    const infectionRisk = symptomsData.reduce((sum, s) => sum + s.riskValue, 0);

    await Patient.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      firstName: req.body.firstName,
      surname: req.body.surname,
      age: req.body.age,
      symptoms: selectedSymptoms,
      infectionRisk
    });

    res.redirect("/patients");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating patient");
  }
};

// Delete patient
exports.remove = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (patient && patient.roomAssigned) {
      const room = await Room.findById(patient.roomAssigned);
      room.currentPatients.pull(patient._id);
      await room.save();
    }

    await Patient.findByIdAndDelete(req.params.id);
    res.redirect("/patients");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting patient");
  }
};
function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
