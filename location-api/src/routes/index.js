const express = require('express');
const router = express.Router();
const locationRoutes = require('./location.routes');
const geocodeRoutes = require('./geocode.routes');

router.use('/', locationRoutes);
router.use('/', geocodeRoutes);

module.exports = router;
