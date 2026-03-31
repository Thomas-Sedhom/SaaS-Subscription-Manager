import { appConfig } from '../config/app.config';

const schemaRef = (name: string) => ({
  $ref: `#/components/schemas/${name}`
});

const successResponse = (schemaName: string, description = 'Successful response') => ({
  description,
  content: {
    'application/json': {
      schema: {
        allOf: [
          schemaRef('ApiSuccessEnvelope'),
          {
            type: 'object',
            properties: {
              data: schemaRef(schemaName)
            }
          }
        ]
      }
    }
  }
});

const arraySuccessResponse = (schemaName: string, description = 'Successful response') => ({
  description,
  content: {
    'application/json': {
      schema: {
        allOf: [
          schemaRef('ApiSuccessEnvelope'),
          {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: schemaRef(schemaName)
              }
            }
          }
        ]
      }
    }
  }
});

const authResponse = (
  schemaName: 'AuthActionResponse' | 'AuthMeResponse' | 'LogoutResponse',
  description: string
) => ({
  description,
  content: {
    'application/json': {
      schema: schemaRef(schemaName)
    }
  }
});

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'SaaS Subscription Manager API',
    version: appConfig.version,
    description: [
      'Interactive API documentation for the SaaS Subscription Manager backend.',
      '',
      'Authentication is cookie-based. After calling `POST /api/v1/auth/login` or `POST /api/v1/auth/signup`, the API stores a JWT in the `accessToken` cookie.',
      'Protected endpoints use the `cookieAuth` security scheme below.'
    ].join('\n')
  },
  servers: [
    {
      url: '/',
      description: 'Current server'
    }
  ],
  tags: [
    { name: 'System', description: 'Service metadata and documentation entrypoints.' },
    { name: 'Auth', description: 'Authentication and current-user session flows.' },
    { name: 'Users', description: 'User profile and admin user-management endpoints.' },
    { name: 'Plans', description: 'Subscription plan catalog and admin plan management.' },
    { name: 'Subscriptions', description: 'Self-service subscription lifecycle and plan-change flows.' },
    { name: 'Payments', description: 'Payment history and payment processing results.' },
    { name: 'Payment Methods', description: 'Saved card management for checkout.' },
    { name: 'Admin', description: 'Admin-only dashboard and administrator creation endpoints.' }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'JWT session cookie set by the login and signup endpoints.'
      }
    },
    responses: {
      BadRequest: {
        description: 'The request payload or action is invalid.',
        content: {
          'application/json': {
            schema: schemaRef('ApiErrorResponse')
          }
        }
      },
      Unauthorized: {
        description: 'Authentication is required or the access token is invalid.',
        content: {
          'application/json': {
            schema: schemaRef('ApiErrorResponse')
          }
        }
      },
      Forbidden: {
        description: 'The authenticated user does not have permission to perform this action.',
        content: {
          'application/json': {
            schema: schemaRef('ApiErrorResponse')
          }
        }
      },
      NotFound: {
        description: 'The requested resource could not be found.',
        content: {
          'application/json': {
            schema: schemaRef('ApiErrorResponse')
          }
        }
      },
      Conflict: {
        description: 'The request conflicts with an existing record.',
        content: {
          'application/json': {
            schema: schemaRef('ApiErrorResponse')
          }
        }
      }
    },
    schemas: {
      ApiSuccessEnvelope: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Request completed successfully' },
          data: { nullable: true }
        }
      },
      ApiErrorResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            nullable: true,
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'object', additionalProperties: true } },
              { type: 'object', additionalProperties: true }
            ]
          }
        }
      },
      UserRole: { type: 'string', enum: ['USER', 'ADMIN'] },
      BillingCycle: { type: 'string', enum: ['MONTHLY', 'YEARLY'] },
      SubscriptionStatus: { type: 'string', enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELED'] },
      PaymentStatus: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
      PaymentType: { type: 'string', enum: ['SUBSCRIPTION_CREATE', 'PLAN_CHANGE'] },
      AuthUser: {
        type: 'object',
        required: ['id', 'name', 'email', 'role'],
        properties: {
          id: { type: 'string', example: 'b94d93f7-0f08-4fca-a62c-6251885f9f12' },
          name: { type: 'string', example: 'Admin' },
          email: { type: 'string', format: 'email', example: 'admin@gmail.com' },
          role: schemaRef('UserRole')
        }
      },
      UserSummary: {
        type: 'object',
        required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: schemaRef('UserRole'),
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthActionResponse: {
        type: 'object',
        required: ['statusCode', 'token', 'message', 'user'],
        properties: {
          statusCode: { type: 'integer', example: 201 },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          message: { type: 'string', example: 'User signed up successfully' },
          user: schemaRef('AuthUser')
        }
      },
      AuthMeResponse: {
        type: 'object',
        required: ['statusCode', 'message', 'user'],
        properties: {
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Authenticated user fetched successfully' },
          user: schemaRef('AuthUser')
        }
      },
      LogoutResponse: {
        type: 'object',
        required: ['statusCode', 'message'],
        properties: {
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'User logged out successfully' }
        }
      },
      Plan: {
        type: 'object',
        required: ['id', 'name', 'price', 'billingCycle', 'features', 'isActive', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'Pro' },
          description: { type: 'string', nullable: true, example: 'For everyday productivity' },
          price: { type: 'number', format: 'float', example: 17 },
          billingCycle: schemaRef('BillingCycle'),
          features: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      PaymentMethod: {
        type: 'object',
        required: ['id', 'userId', 'methodType', 'isDefault', 'isActive', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          methodType: { type: 'string', example: 'CARD' },
          isDefault: { type: 'boolean', example: true },
          last4: { type: 'string', nullable: true, example: '4242' },
          cardholderName: { type: 'string', nullable: true, example: 'John Doe' },
          expiryMonth: { type: 'integer', nullable: true, example: 12 },
          expiryYear: { type: 'integer', nullable: true, example: 2028 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Subscription: {
        type: 'object',
        required: ['id', 'userId', 'planId', 'status', 'cancelAtPeriodEnd', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          planId: { type: 'string' },
          status: schemaRef('SubscriptionStatus'),
          startDate: { type: 'string', format: 'date-time', nullable: true },
          endDate: { type: 'string', format: 'date-time', nullable: true },
          currentPeriodStart: { type: 'string', format: 'date-time', nullable: true },
          currentPeriodEnd: { type: 'string', format: 'date-time', nullable: true },
          cancelAtPeriodEnd: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          plan: { allOf: [schemaRef('Plan')], nullable: true }
        }
      },
      Payment: {
        type: 'object',
        required: ['id', 'subscriptionId', 'amount', 'currency', 'status', 'provider', 'type', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          subscriptionId: { type: 'string' },
          paymentMethodId: { type: 'string', nullable: true },
          amount: { type: 'number', format: 'float', example: 17 },
          currency: { type: 'string', example: 'USD' },
          status: schemaRef('PaymentStatus'),
          provider: { type: 'string', example: 'saved-card' },
          failureReason: { type: 'string', nullable: true },
          type: schemaRef('PaymentType'),
          targetPlanId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          paymentMethod: { allOf: [schemaRef('PaymentMethod')], nullable: true },
          subscription: { allOf: [schemaRef('Subscription')], nullable: true },
          targetPlan: { nullable: true, oneOf: [schemaRef('Plan'), { type: 'null' }] }
        }
      },
      SubscriptionSummary: {
        type: 'object',
        required: ['currentSubscription', 'history'],
        properties: {
          currentSubscription: { allOf: [schemaRef('Subscription')], nullable: true },
          history: { type: 'array', items: schemaRef('Subscription') }
        }
      },
      UserDetail: {
        allOf: [
          schemaRef('UserSummary'),
          {
            type: 'object',
            required: ['subscriptions'],
            properties: {
              subscriptions: { type: 'array', items: schemaRef('Subscription') }
            }
          }
        ]
      },
      AdminDashboardStats: {
        type: 'object',
        required: ['totalUsers', 'totalPlans', 'totalSubscriptions', 'totalPayments'],
        properties: {
          totalUsers: { type: 'integer', example: 18 },
          totalPlans: { type: 'integer', example: 3 },
          totalSubscriptions: { type: 'integer', example: 24 },
          totalPayments: { type: 'integer', example: 42 }
        }
      },
      PaymentProcessResult: {
        type: 'object',
        required: ['payment', 'subscription'],
        properties: {
          payment: { allOf: [schemaRef('Payment')], nullable: true },
          subscription: schemaRef('Subscription')
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 6, example: 'Rm-24222682' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 6, example: 'Rm-24222682' }
        }
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      CreateAdminRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Platform Admin' },
          email: { type: 'string', format: 'email', example: 'admin2@example.com' },
          password: { type: 'string', minLength: 6, example: 'SecurePass123' }
        }
      },
      CreatePlanRequest: {
        type: 'object',
        required: ['name', 'price', 'billingCycle', 'features'],
        properties: {
          name: { type: 'string', example: 'Pro' },
          description: { type: 'string', nullable: true, example: 'For everyday productivity' },
          price: { type: 'number', minimum: 0, example: 17 },
          billingCycle: schemaRef('BillingCycle'),
          features: { type: 'array', items: { type: 'string' }, example: ['Access to Research', 'Includes Claude Code and Cowork'] },
          isActive: { type: 'boolean', example: true }
        }
      },
      UpdatePlanRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'number', minimum: 0 },
          billingCycle: schemaRef('BillingCycle'),
          features: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' }
        }
      },
      CreatePaymentMethodRequest: {
        type: 'object',
        required: ['cardNumber', 'cardholderName', 'expiryMonth', 'expiryYear', 'cvv'],
        properties: {
          cardNumber: { type: 'string', minLength: 12, pattern: '^[\\d\\s]+$', example: '4242 4242 4242 4242' },
          cardholderName: { type: 'string', minLength: 2, example: 'John Doe' },
          expiryMonth: { type: 'integer', minimum: 1, maximum: 12, example: 12 },
          expiryYear: { type: 'integer', minimum: 2000, maximum: 9999, example: 2028 },
          cvv: { type: 'string', pattern: '^\\d{3,4}$', example: '123' },
          isDefault: { type: 'boolean', example: true },
          saveForFuture: { type: 'boolean', example: true }
        }
      },
      SelectPlanRequest: {
        type: 'object',
        required: ['planId'],
        properties: {
          planId: { type: 'string', example: 'f1c6ab5f-73f9-4c27-a1d8-39f71d1f7cbc' }
        }
      },
      CreateSubscriptionRequest: {
        type: 'object',
        required: ['planId'],
        properties: {
          planId: { type: 'string' },
          paymentMethodId: { type: 'string', nullable: true },
          newPaymentMethod: { allOf: [schemaRef('CreatePaymentMethodRequest')], nullable: true },
          simulateFailure: { type: 'boolean', example: false }
        }
      },
      CheckoutSubscriptionRequest: {
        type: 'object',
        properties: {
          paymentMethodId: { type: 'string', nullable: true },
          newPaymentMethod: { allOf: [schemaRef('CreatePaymentMethodRequest')], nullable: true },
          simulateFailure: { type: 'boolean', example: false }
        }
      },
      ChangePlanRequest: {
        type: 'object',
        required: ['newPlanId'],
        properties: {
          newPlanId: { type: 'string' },
          paymentMethodId: { type: 'string', nullable: true },
          newPaymentMethod: { allOf: [schemaRef('CreatePaymentMethodRequest')], nullable: true },
          simulateFailure: { type: 'boolean', example: false }
        }
      },
      CancelSubscriptionRequest: {
        type: 'object',
        properties: {
          reason: { type: 'string', example: 'No longer needed' }
        }
      },
      RootMetadata: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'SaaS Subscription Manager API' },
          data: {
            type: 'object',
            required: ['version', 'docs'],
            properties: {
              version: { type: 'string', example: appConfig.version },
              docs: { type: 'string', example: '/docs' }
            }
          }
        }
      }
    }
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Get API metadata',
        responses: {
          200: {
            description: 'API root metadata.',
            content: {
              'application/json': {
                schema: schemaRef('RootMetadata')
              }
            }
          }
        }
      }
    },
    '/docs.json': {
      get: {
        tags: ['System'],
        summary: 'Get the raw OpenAPI document',
        responses: {
          200: {
            description: 'Raw OpenAPI JSON document.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: true
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user account',
        description: 'Creates a new user account, sets the JWT cookie, and returns the token plus the user payload.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('RegisterRequest')
            }
          }
        },
        responses: {
          201: authResponse('AuthActionResponse', 'User account created successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/Conflict' }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate a user',
        description: 'Validates credentials, sets the JWT cookie, and returns the token plus the user payload.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('LoginRequest')
            }
          }
        },
        responses: {
          200: authResponse('AuthActionResponse', 'User logged in successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Clear the current session cookie',
        responses: {
          200: authResponse('LogoutResponse', 'User logged out successfully.')
        }
      }
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated user',
        security: [{ cookieAuth: [] }],
        responses: {
          200: authResponse('AuthMeResponse', 'Authenticated user fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/v1/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get the current user profile',
        security: [{ cookieAuth: [] }],
        responses: {
          200: successResponse('UserSummary', 'User profile fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      patch: {
        tags: ['Users'],
        summary: 'Update the current user profile',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('UpdateUserRequest')
            }
          }
        },
        responses: {
          200: successResponse('UserSummary', 'User profile updated successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' }
        }
      }
    },
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        security: [{ cookieAuth: [] }],
        responses: {
          200: arraySuccessResponse('UserSummary', 'Users fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/api/v1/users/{userId}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by id',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: successResponse('UserDetail', 'User fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/v1/plans': {
      get: {
        tags: ['Plans'],
        summary: 'List plans',
        description: 'Admins receive all plans. Standard users receive active plans only.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: arraySuccessResponse('Plan', 'Plans fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      },
      post: {
        tags: ['Plans'],
        summary: 'Create a plan',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('CreatePlanRequest')
            }
          }
        },
        responses: {
          201: successResponse('Plan', 'Plan created successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' }
        }
      }
    },
    '/api/v1/plans/{planId}': {
      get: {
        tags: ['Plans'],
        summary: 'Get a plan by id',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'planId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: successResponse('Plan', 'Plan fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      patch: {
        tags: ['Plans'],
        summary: 'Update a plan',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'planId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('UpdatePlanRequest')
            }
          }
        },
        responses: {
          200: successResponse('Plan', 'Plan updated successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' }
        }
      },
      delete: {
        tags: ['Plans'],
        summary: 'Deactivate a plan',
        description: 'This endpoint deactivates the plan instead of removing the record from the database.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'planId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: successResponse('Plan', 'Plan deactivated successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/v1/subscriptions/me': {
      get: {
        tags: ['Subscriptions'],
        summary: 'Get the authenticated user subscription summary',
        security: [{ cookieAuth: [] }],
        responses: {
          200: successResponse('SubscriptionSummary', 'Subscriptions fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/v1/subscriptions/select-plan': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Create or refresh a pending subscription selection',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('SelectPlanRequest')
            }
          }
        },
        responses: {
          201: successResponse('Subscription', 'Plan selected successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/v1/subscriptions': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Create a subscription and process payment immediately',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('CreateSubscriptionRequest')
            }
          }
        },
        responses: {
          201: successResponse('PaymentProcessResult', 'Subscription created successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/v1/subscriptions/{subscriptionId}/checkout': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Complete checkout for a pending subscription',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'subscriptionId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('CheckoutSubscriptionRequest')
            }
          }
        },
        responses: {
          200: successResponse('PaymentProcessResult', 'Subscription checkout completed successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/v1/subscriptions/{subscriptionId}/change-plan': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Change the active plan for a subscription',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'subscriptionId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('ChangePlanRequest')
            }
          }
        },
        responses: {
          200: successResponse('PaymentProcessResult', 'Plan changed successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/v1/subscriptions/{subscriptionId}/cancel': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Cancel a subscription',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'subscriptionId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: schemaRef('CancelSubscriptionRequest')
            }
          }
        },
        responses: {
          200: successResponse('Subscription', 'Subscription canceled successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/v1/payments/me': {
      get: {
        tags: ['Payments'],
        summary: 'List payment history for the authenticated user',
        security: [{ cookieAuth: [] }],
        responses: {
          200: arraySuccessResponse('Payment', 'Payments fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/v1/payment-methods/me': {
      get: {
        tags: ['Payment Methods'],
        summary: 'List saved payment methods',
        security: [{ cookieAuth: [] }],
        responses: {
          200: arraySuccessResponse('PaymentMethod', 'Payment methods fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/v1/payment-methods': {
      post: {
        tags: ['Payment Methods'],
        summary: 'Create a saved payment method',
        description: 'Creates a saved card. For one-time checkout cards, use the subscription checkout payload with `saveForFuture: false` instead.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('CreatePaymentMethodRequest')
            }
          }
        },
        responses: {
          201: successResponse('PaymentMethod', 'Payment method created successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/v1/payment-methods/{paymentMethodId}/default': {
      patch: {
        tags: ['Payment Methods'],
        summary: 'Mark a payment method as the default saved card',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'paymentMethodId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: successResponse('PaymentMethod', 'Default payment method updated successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/v1/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard statistics',
        security: [{ cookieAuth: [] }],
        responses: {
          200: successResponse('AdminDashboardStats', 'Dashboard stats fetched successfully.'),
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/api/v1/admin/admins': {
      post: {
        tags: ['Admin'],
        summary: 'Create another administrator',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: schemaRef('CreateAdminRequest')
            }
          }
        },
        responses: {
          201: successResponse('UserSummary', 'Admin account created successfully.'),
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' }
        }
      }
    }
  }
} as const;
