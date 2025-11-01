const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cocktail API',
      version: '1.0.0',
      description: 'REST API do zarządzania koktajlami i składnikami',
      contact: {
        name: 'API Support',
        email: 'brtsz.lukawski@gmail.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serwer deweloperski',
      },
    ],
    components: {
      schemas: {
        Cocktail: {
          type: 'object',
          required: ['name', 'category', 'instructions', 'ingredients'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID koktajlu',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Nazwa koktajlu',
              example: 'Mojito'
            },
            category: {
              type: 'string',
              description: 'Kategoria koktajlu',
              example: 'Classic'
            },
            instructions: {
              type: 'string',
              description: 'Instrukcje przygotowania',
              example: 'Muddle mint leaves with sugar and lime juice...'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data utworzenia'
            },
            ingredients: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CocktailIngredient'
              }
            }
          }
        },
        CocktailIngredient: {
          type: 'object',
          properties: {
            ingredientId: {
              type: 'integer',
              example: 1
            },
            quantity: {
              type: 'string',
              example: '50ml'
            },
            ingredient: {
              $ref: '#/components/schemas/Ingredient'
            }
          }
        },
        Ingredient: {
          type: 'object',
          required: ['name', 'description', 'isAlcoholic'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID składnika',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Nazwa składnika',
              example: 'Rum'
            },
            description: {
              type: 'string',
              description: 'Opis składnika',
              example: 'Spirytus z trzciny cukrowej'
            },
            isAlcoholic: {
              type: 'boolean',
              description: 'Czy składnik jest alkoholowy',
              example: true
            },
            photoUrl: {
              type: 'string',
              nullable: true,
              description: 'URL zdjęcia składnika',
              example: '/uploads/rum.jpg'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            data: {
              type: 'null'
            },
            error: {
              type: 'string',
              example: 'Błąd serwera'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Ścieżka do plików z dokumentacją
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));
};