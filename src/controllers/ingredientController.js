const prisma = require('../config/prisma');

exports.getIngredients = async (req, res) => {
  const { name, isAlcoholic, sortBy, order, page = 1, limit = 10 } = req.query;
  let where = {};
  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }
  if (isAlcoholic !== undefined) {
    where.isAlcoholic = isAlcoholic === 'true';
  }
  const orderBy = sortBy ? { [sortBy]: order || 'asc' } : undefined;
  const skip = (page - 1) * limit;
  try {
    const ingredients = await prisma.ingredient.findMany({
      where,
      orderBy,
      skip: Number(skip),
      take: Number(limit),
      include: { cocktails: { include: { cocktail: true } } },
    });
    const total = await prisma.ingredient.count({ where });
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({ 
      data: ingredients, 
      meta: { 
        total, 
        page: Number(page), 
        limit: Number(limit), 
        totalPages 
      }, 
      error: null 
    });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
};

exports.getIngredientById = async (req, res) => {
  const { id } = req.params;
  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: parseInt(id) },
      include: { cocktails: { include: { cocktail: true } } },
    });
    if (!ingredient) return res.status(404).json({ data: null, error: 'Składnik nie znaleziony' });
    res.status(200).json({ data: ingredient, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
};

exports.createIngredient = async (req, res) => {
  const { name, description, isAlcoholic } = req.body;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const ingredient = await prisma.ingredient.create({
      data: { name, description, isAlcoholic: isAlcoholic === 'true', photoUrl },
    });
    res.status(201).json({ data: ingredient, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
};

exports.updateIngredient = async (req, res) => {
  const { id } = req.params;
  const { name, description, isAlcoholic } = req.body;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    const ingredient = await prisma.ingredient.update({
      where: { id: parseInt(id) },
      data: { name, description, isAlcoholic: isAlcoholic === 'true', photoUrl },
    });
    res.status(200).json({ data: ingredient, error: null });
  } catch (error) {
    // Sprawdź, czy składnik istnieje
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        data: null, 
        error: 'Składnik o podanym ID nie istnieje' 
      });
    }
    res.status(500).json({ data: null, error: error.message });
  }
};

exports.deleteIngredient = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.ingredient.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).json({ data: null, error: null });
  } catch (error) {
    // Sprawdź, czy składnik istnieje
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        data: null, 
        error: 'Składnik o podanym ID nie istnieje' 
      });
    }
    
    // Sprawdź, czy to błąd foreign key constraint (na wypadek, gdyby kaskada nie zadziałała)
    if (error.code === 'P2003' || error.message.includes('foreign key constraint')) {
      return res.status(400).json({ 
        data: null, 
        error: 'Nie można usunąć składnika, który jest używany w koktajlach. Usuń najpierw powiązane koktajle.' 
      });
    }
    
    res.status(500).json({ data: null, error: error.message });
  }
};