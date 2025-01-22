const Employee = require('../model/Employee');

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    if (!employees) return res.status(204).json({ message: 'No se encontraron empleados.' });
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
  }
};

const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'El ID del empleado es necesario.' });
  
  try {
    const employee = await Employee.findOne({ _id: id });
    if (!employee) return res.status(204).json({ message: 'No se encontraron empleados con el ID dado.' });
    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
  }
};

const createEmployee = async (req, res) => {
  const { firstname, lastname } = req.body;
  if (!firstname || !lastname) return res.status(400).json({ message: 'El primer y segundo nombre son necesarios.' });

  try {
    const newEmployee = await Employee.create({
      firstname,
      lastname
    });
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error(error);
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname } = req.body;
  if (!id) return res.status(400).json({ message: 'El ID es necesario.' });

  try {
    const employee = await Employee.findOne({ _id: id });
    if (!employee) return res.status(204).json({ message: `No se encontraron empleados con el ID ${id}.` });
    if (firstname) employee.firstname = firstname;
    if (lastname) employee.lastname = lastname;
    const result = await employee.save();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'El ID es necesario.' });

  try {
    const employee = await Employee.findOne({ _id: id });
    if (!employee) return res.status(204).json({ message: `No se encontraron empleados con el ID ${id}.` });
    const result = await Employee.deleteOne({ _id: id });
    res.json(result);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
}