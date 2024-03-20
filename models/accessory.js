const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AccessorySchema = new Schema({
    name: { type: String, required: true },
    serialNumber: { type: String },
    manufacturer: { type: String },
    description: { type: String },
    model: { type: String },
    type: { type: String },
    inventoryID: { type: String }
});

// Virtual for book's URL
AccessorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/inventory/accessory/${this._id}`; // FIXME: Remember this will deviate from catalog path as shown in tutorial, will need to structure accordingly to this
});

// Export model
module.exports = mongoose.model("Accessory", AccessorySchema);