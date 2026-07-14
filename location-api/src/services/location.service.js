const { loadProvinces, loadWards } = require('../utils/file.utils');

class LocationService {
  /**
   * Get list of all provinces
   * @returns {Array} List of provinces
   */
  getProvinces() {
    return loadProvinces();
  }

  /**
   * Get wards in a province
   * @param {string|number} provinceId - Province ID
   * @returns {Array} List of wards in the province
   */
  getWardsByProvince(provinceId) {
    const pId = parseInt(provinceId, 10);

    const provinces = loadProvinces();
    const provinceExists = provinces.some(p => p.id === pId);
    if (!provinceExists) {
      const error = new Error(`Province with ID ${provinceId} not found`);
      error.status = 404;
      throw error;
    }

    const wards = loadWards();
    return wards.filter(w => w.provinceId === pId);
  }
}

module.exports = new LocationService();
