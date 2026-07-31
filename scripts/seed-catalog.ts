import fs from 'fs';
import path from 'path';

// Realistic Brands
const BRANDS = [
  "Amul", "Mother Dairy", "Nestlé", "Britannia", "Parle", "Aashirvaad", "Fortune",
  "Tata Sampann", "Everest", "MDH", "Patanjali", "Dabur", "Pepsi", "Coca-Cola",
  "Sprite", "Fanta", "Real", "Paper Boat", "Lay's", "Kellogg's", "Cadbury",
  "Bournvita", "Horlicks", "Nescafé", "Bru", "Surf Excel", "Ariel", "Lizol",
  "Dettol", "Dove", "Himalaya", "Pampers", "Haldiram", "Bikaji", "Sunfeast",
  "Oreo", "Maggi", "Knorr", "Yippee", "Red Bull", "Epigamia", "Yakult", "Catch", "Saffola",
  "India Gate", "Kohinoor", "Daawat", "Pillsbury", "Lipton", "Taj Mahal", "Society Tea",
  "Tropicana", "B natural", "Gatorade", "Sting", "Thums Up", "Limca", "Mirinda",
  "Kurkure", "Bingo", "Doritos", "Pringles", "Too Yumm", "Kinder", "Ferrero Rocher",
  "Hershey's", "Amulya", "Gowardhan", "Nandini", "Heritage", "Milky Mist", "Kissan",
  "Ching's", "FunFoods", "Veeba", "Nivea", "Pears", "Lifebuoy", "Cinthol", "Gillette",
  "Colgate", "Pepsodent", "Oral-B", "Sensodyne", "Head & Shoulders", "Pantene", "Sunsilk",
  "Vim", "Pril", "Harpic", "Colin", "Odonil", "Godrej aer", "Good knight", "All Out",
  "MamyPoko", "Huggies", "Johnson's", "Sebamed", "Pedigree", "Whiskas", "Drools", "Royal Canin",
  "Ashoka", "Haldiram's", "MTR", "Suhana", "Organic Tattva", "24 Mantra", "Pro Nature",
  "Real", "B natural", "Gatorade", "Sting", "Nutella", "Hershey's", "Pillsbury", "Betty Crocker"
];

// Base Image Map for specific realistic categories
const BASE_IMAGES: Record<string, string[]> = {
  "Milk": ["https://cdn.dummyjson.com/products/images/groceries/Milk/1.png"],
  "Apple": ["https://cdn.dummyjson.com/products/images/groceries/Apple/1.png"],
  "Eggs": ["https://cdn.dummyjson.com/products/images/groceries/Eggs/1.png"],
  "Chicken": ["https://cdn.dummyjson.com/products/images/groceries/Chicken%20Meat/1.png"],
  "Fish": ["https://cdn.dummyjson.com/products/images/groceries/Fish%20Steak/1.png"],
  "Beef": ["https://cdn.dummyjson.com/products/images/groceries/Beef%20Steak/1.png"],
  "Oil": ["https://cdn.dummyjson.com/products/images/groceries/Cooking%20Oil/1.png"],
  "Cucumber": ["https://cdn.dummyjson.com/products/images/groceries/Cucumber/1.png"],
  "Dog Food": ["https://cdn.dummyjson.com/products/images/groceries/Dog%20Food/1.png"],
  "Bell Pepper": ["https://cdn.dummyjson.com/products/images/groceries/Green%20Bell%20Pepper/1.png"],
  "Chili": ["https://cdn.dummyjson.com/products/images/groceries/Green%20Chili%20Pepper/1.png"],
  "Honey": ["https://cdn.dummyjson.com/products/images/groceries/Honey%20Jar/1.png"],
  "Ice Cream": ["https://cdn.dummyjson.com/products/images/groceries/Ice%20Cream/1.png"],
  "Juice": ["https://cdn.dummyjson.com/products/images/groceries/Juice/1.png"],
  "Kiwi": ["https://cdn.dummyjson.com/products/images/groceries/Kiwi/1.png"],
  "Lemon": ["https://cdn.dummyjson.com/products/images/groceries/Lemon/1.png"],
  "Strawberry": ["https://cdn.dummyjson.com/products/images/groceries/Strawberry/1.png"],
  "Water": ["https://cdn.dummyjson.com/products/images/groceries/Water/1.png"],
  "Generic": [
    "https://cdn.dummyjson.com/products/images/groceries/Milk/1.png",
    "https://cdn.dummyjson.com/products/images/groceries/Juice/1.png",
    "https://cdn.dummyjson.com/products/images/groceries/Cooking%20Oil/1.png"
  ]
};

const CATEGORIES = [
  "Fresh Fruits", "Fresh Vegetables", "Dairy", "Bread & Bakery",
  "Rice, Atta & Dal", "Oils & Ghee", "Tea & Coffee", "Juices & Cold Drinks",
  "Snacks & Namkeen", "Chocolates & Sweets", "Breakfast & Cereals", 
  "Sauces & Spreads", "Instant Food", "Frozen Food", "Dry Fruits & Nuts", 
  "Spices & Masala", "Chicken, Meat & Fish", "Cleaning Essentials", 
  "Personal Care", "Baby Care", "Pet Care", "Kitchen Essentials"
];

// Helper to generate an ID
const generateId = () => Math.random().toString(36).substring(2, 10);
const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const catalog: any = {
  brands: [],
  categories: [],
  subcategories: [],
  products: []
};

// 1. Generate Brands
BRANDS.forEach(brand => {
  catalog.brands.push({
    id: generateId(),
    name: brand,
    // Using a reliable generic fallback for logos if needed, or just a placeholder since we aren't using Faker
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(brand)}&background=random&color=fff&size=200`
  });
});

// 2. Generate Categories & Subcategories
const SUBCAT_MAP: Record<string, string[]> = {
  "Fresh Fruits": ["Apples & Pears", "Bananas & Melons", "Citrus & Exotic", "Berries"],
  "Fresh Vegetables": ["Daily Veggies", "Leafy Greens", "Root Vegetables", "Organic Veg"],
  "Dairy": ["Milk", "Curd & Yogurt", "Paneer & Cheese", "Butter & Cream"],
  "Bread & Bakery": ["Breads & Buns", "Cakes & Muffins", "Toast & Khari"],
  "Rice, Atta & Dal": ["Basmati Rice", "Wheat Atta", "Dals & Pulses", "Millet"],
  "Oils & Ghee": ["Refined Oil", "Mustard Oil", "Olive Oil", "Pure Ghee"],
  "Tea & Coffee": ["Premium Tea", "Green Tea", "Instant Coffee", "Filter Coffee"],
  "Juices & Cold Drinks": ["Fruit Juices", "Soft Drinks", "Energy Drinks", "Mineral Water"],
  "Snacks & Namkeen": ["Potato Chips", "Bhujia & Mixtures", "Nachos & Popcorn"],
  "Chocolates & Sweets": ["Milk Chocolate", "Dark Chocolate", "Indian Sweets", "Candies"],
  "Breakfast & Cereals": ["Oats & Muesli", "Corn Flakes", "Pancake Mix", "Honey"],
  "Sauces & Spreads": ["Tomato Ketchup", "Mayonnaise", "Peanut Butter", "Jams"],
  "Instant Food": ["Noodles & Pasta", "Soups", "Ready to Eat", "Dessert Mixes"],
  "Frozen Food": ["Ice Creams", "Frozen Peas", "Frozen Snacks", "Frozen Paratha"],
  "Dry Fruits & Nuts": ["Almonds & Cashews", "Raisins & Figs", "Mixed Nuts"],
  "Spices & Masala": ["Whole Spices", "Powdered Spices", "Blended Masala"],
  "Chicken, Meat & Fish": ["Fresh Chicken", "Mutton", "Fish & Seafood", "Eggs"],
  "Cleaning Essentials": ["Detergents", "Dishwash", "Floor Cleaners", "Toilet Cleaners"],
  "Personal Care": ["Soaps & Body Wash", "Hair Care", "Oral Care", "Skin Care"],
  "Baby Care": ["Baby Diapers", "Baby Food", "Baby Skincare"],
  "Pet Care": ["Dog Food", "Cat Food", "Pet Grooming"],
  "Kitchen Essentials": ["Foil & Cling Film", "Tissue Papers", "Garbage Bags"]
};

CATEGORIES.forEach(catName => {
  const catId = generateId();
  catalog.categories.push({
    id: catId,
    name: catName,
    slug: slugify(catName),
    icon: BASE_IMAGES["Generic"][0], // Use real dummyjson image as generic icon
    image: BASE_IMAGES["Generic"][1], 
  });

  SUBCAT_MAP[catName]?.forEach(subName => {
    catalog.subcategories.push({
      id: generateId(),
      categoryId: catId,
      name: subName,
      slug: slugify(subName)
    });
  });
});

// 3. Generate 1000+ Products Programmatically using logical combinations
let productCount = 0;

const getRandomBrand = () => catalog.brands[Math.floor(Math.random() * catalog.brands.length)];
const getRandomEl = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mapping specific subcategories to base images
const getImageForSubcat = (subName: string) => {
  const lower = subName.toLowerCase();
  if (lower.includes('milk')) return BASE_IMAGES["Milk"][0];
  if (lower.includes('apple') || lower.includes('fruit')) return BASE_IMAGES["Apple"][0];
  if (lower.includes('egg')) return BASE_IMAGES["Eggs"][0];
  if (lower.includes('chicken')) return BASE_IMAGES["Chicken"][0];
  if (lower.includes('fish') || lower.includes('sea')) return BASE_IMAGES["Fish"][0];
  if (lower.includes('mutton') || lower.includes('meat')) return BASE_IMAGES["Beef"][0];
  if (lower.includes('oil') || lower.includes('ghee')) return BASE_IMAGES["Oil"][0];
  if (lower.includes('veg')) return BASE_IMAGES["Cucumber"][0];
  if (lower.includes('dog') || lower.includes('pet')) return BASE_IMAGES["Dog Food"][0];
  if (lower.includes('chili') || lower.includes('spice')) return BASE_IMAGES["Chili"][0];
  if (lower.includes('honey')) return BASE_IMAGES["Honey"][0];
  if (lower.includes('ice cream') || lower.includes('frozen')) return BASE_IMAGES["Ice Cream"][0];
  if (lower.includes('juice') || lower.includes('drink')) return BASE_IMAGES["Juice"][0];
  if (lower.includes('water')) return BASE_IMAGES["Water"][0];
  return getRandomEl(BASE_IMAGES["Generic"]);
};

const variants = [
  "500g", "1kg", "2kg", "5kg", "250g", "100g", "50g",
  "1L", "500ml", "2L", "5L", "200ml",
  "Pack of 1", "Pack of 2", "Pack of 4", "Combo Pack"
];

catalog.subcategories.forEach((subcat: any) => {
  // Generate 15-20 products per subcategory (15 * 60 subcats = ~900+ products, we have 70+ subcats -> >1000 products)
  const numProducts = getRandomInt(15, 22);
  
  for (let i = 0; i < numProducts; i++) {
    const brand = getRandomBrand();
    const variant = getRandomEl(variants);
    
    // Creating realistic names based on Brand + Subcategory + Variant
    let baseName = subcat.name.split(' & ')[0].replace(/s$/, ''); // e.g. "Apples & Pears" -> "Apple"
    if (baseName === "Daily Veggie") baseName = "Fresh Tomato";
    if (baseName === "Leafy Green") baseName = "Fresh Spinach";
    if (baseName === "Root Vegetable") baseName = "Fresh Potato";
    
    const productName = `${brand.name} Premium ${baseName} ${variant}`;
    const price = getRandomInt(20, 500);
    const hasDiscount = Math.random() > 0.4;
    const discount = hasDiscount ? getRandomInt(5, 40) : 0;
    const compareAt = hasDiscount ? Math.round(price * (1 + discount / 100)) : null;

    catalog.products.push({
      id: generateId(),
      name: productName,
      slug: slugify(productName) + '-' + generateId(),
      description: `Premium quality ${baseName} brought to you by ${brand.name}. Carefully sourced and packed for the best experience.`,
      brandId: brand.id,
      categoryId: subcat.categoryId,
      subcategoryId: subcat.id,
      sku: `${brand.name.substring(0, 3).toUpperCase()}${getRandomInt(10000, 99999)}`,
      barcode: `${getRandomInt(100000000000, 999999999999)}`,
      price,
      compareAt,
      discount,
      images: [getImageForSubcat(subcat.name), getImageForSubcat(subcat.name)],
      ingredients: `Pure ${baseName}, Natural Preservatives.`,
      nutritionFacts: [
        { name: "Calories", value: `${getRandomInt(50, 500)} kcal` },
        { name: "Protein", value: `${getRandomInt(0, 30)}g` },
        { name: "Carbs", value: `${getRandomInt(0, 100)}g` },
        { name: "Fat", value: `${getRandomInt(0, 40)}g` }
      ],
      expiry: `${getRandomInt(1, 24)} Months`,
      storage: getRandomEl(["Keep in a cool dry place", "Refrigerate after opening", "Store below -18°C"]),
      unit: variant.replace(/[0-9]/g, ''),
      weight: variant.replace(/[^0-9]/g, ''),
      rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
      reviews: getRandomInt(10, 2000),
      deliveryTime: getRandomEl(["8 MINS", "15 MINS", "NEXT DAY", "2 DAYS"]),
      inStock: Math.random() > 0.1,
      stockQty: getRandomInt(0, 100),
      country: "India",
      isOrganic: Math.random() > 0.8,
    });
    productCount++;
  }
});

console.log(`Generated ${productCount} real grocery products!`);
const OUT_FILE = './src/lib/catalog.json';
fs.writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2));
console.log(`Successfully wrote to ${OUT_FILE}`);
