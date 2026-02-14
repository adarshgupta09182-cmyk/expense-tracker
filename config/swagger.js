/**
 * Swagger Configuration
 * API documentation setup using Swagger/OpenAPI
 * @module config/swagger
 */

const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger definition
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Expense Tracker API',
    version: '1.0.0',
    description: 'Complete REST API for expense tracking with budget management',
    contact: {
      name: 'Support',
      email: 'support@expensetracker.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server'
    },
    {
      url: 'https://api.expensetracker.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID (MongoDB ObjectId)'
          },
          name: {
            type: 'string',
            description: 'User full name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description: 'User role'
          },
          monthlyBudget: {
            type: 'number',
            description: 'Monthly budget limit in rupees'
          },
          budgetWarningThreshold: {
            type: 'number',
            description: 'Budget warning threshold percentage (0-100)'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          }
        }
      },
      Expense: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Expense ID (MongoDB ObjectId)'
          },
          userId: {
            type: 'string',
            description: 'User ID who created the expense'
          },
          description: {
            type: 'string',
            description: 'Expense description'
          },
          amount: {
            type: 'number',
            format: 'float',
            description: 'Expense amount in rupees'
          },
          category: {
            type: 'string',
            enum: ['Food', 'Travelling', 'Entertainment', 'Shopping', 'Bills', 'Other'],
            description: 'Expense category'
          },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'Expense date'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          }
        }
      },
      Budget: {
        type: 'object',
        properties: {
          budget: {
            type: 'number',
            description: 'Monthly budget limit'
          },
          totalSpent: {
            type: 'number',
            description: 'Total spent in current month'
          },
          remaining: {
            type: 'number',
            description: 'Remaining budget'
          },
          percentageUsed: {
            type: 'number',
            description: 'Percentage of budget used'
          },
          isExceeded: {
            type: 'boolean',
            description: 'Whether budget is exceeded'
          },
          isWarning: {
            type: 'boolean',
            description: 'Whether budget warning threshold reached'
          },
          warningThreshold: {
            type: 'number',
            description: 'Warning threshold percentage'
          },
          month: {
            type: 'string',
            description: 'Current month name'
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
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

/**
 * Options for swagger-jsdoc
 */
const options = {
  definition: swaggerDefinition,
  apis: ['./routes/*.js', './controllers/*.js']
};

/**
 * Generate Swagger specification
 */
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
