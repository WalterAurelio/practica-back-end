const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployeeById, createEmployee } = require('../../controllers/employees.controller');
const verifyRoles = require('../../middlewares/verifyRoles');
const { Admin, Editor } = require('../../config/rolesList');

router.get('/', verifyRoles(Admin), getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);

module.exports = router;