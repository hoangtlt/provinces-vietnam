const axios = require('axios');
const GeocodeProvider = require('./provider.interface');
const config = require('../../config');

class PhotonProvider extends GeocodeProvider {
  constructor() {
    super();
    this.baseUrl = 'https://photon.komoot.io/api';
  }

  async geocode(address, components) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: address,
          limit: 1
        },
        timeout: config.geocode.timeout
      });

      const results = response.data;

      if (!results || !results.features || !Array.isArray(results.features) || results.features.length === 0) {
        const error = new Error(`Address not found: ${address}`);
        error.status = 404;
        throw error;
      }

      const feature = results.features[0];
      const [lon, lat] = feature.geometry.coordinates;

      // Clean formatted address
      let formattedAddress = '';
      if (components) {
        const { street, ward, province } = components;
        formattedAddress = `${street}, ${ward}, ${province}`;
      } else {
        const props = feature.properties;
        const parts = [
          props.name,
          props.street ? `${props.housenumber || ''} ${props.street}`.trim() : null,
          props.city,
          props.country
        ].filter(Boolean);
        formattedAddress = parts.join(', ');
      }

      return {
        formattedAddress,
        latitude: lat,
        longitude: lon,
        timezone: 'Asia/Ho_Chi_Minh'
      };

    } catch (error) {
      if (error.status === 404) {
        throw error;
      }

      if (error.code === 'ECONNABORTED') {
        const timeoutError = new Error('Photon geocoding provider request timed out');
        timeoutError.status = 504; // Gateway Timeout
        throw timeoutError;
      }

      console.error('Photon Geocoding Error:', error.message);
      const providerError = new Error('Geocoding provider is currently unavailable or returned an error');
      providerError.status = error.response ? error.response.status : 502; // Bad Gateway / Service Unavailable
      throw providerError;
    }
  }
}

module.exports = PhotonProvider;
