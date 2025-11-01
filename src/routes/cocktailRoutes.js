const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const cocktailController = require('../controllers/cocktailController');
const { checkErrors } = require('../middleware/validation');

/**
 * @swagger
 * /cocktails:
 *   get:
 *     summary: Pobierz listę koktajli
 *     description: Zwraca listę wszystkich koktajli z możliwością filtrowania i sortowania
 *     tags: [Cocktails]
 *     parameters:
 *       - in: query
 *         name: ingredient
 *         schema:
 *           type: string
 *         description: Filtruj po nazwie składnika
 *       - in: query
 *         name: isAlcoholic
 *         schema:
 *           type: boolean
 *         description: Filtruj po statusie alkoholowym
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, category, createdAt]
 *         description: Pole do sortowania
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Kierunek sortowania
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         description: Kursor do paginacji
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limit wyników
 *     responses:
 *       200:
 *         description: Lista koktajli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cocktail'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     nextCursor:
 *                       type: integer
 *                       nullable: true
 *                 error:
 *                   type: null
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', cocktailController.getCocktails);

/**
 * @swagger
 * /cocktails/{id}:
 *   get:
 *     summary: Pobierz koktajl po ID
 *     tags: [Cocktails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID koktajlu
 *     responses:
 *       200:
 *         description: Szczegóły koktajlu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cocktail'
 *                 error:
 *                   type: null
 *       404:
 *         description: Koktajl nie znaleziony
 *       500:
 *         description: Błąd serwera
 */
router.get('/:id', cocktailController.getCocktailById);

/**
 * @swagger
 * /cocktails:
 *   post:
 *     summary: Utwórz nowy koktajl
 *     tags: [Cocktails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mojito
 *               category:
 *                 type: string
 *                 example: Classic
 *               instructions:
 *                 type: string
 *                 example: Muddle mint leaves with sugar and lime juice. Add rum and soda water.
 *               ingredients:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredientId
 *                     - quantity
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: string
 *                       example: 50ml
 *     responses:
 *       201:
 *         description: Koktajl utworzony pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cocktail'
 *                 error:
 *                   type: null
 *       400:
 *         description: Błędne dane wejściowe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', [
  body('name').isString().notEmpty().withMessage('Nazwa musi być niepustym stringiem'),
  body('category').isString().notEmpty().withMessage('Kategoria musi być niepustym stringiem'),
  body('instructions').optional().isString().withMessage('Instrukcje muszą być stringiem'),
  body('ingredients').isArray({ min: 1 }).withMessage('Ingredients musi być niepustą tablicą'),
  body('ingredients.*.ingredientId').isInt().withMessage('ingredientId musi być liczbą'),
  body('ingredients.*.quantity').isString().withMessage('quantity musi być stringiem'),
], checkErrors, cocktailController.createCocktail);

/**
 * @swagger
 * /cocktails/{id}:
 *   put:
 *     summary: Aktualizuj koktajl
 *     description: Aktualizuje istniejący koktajl (wszystkie pola są opcjonalne)
 *     tags: [Cocktails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID koktajlu
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Mojito
 *               category:
 *                 type: string
 *                 example: Classic
 *               instructions:
 *                 type: string
 *                 example: Updated instructions for making mojito
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: string
 *                       example: 60ml
 *     responses:
 *       200:
 *         description: Koktajl zaktualizowany pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cocktail'
 *                 error:
 *                   type: null
 *       400:
 *         description: Błędne dane wejściowe
 *       404:
 *         description: Koktajl nie znaleziony
 *       500:
 *         description: Błąd serwera
 */
router.put('/:id', [
  body('name').optional().isString().withMessage('Nazwa musi być stringiem'),
  body('category').optional().isString().withMessage('Kategoria musi być stringiem'),
  body('instructions').optional().isString().withMessage('Instrukcje muszą być stringiem'),
  body('ingredients').optional().isArray().withMessage('Ingredients musi być tablicą'),
], checkErrors, cocktailController.updateCocktail);

/**
 * @swagger
 * /cocktails/{id}:
 *   delete:
 *     summary: Usuń koktajl
 *     description: Usuwa koktajl z bazy danych
 *     tags: [Cocktails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID koktajlu do usunięcia
 *     responses:
 *       204:
 *         description: Koktajl usunięty pomyślnie (brak zawartości w odpowiedzi)
 *       404:
 *         description: Koktajl nie znaleziony
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', cocktailController.deleteCocktail);

module.exports = router;