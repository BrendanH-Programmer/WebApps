const mongoose = require("mongoose");

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
  symptoms: [String],
  infectionRisk: Number,
  roomAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
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

patientSchema.set("toJSON", { virtuals: true });
patientSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Patient", patientSchema);
