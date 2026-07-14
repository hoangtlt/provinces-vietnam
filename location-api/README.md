# Location API

A production-ready Node.js Express REST API serving Vietnam administrative divisions (Provinces, Wards) and Geocoding using Nominatim OpenStreetMap (with built-in Photon fallback for resilience), updated for the post-July 2025 mergers.

## Features
- **Post-Merger Two-Tier Model**: Implements the official two-tier administrative division structure (Province -> Ward), reflecting the July 2025 consolidation down to 34 provincial-level units. Districts are completely omitted as they are no longer required.
- **Clean Architecture**: Decoupled routes, controllers, services, and geocoding providers.
- **In-Memory Cache**: Loads administrative division data from flat JSON files on startup for fast responses.
- **Ward-Province Cross-Validation**: Validates that address components are correct and that the requested ward belongs to the specified province before executing geocoding.
- **Resilient Geocoding**: Utilizes Nominatim OSM with automatic fallback to Photon API if requests are blocked or fail.
- **Interactive API Documentation**: Exposes Swagger UI docs for endpoint testing.
- **Security & Logging**: Secured with Helmet and CORS; logs requests using Morgan.

## Prerequisites
- Node.js (LTS)
- npm

## Install

Clone the repository and install the dependencies:
```bash
npm install
```

## Setup Data

Before starting the server, run the import script to fetch and format Vietnam administrative divisions from the V2 API:
```bash
npm run import-data
```

This will create the following flat JSON files in the `data/` directory:
- `data/provinces.json`
- `data/wards.json`

## Configuration

Duplicate `.env.example` and name it `.env` to customize settings:
```bash
copy .env.example .env
```

Available configurations:
- `PORT`: Port the server runs on (default: `3000`).
- `NODE_ENV`: Application mode (`development` or `production`).
- `GEOCODE_PROVIDER`: Primary geocoding provider (`nominatim` or `photon`).
- `GEOCODE_TIMEOUT`: Axios timeout in milliseconds (default: `5000`).
- `USER_AGENT`: Custom User-Agent header (required by OpenStreetMap Nominatim).

## Run

Run the application in development mode with auto-reload (using nodemon):
```bash
npm run dev
```

For production mode:
```bash
npm start
```

## Verification

To run the end-to-end integration test suite and verify endpoints:
```bash
node scripts/verify-api.js
```

## Swagger API Documentation

Interactive API docs are served at:
```
http://localhost:3000/api-docs
```

All endpoints can be tested live inside the Swagger UI interface.

## Data Source
- **Source URL**: `https://provinces.open-api.vn/api/v2/` (V2 API based on Python's `VietnamProvinces` library).
- **Update Status**: Updated to represent the post-merger administrative divisions effective **July 1, 2025**, which consolidated Vietnam into **34 provincial-level units** (28 provinces and 6 centrally governed cities) and collapsed the district level.
- **How to Update**: When the government modifies administrative divisions in the future, developers can update the database files by simply running `npm run import-data`. The script fetches the updated schema from the V2 endpoint, filters duplicate units, processes division relations, and overwrites the JSON cache files.

## API List

### 1. Get All Provinces
- **Endpoint**: `GET /api/v1/provinces`
- **Description**: Returns all 34 post-merger provinces and centrally governed cities in Vietnam.
- **Response Format (200 Success)**:
  ```json
  {
    "success": true,
    "message": "Provinces retrieved successfully",
    "data": [
      {
        "id": 79,
        "name": "Thành phố Hồ Chí Minh"
      }
    ]
  }
  ```

### 2. Get Wards by Province
- **Endpoint**: `GET /api/v1/provinces/{provinceId}/wards`
- **Description**: Returns wards belonging to a specific province.
- **Response Format (200 Success)**:
  ```json
  {
    "success": true,
    "message": "Wards retrieved successfully",
    "data": [
      {
        "id": 25747,
        "name": "Phường Thủ Dầu Một",
        "provinceId": 79
      }
    ]
  }
  ```
- **Error Responses**:
  - **404 Not Found**: If the province ID does not exist.

### 3. Geocode Address (Two-tier)
- **Endpoint**: `POST /api/v1/geocode`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "province": "Thành phố Hồ Chí Minh",
    "ward": "Phường Bến Thành",
    "street": "123 Lê Lợi"
  }
  ```
- **Response Format (200 Success)**:
  ```json
  {
    "success": true,
    "message": "Address geocoded successfully",
    "data": {
      "formattedAddress": "123 Lê Lợi, Phường Bến Thành, Thành phố Hồ Chí Minh",
      "latitude": 10.7724246,
      "longitude": 106.6996781,
      "timezone": "Asia/Ho_Chi_Minh"
    }
  }
  ```
- **Error Responses**:
  - **400 Bad Request**: If parameters are missing, or if the ward does not belong to the province.
  - **404 Not Found**: If the geocoding provider fails to resolve the coordinates.
  - **502 Bad Gateway / 504 Gateway Timeout**: If geocoding provider fails or times out.
