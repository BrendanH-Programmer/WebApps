const Patient = require("../models/Patient");
const Room = require("../models/Room");
const Symptom = require("../models/Symptom");
const { assignRoomToPatient } = require("../utils/roomAssigner");

// Utility to capitalize names/addresses
function capitalize(str) {
  return str
    .split(' ')
    .map(word => word.length ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '')
    .join(' ');
}

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

// Show new patient form
exports.new = async (req, res) => {
  try {
    const symptomList = await Symptom.find();
    const availableRooms = await Room.find({
      $expr: { $lt: [{ $size: "$currentPatients" }, "$capacity"] }
    });

    const symptomRiskMap = {};
    symptomList.forEach(symptom => {
      symptomRiskMap[symptom.name] = symptom.riskValue;
    });

    res.render("patients/new", {
      symptomList,
      rooms: availableRooms,
      symptomRiskMap,
      user: req.session.user
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading form");
  }
};

// Show edit patient form
exports.edit = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    const symptomList = await Symptom.find();

    if (!patient) return res.status(404).send("Patient not found");

    const infectionRisk = patient.infectionRisk || 0;
    let availableRooms = await Room.find({
      status: "Available",
      $expr: { $lt: [{ $size: "$currentPatients" }, "$capacity"] },
      isIsolation: infectionRisk >= 5
    });

    if (infectionRisk < 5) {
      availableRooms = await Room.find({
        status: "Available",
        $expr: { $lt: [{ $size: "$currentPatients" }, "$capacity"] },
        isIsolation: false
      });
    }

    if (patient.roomAssigned) {
      const currentRoom = await Room.findById(patient.roomAssigned);
      if (currentRoom && !availableRooms.some(r => r._id.equals(currentRoom._id))) {
        availableRooms.push(currentRoom);
      }
    }

    res.render("patients/edit", {
      patient,
      symptomList,
      rooms: availableRooms,
      user: req.session.user
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit form");
  }
};

// Create patient
exports.create = async (req, res) => {
  try {
    const selectedSymptoms = Array.isArray(req.body.symptoms)
      ? req.body.symptoms
      : req.body.symptoms ? [req.body.symptoms] : [];

    const symptomsData = await Symptom.find({ name: { $in: selectedSymptoms } });
    const infectionRisk = symptomsData.reduce((sum, s) => sum + s.riskValue, 0);

    const selectedRoom = await Room.findById(req.body.roomAssigned);
    if (!selectedRoom || selectedRoom.status !== "Available") {
      return res.status(400).send("Selected room is invalid or unavailable.");
    }

    if ((infectionRisk >= 5 && !selectedRoom.isIsolation) ||
        (infectionRisk < 5 && selectedRoom.isIsolation)) {
      return res.status(400).send("Room inappropriate for infection risk.");
    }

    if (selectedRoom.currentPatients.length >= selectedRoom.capacity) {
      return res.status(400).send("Room at full capacity.");
    }

    const newPatient = new Patient({
      title: req.body.title,
      firstName: capitalize(req.body.firstName),
      surname: capitalize(req.body.surname),
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      address: capitalize(req.body.address),
      phoneNumber: req.body.phoneNumber,
      emergencyContact: {
        name: capitalize(req.body.emergencyContactName),
        relationship: capitalize(req.body.emergencyContactRelationship),
        phone: req.body.emergencyContactPhone,
      },
      symptoms: selectedSymptoms,
      infectionRisk,
      roomAssigned: selectedRoom._id
    });

    await newPatient.save();
    selectedRoom.currentPatients.push(newPatient._id);
    await selectedRoom.save();

    res.redirect("/patients");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating patient");
  }
};

// Update patient info
exports.update = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send("Patient not found");

    const selectedSymptoms = Array.isArray(req.body.symptoms)
      ? req.body.symptoms
      : req.body.symptoms ? [req.body.symptoms] : [];

    const symptomsData = await Symptom.find({ name: { $in: selectedSymptoms } });
    const infectionRisk = symptomsData.reduce((sum, s) => sum + s.riskValue, 0);

    const selectedRoom = await Room.findById(req.body.roomAssigned);
    if (!selectedRoom || selectedRoom.status !== "Available") {
      return res.status(400).send("Selected room is invalid or unavailable.");
    }

    const isSameRoom = patient.roomAssigned && patient.roomAssigned.equals(selectedRoom._id);
    if (!isSameRoom && selectedRoom.currentPatients.length >= selectedRoom.capacity) {
      return res.status(400).send("Room at full capacity.");
    }

    if ((infectionRisk >= 5 && !selectedRoom.isIsolation) ||
        (infectionRisk < 5 && selectedRoom.isIsolation)) {
      return res.status(400).send("Room inappropriate for infection risk.");
    }

    if (!isSameRoom && patient.roomAssigned) {
      const oldRoom = await Room.findById(patient.roomAssigned);
      if (oldRoom) {
        oldRoom.currentPatients.pull(patient._id);
        await oldRoom.save();
      }
      selectedRoom.currentPatients.push(patient._id);
      await selectedRoom.save();
    }

    Object.assign(patient, {
      title: req.body.title,
      firstName: capitalize(req.body.firstName),
      surname: capitalize(req.body.surname),
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      address: capitalize(req.body.address),
      phoneNumber: req.body.phoneNumber,
      emergencyContact: {
        name: capitalize(req.body.emergencyContactName),
        relationship: capitalize(req.body.emergencyContactRelationship),
        phone: req.body.emergencyContactPhone,
      },
      symptoms: selectedSymptoms,
      infectionRisk,
      roomAssigned: selectedRoom._id
    });

    await patient.save();

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
    if (patient?.roomAssigned) {
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


// Get total number of patients in the database
exports.getTotalPatients = async () => {
  try {
    const count = await Patient.countDocuments(); // No filter — returns all patients
    return count;
  } catch (err) {
    console.error("Error getting total patients:", err);
    throw err;
  }
};

// Get number of patients currently in isolation (infectionRisk >= 5)
exports.getPatientsInIsolation = async () => {
  try {
    const count = await Patient.countDocuments({ infectionRisk: { $gte: 5 } });
    return count;
  } catch (err) {
    console.error("Error getting patients in isolation:", err);
    throw err;
  }
};

exports.searchPatients = async (query) => {
  try {
    const regex = new RegExp(query, "i");

    const patients = await Patient.find({
      $or: [
        { firstName: regex },
        { surname: regex },
        { nhsNumber: regex },
        { symptoms: { $in: [regex] } }, // match symptoms array
      ]
    });

    return patients;
  } catch (err) {
    console.error("Error searching patients:", err);
    return [];
  }
};