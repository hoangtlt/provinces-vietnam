const { sendError } = require('../utils/response.utils');
const { loadProvinces, loadWards } = require('../utils/file.utils');

const validateGeocodeRequest = (req, res, next) => {
  const { province, ward, street } = req.body;
  const errors = [];

  if (!province || typeof province !== 'string' || !province.trim()) {
    errors.push({ field: 'province', message: 'Province is required and must be a non-empty string' });
  }

  if (!ward || typeof ward !== 'string' || !ward.trim()) {
    errors.push({ field: 'ward', message: 'Ward is required and must be a non-empty string' });
  }

  if (!street || typeof street !== 'string' || !street.trim()) {
    errors.push({ field: 'street', message: 'Street is required and must be a non-empty string' });
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', errors, 400);
  }

  try {
    const provinces = loadProvinces();
    const wards = loadWards();

    const normalizedProvince = province.trim().toLowerCase();
    const normalizedWard = ward.trim().toLowerCase();

    // Check if province exists
    const matchedProvince = provinces.find(
      p => p.name.trim().toLowerCase() === normalizedProvince
    );

    if (!matchedProvince) {
      errors.push({
        field: 'province',
        message: `Province '${province}' does not exist in the database`
      });
      return sendError(res, 'Validation failed', errors, 400);
    }

    // Check if ward belongs to the matched province
    const matchedWard = wards.find(
      w => w.name.trim().toLowerCase() === normalizedWard && w.provinceId === matchedProvince.id
    );

    if (!matchedWard) {
      errors.push({
        field: 'ward',
        message: `Ward '${ward}' does not belong to Province '${province}'`
      });
      return sendError(res, 'Validation failed', errors, 400);
    }

  } catch (err) {
    return sendError(res, 'Internal data loading error: ' + err.message, [], 500);
  }

  next();
};

module.exports = {
  validateGeocodeRequest
};
