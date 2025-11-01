const { validationResult } = require('express-validator');

// Middleware do sprawdzania błędów walidacji
const checkErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ data: null, error: errors.array()[0].msg });
  }
  next();
};

module.exports = { checkErrors };