import { Recipe } from './recipe-data';

export const EXTENDED_RECIPES_2: Record<string, Recipe> = {
  // === HEALTHY ===
  "sprouts-bowl": {
    id: "sprouts-bowl",
    name: "Sprouts Salad Bowl",
    time: "10 min",
    difficulty: "Easy",
    calories: "180 kcal",
    protein: "12g",
    servings: "1",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    description: "A super healthy, protein-rich salad with mung bean sprouts, cucumber, and tangy chaat masala.",
    nutrition: { calories: 180, protein: 12, carbs: 24, fat: 4, fiber: 8, sugar: 3 },
    ingredientsList: [
      { name: "Mung Sprouts", query: "sprouts", requiredQty: 1, requiredUnit: "pack", icon: "🌱" },
      { name: "Cucumber", query: "cucumber", requiredQty: 1, requiredUnit: "kg", icon: "🥒" },
      { name: "Lemon", query: "lemon", requiredQty: 1, requiredUnit: "kg", icon: "🍋" }
    ],
    steps: [
      { title: "Prep", desc: "Steam sprouts lightly if preferred.", time: "5 min", difficulty: "Easy" },
      { title: "Mix", desc: "Toss with chopped cucumber, tomato, onion, lemon juice, and spices.", time: "5 min", difficulty: "Easy" }
    ]
  },
  "smoothie-bowl": {
    id: "smoothie-bowl",
    name: "Berry Smoothie Bowl",
    time: "5 min",
    difficulty: "Easy",
    calories: "280 kcal",
    protein: "6g",
    servings: "1",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=1200&q=80",
    description: "A thick, refreshing berry smoothie topped with granola, chia seeds, and fresh fruits.",
    nutrition: { calories: 280, protein: 6, carbs: 45, fat: 8, fiber: 10, sugar: 20 },
    ingredientsList: [
      { name: "Frozen Berries", query: "berry", requiredQty: 1, requiredUnit: "pack", icon: "🫐" },
      { name: "Banana", query: "banana", requiredQty: 1, requiredUnit: "kg", icon: "🍌" },
      { name: "Almond Milk", query: "almond milk", requiredQty: 1, requiredUnit: "L", icon: "🥛" }
    ],
    steps: [
      { title: "Blend", desc: "Blend berries, banana, and milk until thick and creamy.", time: "3 min", difficulty: "Easy" },
      { title: "Top", desc: "Pour into a bowl and top with granola and seeds.", time: "2 min", difficulty: "Easy" }
    ]
  },

  // === PASTA & ITALIAN ===
  "alfredo-pasta": {
    id: "alfredo-pasta",
    name: "Fettuccine Alfredo",
    time: "20 min",
    difficulty: "Medium",
    calories: "600 kcal",
    protein: "16g",
    servings: "2",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=1200&q=80",
    description: "Classic Italian pasta with a rich, buttery Parmesan cheese sauce.",
    nutrition: { calories: 600, protein: 16, carbs: 50, fat: 38, fiber: 2, sugar: 3 },
    ingredientsList: [
      { name: "Fettuccine", query: "pasta", requiredQty: 1, requiredUnit: "pack", icon: "🍝" },
      { name: "Parmesan Cheese", query: "cheese", requiredQty: 1, requiredUnit: "pack", icon: "🧀" },
      { name: "Butter", query: "butter", requiredQty: 1, requiredUnit: "pack", icon: "🧈" }
    ],
    steps: [
      { title: "Boil Pasta", desc: "Cook pasta in heavily salted water.", time: "10 min", difficulty: "Easy" },
      { title: "Sauce", desc: "Melt butter, add cream and cheese, toss with pasta and pasta water.", time: "10 min", difficulty: "Medium" }
    ]
  },
  "lasagna": {
    id: "lasagna",
    name: "Classic Veg Lasagna",
    time: "60 min",
    difficulty: "Hard",
    calories: "550 kcal",
    protein: "18g",
    servings: "4",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=1200&q=80",
    description: "Layers of pasta, rich tomato ragù, creamy béchamel, and melted cheese.",
    nutrition: { calories: 550, protein: 18, carbs: 40, fat: 30, fiber: 5, sugar: 8 },
    ingredientsList: [
      { name: "Lasagna Sheets", query: "lasagna", requiredQty: 1, requiredUnit: "pack", icon: "🍝" },
      { name: "Cheese", query: "cheese", requiredQty: 1, requiredUnit: "pack", icon: "🧀" },
      { name: "Tomato Sauce", query: "tomato puree", requiredQty: 1, requiredUnit: "bottle", icon: "🍅" }
    ],
    steps: [
      { title: "Layer", desc: "Layer sauce, pasta sheets, veggies, and cheese in a baking dish.", time: "20 min", difficulty: "Medium" },
      { title: "Bake", desc: "Bake at 200°C for 40 minutes until bubbly and golden.", time: "40 min", difficulty: "Hard" }
    ]
  },

  // === SNACKS ===
  "garlic-bread": {
    id: "garlic-bread",
    name: "Cheese Garlic Bread",
    time: "15 min",
    difficulty: "Easy",
    calories: "320 kcal",
    protein: "8g",
    servings: "2",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=1200&q=80",
    description: "Toasted baguette slices smothered in garlic butter and melted mozzarella.",
    nutrition: { calories: 320, protein: 8, carbs: 30, fat: 18, fiber: 2, sugar: 2 },
    ingredientsList: [
      { name: "Baguette", query: "bread", requiredQty: 1, requiredUnit: "pack", icon: "🥖" },
      { name: "Garlic", query: "garlic", requiredQty: 1, requiredUnit: "pack", icon: "🧄" },
      { name: "Cheese", query: "cheese", requiredQty: 1, requiredUnit: "pack", icon: "🧀" }
    ],
    steps: [
      { title: "Prep", desc: "Mix minced garlic and herbs into softened butter.", time: "5 min", difficulty: "Easy" },
      { title: "Bake", desc: "Spread on bread, top with cheese, and bake until melted.", time: "10 min", difficulty: "Easy" }
    ]
  },
  "nachos": {
    id: "nachos",
    name: "Loaded Nachos",
    time: "15 min",
    difficulty: "Easy",
    calories: "450 kcal",
    protein: "10g",
    servings: "2",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy tortilla chips loaded with melted cheese, jalapeños, beans, and salsa.",
    nutrition: { calories: 450, protein: 10, carbs: 45, fat: 24, fiber: 6, sugar: 4 },
    ingredientsList: [
      { name: "Tortilla Chips", query: "chips", requiredQty: 1, requiredUnit: "pack", icon: "🥙" },
      { name: "Cheese", query: "cheese", requiredQty: 1, requiredUnit: "pack", icon: "🧀" },
      { name: "Jalapenos", query: "jalapeno", requiredQty: 1, requiredUnit: "bottle", icon: "🌶" }
    ],
    steps: [
      { title: "Assemble", desc: "Spread chips on a tray. Top with cheese, beans, and jalapeños.", time: "5 min", difficulty: "Easy" },
      { title: "Bake", desc: "Bake for 5-7 mins until cheese melts. Serve with salsa.", time: "10 min", difficulty: "Easy" }
    ]
  },

  // === DESSERTS ===
  "ice-cream-sundae": {
    id: "ice-cream-sundae",
    name: "Classic Sundae",
    time: "5 min",
    difficulty: "Easy",
    calories: "400 kcal",
    protein: "6g",
    servings: "1",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&w=1200&q=80",
    description: "Vanilla ice cream topped with hot fudge, whipped cream, nuts, and a cherry.",
    nutrition: { calories: 400, protein: 6, carbs: 50, fat: 20, fiber: 2, sugar: 40 },
    ingredientsList: [
      { name: "Ice Cream", query: "ice cream", requiredQty: 1, requiredUnit: "tub", icon: "🍨" },
      { name: "Chocolate Syrup", query: "syrup", requiredQty: 1, requiredUnit: "bottle", icon: "🍫" },
      { name: "Nuts", query: "cashew", requiredQty: 1, requiredUnit: "pack", icon: "🥜" }
    ],
    steps: [
      { title: "Scoop", desc: "Add generous scoops of ice cream to a bowl.", time: "2 min", difficulty: "Easy" },
      { title: "Garnish", desc: "Drizzle syrup and sprinkle nuts.", time: "3 min", difficulty: "Easy" }
    ]
  },
  "kheer": {
    id: "kheer",
    name: "Rice Kheer",
    time: "45 min",
    difficulty: "Medium",
    calories: "320 kcal",
    protein: "8g",
    servings: "4",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1601050690117-94f5f6af8bdc?auto=format&fit=crop&w=1200&q=80",
    description: "A traditional Indian rice pudding flavored with cardamom and saffron.",
    nutrition: { calories: 320, protein: 8, carbs: 55, fat: 8, fiber: 1, sugar: 25 },
    ingredientsList: [
      { name: "Basmati Rice", query: "basmati", requiredQty: 1, requiredUnit: "pack", icon: "🍚" },
      { name: "Milk", query: "milk", requiredQty: 1, requiredUnit: "L", icon: "🥛" },
      { name: "Sugar", query: "sugar", requiredQty: 1, requiredUnit: "kg", icon: "🍬" }
    ],
    steps: [
      { title: "Boil", desc: "Simmer rice and milk on low heat until thickened and creamy.", time: "40 min", difficulty: "Medium" },
      { title: "Flavor", desc: "Stir in sugar, cardamom, and chopped nuts.", time: "5 min", difficulty: "Easy" }
    ]
  },
  
  // === INDIAN EXTRA ===
  "paneer-tikka": {
    id: "paneer-tikka",
    name: "Paneer Tikka",
    time: "30 min",
    difficulty: "Medium",
    calories: "380 kcal",
    protein: "22g",
    servings: "2",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1599487405270-86430f8e3251?auto=format&fit=crop&w=1200&q=80",
    description: "Chunks of paneer marinated in spices and grilled in a tandoor.",
    nutrition: { calories: 380, protein: 22, carbs: 12, fat: 28, fiber: 3, sugar: 4 },
    ingredientsList: [
      { name: "Paneer", query: "paneer", requiredQty: 1, requiredUnit: "pack", icon: "🧀" },
      { name: "Yogurt", query: "yogurt", requiredQty: 1, requiredUnit: "pack", icon: "🥣" },
      { name: "Capsicum", query: "capsicum", requiredQty: 1, requiredUnit: "kg", icon: "🫑" }
    ],
    steps: [
      { title: "Marinate", desc: "Mix yogurt and spices. Coat paneer and veggies and rest for 30 mins.", time: "10 min", difficulty: "Easy" },
      { title: "Grill", desc: "Skewer and grill until edges are charred.", time: "20 min", difficulty: "Medium" }
    ]
  },
  "samosa": {
    id: "samosa",
    name: "Punjabi Samosa",
    time: "60 min",
    difficulty: "Hard",
    calories: "260 kcal",
    protein: "4g",
    servings: "4",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy, flaky pastry stuffed with a spiced potato and pea filling.",
    nutrition: { calories: 260, protein: 4, carbs: 32, fat: 12, fiber: 3, sugar: 1 },
    ingredientsList: [
      { name: "Maida", query: "maida", requiredQty: 1, requiredUnit: "pack", icon: "🌾" },
      { name: "Potato", query: "potato", requiredQty: 1, requiredUnit: "kg", icon: "🥔" },
      { name: "Peas", query: "peas", requiredQty: 1, requiredUnit: "pack", icon: "🫛" }
    ],
    steps: [
      { title: "Filling", desc: "Boil and mash potatoes. Sauté with peas and spices.", time: "20 min", difficulty: "Medium" },
      { title: "Dough", desc: "Knead firm dough with maida, ajwain, and oil/ghee.", time: "15 min", difficulty: "Medium" },
      { title: "Shape & Fry", desc: "Roll, stuff, shape into cones, and deep fry on low heat.", time: "25 min", difficulty: "Hard" }
    ]
  },
  "jalebi": {
    id: "jalebi",
    name: "Crispy Jalebi",
    time: "30 min",
    difficulty: "Hard",
    calories: "340 kcal",
    protein: "2g",
    servings: "4",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy, deep-fried spirals soaked in saffron-infused sugar syrup.",
    nutrition: { calories: 340, protein: 2, carbs: 75, fat: 8, fiber: 0, sugar: 55 },
    ingredientsList: [
      { name: "Maida", query: "maida", requiredQty: 1, requiredUnit: "pack", icon: "🌾" },
      { name: "Sugar", query: "sugar", requiredQty: 1, requiredUnit: "kg", icon: "🍬" }
    ],
    steps: [
      { title: "Batter", desc: "Prepare a fermented maida batter.", time: "10 min", difficulty: "Easy" },
      { title: "Syrup", desc: "Make a one-string consistency sugar syrup with saffron.", time: "10 min", difficulty: "Medium" },
      { title: "Fry", desc: "Pipe batter into hot oil, fry until crisp, and dunk in warm syrup.", time: "10 min", difficulty: "Hard" }
    ]
  }
};
