const request = require('supertest');

// Mock musi być PRZED importem app
jest.mock('../config/prisma', () => ({
  cocktail: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  ingredient: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const app = require('../../server');
const prisma = require('../config/prisma');

describe('Server and Middleware Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Domyślne mocki dla udanych odpowiedzi
    prisma.cocktail.findMany.mockResolvedValue([]);
    prisma.cocktail.count.mockResolvedValue(0);
    prisma.ingredient.findMany.mockResolvedValue([]);
    prisma.ingredient.count.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Health Check / (or root)', () => {
    it('should return 200 for health check if defined', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Middleware Log Testing', () => {
    it('should log requests (indirect test via response)', async () => {
      const res = await request(app).get('/cocktails');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Error Handler Testing', () => {
    it('should return 500 for server errors', async () => {
      prisma.cocktail.findMany.mockRejectedValue(new Error('Test error'));
      const res = await request(app).get('/cocktails');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Test error');
    });
  });
});