const express = require("express");
const router = express.Router();

// Require controller modules.
const assigned_device_controller = require("../controllers/assigned_deviceController");
const device_controller = require("../controllers/deviceController");
const employee_controller = require("../controllers/employeeController");
const accessory_controller = require("../controllers/accessoryController");
const assigned_accessory_controller = require("../controllers/assigned_accessoryController");


/// ASSIGNED DEVICE ROUTES ///

// GET catalog home page.
router.get("/", assigned_device_controller.index);

// GET request for creating a assigned_device. NOTE This must come before routes that display assigned_device (uses id).
router.get("/assigned_device/create", assigned_device_controller.assigned_device_create_get);

// POST request for creating assigned_device.
router.post("/assigned_device/create", assigned_device_controller.assigned_device_create_post);

// GET request to delete assigned_device.
router.get("/assigned_device/:id/delete", assigned_device_controller.assigned_device_delete_get);

// POST request to delete assigned_device.
router.post("/assigned_device/:id/delete", assigned_device_controller.assigned_device_delete_post);

// GET request to update assigned_device.
router.get("/assigned_device/:id/update", assigned_device_controller.assigned_device_update_get);

// POST request to update assigned_device.
router.post("/assigned_device/:id/update", assigned_device_controller.assigned_device_update_post);

// GET request for one assigned_device.
router.get("/assigned_device/:id", assigned_device_controller.assigned_device_detail);

// GET request for list of all assigned_device items.
router.get("/assigned_devices", assigned_device_controller.assigned_device_list);

/// DEVICE ROUTES ///

// GET request for creating device. NOTE This must come before route for id (i.e. display device).
router.get("/device/create", device_controller.device_create_get);

// POST request for creating device.
router.post("/device/create", device_controller.device_create_post);

// GET request to delete device.
router.get("/device/:id/delete", device_controller.device_delete_get);

// POST request to delete device.
router.post("/device/:id/delete", device_controller.device_delete_post);

// GET request to update device.
router.get("/device/:id/update", device_controller.device_update_get);

// POST request to update device.
router.post("/device/:id/update", device_controller.device_update_post);

// GET request for one device.
router.get("/device/:id", device_controller.device_detail);

// GET request for list of all devices.
router.get("/devices", device_controller.device_list);

/// EMPLOYEE ROUTES ///

// GET request for creating a employee. NOTE This must come before route that displays employee (uses id).
router.get("/employee/create", employee_controller.employee_create_get);

//POST request for creating employee.
router.post("/employee/create", employee_controller.employee_create_post);

// GET request to delete employee.
router.get("/employee/:id/delete", employee_controller.employee_delete_get);

// POST request to delete employee.
router.post("/employee/:id/delete", employee_controller.employee_delete_post);

// GET request to update employee.
router.get("/employee/:id/update", employee_controller.employee_update_get);

// POST request to update employee.
router.post("/employee/:id/update", employee_controller.employee_update_post);

// GET request for one employee.
router.get("/employee/:id", employee_controller.employee_detail);

// GET request for list of all employees.
router.get("/employees", employee_controller.employee_list);

/// ACCESSORY ROUTES ///

// GET request for creating a accessory. NOTE This must come before route that displays accessory (uses id).
router.get("/accessory/create", accessory_controller.accessory_create_get);

// POST request for creating accessory.
router.post("/accessory/create", accessory_controller.accessory_create_post);

// GET request to delete accessory.
router.get("/accessory/:id/delete", accessory_controller.accessory_delete_get);

// POST request to delete accessory.
router.post("/accessory/:id/delete", accessory_controller.accessory_delete_post);

// GET request to update accessory.
router.get("/accessory/:id/update", accessory_controller.accessory_update_get);

// POST request to update accessory.
router.post("/accessory/:id/update", accessory_controller.accessory_update_post);

// GET request for one accessory.
router.get("/accessory/:id", accessory_controller.accessory_detail);

// GET request for list of all accessory.
router.get("/accessories", accessory_controller.accessory_list);

/// ASSIGNED ACCESSORIES ROUTES ///

// GET request for assigning a accessory. NOTE This must come before route that displays employee (uses id).
router.get("/assigned_accessory/create", assigned_accessory_controller.assigned_accessory_create_get);

//POST request for assigning a accessory.
router.post("/assigned_accessory/create", assigned_accessory_controller.assigned_accessory_create_post);

// GET request to delete assigned accessory.
router.get("/assigned_accessory/:id/delete", assigned_accessory_controller.assigned_accessory_delete_get);

// POST request to delete assigned accessory.
router.post("/assigned_accessory/:id/delete", assigned_accessory_controller.assigned_accessory_delete_post);

// GET request to update assigned accessory.
router.get("/assigned_accessory/:id/update", assigned_accessory_controller.assigned_accessory_update_get);

// POST request to update assigned accessory.
router.post("/assigned_accessory/:id/update", assigned_accessory_controller.assigned_accessory_update_post);

// GET request for one assigned accessory.
router.get("/assigned_accessory/:id", assigned_accessory_controller.assigned_accessory_detail);

// GET request for list of all assigned accessory.
router.get("/assigned_accessories", assigned_accessory_controller.assigned_accessory_list);

module.exports = router;