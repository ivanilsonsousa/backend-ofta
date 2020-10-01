const express = require('express');
const { body, check, oneOf, validationResult } = require('express-validator');

const routes = express.Router();

const authMiddleware = require('./middlewares/auth');
const LoginController = require('./controllers/LoginController');
const PatientController = require('./controllers/PatientController');

routes.get('/authenticate', authMiddleware, LoginController.isAuthenticate);
routes.post('/begin-pass-reset', LoginController.beginPassReset);
routes.post('/confirm-pin-reset', LoginController.confirmPinReset);
routes.post('/reset-pass', LoginController.resetPass);

routes.post('/login', LoginController.auth);
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