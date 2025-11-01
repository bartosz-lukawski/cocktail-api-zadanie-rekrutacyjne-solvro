-- DropForeignKey
ALTER TABLE "public"."CocktailIngredient" DROP CONSTRAINT "CocktailIngredient_cocktailId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CocktailIngredient" DROP CONSTRAINT "CocktailIngredient_ingredientId_fkey";

-- AddForeignKey
ALTER TABLE "CocktailIngredient" ADD CONSTRAINT "CocktailIngredient_cocktailId_fkey" FOREIGN KEY ("cocktailId") REFERENCES "Cocktail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CocktailIngredient" ADD CONSTRAINT "CocktailIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
