import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Gallery API',
    version: '1.0.0',
    description: 'REST API for gallery images with JWT auth.'
  },
  servers: [
    { url: 'http://localhost:8000', description: 'Local dev' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Image: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          url: { type: 'string' },
          width: { type: 'integer' },
          height: { type: 'integer' },
          keywords: { type: 'array', items: { type: 'string' } }
        }
      },
      ImageList: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Image' } },
          next_cursor: { type: 'string', nullable: true }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}

const options = {
  definition: swaggerDefinition,
  apis: ['src/routes/*.js']
}

export default swaggerJSDoc(options)
