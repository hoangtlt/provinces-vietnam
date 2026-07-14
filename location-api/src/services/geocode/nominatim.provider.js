const axios = require('axios');
const GeocodeProvider = require('./provider.interface');
const config = require('../../config');

class NominatimProvider extends GeocodeProvider {
  constructor() {
    super();
    this.baseUrl = 'https://nominatim.openstreetmap.org/search';
  }

  async geocode(address, components) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': config.geocode.userAgent
        },
        timeout: config.geocode.timeout
      });

      const results = response.data;

      if (!results || !Array.isArray(results) || results.length === 0) {
        const error = new Error(`Address not found: ${address}`);
        error.status = 404;
        throw error;
      }

      const location = results[0];

      // Format the clean address: if components are provided, join them, otherwise use Nominatim's display_name
      let formattedAddress = '';
      if (components) {
        const { street, ward, province } = components;
        formattedAddress = `${street}, ${ward}, ${province}`;
      } else {
        formattedAddress = location.display_name;
      }

      return {
        formattedAddress,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        timezone: 'Asia/Ho_Chi_Minh'
      };

    } catch (error) {
      if (error.status === 404) {
        throw error;
      }

      if (error.code === 'ECONNABORTED') {
        const timeoutError = new Error('Geocoding provider request timed out');
        timeoutError.status = 504; // Gateway Timeout
        throw timeoutError;
      }

      console.error('Nominatim Geocoding Error:', error.message);
      const status = error.response ? error.response.status : 502;
      const providerError = new Error('Geocoding provider is currently unavailable or returned an error');
      providerError.status = status;
      throw providerError;
    }
  }
}

module.exports = NominatimProvider;
