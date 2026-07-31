const fs = require('fs');
const path = require('path');

const recipePath = path.join(__dirname, '../src/lib/recipe-data.ts');

const content = `
export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface Ingredient {
  name: string;
  query: string;
  requiredQty: number;
  requiredUnit: string;
  icon: string;
}

export interface RecipeStep {
  title: string;
  desc: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tip?: string;
  mistake?: string;
  img?: string;
}

export interface Recipe {
  id: string;
  name: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  calories: string;
  protein: string;
  servings: string;
  rating: string;
  img: string;
  description: string;
  nutrition: Nutrition;
  ingredientsList: Ingredient[];
  steps: RecipeStep[];
}

export const MOCK_RECIPES: Record<string, Recipe> = {
  "paneer-butter-masala": {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    time: "40 min",
    difficulty: "Medium",
    calories: "450 kcal",
    protein: "16g",
    servings: "4",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&w=1200&q=80",
    description: "A rich, creamy, and mildly sweet gravy made with butter, tomatoes, cashews, and soft paneer cubes.",
    nutrition: { calories: 450, protein: 16, carbs: 12, fat: 38, fiber: 3, sugar: 5 },
    ingredientsList: [
      { name: "Paneer", query: "paneer", requiredQty: 1, requiredUnit: "pack", icon: "🧀" },
      { name: "Tomato", query: "tomato", requiredQty: 1, requiredUnit: "kg", icon: "🍅" },
      { name: "Butter", query: "butter", requiredQty: 1, requiredUnit: "pack", icon: "🧈" },
      { name: "Cashews", query: "cashew", requiredQty: 1, requiredUnit: "pack", icon: "🥜" },
      { name: "Fresh Cream", query: "cream", requiredQty: 1, requiredUnit: "pack", icon: "🥛" }
    ],
    steps: [
      { title: "Prep Gravy", desc: "Sauté onions, tomatoes, and cashews. Blend into a smooth paste.", time: "15 min", difficulty: "Medium", tip: "Strain the puree for a silky texture." },
      { title: "Cook Masala", desc: "Cook the paste with butter and spices until oil separates.", time: "15 min", difficulty: "Medium" },
      { title: "Add Paneer", desc: "Add cubed paneer and simmer. Garnish with cream and kasuri methi.", time: "10 min", difficulty: "Easy" }
    ]
  },
  "rajma-chawal": {
    id: "rajma-chawal",
    name: "Rajma Chawal",
    time: "45 min",
    difficulty: "Easy",
    calories: "410 kcal",
    protein: "14g",
    servings: "4",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
    description: "Comforting kidney beans cooked in a spiced tomato gravy, served over steaming basmati rice.",
    nutrition: { calories: 410, protein: 14, carbs: 65, fat: 12, fiber: 15, sugar: 4 },
    ingredientsList: [
      { name: "Rajma", query: "rajma", requiredQty: 1, requiredUnit: "pack", icon: "🫘" },
      { name: "Basmati Rice", query: "basmati", requiredQty: 1, requiredUnit: "pack", icon: "🍚" },
      { name: "Tomato", query: "tomato", requiredQty: 1, requiredUnit: "kg", icon: "🍅" },
      { name: "Onion", query: "onion", requiredQty: 1, requiredUnit: "kg", icon: "🧅" }
    ],
    steps: [
      { title: "Boil Rajma", desc: "Soak rajma overnight and pressure cook until tender.", time: "20 min", difficulty: "Easy" },
      { title: "Prepare Gravy", desc: "Sauté onions, tomatoes, and spices. Add cooked rajma and simmer.", time: "15 min", difficulty: "Medium" },
      { title: "Cook Rice", desc: "Boil soaked basmati rice until fluffy.", time: "10 min", difficulty: "Easy" }
    ]
  },
  "dal-makhani": {
    id: "dal-makhani",
    name: "Dal Makhani",
    time: "60 min",
    difficulty: "Medium",
    calories: "380 kcal",
    protein: "12g",
    servings: "4",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
    description: "Whole black lentils and kidney beans slow-cooked with butter and cream for a rich, comforting meal.",
    nutrition: { calories: 380, protein: 12, carbs: 45, fat: 18, fiber: 14, sugar: 4 },
    ingredientsList: [
      { name: "Urad Dal", query: "urad dal", requiredQty: 1, requiredUnit: "pack", icon: "🍛" },
      { name: "Butter", query: "butter", requiredQty: 1, requiredUnit: "pack", icon: "🧈" },
      { name: "Tomato", query: "tomato", requiredQty: 1, requiredUnit: "kg", icon: "🍅" },
      { name: "Fresh Cream", query: "cream", requiredQty: 1, requiredUnit: "pack", icon: "🥛" }
    ],
    steps: [
      { title: "Boil Dal", desc: "Pressure cook soaked lentils until soft.", time: "30 min", difficulty: "Easy" },
      { title: "Tempering", desc: "Cook tomato puree with ginger garlic paste and spices.", time: "10 min", difficulty: "Medium" },
      { title: "Simmer", desc: "Add tempering to dal. Simmer on low heat. Finish with cream.", time: "20 min", difficulty: "Easy" }
    ]
  },
  "biryani": {
    id: "biryani",
    name: "Chicken Biryani",
    time: "90 min",
    difficulty: "Hard",
    calories: "550 kcal",
    protein: "32g",
    servings: "6",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
    description: "Aromatic basmati rice layered with spiced marinated chicken, caramelized onions, and saffron.",
    nutrition: { calories: 550, protein: 32, carbs: 48, fat: 22, fiber: 4, sugar: 3 },
    ingredientsList: [
      { name: "Chicken", query: "chicken", requiredQty: 1, requiredUnit: "kg", icon: "🍗" },
      { name: "Basmati Rice", query: "basmati", requiredQty: 1, requiredUnit: "pack", icon: "🍚" },
      { name: "Onion", query: "onion", requiredQty: 1, requiredUnit: "kg", icon: "🧅" },
      { name: "Yogurt", query: "yogurt", requiredQty: 1, requiredUnit: "pack", icon: "🥣" },
      { name: "Biryani Masala", query: "masala", requiredQty: 1, requiredUnit: "pack", icon: "🌶️" }
    ],
    steps: [
      { title: "Marinate", desc: "Marinate chicken with yogurt and spices for 1 hour.", time: "10 min", difficulty: "Easy" },
      { title: "Cook Rice", desc: "Par-boil basmati rice with whole spices.", time: "15 min", difficulty: "Medium" },
      { title: "Layer and Dum", desc: "Layer chicken and rice. Seal and cook on dum for 40 mins.", time: "40 min", difficulty: "Hard" }
    ]
  },
  "palak-paneer": {
    id: "palak-paneer",
    name: "Palak Paneer",
    time: "35 min",
    difficulty: "Easy",
    calories: "320 kcal",
    protein: "14g",
    servings: "4",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    description: "Fresh spinach puree cooked with Indian spices and soft paneer cubes.",
    nutrition: { calories: 320, protein: 14, carbs: 10, fat: 26, fiber: 6, sugar: 3 },
    ingredientsList: [
      { name: "Spinach", query: "spinach", requiredQty: 1, requiredUnit: "bunch", icon: "🥬" },
      { name: "Paneer", query: "paneer", requiredQty: 1, requiredUnit: "pack", icon: "🧀" },
      { name: "Garlic", query: "garlic", requiredQty: 1, requiredUnit: "pack", icon: "🧄" },
      { name: "Fresh Cream", query: "cream", requiredQty: 1, requiredUnit: "pack", icon: "🥛" }
    ],
    steps: [
      { title: "Blanch Spinach", desc: "Blanch spinach in boiling water and puree.", time: "10 min", difficulty: "Easy" },
      { title: "Cook Masala", desc: "Sauté garlic, onions, and tomatoes. Add spices.", time: "10 min", difficulty: "Medium" },
      { title: "Simmer", desc: "Add spinach puree and paneer. Simmer for 5 mins.", time: "10 min", difficulty: "Easy" }
    ]
  },
  "idli": {
    id: "idli",
    name: "Soft Idli",
    time: "20 min",
    difficulty: "Medium",
    calories: "120 kcal",
    protein: "4g",
    servings: "4",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=1200&q=80",
    description: "Steamed rice and lentil cakes. Light, fluffy, and a healthy South Indian breakfast.",
    nutrition: { calories: 120, protein: 4, carbs: 26, fat: 0.5, fiber: 2, sugar: 0 },
    ingredientsList: [
      { name: "Idli Batter", query: "batter", requiredQty: 1, requiredUnit: "pack", icon: "🥣" }
    ],
    steps: [
      { title: "Prep Batter", desc: "Use fermented batter. Lightly mix.", time: "5 min", difficulty: "Easy" },
      { title: "Steam", desc: "Pour into greased idli molds and steam for 10-15 mins.", time: "15 min", difficulty: "Easy" }
    ]
  },
  "dosa": {
    id: "dosa",
    name: "Masala Dosa",
    time: "25 min",
    difficulty: "Medium",
    calories: "280 kcal",
    protein: "5g",
    servings: "2",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy rice crepe stuffed with a spiced potato filling. Served with chutney.",
    nutrition: { calories: 280, protein: 5, carbs: 42, fat: 10, fiber: 4, sugar: 1 },
    ingredientsList: [
      { name: "Dosa Batter", query: "batter", requiredQty: 1, requiredUnit: "pack", icon: "🥣" },
      { name: "Potato", query: "potato", requiredQty: 1, requiredUnit: "kg", icon: "🥔" },
      { name: "Onion", query: "onion", requiredQty: 1, requiredUnit: "kg", icon: "🧅" },
      { name: "Ghee", query: "ghee", requiredQty: 1, requiredUnit: "pack", icon: "🧈" }
    ],
    steps: [
      { title: "Potato Masala", desc: "Boil potatoes and sauté with onions and mustard seeds.", time: "15 min", difficulty: "Medium" },
      { title: "Make Dosa", desc: "Spread batter thin on a hot tawa. Cook with ghee until crisp.", time: "10 min", difficulty: "Hard" }
    ]
  },
  "poha": {
    id: "poha",
    name: "Kanda Poha",
    time: "15 min",
    difficulty: "Easy",
    calories: "250 kcal",
    protein: "4g",
    servings: "2",
    rating: "4.6",
    img: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1200&q=80",
    description: "A popular Indian breakfast of flattened rice, tempered with onions, mustard seeds, and peanuts.",
    nutrition: { calories: 250, protein: 4, carbs: 45, fat: 8, fiber: 2, sugar: 1 },
    ingredientsList: [
      { name: "Poha", query: "poha", requiredQty: 1, requiredUnit: "pack", icon: "🍚" },
      { name: "Peanuts", query: "peanut", requiredQty: 1, requiredUnit: "pack", icon: "🥜" },
      { name: "Onion", query: "onion", requiredQty: 1, requiredUnit: "kg", icon: "🧅" }
    ],
    steps: [
      { title: "Rinse Poha", desc: "Lightly rinse poha in a colander. Do not soak.", time: "2 min", difficulty: "Easy" },
      { title: "Temper", desc: "Sauté mustard seeds, peanuts, curry leaves, and onions.", time: "8 min", difficulty: "Easy" },
      { title: "Mix", desc: "Add turmeric, salt, and poha. Mix gently and steam for 2 mins.", time: "5 min", difficulty: "Easy" }
    ]
  },
  "upma": {
    id: "upma",
    name: "Rava Upma",
    time: "20 min",
    difficulty: "Easy",
    calories: "210 kcal",
    protein: "5g",
    servings: "2",
    rating: "4.5",
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
    description: "A savory semolina porridge cooked with vegetables and tempered with mustard seeds.",
    nutrition: { calories: 210, protein: 5, carbs: 36, fat: 6, fiber: 3, sugar: 2 },
    ingredientsList: [
      { name: "Semolina", query: "rava", requiredQty: 1, requiredUnit: "pack", icon: "🍚" },
      { name: "Onion", query: "onion", requiredQty: 1, requiredUnit: "kg", icon: "🧅" },
      { name: "Carrot", query: "carrot", requiredQty: 1, requiredUnit: "kg", icon: "🥕" },
      { name: "Ghee", query: "ghee", requiredQty: 1, requiredUnit: "pack", icon: "🧈" }
    ],
    steps: [
      { title: "Roast Rava", desc: "Dry roast semolina until aromatic.", time: "5 min", difficulty: "Easy" },
      { title: "Temper", desc: "Sauté mustard seeds, urad dal, onions, and veggies.", time: "10 min", difficulty: "Medium" },
      { title: "Cook", desc: "Add boiling water and roasted rava. Stir continuously.", time: "5 min", difficulty: "Easy" }
    ]
  },
  "chole-bhature": {
    id: "chole-bhature",
    name: "Chole Bhature",
    time: "60 min",
    difficulty: "Hard",
    calories: "550 kcal",
    protein: "18g",
    servings: "4",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1626132647523-66f55c328bf3?auto=format&fit=crop&w=1200&q=80",
    description: "Spicy chickpea curry served with fluffy, deep-fried leavened bread. A North Indian favorite.",
    nutrition: { calories: 550, protein: 18, carbs: 70, fat: 24, fiber: 12, sugar: 4 },
    ingredientsList: [
      { name: "Chickpeas", query: "chole", requiredQty: 1, requiredUnit: "pack", icon: "🧆" },
      { name: "Maida", query: "maida", requiredQty: 1, requiredUnit: "pack", icon: "🌾" },
      { name: "Onion", query: "onion", requiredQty: 1, requiredUnit: "kg", icon: "🧅" },
      { name: "Tomato", query: "tomato", requiredQty: 1, requiredUnit: "kg", icon: "🍅" }
    ],
    steps: [
      { title: "Prep Chole", desc: "Soak chickpeas overnight. Pressure cook until soft.", time: "25 min", difficulty: "Easy" },
      { title: "Cook Curry", desc: "Sauté onion-tomato masala with spices. Add chole.", time: "20 min", difficulty: "Medium" },
      { title: "Make Bhature", desc: "Knead maida with yogurt. Roll and deep fry until puffed.", time: "15 min", difficulty: "Hard" }
    ]
  }
};
`;

fs.writeFileSync(recipePath, content, 'utf8');
console.log('Successfully updated recipe-data.ts');
