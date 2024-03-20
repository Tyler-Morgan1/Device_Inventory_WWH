const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AssignedDeviceSchema = new Schema({
    device: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    employee_assigned: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date_assigned: { type: Date },
    date_returned: { type: Date },
    condition_assigned: { type: String },
    condition_returned: { type: String }
});

// Virtual for book's URL
AssignedDeviceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/inventory/assigned_device/${this._id}`; // FIXME: Remember this will deviate from catalog path as shown in tutorial, will need to structure accordingly to this
});

// Export model
module.exports = mongoose.model("AssignedDevice", AssignedDeviceSchema);