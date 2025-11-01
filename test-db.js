const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Połączenie z bazą danych działa!');
    
    const count = await prisma.cocktail.count();
    console.log(`📊 Liczba koktajli w bazie: ${count}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Błąd połączenia z bazą danych:');
    console.error(error.message);
  }
}

testConnection();