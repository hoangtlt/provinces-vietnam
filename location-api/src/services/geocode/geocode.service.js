const NominatimProvider = require('./nominatim.provider');
const PhotonProvider = require('./photon.provider');

class GeocodeService {
  constructor() {
    this.providers = {
      nominatim: new NominatimProvider(),
      photon: new PhotonProvider()
    };
  }

  /**
   * Combine address fields (two-tier) and perform geocoding using the active provider
   * @param {Object} components - Address fields { street, ward, province }
   * @returns {Promise<Object>} Geocoding result
   */
  async geocode(components) {
    const { street, ward, province } = components;

    // Combine address parts as requested (no district)
    const addressQuery = `${street.trim()}, ${ward.trim()}, ${province.trim()}, Việt Nam`;

    const providerName = (process.env.GEOCODE_PROVIDER || 'nominatim').toLowerCase();

    try {
      return await this._executeGeocode(providerName, addressQuery, components);
    } catch (error) {
      const status = error.status || 500;
      // Fallback: If Nominatim fails due to block/rate-limits/server-errors (excluding 404 not found)
      if (providerName === 'nominatim' && status !== 404) {
        console.warn(`Primary provider 'nominatim' failed (status ${status}): ${error.message}. Falling back to 'photon' provider...`);
        try {
          return await this._executeGeocode('photon', addressQuery, components);
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  async _executeGeocode(providerName, addressQuery, components) {
    const provider = this.providers[providerName];
    if (!provider) {
      const error = new Error(`Unsupported geocoding provider: ${providerName}`);
      error.status = 500;
      throw error;
    }
    return await provider.geocode(addressQuery, components);
  }
}

module.exports = new GeocodeService();
