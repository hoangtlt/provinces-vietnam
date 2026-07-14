const geocodeService = require('../services/geocode/geocode.service');
const { sendSuccess } = require('../utils/response.utils');

/**
 * Geocode address
 */
const geocodeAddress = async (req, res, next) => {
  try {
    const { province, district, ward, street } = req.body;
    const result = await geocodeService.geocode({ province, district, ward, street });
    return sendSuccess(res, 'Address geocoded successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  geocodeAddress
};
