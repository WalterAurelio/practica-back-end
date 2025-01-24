const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployeeById, createEmployee, deleteEmployee, updateEmployee } = require('../../controllers/employees.controller');
const verifyRoles = require('../../middlewares/verifyRoles');
const { Admin, Editor } = require('../../config/rolesList');

router.get('/', verifyRoles(Admin), getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;