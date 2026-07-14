const locationService = require('../services/location.service');
const { sendSuccess } = require('../utils/response.utils');

/**
 * Get all provinces
 */
const getProvinces = async (req, res, next) => {
  try {
    const data = locationService.getProvinces();
    return sendSuccess(res, 'Provinces retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get wards by province ID
 */
const getWards = async (req, res, next) => {
  try {
    const { provinceId } = req.params;
    const data = locationService.getWardsByProvince(provinceId);
    return sendSuccess(res, 'Wards retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProvinces,
  getWards
};
