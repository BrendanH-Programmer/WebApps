const Symptom = require("../models/Symptom");

// Show all symptoms
exports.getAllSymptoms = async (req, res) => {
  try {
    const symptoms = await Symptom.find().lean();
    res.render("symptoms/index", { symptoms, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching symptoms");
  }
};

// Show form to add new symptom
exports.showAddForm = (req, res) => {
  res.render("symptoms/new");
};

// Handle add new symptom
exports.create = async (req, res) => {
  try {
    const { name, riskValue } = req.body;
    await Symptom.create({ name, riskValue });
    res.redirect("/symptoms");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding symptom");
  }
};

// Show form to edit symptom
exports.edit = async (req, res) => {
  try {
    const symptom = await Symptom.findById(req.params.id).lean();
    res.render("symptoms/edit", { symptom });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading edit form");
  }
};

// Handle update symptom
exports.update = async (req, res) => {
  try {
    const { name, riskValue } = req.body;
    await Symptom.findByIdAndUpdate(req.params.id, { name, riskValue });
    res.redirect("/symptoms");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating symptom");
  }
};

// Handle delete symptom
exports.delete = async (req, res) => {
  try {
    await Symptom.findByIdAndDelete(req.params.id);
    res.redirect("/symptoms");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting symptom");
  }
};
