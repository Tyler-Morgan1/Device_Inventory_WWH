#! /usr/bin/env node

console.log(
    'This script populates some test devices, employees and assignments to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Device = require("./models/device");
  const Employee = require("./models/employee");
  const Accessory = require("./models/accessory");
  const AssignedDevice = require("./models/assigned_device");
  const AssignedAccessory = require("./models/assigned_accessory");

  
  const devices = [];
  const employees = [];
  const accessories = [];
  const assignedDevices = [];
  const assignedAccessories = [];
  
  const mongoose = require("mongoose");
const employee = require("./models/employee");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createDevices();
    await createEmployees();
    await createAccessories();
    await createAssignedAccessories();
    await createAssignedDevices();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // genre[0] will always be the Fantasy genre, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function deviceCreate(index, serialNumber, manufacturer) {
    const device = new Device({ serialNumber: serialNumber, manufacturer: manufacturer });
    await device.save();
    devices[index] = device;
    console.log(`Added device: ${serialNumber}`);
  }
  
  async function employeeCreate(index, name) {
    const employee = new Employee({name: name});
    await employee.save();
    employees[index] = employee;
    console.log(`Added employee: ${name}`);
  }
  
  async function accessoryCreate(index, name) {
    const accessory = new Accessory({name: name});
    await accessory.save();
    accessories[index] = accessory;
    console.log(`Added accessory: ${name}`);
  }
  
  async function assignedAccessoryCreate(index, item, employee_assigned) {
    const assignedAccessory = new AssignedAccessory({item: item, employee_assigned: employee_assigned});
    await assignedAccessory.save();
    assignedAccessories[index] = assignedAccessory;
    console.log(`Added assignedAccessory: ${item}`);
  }

  async function assignedDeviceCreate(index, device, employee_assigned) {
    const assignedDevice = new AssignedDevice({device: device, employee_assigned: employee_assigned});
    await assignedDevice.save();
    assignedDevices[index] = assignedDevice;
    console.log(`Added assignedDevice: ${device.serialNumber}, ${employee_assigned.name}`);
  }
  
  async function createDevices() {
    console.log("Adding devices");
    await Promise.all([
      deviceCreate(0, "12345TEST", "Lenovo"),
      deviceCreate(1, "67890TEST", "Asus"),
      deviceCreate(2, "16253TEST", "Apple"),
    ]);
  }
  
  async function createEmployees() {
    console.log("Adding employees");
    await Promise.all([
      employeeCreate(0, "Mr. Hugo TEST"),
      employeeCreate(1, "Tyler TEST"),
      employeeCreate(2, "Pable TEST"),
    ]);
  }
  
  async function createAccessories() {
    console.log("Adding Accessories");
    await Promise.all([
        accessoryCreate(0, "Charger TEST"),
        accessoryCreate(1, "Mouse TEST"),
        accessoryCreate(2, "Bluetooth KeyboardTEST")
    ]);
  }
  
  async function createAssignedAccessories() {
    console.log("Assigning accessories");
    await Promise.all([
      assignedAccessoryCreate(0, accessories[0], employees[0]),
      assignedAccessoryCreate(1, accessories[1], employees[1]),
      assignedAccessoryCreate(2, accessories[2], employees[2]),
    ]);
  }

  async function createAssignedDevices() {
    console.log("Assigning devices");
    await Promise.all([
      assignedDeviceCreate(0, devices[0], employees[0]),
      assignedDeviceCreate(1, devices[1], employees[1]),
      assignedDeviceCreate(2, devices[2], employees[2]),
    ]);
  }

  