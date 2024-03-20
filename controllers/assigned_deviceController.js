const AssignedDevice = require("../models/assigned_device");
const Employee = require("../models/employee");
const Device = require("../models/device");
const Accessory = require("../models/accessory");
const AssignedAccessory = require("../models/assigned_accessory");

const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
    // res.send("NOT IMPLEMENTED: Site Home Page");
    const[
      employeeCount, deviceCount, accessoryCount, assignedDeviceCount, assignedAccessoryCount
    ] = await Promise.all([
      Employee.countDocuments({}).exec(),
      Device.countDocuments({}).exec(),
      Accessory.countDocuments({}).exec(),
      AssignedDevice.countDocuments({}).exec(),
      AssignedAccessory.countDocuments({}).exec()
    ]);

    res.render("index", {
      title: "Westwind I.T. Employee Devices Inventory",
      employee_count: employeeCount,
      device_count: deviceCount,
      accessory_count: accessoryCount,
      assigned_devices_count: assignedDeviceCount,
      assigned_accessories_count: assignedAccessoryCount
    });
  });

// Display list of all assigned devices.
exports.assigned_device_list = asyncHandler(async (req, res, next) => {
  const allAssignedDevices = await AssignedDevice.find().populate("device").populate("employee_assigned").exec();

  res.render("assigned_devices_list", {title: "Assigned Devices List", assigned_devices_list: allAssignedDevices});
});

// Display detail page for a specific assigned device.
exports.assigned_device_detail = asyncHandler(async (req, res, next) => {
  const assignedDevice = await AssignedDevice.findById(req.params.id).exec();
  if (assignedDevice == null) {
    const err = new Error("Device not found");
    err.status = 404;
    return next(err);
  }
  const [device] = await Device.find(assignedDevice.device).exec();
  const [employee] = await Employee.find(assignedDevice.employee_assigned).exec();
  res.render("assigned_device_detail", {
    title: "Assigned Device Detail",
    assignedDevice: assignedDevice,
    device: device,
    employee: employee
  })
});

// Display assigned device create form on GET.
exports.assigned_device_create_get = asyncHandler(async (req, res, next) => {
  const [allDevices, allEmployees] = await Promise.all([
    Device.find().sort({ name: 1 }).exec(),
    Employee.find().sort({ name: 1 }).exec(),
  ]);

  res.render("assigned_devices_form", {
    title: "Create Device Assignment",
    allDevices: allDevices,
    allEmployees: allEmployees
  })
});

// Handle assigned device create on POST.
exports.assigned_device_create_post = [
  // Validate and sanitize the name field.
  body("device", "must select a device to assign")
    .trim()
    .escape(),
  body("employee_assigned", "must select an employee to assign to")
    .trim()
    .escape(),
  body("date_assigned")
    .trim()
    .optional({values: "falsy"})
    .escape(),
    body("date_returned")
    .trim()
    .optional({values: "falsy"})
    .escape(),
  body("condition_assigned")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  body("condition_returned")
    .optional({ values: "falsy" })
    .trim()
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a accessory object with escaped and trimmed data.
    const assignedDevice = new AssignedDevice({
      device: req.body.device, 
      employee_assigned: req.body.employee_assigned,
      date_assigned: req.body.date_assigned,
      date_returned: req.body.date_returned,
      condition_assigned: req.body.condition_assigned,
      condition_returned: req.body.condition_returned
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      const [allDevices, allEmployees] = await Promise.all([
        Device.find().sort({ name: 1 }).exec(),
        Employee.find().sort({ name: 1 }).exec(),
      ]);
      res.render("assigned_devices_form", {
        title: "Create Device Assignment",
        assignedDevice: assignedDevice,
        errors: errors.array(),
        allDevices: allDevices,
        allEmployees: allEmployees
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const assignmentExists = await AssignedDevice.findOne({ device: req.body.device, employee_assigned: req.body.employee_assigned }).exec();
      if (assignmentExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(assignmentExists.url);
      } else {
        await assignedDevice.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(assignedDevice.url);
      }
    }
  }),
];

// Display assigned device delete form on GET.
exports.assigned_device_delete_get = asyncHandler(async (req, res, next) => {
  const assigned_device = await AssignedDevice.findById(req.params.id).exec();
  const [device] = await Device.find(assigned_device.device).exec();
  const [employee] = await Employee.find(assigned_device.employee_assigned).exec();
  res.render("assigned_device_delete", {
   title: "Delete Device Assignment",
   assigned_device: assigned_device,
   device: device,
   employee: employee
 });
});

// Handle assigned device delete on POST.
exports.assigned_device_delete_post = asyncHandler(async (req, res, next) => {
  await AssignedDevice.findByIdAndDelete(req.body.assigned_deviceid);
  res.redirect("/inventory/assigned_devices");
});

// Display assigned device update form on GET.
exports.assigned_device_update_get = asyncHandler(async (req, res, next) => {
  const assignedDevice = await AssignedDevice.findById(req.params.id).exec();
  if (assignedDevice === null) {
    const err = new Error("Accessory assignment not found");
    err.status = 404;
    return next(err);
  } else {
    const [allDevices, allEmployees] = await Promise.all([
      Device.find().sort({ name: 1 }).exec(),
      Employee.find().sort({ name: 1 }).exec(),
    ]);
    res.render("assigned_devices_form", {
      title: "Create Device Assignment",
      allDevices: allDevices,
      allEmployees: allEmployees,
      assignedDevice: assignedDevice
    })
  }
});

// Handle assigned device update on POST.
exports.assigned_device_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.device)) {
      req.body.device =
        typeof req.body.device === "undefined" ? [] : [req.body.device];
    }
    next();
  },

  // Validate and sanitize the name field.
  body("device", "must select a device to assign")
    .trim()
    .escape(),
  body("employee_assigned", "must select an employee to assign to")
    .trim()
    .escape(),
  body("date_assigned")
    .trim()
    .optional({values: "falsy"})
    .escape(),
    body("date_returned")
    .trim()
    .optional({values: "falsy"})
    .escape(),
  body("condition_assigned")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  body("condition_returned")
    .optional({ values: "falsy" })
    .trim()
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a accessory object with escaped and trimmed data.
    const assignedDevice = new AssignedDevice({
      device: req.body.device, 
      employee_assigned: req.body.employee_assigned,
      date_assigned: req.body.date_assigned,
      date_returned: req.body.date_returned,
      condition_assigned: req.body.condition_assigned,
      condition_returned: req.body.condition_returned,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      const [allDevices, allEmployees] = await Promise.all([
        Device.find().sort({ name: 1 }).exec(),
        Employee.find().sort({ name: 1 }).exec(),
      ]);
      res.render("assigned_devices_form", {
        title: "Update Device Assignment",
        assignedDevice: assignedDevice,
        errors: errors.array(),
        allDevices: allDevices,
        allEmployees: allEmployees,
      });
      return;
    } else {
      const updatedDeviceAssignment = await AssignedDevice.findByIdAndUpdate(req.params.id, assignedDevice, {})
      res.redirect(updatedDeviceAssignment.url);
    }
  }),
];