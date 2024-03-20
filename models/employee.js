const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
    name: { type: String, required: true },
    department: { type: String },
    position: { type: String },
    date_hired: { type: Date },
    date_employment_terminated: { type: Date },
    current_employee: { type: Boolean }
});

// Virtual for book's URL
EmployeeSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/inventory/employee/${this._id}`;
});

// Export model
module.exports = mongoose.model("Employee", EmployeeSchema);