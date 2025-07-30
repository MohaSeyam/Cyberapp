const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CyberPlan API',
      version: '1.0.0',
      description: 'API documentation for CyberPlan - Cybersecurity Learning Platform',
      contact: {
        name: 'CyberPlan Team',
        email: 'support@cyberplan.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.cyberplan.com',
        description: 'Production server'
      }
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
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            firstName: {
              type: 'string',
              description: 'First name'
            },
            lastName: {
              type: 'string',
              description: 'Last name'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            }
          }
        },
        Note: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Note ID'
            },
            title: {
              type: 'string',
              description: 'Note title'
            },
            content: {
              type: 'string',
              description: 'Note content'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Note tags'
            },
            category: {
              type: 'string',
              enum: ['general', 'study', 'ideas', 'resources', 'personal'],
              description: 'Note category'
            },
            weekId: {
              type: 'integer',
              description: 'Associated week ID'
            },
            dayKey: {
              type: 'string',
              enum: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
              description: 'Associated day'
            },
            taskId: {
              type: 'string',
              description: 'Associated task ID'
            },
            isFavorite: {
              type: 'boolean',
              description: 'Is note favorited'
            },
            isPinned: {
              type: 'boolean',
              description: 'Is note pinned'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        JournalEntry: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Journal entry ID'
            },
            title: {
              type: 'string',
              description: 'Entry title'
            },
            content: {
              type: 'string',
              description: 'Entry content'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Entry tags'
            },
            mood: {
              type: 'string',
              enum: ['happy', 'sad', 'excited', 'frustrated', 'neutral'],
              description: 'User mood'
            },
            weekId: {
              type: 'integer',
              description: 'Associated week ID'
            },
            dayKey: {
              type: 'string',
              enum: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
              description: 'Associated day'
            },
            isFavorite: {
              type: 'boolean',
              description: 'Is entry favorited'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Progress: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Progress record ID'
            },
            weekId: {
              type: 'integer',
              description: 'Week ID'
            },
            dayKey: {
              type: 'string',
              enum: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
              description: 'Day key'
            },
            taskId: {
              type: 'string',
              description: 'Task ID'
            },
            isCompleted: {
              type: 'boolean',
              description: 'Is task completed'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Completion date'
            },
            timeSpent: {
              type: 'integer',
              description: 'Time spent in minutes'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            }
          }
        },
        Resource: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Resource ID'
            },
            title: {
              type: 'string',
              description: 'Resource title'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'Resource URL'
            },
            type: {
              type: 'string',
              enum: ['link', 'video', 'document', 'tool'],
              description: 'Resource type'
            },
            description: {
              type: 'string',
              description: 'Resource description'
            },
            weekId: {
              type: 'integer',
              description: 'Associated week ID'
            },
            dayIndex: {
              type: 'integer',
              description: 'Associated day index'
            },
            isPlanResource: {
              type: 'boolean',
              description: 'Is this a plan resource'
            }
          }
        },
        Achievement: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Achievement title'
            },
            description: {
              type: 'string',
              description: 'Achievement description'
            },
            icon: {
              type: 'string',
              description: 'Achievement icon'
            },
            type: {
              type: 'string',
              enum: ['completion_milestone', 'consistency', 'speed', 'quality'],
              description: 'Achievement type'
            },
            unlockedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When achievement was unlocked'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field name'
                  },
                  message: {
                    type: 'string',
                    description: 'Validation message'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './routes/*.js',
    './middleware/*.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;