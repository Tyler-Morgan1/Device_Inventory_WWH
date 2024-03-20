const AssignedAccessory = require("../models/assigned_accessory");
const Employee = require("../models/employee");
const Accessory = require("../models/accessory");
const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

// Display list of all assigned accessorys.
exports.assigned_accessory_list = asyncHandler(async (req, res, next) => {
  const allAssignedAccessories = await AssignedAccessory.find().populate("item").populate("employee_assigned").exec();

  res.render("assigned_accessories_list", {title: "Assigned Accessories List", assigned_accessories_list: allAssignedAccessories});
});

// Display detail page for a specific assigned accessory.
exports.assigned_accessory_detail = asyncHandler(async (req, res, next) => {
  const assignedAccessory = await AssignedAccessory.findById(req.params.id).exec();
  if (assignedAccessory == null) {
    const err = new Error("Accessory not found");
    err.status = 404;
    return next(err);
  }
  const [accessory] = await Accessory.find(assignedAccessory.item).exec();
  const [employee] = await Employee.find(assignedAccessory.employee_assigned).exec();
  res.render("assigned_accessory_detail", {
    title: "Assigned Accessory Detail",
    assignedAccessory: assignedAccessory,
    accessory: accessory,
    employee: employee
  })
});

// Display assigned accessory create form on GET.
exports.assigned_accessory_create_get = asyncHandler(async (req, res, next) => {
  const [allAccessories, allEmployees] = await Promise.all([
    Accessory.find().sort({ name: 1 }).exec(),
    Employee.find().sort({ name: 1 }).exec(),
  ]);

  res.render("assigned_accessories_form", {
    title: "Create Accessory Assignment",
    allAccessories: allAccessories,
    allEmployees: allEmployees
  })
});

// Handle assigned accessory create on POST.
exports.assigned_accessory_create_post = [
  // Validate and sanitize the name field.
  body("item", "must select an accessory to assign")
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
    const assignedAccessory = new AssignedAccessory({
      item: req.body.item, 
      employee_assigned: req.body.employee_assigned,
      date_assigned: req.body.date_assigned,
      date_returned: req.body.date_returned,
      condition_assigned: req.body.condition_assigned,
      condition_returned: req.body.condition_returned
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("assigned_accessories_form", {
        title: "Create Accessory Assignment",
        assignedAccessory: assignedAccessory,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const assignmentExists = await AssignedAccessory.findById(req.params.id).exec();
      if (assignmentExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(assignmentExists.url);
      } else {
        await assignedAccessory.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(assignedAccessory.url);
      }
    }
  }),
];

// Display assigned accessory delete form on GET.
exports.assigned_accessory_delete_get = asyncHandler(async (req, res, next) => {
  const assigned_accessory = await AssignedAccessory.findById(req.params.id).exec();
  const [accessory] = await Accessory.find(assigned_accessory.item).exec();
  const [employee] = await Employee.find(assigned_accessory.employee_assigned).exec();
  res.render("assigned_accessories_delete", {
   title: "Delete Accessory Assignment",
   assigned_accessory: assigned_accessory,
   accessory: accessory,
   employee: employee
 });
});

// Handle assigned accessory delete on POST.
exports.assigned_accessory_delete_post = asyncHandler(async (req, res, next) => {
  await AssignedAccessory.findByIdAndDelete(req.body.assigned_accessoryid);
  res.redirect("/inventory/assigned_accessories");
});

// Display assigned accessory update form on GET.
exports.assigned_accessory_update_get = asyncHandler(async (req, res, next) => {
  const assignedAccessory = await AssignedAccessory.findById(req.params.id).exec();
  if (assignedAccessory === null) {
    const err = new Error("Accessory assignment not found");
    err.status = 404;
    return next(err);
  } else {
    const [allAccessories, allEmployees] = await Promise.all([
      Accessory.find().sort({ name: 1 }).exec(),
      Employee.find().sort({ name: 1 }).exec(),
    ]);
    res.render("assigned_accessories_form", {
      title: "Update Accessory Assignment",
      allAccessories: allAccessories,
      allEmployees: allEmployees,
      assignedAccessory: assignedAccessory
    })
  }
});

// Handle assigned accessory update on POST.
exports.assigned_accessory_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.device)) {
      req.body.device =
        typeof req.body.device === "undefined" ? [] : [req.body.device];
    }
    next();
  },

  // Validate and sanitize the name field.
  body("item", "must select an accessory to assign")
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
    const assignedAccessory = new AssignedAccessory({
      item: req.body.item, 
      employee_assigned: req.body.employee_assigned,
      date_assigned: req.body.date_assigned,
      date_returned: req.body.date_returned,
      condition_assigned: req.body.condition_assigned,
      condition_returned: req.body.condition_returned,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      const [allAccessories, allEmployees] = await Promise.all([
        Accessory.find().sort({ name: 1 }).exec(),
        Employee.find().sort({ name: 1 }).exec(),
      ]);
      res.render("assigned_accessories_form", {
        title: "Update Accessory Assignment",
        assignedAccessory: assignedAccessory,
        errors: errors.array(),
        allAccessories: allAccessories,
        allEmployees: allEmployees,
      });
      return;
    } else {
      const updatedAccessoryAssignment = await AssignedAccessory.findByIdAndUpdate(req.params.id, assignedAccessory, {})
      res.redirect(updatedAccessoryAssignment.url);
    }
  }),
];