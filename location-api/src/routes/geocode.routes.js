const express = require('express');
const router = express.Router();
const geocodeController = require('../controllers/geocode.controller');
const { validateGeocodeRequest } = require('../middleware/validation.middleware');

router.post('/geocode', validateGeocodeRequest, geocodeController.geocodeAddress);

module.exports = router;
