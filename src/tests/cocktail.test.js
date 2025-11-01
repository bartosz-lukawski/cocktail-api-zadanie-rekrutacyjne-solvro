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

const mockCocktail = {
  id: 1,
  name: 'Mojito',
  category: 'Classic',
  instructions: 'Muddle mint...',
  createdAt: new Date(),
  ingredients: [{ ingredientId: 1, quantity: '50ml', ingredient: { name: 'Rum' } }],
};

describe('Cocktail API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /cocktails', () => {
    it('should return all cocktails with 200', async () => {
      prisma.cocktail.findMany.mockResolvedValue([mockCocktail]);
      prisma.cocktail.count.mockResolvedValue(1);
      const res = await request(app).get('/cocktails');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should return paginated cocktails', async () => {
      prisma.cocktail.findMany.mockResolvedValue([mockCocktail]);
      prisma.cocktail.count.mockResolvedValue(20);
      const res = await request(app).get('/cocktails?page=2&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1); // Mock returns 1
      expect(res.body.meta.totalPages).toBe(4);
    });

    it('should filter by ingredient', async () => {
      prisma.cocktail.findMany.mockResolvedValue([mockCocktail]);
      prisma.cocktail.count.mockResolvedValue(1);
      const res = await request(app).get('/cocktails?ingredient=rum');
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].ingredients[0].ingredient.name).toContain('Rum');
    });

    it('should sort by name asc', async () => {
      prisma.cocktail.findMany.mockResolvedValue([mockCocktail]);
      prisma.cocktail.count.mockResolvedValue(1);
      const res = await request(app).get('/cocktails?sortBy=name&order=asc');
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].name).toBe('Mojito');
    });

    it('should return 500 on server error', async () => {
      prisma.cocktail.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/cocktails');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('GET /cocktails/:id', () => {
    it('should return cocktail by ID with 200', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(mockCocktail);
      const res = await request(app).get('/cocktails/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Mojito');
    });

    it('should return 404 if not found', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/cocktails/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Koktajl nie znaleziony');
    });

    it('should return 500 on server error', async () => {
      prisma.cocktail.findUnique.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/cocktails/1');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('POST /cocktails', () => {
    it('should create cocktail with 201', async () => {
      prisma.cocktail.create.mockResolvedValue(mockCocktail);
      const res = await request(app).post('/cocktails').send({
        name: 'Mojito',
        category: 'Classic',
        instructions: 'Muddle mint...',
        ingredients: [{ ingredientId: 1, quantity: '50ml' }],
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('Mojito');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).post('/cocktails').send({ name: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 500 on server error', async () => {
      prisma.cocktail.create.mockRejectedValue(new Error('DB error'));
      const res = await request(app).post('/cocktails').send({
        name: 'Test',
        category: 'Test Category',
        instructions: 'Test instructions',
        ingredients: [{ ingredientId: 1, quantity: '50ml' }],
      });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('PUT /cocktails/:id', () => {
    it('should update cocktail with 200', async () => {
      prisma.cocktail.update.mockResolvedValue({ ...mockCocktail, name: 'Updated Mojito' });
      const res = await request(app).put('/cocktails/1').send({ name: 'Updated Mojito' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Updated Mojito');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).put('/cocktails/1').send({ name: 123 });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 500 on server error', async () => {
      prisma.cocktail.update.mockRejectedValue(new Error('DB error'));
      const res = await request(app).put('/cocktails/1').send({ name: 'Test' });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('DELETE /cocktails/:id', () => {
    it('should delete cocktail with 204', async () => {
      prisma.cocktail.delete.mockResolvedValue(mockCocktail);
      const res = await request(app).delete('/cocktails/1');
      expect(res.statusCode).toBe(204);
      expect(res.body).toEqual({});
    });

    it('should return 400 on server error', async () => {
      prisma.cocktail.delete.mockRejectedValue(new Error('DB error'));
      const res = await request(app).delete('/cocktails/1');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });
});