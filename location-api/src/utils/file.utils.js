const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

let provincesCache = null;
let wardsCache = null;

const loadProvinces = () => {
  if (!provincesCache) {
    const filePath = path.join(DATA_DIR, 'provinces.json');
    if (!fs.existsSync(filePath)) {
      throw new Error('provinces.json data file not found. Please run npm run import-data first.');
    }
    provincesCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return provincesCache;
};

const loadWards = () => {
  if (!wardsCache) {
    const filePath = path.join(DATA_DIR, 'wards.json');
    if (!fs.existsSync(filePath)) {
      throw new Error('wards.json data file not found. Please run npm run import-data first.');
    }
    wardsCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return wardsCache;
};

module.exports = {
  loadProvinces,
  loadWards
};
