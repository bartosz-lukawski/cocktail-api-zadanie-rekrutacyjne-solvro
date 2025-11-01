const express = require('express');
delete require.cache[require.resolve('./src/config/swagger')];
const swaggerConfig = require('./src/config/swagger');

delete require.cache[require.resolve('./src/routes/cocktailRoutes')];
delete require.cache[require.resolve('./src/routes/ingredientRoutes')];
const cocktailRoutes = require('./src/routes/cocktailRoutes');
const ingredientRoutes = require('./src/routes/ingredientRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Globalne middleware do logowania żądań
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

swaggerConfig(app);
app.use('/cocktails', cocktailRoutes);
app.use('/ingredients', ingredientRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ data: null, error: 'Wewnętrzny błąd serwera' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
}

module.exports = app;