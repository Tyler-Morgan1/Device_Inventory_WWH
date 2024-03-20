const Device = require("../models/device");
const AssignedDevice = require("../models/assigned_device");
const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

// Display list of all Devices.
exports.device_list = asyncHandler(async (req, res, next) => {
  const allDevices = await Device.find({}, "serialNumber manufacturer").sort({manufacturer: 1}).exec();
  res.render("device_list", {title: "Device List", device_list: allDevices});
});

// Display detail page for a specific Device.
exports.device_detail = asyncHandler(async (req, res, next) => {
  const device = await Device.findById(req.params.id).exec();
  if (device == null) {
    const err = new Error("Device not found");
    err.status = 404;
    return next(err);
  }
  res.render("device_detail", {device: device});
});

// Display Device create form on GET.
exports.device_create_get = asyncHandler(async (req, res, next) => {
  res.render("device_form", {title: "Create Device"})
});

// Handle Device create on POST.
exports.device_create_post = [
  // Validate and sanitize the name field.
  body("serialNumber", "serialNumber must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("manufacturer", "manufacturer must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("department")
    .optional({values: "falsy"})
    .trim()
    .escape(),
  body("name")
    .optional({values: "falsy"})
    .trim()
    .escape(),
  body("model")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  body("type")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  body("westWindInventoryID")
    .optional({ values: "falsy" })
    .trim()
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a device object with escaped and trimmed data.
    const device = new Device({
      serialNumber: req.body.serialNumber,
      manufacturer: req.body.manufacturer,
      department: req.body.department,
      name: req.body.name, 
      model: req.body.model,
      description: req.body.description,
      type: req.body.type, 
      westWindInventoryID: req.body.westWindInventoryID
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("device_form", {
        title: "Create Device",
        device: device,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if device with same name already exists.
      const deviceExists = await Device.findOne({ serialNumber: req.body.serialNumber, manufacturer: req.body.manufacturer }).exec();
      if (deviceExists) {
        // device exists, redirect to its detail page.
        res.redirect(deviceExists.url);
      } else {
        await device.save();
        // New device saved. Redirect to device detail page.
        res.redirect(device.url);
      }
    }
  }),
];

// Display Device delete form on GET.
exports.device_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of device and all their assigned employees (in parallel)
  const [device, assignedEmployee] = await Promise.all([
   Device.findById(req.params.id).exec(),
   AssignedDevice.find({ device: req.params.id }, "employee_assigned").exec(),
 ]);

 if (device === null) {
   // No results.
   res.redirect("/inventory/devices");
 }

 res.render("device_delete", {
   title: "Delete Device",
   device: device,
   assigned_employee: assignedEmployee,
 });
});

// Handle Device delete on POST.
exports.device_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of device and all their assigned employees (in parallel)
  const [device, assignedEmployee] = await Promise.all([
    Device.findById(req.params.id).exec(),
    AssignedDevice.find({ device: req.params.id }, "employee_assigned").exec(),
  ]);

  if (assignedEmployee.length > 0) {
  // Device has assignments. Render in same way as for GET route.
    res.render("device_delete", {
      title: "Delete device",
      device: device,
      assigned_employee: assignedEmployee
    });
  return;
  } else {
    // Device has no assignments. Delete object and redirect to the list of devices.
    await Device.findByIdAndDelete(req.body.deviceid);
    res.redirect("/inventory/devices");
  }
});

// Display Device update form on GET.
exports.device_update_get = asyncHandler(async (req, res, next) => {
  const device = await Device.findById(req.params.id).exec();
  if (device === null) {
    const err = new Error("Device not found");
    err.status = 404;
    return next(err);
  }
  res.render("device_form", {
    title: "Update Device",
    device: device
  })
});

// Handle Device update on POST.
exports.device_update_post = [
  // Convert the device to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.device)) {
      req.body.device =
        typeof req.body.device === "undefined" ? [] : [req.body.device];
    }
    next();
  },

  // Validate and sanitize the name field.
  body("serialNumber", "serialNumber must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("manufacturer", "manufacturer must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("department")
    .optional({values: "falsy"})
    .trim()
    .escape(),
  body("name")
    .optional({values: "falsy"})
    .trim()
    .escape(),
  body("model")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  body("type")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  body("westWindInventoryID")
    .optional({ values: "falsy" })
    .trim()
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a device object with escaped/trimmed data and old id.
    const newDevice = new Device({ 
      serialNumber: req.body.serialNumber, 
      manufacturer: req.body.manufacturer, 
      name: req.body.name, 
      model: req.body.model, 
      description: req.body.description,
      type: req.body.type, 
      westWindInventoryID: req.body.westWindInventoryID,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages
      res.render("device_form", {
        title: "Update Device",
        device: newDevice,
        errors: errors.array(),
      })
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedDevice = await Device.findByIdAndUpdate(req.params.id, newDevice, {});
      // Redirect to device detail page.
      res.redirect(updatedDevice.url);
    }
  }),
];