class GeocodeProvider {
  /**
   * Geocode a combined address string.
   * @param {string} address - The formatted address to query.
   * @returns {Promise<{formattedAddress: string, latitude: number, longitude: number, timezone: string}>}
   */
  async geocode(address) {
    throw new Error('Method "geocode" must be implemented by subclass');
  }
}

module.exports = GeocodeProvider;
