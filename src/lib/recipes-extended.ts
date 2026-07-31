import { Recipe } from './recipe-data';

export const EXTENDED_RECIPES: Record<string, Recipe> = {
  // === INDIAN ===
  "veg-pulao": {
    id: "veg-pulao",
    name: "Vegetable Pulao",
    time: "30 min",
    difficulty: "Easy",
    calories: "290 kcal",
    protein: "6g",
    servings: "4",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=1200&q=80",
    description: "A mildly spiced, fragrant basmati rice dish cooked with mixed vegetables and whole spices.",
    nutrition: { calories: 290, protein: 6, carbs: 48, fat: 8, fiber: 5, sugar: 2 },
    ingredientsList: [
      { name: "Basmati Rice", query: "basmati", requiredQty: 1, requiredUnit: "pack", icon: "🍚" },
      { name: "Mixed Vegetables", query: "vegetable", requiredQty: 1, requiredUnit: "pack", icon: "🥕" },
      { name: "Ghee", query: "ghee", requiredQty: 1, requiredUnit: "pack", icon: "🧈" }
    ],
    steps: [
      { title: "Prep", desc: "Soak rice for 20 mins. Chop veggies.", time: "10 min", difficulty: "Easy" },
      { title: "Cook", desc: "Sauté whole spices and veggies in ghee. Add rice and water. Simmer.", time: "20 min", difficulty: "Easy" }
    ]
  },
  "butter-chicken": {
    id: "butter-chicken",
    name: "Butter Chicken",
    time: "45 min",
    difficulty: "Medium",
    calories: "480 kcal",
    protein: "24g",
    servings: "4",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
    description: "Tender chicken cooked in a rich, creamy tomato gravy with butter and Indian spices.",
    nutrition: { calories: 480, protein: 24, carbs: 12, fat: 38, fiber: 3, sugar: 6 },
    ingredientsList: [
      { name: "Chicken", query: "chicken", requiredQty: 1, requiredUnit: "kg", icon: "🍗" },
      { name: "Tomato", query: "tomato", requiredQty: 1, requiredUnit: "kg", icon: "🍅" },
      { name: "Butter", query: "butter", requiredQty: 1, requiredUnit: "pack", icon: "🧈" },
      { name: "Fresh Cream", query: "cream", requiredQty: 1, requiredUnit: "pack", icon: "🥛" }
    ],
    steps: [
      { title: "Marinate", desc: "Marinate chicken in yogurt and spices. Grill slightly.", time: "20 min", difficulty: "Medium" },
      { title: "Gravy", desc: "Cook tomatoes and spices into a fine paste. Simmer with chicken, butter, and cream.", time: "25 min", difficulty: "Medium" }
    ]
  },
  "egg-curry": {
    id: "egg-curry",
    name: "Egg Curry",
    time: "30 min",
    difficulty: "Easy",
    calories: "310 kcal",
    protein: "14g",
    servings: "2",
    rating: "4.6",
    img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80",
    description: "Hard-boiled eggs simmered in a spiced onion-tomato gravy.",
    nutrition: { calories: 310, protein: 14, carbs: 12, fat: 22, fiber: 3, sugar: 4 },
    ingredientsList: [
      { name: "Eggs", query: "egg", requiredQty: 1, requiredUnit: "pack", icon: "🥚" },
      { name: "Onion", query: "onion", requiredQty: 1, requiredUnit: "kg", icon: "🧅" },
      { name: "Tomato", query: "tomato", requiredQty: 1, requiredUnit: "kg", icon: "🍅" }
    ],
    steps: [
      { title: "Boil Eggs", desc: "Boil, peel, and lightly fry the eggs.", time: "15 min", difficulty: "Easy" },
      { title: "Curry", desc: "Sauté onion, tomato, and spices. Add eggs and simmer.", time: "15 min", difficulty: "Medium" }
    ]
  },

  // === BREAKFAST ===
  "oats": {
    id: "oats",
    name: "Healthy Oatmeal",
    time: "10 min",
    difficulty: "Easy",
    calories: "220 kcal",
    protein: "8g",
    servings: "1",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1200&q=80",
    description: "A quick, hearty bowl of rolled oats cooked in milk, topped with fresh fruits and nuts.",
    nutrition: { calories: 220, protein: 8, carbs: 38, fat: 5, fiber: 6, sugar: 10 },
    ingredientsList: [
      { name: "Rolled Oats", query: "oats", requiredQty: 1, requiredUnit: "pack", icon: "🌾" },
      { name: "Milk", query: "milk", requiredQty: 1, requiredUnit: "L", icon: "🥛" },
      { name: "Apple", query: "apple", requiredQty: 1, requiredUnit: "kg", icon: "🍎" }
    ],
    steps: [
      { title: "Cook Oats", desc: "Boil oats with milk for 5 minutes.", time: "5 min", difficulty: "Easy" },
      { title: "Garnish", desc: "Top with chopped fruits and honey.", time: "5 min", difficulty: "Easy" }
    ]
  },
  "sandwich": {
    id: "sandwich",
    name: "Grilled Veg Sandwich",
    time: "15 min",
    difficulty: "Easy",
    calories: "280 kcal",
    protein: "7g",
    servings: "1",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy grilled bread layered with fresh vegetables and cheese.",
    nutrition: { calories: 280, protein: 7, carbs: 35, fat: 12, fiber: 4, sugar: 3 },
    ingredientsList: [
      { name: "Bread", query: "bread", requiredQty: 1, requiredUnit: "pack", icon: "🍞" },
      { name: "Cheese", query: "cheese", requiredQty: 1, requiredUnit: "pack", icon: "🧀" },
      { name: "Tomato", query: "tomato", requiredQty: 1, requiredUnit: "kg", icon: "🍅" }
    ],
    steps: [
      { title: "Assemble", desc: "Layer bread with veggies, cheese, and chutney.", time: "5 min", difficulty: "Easy" },
      { title: "Grill", desc: "Grill until golden and cheese melts.", time: "10 min", difficulty: "Easy" }
    ]
  },
  "omelette": {
    id: "omelette",
    name: "Masala Omelette",
    time: "10 min",
    difficulty: "Easy",
    calories: "210 kcal",
    protein: "14g",
    servings: "1",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1510693201872-88746c2438b6?auto=format&fit=crop&w=1200&q=80",
    description: "A fluffy Indian-style omelette packed with onions, green chilies, and cilantro.",
    nutrition: { calories: 210, protein: 14, carbs: 2, fat: 15, fiber: 0.5, sugar: 1 },
    ingredientsList: [
      { name: "Eggs", query: "egg", requiredQty: 1, requiredUnit: "pack", icon: "🥚" },
      { name: "Onion", query: "onion", requiredQty: 1, requiredUnit: "kg", icon: "🧅" },
      { name: "Cilantro", query: "coriander", requiredQty: 1, requiredUnit: "bunch", icon: "🌿" }
    ],
    steps: [
      { title: "Whisk", desc: "Beat eggs with chopped onions, chilies, and salt.", time: "5 min", difficulty: "Easy" },
      { title: "Cook", desc: "Pour into a hot greased pan and cook on both sides.", time: "5 min", difficulty: "Easy" }
    ]
  },

  // === HEALTHY ===
  "quinoa-salad": {
    id: "quinoa-salad",
    name: "Avocado Quinoa Salad",
    time: "20 min",
    difficulty: "Easy",
    calories: "320 kcal",
    protein: "10g",
    servings: "2",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    description: "A refreshing, protein-packed salad with fluffy quinoa, creamy avocado, and lemon vinaigrette.",
    nutrition: { calories: 320, protein: 10, carbs: 35, fat: 16, fiber: 8, sugar: 3 },
    ingredientsList: [
      { name: "Quinoa", query: "quinoa", requiredQty: 1, requiredUnit: "pack", icon: "🍚" },
      { name: "Avocado", query: "avocado", requiredQty: 1, requiredUnit: "kg", icon: "🥑" },
      { name: "Lemon", query: "lemon", requiredQty: 1, requiredUnit: "kg", icon: "🍋" }
    ],
    steps: [
      { title: "Cook Quinoa", desc: "Boil quinoa until fluffy and let it cool.", time: "15 min", difficulty: "Easy" },
      { title: "Mix", desc: "Toss with chopped avocado, veggies, and lemon dressing.", time: "5 min", difficulty: "Easy" }
    ]
  },
  "greek-salad": {
    id: "greek-salad",
    name: "Classic Greek Salad",
    time: "10 min",
    difficulty: "Easy",
    calories: "280 kcal",
    protein: "6g",
    servings: "2",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
    description: "A crisp Mediterranean salad with cucumbers, tomatoes, feta cheese, and olives.",
    nutrition: { calories: 280, protein: 6, carbs: 12, fat: 22, fiber: 4, sugar: 6 },
    ingredientsList: [
      { name: "Cucumber", query: "cucumber", requiredQty: 1, requiredUnit: "kg", icon: "🥒" },
      { name: "Tomato", query: "tomato", requiredQty: 1, requiredUnit: "kg", icon: "🍅" },
      { name: "Olive Oil", query: "olive oil", requiredQty: 1, requiredUnit: "bottle", icon: "🫒" }
    ],
    steps: [
      { title: "Chop", desc: "Roughly chop all vegetables.", time: "8 min", difficulty: "Easy" },
      { title: "Toss", desc: "Toss with feta, olives, and olive oil.", time: "2 min", difficulty: "Easy" }
    ]
  },

  // === PASTA & ITALIAN ===
  "white-sauce-pasta": {
    id: "white-sauce-pasta",
    name: "Creamy White Pasta",
    time: "25 min",
    difficulty: "Medium",
    calories: "520 kcal",
    protein: "14g",
    servings: "2",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
    description: "Penne pasta tossed in a luxurious, creamy garlic béchamel sauce.",
    nutrition: { calories: 520, protein: 14, carbs: 55, fat: 28, fiber: 3, sugar: 4 },
    ingredientsList: [
      { name: "Penne Pasta", query: "pasta", requiredQty: 1, requiredUnit: "pack", icon: "🍝" },
      { name: "Milk", query: "milk", requiredQty: 1, requiredUnit: "L", icon: "🥛" },
      { name: "Cheese", query: "cheese", requiredQty: 1, requiredUnit: "pack", icon: "🧀" }
    ],
    steps: [
      { title: "Boil Pasta", desc: "Boil pasta in salted water until al dente.", time: "10 min", difficulty: "Easy" },
      { title: "Sauce", desc: "Make a roux with butter and flour, whisk in milk until thick.", time: "10 min", difficulty: "Medium" },
      { title: "Combine", desc: "Toss pasta in sauce, top with cheese.", time: "5 min", difficulty: "Easy" }
    ]
  },
  "red-sauce-pasta": {
    id: "red-sauce-pasta",
    name: "Arrabbiata Pasta",
    time: "25 min",
    difficulty: "Medium",
    calories: "410 kcal",
    protein: "12g",
    servings: "2",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
    description: "Pasta enveloped in a spicy, tangy tomato sauce with herbs.",
    nutrition: { calories: 410, protein: 12, carbs: 65, fat: 12, fiber: 6, sugar: 8 },
    ingredientsList: [
      { name: "Pasta", query: "pasta", requiredQty: 1, requiredUnit: "pack", icon: "🍝" },
      { name: "Tomato Purée", query: "tomato puree", requiredQty: 1, requiredUnit: "pack", icon: "🍅" },
      { name: "Garlic", query: "garlic", requiredQty: 1, requiredUnit: "pack", icon: "🧄" }
    ],
    steps: [
      { title: "Boil Pasta", desc: "Cook pasta until al dente.", time: "10 min", difficulty: "Easy" },
      { title: "Sauce", desc: "Sauté garlic, add tomato purée, chili flakes, and simmer.", time: "12 min", difficulty: "Medium" },
      { title: "Mix", desc: "Combine sauce and pasta.", time: "3 min", difficulty: "Easy" }
    ]
  },

  // === SNACKS ===
  "maggi": {
    id: "maggi",
    name: "Vegetable Maggi",
    time: "10 min",
    difficulty: "Easy",
    calories: "350 kcal",
    protein: "6g",
    servings: "1",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=1200&q=80",
    description: "The classic 2-minute noodle upgraded with fresh vegetables and extra spices.",
    nutrition: { calories: 350, protein: 6, carbs: 55, fat: 14, fiber: 3, sugar: 2 },
    ingredientsList: [
      { name: "Maggi Noodles", query: "maggi", requiredQty: 1, requiredUnit: "pack", icon: "🍜" },
      { name: "Mixed Veggies", query: "vegetable", requiredQty: 1, requiredUnit: "pack", icon: "🥕" }
    ],
    steps: [
      { title: "Boil", desc: "Boil water with veggies and tastemaker.", time: "5 min", difficulty: "Easy" },
      { title: "Noodles", desc: "Add noodles and cook until water evaporates.", time: "5 min", difficulty: "Easy" }
    ]
  },
  "french-fries": {
    id: "french-fries",
    name: "Crispy French Fries",
    time: "25 min",
    difficulty: "Medium",
    calories: "380 kcal",
    protein: "4g",
    servings: "2",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=1200&q=80",
    description: "Perfectly golden, crispy on the outside, fluffy on the inside potato fries.",
    nutrition: { calories: 380, protein: 4, carbs: 45, fat: 20, fiber: 4, sugar: 1 },
    ingredientsList: [
      { name: "Potatoes", query: "potato", requiredQty: 1, requiredUnit: "kg", icon: "🥔" },
      { name: "Cooking Oil", query: "oil", requiredQty: 1, requiredUnit: "L", icon: "🛢️" }
    ],
    steps: [
      { title: "Cut", desc: "Slice potatoes into sticks and soak in cold water.", time: "10 min", difficulty: "Easy" },
      { title: "Fry", desc: "Double fry in hot oil until golden crisp.", time: "15 min", difficulty: "Medium" }
    ]
  },

  // === DESSERTS ===
  "gulab-jamun": {
    id: "gulab-jamun",
    name: "Gulab Jamun",
    time: "40 min",
    difficulty: "Hard",
    calories: "300 kcal",
    protein: "4g",
    servings: "4",
    rating: "4.9",
    img: "/gulab-jamun-hero.png",
    description: "Soft, melt-in-your-mouth milk solid spheres soaked in fragrant rose-cardamom syrup.",
    nutrition: { calories: 300, protein: 4, carbs: 45, fat: 12, fiber: 0, sugar: 35 },
    ingredientsList: [
      { name: "Gulab Jamun Mix", query: "gulab jamun", requiredQty: 1, requiredUnit: "pack", icon: "🥣" },
      { name: "Sugar", query: "sugar", requiredQty: 1, requiredUnit: "kg", icon: "🍬" }
    ],
    steps: [
      { title: "Dough", desc: "Knead mix with milk to form a soft dough. Roll into balls.", time: "15 min", difficulty: "Medium" },
      { title: "Syrup", desc: "Boil sugar and water with cardamom until slightly sticky.", time: "10 min", difficulty: "Easy" },
      { title: "Fry & Soak", desc: "Fry balls on low heat, then soak in hot syrup.", time: "15 min", difficulty: "Hard" }
    ]
  },
  "brownie": {
    id: "brownie",
    name: "Fudge Brownie",
    time: "45 min",
    difficulty: "Medium",
    calories: "450 kcal",
    protein: "5g",
    servings: "6",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    description: "Rich, dense, and deeply chocolatey fudge brownies with a crinkly top.",
    nutrition: { calories: 450, protein: 5, carbs: 55, fat: 25, fiber: 3, sugar: 40 },
    ingredientsList: [
      { name: "Dark Chocolate", query: "chocolate", requiredQty: 1, requiredUnit: "pack", icon: "🍫" },
      { name: "Butter", query: "butter", requiredQty: 1, requiredUnit: "pack", icon: "🧈" },
      { name: "Maida", query: "maida", requiredQty: 1, requiredUnit: "pack", icon: "🌾" }
    ],
    steps: [
      { title: "Melt", desc: "Melt chocolate and butter together.", time: "10 min", difficulty: "Easy" },
      { title: "Bake", desc: "Mix with eggs, sugar, flour, and bake at 180°C for 25 mins.", time: "35 min", difficulty: "Medium" }
    ]
  }
};
