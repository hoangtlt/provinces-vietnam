const axios = require('axios');
const app = require('../src/app');

const TEST_PORT = 3005;
let server;

async function runTests() {
  server = app.listen(TEST_PORT, async () => {
    console.log(`Test server started on port ${TEST_PORT}. Running verification tests...`);
    const client = axios.create({
      baseURL: `http://localhost:${TEST_PORT}/api/v1`,
      validateStatus: () => true // Allow receiving non-2xx status codes without throwing errors
    });

    try {
      // 1. Verify GET /provinces
      console.log('\n--- 1. Testing GET /provinces (Post-merger expect 34) ---');
      const provincesRes = await client.get('/provinces');
      console.log('Status Code:', provincesRes.status);
      console.log('Success:', provincesRes.data.success);
      console.log('Message:', provincesRes.data.message);
      console.log('Provinces Count:', provincesRes.data.data ? provincesRes.data.data.length : 0);
      if (provincesRes.status !== 200 || !provincesRes.data.success || !Array.isArray(provincesRes.data.data)) {
        throw new Error('Test 1 failed (GET /provinces)');
      }
      if (provincesRes.data.data.length !== 34) {
        throw new Error(`Test 1 failed: Expected exactly 34 provinces, got ${provincesRes.data.data.length}`);
      }

      // 2. Verify GET /provinces/{provinceId}/wards
      console.log('\n--- 2. Testing GET /provinces/79/wards ---');
      const wardsRes = await client.get('/provinces/79/wards');
      console.log('Status Code:', wardsRes.status);
      console.log('Success:', wardsRes.data.success);
      console.log('Message:', wardsRes.data.message);
      console.log('Wards Count:', wardsRes.data.data ? wardsRes.data.data.length : 0);
      if (wardsRes.status !== 200 || !wardsRes.data.success || !Array.isArray(wardsRes.data.data)) {
        throw new Error('Test 2 failed (GET /provinces/79/wards)');
      }

      // 3. Verify POST /geocode (Success case with Photon/Nominatim)
      console.log('\n--- 3. Testing POST /geocode (Valid request) ---');
      const geocodeRes = await client.post('/geocode', {
        province: 'Thành phố Hồ Chí Minh',
        ward: 'Phường Bến Thành',
        street: '123 Lê Lợi'
      });
      console.log('Status Code:', geocodeRes.status);
      console.log('Body:', JSON.stringify(geocodeRes.data, null, 2));
      if (geocodeRes.status !== 200 || !geocodeRes.data.success || !geocodeRes.data.data.latitude) {
        throw new Error('Test 3 failed (POST /geocode success)');
      }

      // 4. Verify POST /geocode (Validation fail case: Ward mismatching Province)
      console.log('\n--- 4. Testing POST /geocode (Validation Ward-Province Mismatch) ---');
      const geocodeValRes = await client.post('/geocode', {
        province: 'Thành phố Hồ Chí Minh',
        ward: 'Phường Ba Đình', // Ward Ba Dinh belongs to Hanoi (code 1), not HCMC (code 79)
        street: '123 Lê Lợi'
      });
      console.log('Status Code:', geocodeValRes.status);
      console.log('Body:', JSON.stringify(geocodeValRes.data, null, 2));
      if (geocodeValRes.status !== 400 || geocodeValRes.data.success || !Array.isArray(geocodeValRes.data.errors)) {
        throw new Error('Test 4 failed (POST /geocode validation checks)');
      }
      if (!geocodeValRes.data.errors.some(e => e.field === 'ward' && e.message.includes('does not belong to Province'))) {
        throw new Error('Test 4 failed: Expected ward mismatch error details in response.');
      }

      // 5. Verify GET /provinces/{provinceId}/wards (404 Check)
      console.log('\n--- 5. Testing GET /provinces/999/wards (404 Check) ---');
      const notFoundRes = await client.get('/provinces/999/wards');
      console.log('Status Code:', notFoundRes.status);
      console.log('Body:', JSON.stringify(notFoundRes.data, null, 2));
      if (notFoundRes.status !== 404 || notFoundRes.data.success) {
        throw new Error('Test 5 failed (GET /provinces/999/wards 404 check)');
      }

      console.log('\n=============================================================');
      console.log('🎉 Verification Successful! All Post-merger V2 tests passed.');
      console.log('=============================================================');
      cleanup(0);
    } catch (err) {
      console.error('\n❌ Verification Failed:', err.message);
      cleanup(1);
    }
  });
}

function cleanup(exitCode) {
  if (server) {
    server.close(() => {
      console.log('Test server shut down.');
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
}

runTests();
