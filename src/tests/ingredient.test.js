const request = require('supertest');

// Mock musi być PRZED importem app
jest.mock('../config/prisma', () => ({
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

const mockIngredient = {
  id: 1,
  name: 'Rum',
  description: 'Spirytus z trzciny cukrowej',
  isAlcoholic: true,
  photoUrl: '/uploads/rum.jpg',
  cocktails: [{ cocktailId: 1, quantity: '50ml', cocktail: { name: 'Mojito' } }],
};

describe('Ingredient API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /ingredients', () => {
    it('should return all ingredients with 200', async () => {
      prisma.ingredient.findMany.mockResolvedValue([mockIngredient]);
      prisma.ingredient.count.mockResolvedValue(1);
      const res = await request(app).get('/ingredients');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should return paginated ingredients', async () => {
      prisma.ingredient.findMany.mockResolvedValue([mockIngredient]);
      prisma.ingredient.count.mockResolvedValue(20);
      const res = await request(app).get('/ingredients?page=2&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.totalPages).toBe(4);
    });

    it('should filter by name', async () => {
      prisma.ingredient.findMany.mockResolvedValue([mockIngredient]);
      prisma.ingredient.count.mockResolvedValue(1);
      const res = await request(app).get('/ingredients?name=rum');
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].name).toContain('Rum');
    });

    it('should filter by isAlcoholic', async () => {
      prisma.ingredient.findMany.mockResolvedValue([mockIngredient]);
      prisma.ingredient.count.mockResolvedValue(1);
      const res = await request(app).get('/ingredients?isAlcoholic=true');
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].isAlcoholic).toBe(true);
    });

    it('should sort by name asc', async () => {
      prisma.ingredient.findMany.mockResolvedValue([mockIngredient]);
      prisma.ingredient.count.mockResolvedValue(1);
      const res = await request(app).get('/ingredients?sortBy=name&order=asc');
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].name).toBe('Rum');
    });

    it('should return 500 on server error', async () => {
      prisma.ingredient.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/ingredients');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('GET /ingredients/:id', () => {
    it('should return ingredient by ID with 200', async () => {
      prisma.ingredient.findUnique.mockResolvedValue(mockIngredient);
      const res = await request(app).get('/ingredients/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Rum');
    });

    it('should return 404 if not found', async () => {
      prisma.ingredient.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/ingredients/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Składnik nie znaleziony');
    });

    it('should return 500 on server error', async () => {
      prisma.ingredient.findUnique.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/ingredients/1');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('POST /ingredients', () => {
    it('should create ingredient with 201', async () => {
      prisma.ingredient.create.mockResolvedValue(mockIngredient);
      const res = await request(app).post('/ingredients')
        .field('name', 'Rum')
        .field('description', 'Spirytus z trzciny cukrowej')
        .field('isAlcoholic', 'true')
        .attach('photo', Buffer.from('test image'), 'test.jpg');
      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('Rum');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).post('/ingredients').send({ name: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 500 on server error', async () => {
      prisma.ingredient.create.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/ingredients')
        .send({ 
          name: 'Test', 
          description: 'Test description', 
          isAlcoholic: 'true' 
        });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('PUT /ingredients/:id', () => {
    it('should update ingredient with 200', async () => {
      prisma.ingredient.update.mockResolvedValue({ ...mockIngredient, name: 'Updated Rum' });
      const res = await request(app).put('/ingredients/1').send({ name: 'Updated Rum' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Updated Rum');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).put('/ingredients/1').send({ name: 123 });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 500 on server error', async () => {
      prisma.ingredient.update.mockRejectedValue(new Error('DB error'));
      const res = await request(app).put('/ingredients/1').send({ name: 'Test' });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('DELETE /ingredients/:id', () => {
    it('should delete ingredient with 204', async () => {
      prisma.ingredient.delete.mockResolvedValue(mockIngredient);
      const res = await request(app).delete('/ingredients/1');
      expect(res.statusCode).toBe(204);
      expect(res.body).toEqual({});
    });

    it('should return 500 on server error', async () => {  // ✅ Zmień nazwę testu
      prisma.ingredient.delete.mockRejectedValue(new Error('DB error'));
      const res = await request(app).delete('/ingredients/1');
      expect(res.statusCode).toBe(500);  // ✅ Zmień 400 na 500
      expect(res.body.error).toBe('DB error');
    });
  });
});