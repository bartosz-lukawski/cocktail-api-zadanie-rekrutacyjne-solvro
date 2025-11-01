const prisma = require('../config/prisma');

exports.getCocktails = async (req, res) => {
  const { ingredient, isAlcoholic, sortBy, order, cursor, limit = 10 } = req.query;
  let where = {};
  if (ingredient) {
    where.ingredients = { some: { ingredient: { name: { contains: ingredient, mode: 'insensitive' } } } };
  }
  if (isAlcoholic !== undefined) {
    where.ingredients = { some: { ingredient: { isAlcoholic: isAlcoholic === 'true' } } };
  }
  const orderBy = sortBy ? { [sortBy]: order || 'asc' } : undefined;
  try {
    const cocktails = await prisma.cocktail.findMany({
      where,
      orderBy,
      take: Number(limit),
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: Number(cursor) } : undefined,
      include: { ingredients: { include: { ingredient: true } } },
    });
    const total = await prisma.cocktail.count({ where });
    const totalPages = Math.ceil(total / limit);
    const nextCursor = cocktails.length === Number(limit) ? cocktails[cocktails.length - 1].id : null;
    res.status(200).json({ data: cocktails, meta: { total, limit: Number(limit), totalPages, nextCursor }, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
};

exports.getCocktailById = async (req, res) => {
  const { id } = req.params;
  try {
    const cocktail = await prisma.cocktail.findUnique({
      where: { id: parseInt(id) },
      include: { ingredients: { include: { ingredient: true } } },
    });
    if (!cocktail) return res.status(404).json({ data: null, error: 'Koktajl nie znaleziony' });
    res.status(200).json({ data: cocktail, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
};

exports.createCocktail = async (req, res) => {
  const { name, category, instructions, ingredients } = req.body;
  try {
    const cocktail = await prisma.cocktail.create({
      data: { name, category, instructions, ingredients: { create: ingredients.map(i => ({ ingredientId: i.ingredientId, quantity: i.quantity })) } },
    });
    res.status(201).json({ data: cocktail, error: null });
  } catch (error) {
    // Sprawdź, czy składnik nie istnieje
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        data: null, 
        error: 'Jeden lub więcej składników o podanych ID nie istnieje' 
      });
    }
    res.status(500).json({ data: null, error: error.message });
  }
};

exports.updateCocktail = async (req, res) => {
  const { id } = req.params;
  const { name, category, instructions, ingredients } = req.body;
  
  // Przygotuj dane do aktualizacji
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (category !== undefined) updateData.category = category;
  if (instructions !== undefined) updateData.instructions = instructions;
  
  // Dodaj ingredients tylko jeśli są wysłane
  if (ingredients !== undefined) {
    updateData.ingredients = {
      deleteMany: {},
      create: ingredients.map(i => ({ ingredientId: i.ingredientId, quantity: i.quantity })),
    };
  }
  
  try {
    const cocktail = await prisma.cocktail.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { ingredients: { include: { ingredient: true } } },
    });
    res.status(200).json({ data: cocktail, error: null });
  } catch (error) {
    // Sprawdź, czy koktajl istnieje
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        data: null, 
        error: 'Koktajl o podanym ID nie istnieje' 
      });
    }
    
    // Sprawdź, czy składnik nie istnieje
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        data: null, 
        error: 'Jeden lub więcej składników o podanych ID nie istnieje' 
      });
    }
    
    res.status(500).json({ data: null, error: error.message });
  }
};

exports.deleteCocktail = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cocktail.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).json({ data: null, error: null });
  } catch (error) {
    // Sprawdź, czy koktajl istnieje
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        data: null, 
        error: 'Koktajl o podanym ID nie istnieje' 
      });
    }
    
    res.status(500).json({ data: null, error: error.message });
  }
};