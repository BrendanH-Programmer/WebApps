const mongoose = require("mongoose");
const crypto = require("crypto");

// Define the Patient schema
const patientSchema = new mongoose.Schema({
  title: {
    type: String,
    enum: ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof"],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  surname: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", "Prefer not to say"],
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        const today = new Date();
        return value < today && value.getFullYear() > 1900;
      },
      message: "Date of birth must be in the past and after 1900",
    },
  },
  address: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  symptoms: [String],
  infectionRisk: Number,
  roomAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },
  nhsNumber: {
    type: String,
    unique: true,
    immutable: true,
  }
});

// Virtual property to get age
patientSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Deterministic NHS number generator using hash of name + dob
function generateNHSNumber(firstName, surname, dob) {
  const base = `${firstName.toLowerCase()}-${surname.toLowerCase()}-${dob.toISOString().split('T')[0]}`;
  return "NHS-" + crypto.createHash("sha256").update(base).digest("hex").slice(0, 10).toUpperCase();
}

// Pre-save hook to assign NHS number if not already set
patientSchema.pre("save", function (next) {
  if (!this.nhsNumber) {
    this.nhsNumber = generateNHSNumber(this.firstName, this.surname, this.dateOfBirth);
  }
  next();
});

patientSchema.set("toJSON", { virtuals: true });
patientSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Patient", patientSchema);
