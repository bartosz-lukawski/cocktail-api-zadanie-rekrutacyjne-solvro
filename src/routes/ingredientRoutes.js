const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { checkErrors } = require('../middleware/validation');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

/**
 * @swagger
 * /ingredients:
 *   get:
 *     summary: Pobierz listę składników
 *     description: Zwraca listę wszystkich składników z możliwością filtrowania i sortowania
 *     tags: [Ingredients]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtruj po nazwie składnika (wyszukiwanie częściowe)
 *       - in: query
 *         name: isAlcoholic
 *         schema:
 *           type: boolean
 *         description: Filtruj po statusie alkoholowym (true/false)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, id]
 *         description: Pole do sortowania
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Kierunek sortowania
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numer strony
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Liczba wyników na stronę
 *     responses:
 *       200:
 *         description: Lista składników
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ingredient'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Całkowita liczba składników
 *                     page:
 *                       type: integer
 *                       description: Aktualny numer strony
 *                     limit:
 *                       type: integer
 *                       description: Limit wyników na stronę
 *                     totalPages:
 *                       type: integer
 *                       description: Całkowita liczba stron
 *                 error:
 *                   type: null
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', ingredientController.getIngredients);

/**
 * @swagger
 * /ingredients/{id}:
 *   get:
 *     summary: Pobierz składnik po ID
 *     description: Zwraca szczegóły pojedynczego składnika wraz z listą koktajli, w których jest używany
 *     tags: [Ingredients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID składnika
 *     responses:
 *       200:
 *         description: Szczegóły składnika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Ingredient'
 *                 error:
 *                   type: null
 *       404:
 *         description: Składnik nie znaleziony
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: Składnik nie znaleziony
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', ingredientController.getIngredientById);

/**
 * @swagger
 * /ingredients:
 *   post:
 *     summary: Utwórz nowy składnik
 *     description: Tworzy nowy składnik z opcjonalnym zdjęciem
 *     tags: [Ingredients]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - isAlcoholic
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nazwa składnika
 *                 example: Rum
 *               description:
 *                 type: string
 *                 description: Opis składnika
 *                 example: Spirytus z trzciny cukrowej
 *               isAlcoholic:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 description: Czy składnik jest alkoholowy (jako string)
 *                 example: 'true'
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Zdjęcie składnika (opcjonalne)
 *     responses:
 *       201:
 *         description: Składnik utworzony pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Ingredient'
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
 *                   example: Brak nazwy składnika
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', 
  upload.single('photo'),
  [
    body('name').notEmpty().withMessage('Brak nazwy składnika'),
    body('description').notEmpty().withMessage('Brak opisu składnika'),
    body('isAlcoholic').isIn(['true', 'false']).withMessage('isAlcoholic musi być true lub false'),
  ],
  checkErrors,
  ingredientController.createIngredient
);

/**
 * @swagger
 * /ingredients/{id}:
 *   put:
 *     summary: Aktualizuj składnik
 *     description: Aktualizuje istniejący składnik (wszystkie pola są opcjonalne)
 *     tags: [Ingredients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID składnika
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nazwa składnika
 *                 example: White Rum
 *               description:
 *                 type: string
 *                 description: Opis składnika
 *                 example: Biały rum z trzciny cukrowej
 *               isAlcoholic:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 description: Czy składnik jest alkoholowy (jako string)
 *                 example: 'true'
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Nowe zdjęcie składnika (opcjonalne)
 *     responses:
 *       200:
 *         description: Składnik zaktualizowany pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Ingredient'
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
 *                   example: Nazwa musi być stringiem
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', 
  upload.single('photo'),
  [
    body('name').optional().isString().withMessage('Nazwa musi być stringiem'),
    body('description').optional().isString().withMessage('Opis musi być stringiem'),
    body('isAlcoholic').optional().isIn(['true', 'false']).withMessage('isAlcoholic musi być true lub false'),
  ],
  checkErrors,
  ingredientController.updateIngredient
);

/**
 * @swagger
 * /ingredients/{id}:
 *   delete:
 *     summary: Usuń składnik
 *     description: Usuwa składnik z bazy danych
 *     tags: [Ingredients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID składnika do usunięcia
 *     responses:
 *       204:
 *         description: Składnik usunięty pomyślnie (brak zawartości w odpowiedzi)
 *       400:
 *         description: Błąd podczas usuwania
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: Nie można usunąć składnika
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', ingredientController.deleteIngredient);

module.exports = router;