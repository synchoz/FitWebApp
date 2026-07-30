'use strict';

const foods = [
  // ===== CHICKEN =====
  { food: 'Chicken Breast (Raw)', amount: 100, calories: 165, protein: 31, carbs: 0, fats: 4 },
  { food: 'Chicken Breast (Grilled)', amount: 100, calories: 165, protein: 31, carbs: 0, fats: 4 },
  { food: 'Chicken Breast (Boiled)', amount: 100, calories: 150, protein: 30, carbs: 0, fats: 3 },
  { food: 'Chicken Thigh (Grilled, Skinless)', amount: 100, calories: 209, protein: 26, carbs: 0, fats: 11 },
  { food: 'Chicken Thigh (With Skin)', amount: 100, calories: 250, protein: 24, carbs: 0, fats: 17 },
  { food: 'Chicken Drumstick (Grilled)', amount: 100, calories: 172, protein: 28, carbs: 0, fats: 6 },
  { food: 'Chicken Wings (Grilled)', amount: 100, calories: 203, protein: 30, carbs: 0, fats: 8 },
  { food: 'Chicken Schnitzel (Fried)', amount: 100, calories: 280, protein: 20, carbs: 15, fats: 16 },
  { food: 'Ground Chicken (Cooked)', amount: 100, calories: 189, protein: 27, carbs: 0, fats: 9 },
  { food: 'Chicken Shawarma', amount: 100, calories: 220, protein: 25, carbs: 2, fats: 12 },
  { food: 'Chicken Liver (Cooked)', amount: 100, calories: 172, protein: 24, carbs: 1, fats: 7 },

  // ===== FISH / SEAFOOD =====
  { food: 'Salmon (Grilled)', amount: 100, calories: 208, protein: 22, carbs: 0, fats: 13 },
  { food: 'Salmon (Raw)', amount: 100, calories: 208, protein: 20, carbs: 0, fats: 13 },
  { food: 'Tuna (Canned in Water)', amount: 100, calories: 116, protein: 26, carbs: 0, fats: 1 },
  { food: 'Tuna (Canned in Oil)', amount: 100, calories: 198, protein: 25, carbs: 0, fats: 11 },
  { food: 'Tilapia (Grilled)', amount: 100, calories: 128, protein: 26, carbs: 0, fats: 3 },
  { food: 'Shrimp (Cooked)', amount: 100, calories: 99, protein: 24, carbs: 0, fats: 1 },

  // ===== MEAT =====
  { food: 'Ground Beef (Cooked, 80/20)', amount: 100, calories: 254, protein: 26, carbs: 0, fats: 17 },
  { food: 'Beef Steak (Grilled)', amount: 100, calories: 271, protein: 26, carbs: 0, fats: 18 },
  { food: 'Turkey Breast (Cooked)', amount: 100, calories: 135, protein: 30, carbs: 0, fats: 1 },
  { food: 'Lamb (Grilled)', amount: 100, calories: 294, protein: 25, carbs: 0, fats: 21 },

  // ===== EGGS / DAIRY =====
  { food: 'Egg (Whole, Boiled)', amount: 100, calories: 155, protein: 13, carbs: 1, fats: 11 },
  { food: 'Egg White', amount: 100, calories: 52, protein: 11, carbs: 1, fats: 0 },
  { food: 'Cottage Cheese 5%', amount: 100, calories: 106, protein: 12, carbs: 3, fats: 5 },
  { food: 'Cottage Cheese 0%', amount: 100, calories: 72, protein: 12, carbs: 4, fats: 0 },
  { food: 'White Cheese (Gvina Levana) 5%', amount: 100, calories: 116, protein: 8, carbs: 4, fats: 5 },
  { food: 'Labneh', amount: 100, calories: 130, protein: 6, carbs: 4, fats: 10 },
  { food: 'Greek Yogurt', amount: 100, calories: 97, protein: 9, carbs: 4, fats: 5 },
  { food: 'Milk 3% (Tnuva)', amount: 100, calories: 60, protein: 3, carbs: 5, fats: 3 },
  { food: 'Feta Cheese', amount: 100, calories: 264, protein: 14, carbs: 4, fats: 21 },
  { food: 'Yellow Cheese (Emek/Tzfatit)', amount: 100, calories: 350, protein: 25, carbs: 2, fats: 28 },

  // ===== NUTS / SEEDS =====
  { food: 'Almonds', amount: 100, calories: 579, protein: 21, carbs: 22, fats: 50 },
  { food: 'Walnuts', amount: 100, calories: 654, protein: 15, carbs: 14, fats: 65 },
  { food: 'Cashews', amount: 100, calories: 553, protein: 18, carbs: 30, fats: 44 },
  { food: 'Peanuts', amount: 100, calories: 567, protein: 26, carbs: 16, fats: 49 },
  { food: 'Peanut Butter', amount: 100, calories: 588, protein: 25, carbs: 20, fats: 50 },
  { food: 'Tahini', amount: 100, calories: 595, protein: 17, carbs: 21, fats: 53 },
  { food: 'Sunflower Seeds', amount: 100, calories: 584, protein: 21, carbs: 20, fats: 51 },

  // ===== CARBS / GRAINS =====
  { food: 'White Rice (Cooked)', amount: 100, calories: 130, protein: 2, carbs: 28, fats: 0 },
  { food: 'Brown Rice (Cooked)', amount: 100, calories: 111, protein: 2, carbs: 23, fats: 1 },
  { food: 'Pasta (Cooked)', amount: 100, calories: 131, protein: 5, carbs: 25, fats: 1 },
  { food: 'White Bread (Achdut/Angel)', amount: 100, calories: 265, protein: 9, carbs: 49, fats: 3 },
  { food: 'Whole Wheat Bread', amount: 100, calories: 247, protein: 13, carbs: 41, fats: 3 },
  { food: 'Pita Bread', amount: 100, calories: 275, protein: 9, carbs: 55, fats: 2 },
  { food: 'Couscous (Cooked)', amount: 100, calories: 112, protein: 4, carbs: 23, fats: 0 },
  { food: 'Quinoa (Cooked)', amount: 100, calories: 120, protein: 4, carbs: 21, fats: 2 },
  { food: 'Oatmeal (Cooked)', amount: 100, calories: 71, protein: 2, carbs: 12, fats: 1 },
  { food: 'Potato (Boiled)', amount: 100, calories: 87, protein: 2, carbs: 20, fats: 0 },
  { food: 'Sweet Potato (Baked)', amount: 100, calories: 90, protein: 2, carbs: 21, fats: 0 },

  // ===== LEGUMES =====
  { food: 'Chickpeas (Cooked)', amount: 100, calories: 164, protein: 9, carbs: 27, fats: 3 },
  { food: 'Hummus', amount: 100, calories: 166, protein: 8, carbs: 14, fats: 10 },
  { food: 'Lentils (Cooked)', amount: 100, calories: 116, protein: 9, carbs: 20, fats: 0 },
  { food: 'Black Beans (Cooked)', amount: 100, calories: 132, protein: 9, carbs: 24, fats: 1 },
  { food: 'Falafel (Fried)', amount: 100, calories: 333, protein: 13, carbs: 32, fats: 18 },
  { food: 'Tofu', amount: 100, calories: 76, protein: 8, carbs: 2, fats: 5 },

  // ===== VEGETABLES =====
  { food: 'Cucumber', amount: 100, calories: 15, protein: 1, carbs: 4, fats: 0 },
  { food: 'Tomato', amount: 100, calories: 18, protein: 1, carbs: 4, fats: 0 },
  { food: 'Bell Pepper', amount: 100, calories: 31, protein: 1, carbs: 6, fats: 0 },
  { food: 'Israeli Salad (Chopped Cucumber+Tomato)', amount: 100, calories: 25, protein: 1, carbs: 5, fats: 0 },
  { food: 'Broccoli (Cooked)', amount: 100, calories: 35, protein: 2, carbs: 7, fats: 0 },
  { food: 'Carrot (Raw)', amount: 100, calories: 41, protein: 1, carbs: 10, fats: 0 },
  { food: 'Onion (Raw)', amount: 100, calories: 40, protein: 1, carbs: 9, fats: 0 },
  { food: 'Zucchini (Cooked)', amount: 100, calories: 17, protein: 1, carbs: 3, fats: 0 },
  { food: 'Eggplant (Grilled)', amount: 100, calories: 35, protein: 1, carbs: 8, fats: 0 },
  { food: 'Avocado', amount: 100, calories: 160, protein: 2, carbs: 9, fats: 15 },

  // ===== FRUITS =====
  { food: 'Banana', amount: 100, calories: 89, protein: 1, carbs: 23, fats: 0 },
  { food: 'Apple', amount: 100, calories: 52, protein: 0, carbs: 14, fats: 0 },
  { food: 'Orange', amount: 100, calories: 47, protein: 1, carbs: 12, fats: 0 },
  { food: 'Watermelon', amount: 100, calories: 30, protein: 1, carbs: 8, fats: 0 },
  { food: 'Strawberries', amount: 100, calories: 32, protein: 1, carbs: 8, fats: 0 },
  { food: 'Dates (Medjool)', amount: 100, calories: 277, protein: 2, carbs: 75, fats: 0 },
  { food: 'Grapes', amount: 100, calories: 69, protein: 1, carbs: 18, fats: 0 },

  // ===== OILS / FATS =====
  { food: 'Olive Oil', amount: 100, calories: 884, protein: 0, carbs: 0, fats: 100 },
  { food: 'Coconut Oil', amount: 100, calories: 862, protein: 0, carbs: 0, fats: 100 },
  { food: 'Butter', amount: 100, calories: 717, protein: 1, carbs: 0, fats: 81 },
  { food: 'Mayonnaise', amount: 100, calories: 680, protein: 1, carbs: 3, fats: 75 },

  // ===== SNACKS / ISRAELI SUPERMARKET STAPLES =====
  { food: 'Bamba', amount: 100, calories: 545, protein: 13, carbs: 47, fats: 34 },
  { food: 'Bissli', amount: 100, calories: 480, protein: 8, carbs: 65, fats: 20 },
  { food: 'Rice Cakes (Osem)', amount: 100, calories: 387, protein: 8, carbs: 82, fats: 3 },
  { food: 'Corn Flakes', amount: 100, calories: 357, protein: 7, carbs: 84, fats: 1 },
  { food: 'Granola', amount: 100, calories: 471, protein: 10, carbs: 64, fats: 20 },
  { food: 'Halva', amount: 100, calories: 500, protein: 12, carbs: 45, fats: 30 },
  { food: 'Dark Chocolate (70%)', amount: 100, calories: 598, protein: 8, carbs: 45, fats: 43 },
  { food: 'Milk Chocolate', amount: 100, calories: 535, protein: 8, carbs: 59, fats: 30 },

  // ===== DRINKS =====
  { food: 'Orange Juice', amount: 100, calories: 45, protein: 1, carbs: 10, fats: 0 },
  { food: 'Chocolate Milk', amount: 100, calories: 83, protein: 3, carbs: 10, fats: 3 },
  { food: 'Protein Shake (Whey, Mixed w/ Water)', amount: 100, calories: 40, protein: 8, carbs: 1, fats: 0 },
];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('foods', foods, { ignoreDuplicates: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('foods', {
      food: foods.map((f) => f.food),
    });
  },
};
