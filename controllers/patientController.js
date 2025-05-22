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

// Show new patient form
exports.new = async (req, res) => {
  try {
    const symptomList = await Symptom.find();

    // Find rooms that are not at full capacity
    const availableRooms = await Room.find({
      $expr: { $lt: [{ $size: "$currentPatients" }, "$capacity"] }
    });

    // Build risk map for frontend JS use
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

    if (!patient) {
      return res.status(404).send("Patient not found");
    }

    // Use patient's infection risk to filter rooms:
    const infectionRisk = patient.infectionRisk || 0;

    // Query available rooms by capacity and isolation status based on infectionRisk
    const availableRooms = await Room.find({
      status: "Available",
      $expr: { $lt: [{ $size: "$currentPatients" }, "$capacity"] },
      isIsolation: infectionRisk >= 5 // only isolation rooms if infectionRisk >= 5
    });

    // For patients with infectionRisk < 5, select only non-isolation rooms
    if (infectionRisk < 5) {
      const nonIsolationRooms = await Room.find({
        status: "Available",
        $expr: { $lt: [{ $size: "$currentPatients" }, "$capacity"] },
        isIsolation: false
      });

      // Merge availableRooms and nonIsolationRooms
      // Since availableRooms would be empty if infectionRisk < 5 due to the above query,
      // just use nonIsolationRooms:
      availableRooms.splice(0, availableRooms.length, ...nonIsolationRooms);
    }

    // Add current room (even if full or unavailable) if not already in availableRooms
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
    if (!selectedRoom) {
      return res.status(400).send("Selected room does not exist.");
    }
    if (selectedRoom.status !== "Available") {
      return res.status(400).send("Selected room is not available.");
    }

    if ((infectionRisk >= 5 && !selectedRoom.isIsolation) ||
        (infectionRisk < 5 && selectedRoom.isIsolation)) {
      return res.status(400).send("Selected room is not appropriate for patient infection risk.");
    }

    const currentPatientCount = selectedRoom.currentPatients.length;
    if (currentPatientCount >= selectedRoom.capacity) {
      return res.status(400).send("Selected room is at full capacity.");
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

// Update patient info and infection risk
exports.update = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send("Patient not found");

    // Parse selected symptoms and calculate infection risk
    const selectedSymptoms = Array.isArray(req.body.symptoms)
      ? req.body.symptoms
      : req.body.symptoms ? [req.body.symptoms] : [];

    const symptomsData = await Symptom.find({ name: { $in: selectedSymptoms } });
    const infectionRisk = symptomsData.reduce((sum, s) => sum + s.riskValue, 0);

    // Find the newly selected room
    const selectedRoom = await Room.findById(req.body.roomAssigned);
    if (!selectedRoom) {
      return res.status(400).send("Selected room does not exist.");
    }
    if (selectedRoom.status !== "Available") {
      return res.status(400).send("Selected room is not available.");
    }

    // Check if room matches infection risk/isolation rules
    if ((infectionRisk >= 5 && !selectedRoom.isIsolation) ||
        (infectionRisk < 5 && selectedRoom.isIsolation)) {
      return res.status(400).send("Selected room is not appropriate for patient infection risk.");
    }

    // Check capacity
    // If the patient is moving rooms, exclude the patient from the count on the old room
    // but for simplicity, just check if selected room has capacity or if it is the current room assigned
    let currentPatientCount = selectedRoom.currentPatients.length;
    const isSameRoom = patient.roomAssigned && patient.roomAssigned.equals(selectedRoom._id);
    if (!isSameRoom && currentPatientCount >= selectedRoom.capacity) {
      return res.status(400).send("Selected room is at full capacity.");
    }

    // If the patient is changing rooms, update the rooms' currentPatients arrays
    if (!isSameRoom) {
      // Remove patient from old room
      if (patient.roomAssigned) {
        const oldRoom = await Room.findById(patient.roomAssigned);
        if (oldRoom) {
          oldRoom.currentPatients.pull(patient._id);
          await oldRoom.save();
        }
      }

      // Add patient to new room
      selectedRoom.currentPatients.push(patient._id);
      await selectedRoom.save();
    }

    // Update patient info and room assignment
    patient.title = req.body.title;
    patient.firstName = capitalize(req.body.firstName);
    patient.surname = capitalize(req.body.surname);
    patient.gender = req.body.gender;
    patient.dateOfBirth = req.body.dateOfBirth;
    patient.address = capitalize(req.body.address);
    patient.phoneNumber = req.body.phoneNumber;
    patient.emergencyContact = {
      name: capitalize(req.body.emergencyContactName),
      relationship: capitalize(req.body.emergencyContactRelationship),
      phone: req.body.emergencyContactPhone,
    };
    patient.symptoms = selectedSymptoms;
    patient.infectionRisk = infectionRisk;
    patient.roomAssigned = selectedRoom._id;

    await patient.save();

    res.redirect("/patients");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating patient");
  }
};

// Delete patient and update room
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

// Utility to capitalize names/addresses
function capitalize(str) {
  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}