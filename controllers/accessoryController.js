const Accessory = require("../models/accessory");
const AssignedAccessory = require("../models/assigned_accessory");
const asyncHandler = require("express-async-handler");


const { body, validationResult } = require("express-validator");

// Display list of all Accessories.
exports.accessory_list = asyncHandler(async (req, res, next) => {
  const allAccessories = await Accessory.find().sort({name: 1}).exec();

  res.render("accessory_list", {title: "Accessory List", accessory_list: allAccessories});
});

// Display detail page for a specific Accessory.
exports.accessory_detail = asyncHandler(async (req, res, next) => {
  const accessory = await Accessory.findById(req.params.id).exec();
  if (accessory == null) {
    const err = new Error("accessory not found");
    err.status = 404;
    return next(err);
  }
  res.render("accessory_detail", {accessory: accessory});
});

// Display Accessory create form on GET.
exports.accessory_create_get = asyncHandler(async (req, res, next) => {
  res.render("accessory_form", {title: "Create Accessory"})
});

// Handle Accessory create on POST.
exports.accessory_create_post = [
  // Validate and sanitize the name field.
  body("name")
    .trim()
    .escape(),
  body("serialNumber", "serialNumber must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .optional({values: "falsy"})
    .escape(),
  body("manufacturer", "manufacturer must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .optional({values: "falsy"})
    .escape(),
  body("description")
    .optional({values: "falsy"})
    .trim()
    .escape(),
  body("model")
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

    // Create a accessory object with escaped and trimmed data.
    const accessory = new Accessory({
      name: req.body.name, 
      serialNumber: req.body.serialNumber,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      model: req.body.model,
      type: req.body.type, 
      westWindInventoryID: req.body.westWindInventoryID
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("accessory_form", {
        title: "Create Accessory",
        accessory: accessory,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const accessoryExists = await Accessory.findOne({ name: req.body.name }).exec();
      if (accessoryExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(accessoryExists.url);
      } else {
        await accessory.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(accessory.url);
      }
    }
  }),
];

// Display Accessory delete form on GET.
exports.accessory_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of accessory and all their assigned employees (in parallel)
  const [accessory, assignedEmployee] = await Promise.all([
   Accessory.findById(req.params.id).exec(),
   AssignedAccessory.find({ item: req.params.id }, "employee_assigned").exec(),
 ]);

 if (accessory === null) {
   // No results.
   res.redirect("/inventory/accessories");
 }

 res.render("accessory_delete", {
   title: "Delete Accessory",
   accessory: accessory,
   assigned_employee: assignedEmployee,
 });
});

// Handle Accessory delete on POST.
exports.accessory_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of accessory and all their assigned employees (in parallel)
  const [accessory, assignedEmployee] = await Promise.all([
    Accessory.findById(req.params.id).exec(),
    AssignedAccessory.find({ item: req.params.id }, "employee_assigned").exec(),
  ]);

  if (assignedEmployee.length > 0) {
  // accessory has assignments. Render in same way as for GET route.
    res.render("accessory_delete", {
      title: "Delete accessory",
      accessory: accessory,
      assigned_employee: assignedEmployee
    });
  return;
  } else {
    // accessory has no assignments. Delete object and redirect to the list of accessories.
    await Accessory.findByIdAndDelete(req.body.accessoryid);
    res.redirect("/inventory/accessories");
  }
});

// Display Accessory update form on GET.
exports.accessory_update_get = asyncHandler(async (req, res, next) => {
  const accessory = await Accessory.findById(req.params.id).exec();
  if (accessory === null) {
    const err = new Error("Accessory not found");
    err.status = 404;
    return next(err);
  }
  res.render("accessory_form", {
    title: "Update Accessory",
    accessory: accessory
  })
});

// Handle Accessory update on POST.
exports.accessory_update_post = [
  // Convert the accessory to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.accessory)) {
      req.body.accessory =
        typeof req.body.accessory === "undefined" ? [] : [req.body.accessory];
    }
    next();
  },

  // Validate and sanitize the name field.
  body("name", "must include name")
    .trim()
    .escape(),
  body("serialNumber", "serialNumber must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .optional({values: "falsy"})
    .escape(),
  body("manufacturer", "manufacturer must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .optional({values: "falsy"})
    .escape(),
  body("description")
    .optional({values: "falsy"})
    .trim()
    .escape(),
  body("model")
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

    // Create a accessory object with escaped and trimmed data.
    const newAccessory = new Accessory({
      name: req.body.name, 
      serialNumber: req.body.serialNumber,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      model: req.body.model,
      type: req.body.type, 
      westWindInventoryID: req.body.westWindInventoryID,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages
      res.render("accessory_form", {
        title: "Update Accessory",
        accessory: newAccessory,
        errors: errors.array(),
      })
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedAccessory = await Accessory.findByIdAndUpdate(req.params.id, newAccessory, {});
      // Redirect to book detail page.
      res.redirect(updatedAccessory.url);
    }
  }),
];