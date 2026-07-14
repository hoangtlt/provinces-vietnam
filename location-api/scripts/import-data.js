const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://provinces.open-api.vn/api/v2/?depth=2';
const DATA_DIR = path.join(__dirname, '../data');

async function importData() {
  try {
    console.log(`Fetching Vietnam administrative division data from ${API_URL}...`);
    const response = await axios.get(API_URL, {
      timeout: 30000 // 30 seconds
    });
    const provincesData = response.data;

    if (!Array.isArray(provincesData)) {
      throw new Error('Invalid data format received from API. Expected an array of provinces.');
    }

    console.log(`Fetched ${provincesData.length} provinces. Processing...`);

    const provinces = [];
    const wards = [];

    for (const p of provincesData) {
      provinces.push({
        id: p.code,
        name: p.name
      });

      if (p.wards && Array.isArray(p.wards)) {
        for (const w of p.wards) {
          wards.push({
            id: w.code,
            name: w.name,
            provinceId: p.code
          });
        }
      }
    }

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(
      path.join(DATA_DIR, 'provinces.json'),
      JSON.stringify(provinces, null, 2),
      'utf8'
    );
    fs.writeFileSync(
      path.join(DATA_DIR, 'wards.json'),
      JSON.stringify(wards, null, 2),
      'utf8'
    );

    // Delete legacy districts file if it exists
    const districtsPath = path.join(DATA_DIR, 'districts.json');
    if (fs.existsSync(districtsPath)) {
      fs.unlinkSync(districtsPath);
      console.log('Deleted legacy data/districts.json file.');
    }

    console.log('Import completed successfully!');
    console.log(`Saved ${provinces.length} provinces to data/provinces.json`);
    console.log(`Saved ${wards.length} wards to data/wards.json`);
  } catch (error) {
    console.error('Error importing administrative data:', error.message);
    process.exit(1);
  }
}

importData();
