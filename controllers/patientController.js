const Patient = require("../models/Patient");
const { assignRoomToPatient } = require("../utils/roomAssigner");

exports.index = async (req, res) => {
  const patients = await Patient.find().populate("roomAssigned");
  res.render("patients/index", { patients });
};

exports.new = (req, res) => {
  res.render("patients/new");
};

exports.create = async (req, res) => {
  try {
    const patient = new Patient({
      title: req.body.title,
      firstName: req.body.firstName,
      surname: req.body.surname,
      age: req.body.age,
      symptoms: req.body.symptoms.split(',').map(s => s.trim()),
      infectionRisk: req.body.infectionRisk,
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


exports.edit = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  res.render("patients/edit", { patient });
};

exports.update = async (req, res) => {
  await Patient.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/patients");
};

exports.remove = async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.redirect("/patients");
};