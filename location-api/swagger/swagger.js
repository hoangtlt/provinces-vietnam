const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Vietnam Location and Geocoding API',
    version: '1.0.0',
    description: 'Internal API to handle Vietnam locations (provinces, wards) and geocode physical addresses using Nominatim OpenStreetMap (Vietnam post-merger v2 model).'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Server'
    }
  ],
  paths: {
    '/provinces': {
      get: {
        summary: 'Retrieve all provinces/cities',
        description: 'Returns a complete list of centrally governed cities and provinces in Vietnam post-merger (total 34).',
        responses: {
          '200': {
            description: 'A list of provinces.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                },
                example: {
                  success: true,
                  message: 'Provinces retrieved successfully',
                  data: [
                    {
                      id: 79,
                      name: 'Thành phố Hồ Chí Minh'
                    },
                    {
                      id: 1,
                      name: 'Thành phố Hà Nội'
                    }
                  ]
                }
              }
            }
          },
          '500': {
            description: 'Internal Server Error.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/provinces/{provinceId}/wards': {
      get: {
        summary: 'Retrieve wards/phường/xã by province ID',
        description: 'Returns all wards belonging to a specific province.',
        parameters: [
          {
            name: 'provinceId',
            in: 'path',
            required: true,
            description: 'Numerical ID of the province',
            schema: {
              type: 'integer',
              example: 79
            }
          }
        ],
        responses: {
          '200': {
            description: 'A list of wards.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                },
                example: {
                  success: true,
                  message: 'Wards retrieved successfully',
                  data: [
                    {
                      id: 25747,
                      name: 'Phường Thủ Dầu Một',
                      provinceId: 79
                    }
                  ]
                }
              }
            }
          },
          '404': {
            description: 'Province not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                  success: false,
                  message: 'Province with ID 999 not found',
                  errors: []
                }
              }
            }
          },
          '500': {
            description: 'Internal Server Error.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/geocode': {
      post: {
        summary: 'Geocode address components (Two-tier)',
        description: 'Combines street, ward, and province inputs, performs validations (e.g. checks if ward belongs to province), calls a geocoding service, and returns coordinates.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GeocodeRequest'
              },
              example: {
                province: 'Thành phố Hồ Chí Minh',
                ward: 'Phường Bến Thành',
                street: '123 Lê Lợi'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Geocoding successful.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                },
                example: {
                  success: true,
                  message: 'Address geocoded successfully',
                  data: {
                    formattedAddress: '123 Lê Lợi, Phường Bến Thành, Thành phố Hồ Chí Minh',
                    latitude: 10.7724246,
                    longitude: 106.6996781,
                    timezone: 'Asia/Ho_Chi_Minh'
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation failed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                  success: false,
                  message: 'Validation failed',
                  errors: [
                    {
                      field: 'ward',
                      message: "Ward 'Phường Bến Thành' does not belong to Province 'Tỉnh Đồng Nai'"
                    }
                  ]
                }
              }
            }
          },
          '404': {
            description: 'Address not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                  success: false,
                  message: 'Address not found: 123 Lê Lợi, Phường Bến Thành, Thành phố Hồ Chí Minh, Việt Nam',
                  errors: []
                }
              }
            }
          },
          '502': {
            description: 'Bad Gateway / Provider Error.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '504': {
            description: 'Gateway Timeout.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Internal Server Error.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Success'
          },
          data: {
            type: 'object'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object'
            }
          }
        }
      },
      GeocodeRequest: {
        type: 'object',
        required: ['province', 'ward', 'street'],
        properties: {
          province: {
            type: 'string',
            description: 'Name of the province/city in Vietnam',
            example: 'Thành phố Hồ Chí Minh'
          },
          ward: {
            type: 'string',
            description: 'Name of the ward/phường/xã',
            example: 'Phường Bến Thành'
          },
          street: {
            type: 'string',
            description: 'Detailed street address (e.g. house number, street name)',
            example: '123 Lê Lợi'
          }
        }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = {
  setupSwagger
};
