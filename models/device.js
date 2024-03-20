const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    serialNumber: { type: String, required: true },
    manufacturer: { type: String, required: true },
    name: { type: String },
    model: { type: String },
    description: { type: String },
    type: { type: String },
    westWindInventoryID: { type: String }
});

// Virtual for book's URL
DeviceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/inventory/device/${this._id}`; // FIXME: Remember this will deviate from catalog path as shown in tutorial, will need to structure accordingly to this
});

// Export model
module.exports = mongoose.model("Device", DeviceSchema);