const Patient = require("../models/Patient");
exports.index = async (req, res) => {
  const patients = await Patient.find().populate("roomAssigned");
  res.render("patients/index", { patients });
};

exports.new = (req, res) => {
  res.render("patients/new");
};

exports.create = async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.redirect("/patients");
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
