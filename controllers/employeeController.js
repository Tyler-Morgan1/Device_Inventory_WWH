const Employee = require("../models/employee");
const AssignedAccessory = require("../models/assigned_accessory");
const AssignedDevice = require("../models/assigned_device");
const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

// Display list of all employees.
exports.employee_list = asyncHandler(async (req, res, next) => {
  const allEmployees = await Employee.find().sort({ name: 1 }).exec();
  res.render("employee_list", {
    title: "Employee List",
    employee_list: allEmployees
  });
});

// Display detail page for a specific employee.
exports.employee_detail = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id).exec();
  if (employee == null) {
    const err = new Error("Employee not found");
    err.status = 404;
    return next(err);
  }
  res.render("employee_detail", {employee: employee});
});

// Display employee create form on GET.
exports.employee_create_get = asyncHandler(async (req, res, next) => {
  res.render("employee_form", {title: "Create Employee"})
});

// Handle employee create on POST.
exports.employee_create_post = [
  // Validate and sanitize the name field.
  body("name", "Employee name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("department")
    .optional({values: "falsy"})
    .trim()
    .escape(),
  body("position")
    .optional({values: "falsy"})
    .trim()
    .escape()
    .isAlphanumeric()
    .withMessage("Position title has non-alphanumeric characters."),
  body("date_hired", "Invalid date of hire")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_employment_terminated", "Invalid date of employment termination.")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  // body("current_employee", "Current Employee error")
  //   .optional({ values: "falsy" }),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const employee = new Employee({ name: req.body.name, department: req.body.department, position: req.body.position, date_hired: req.body.date_hired, date_employment_terminated: req.body.date_employment_terminated });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("employee_form", {
        title: "Create Employee",
        employee: employee,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const employeeExists = await Employee.findOne({ name: req.body.name }).exec();
      if (employeeExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(employeeExists.url);
      } else {
        await employee.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(employee.url);
      }
    }
  }),
];

// Display employee delete form on GET.
exports.employee_delete_get = asyncHandler(async (req, res, next) => {
   // Get details of employee and all their assigned devices (in parallel)
   const [employee, assignedDevices, assignedAccessories] = await Promise.all([
    Employee.findById(req.params.id).exec(),
    AssignedDevice.find({ employee_assigned: req.params.id }, "serialNumber manufacturer").exec(),
    AssignedAccessory.find({ employee_assigned: req.params.id }, "item").exec(),
  ]);

  if (employee === null) {
    // No results.
    res.redirect("/inventory/emploees");
  }

  res.render("employee_delete", {
    title: "Delete Employee",
    employee: employee,
    assigned_devices: assignedDevices,
    assigned_accessories: assignedAccessories
  });
});

// Handle employee delete on POST.
exports.employee_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of employee and all their assigned devices (in parallel)
  const [employee, assignedDevices, assignedAccessories] = await Promise.all([
    Employee.findById(req.params.id).exec(),
    AssignedDevice.find({ employee_assigned: req.params.id }, "serialNumber manufacturer").exec(),
    AssignedAccessory.find({ employee_assigned: req.params.id }, "item").exec(),
  ]);

  if (assignedDevices.length > 0 || assignedAccessories.length > 0) {
    // Employee has assignments. Render in same way as for GET route.
    res.render("employee_delete", {
      title: "Delete employee",
      employee: employee,
      assigned_devices: assignedDevices,
      assigned_accessories: assignedAccessories
    });
    return;
  } else {
    // Employee has no assignments. Delete object and redirect to the list of employees.
    await Employee.findByIdAndDelete(req.body.employeeid);
    res.redirect("/inventory/employees");
  }
});

// Display employee update form on GET.
exports.employee_update_get = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id).exec();

  if (employee === null) {
    const err = new Error("Employee not found");
    err.status = 404;
    return next(err);
  }

  res.render("employee_form", {
    title: "Update Employee",
    employee: employee
  })
});

// Handle employee update on POST.
exports.employee_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.employee)) {
      req.body.employee =
        typeof req.body.employee === "undefined" ? [] : [req.body.employee];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Employee name must contain at least 3 characters")
  .trim()
  .isLength({ min: 3 })
  .escape(),
body("department")
  .optional({values: "falsy"})
  .trim()
  .escape()
  .isAlphanumeric()
  .withMessage("Department name has non-alphanumeric characters."),
body("position")
  .optional({values: "falsy"})
  .trim()
  .escape()
  .isAlphanumeric()
  .withMessage("Position title has non-alphanumeric characters."),
body("date_hired", "Invalid date of hire")
  .optional({ values: "falsy" })
  .isISO8601()
  .toDate(),
body("date_employment_terminated", "Invalid date of employment termination.")
  .optional({ values: "falsy" })
  .isISO8601()
  .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a employee object with escaped/trimmed data and old id.
    const newEmployee = new Employee({ 
      name: req.body.name, 
      department: req.body.department, 
      position: req.body.position, 
      date_hired: req.body.date_hired, 
      date_employment_terminated: req.body.date_employment_terminated,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages
      res.render("employee_form", {
        title: "Update Employee",
        employee: newEmployee,
        errors: errors.array(),
      })
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, newEmployee, {});
      // Redirect to book detail page.
      res.redirect(updatedEmployee.url);
    }
  }),
];