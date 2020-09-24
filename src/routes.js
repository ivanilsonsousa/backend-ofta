const express = require('express');
const { body, check, oneOf, validationResult } = require('express-validator');

const routes = express.Router();

const PatientController = require('./controllers/PatientController');

routes.get('/patient', PatientController.index);

routes.post('/patient', [
  check('cpf').exists(),
  check('name').isLength({ min: 5 }),
  check('fone').isLength({ min: 15, max: 15 }),
  check('occupation').exists(),
  check('age').isNumeric(),
  check('gender').isIn(['M', 'F'])
], PatientController.store);
routes.delete('/patient/:id', PatientController.destroy);
routes.put('/patient/:id', PatientController.update);

module.exports = routes;