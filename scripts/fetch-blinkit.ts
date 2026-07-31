import fs from 'fs';
import path from 'path';

const API_KEY = '9c94ce86-6594-441f-bf38-8bb73e2b9256';
const BASE_URL = 'https://api.quickcommerceapi.com/v1/search?platform=BlinkIt&lat=12.90&lon=77.66&q=';

// A robust list of queries mapped to our categories and subcategories
const QUERIES = [
  { q: "Milk", category: "Dairy & Eggs", subcategory: "Milk" },
  { q: "Curd", category: "Dairy & Eggs", subcategory: "Curd & Yogurt" },
  { q: "Paneer", category: "Dairy & Eggs", subcategory: "Paneer & Cheese" },
  { q: "Cheese", category: "Dairy & Eggs", subcategory: "Paneer & Cheese" },
  { q: "Butter", category: "Dairy & Eggs", subcategory: "Butter & Cream" },
  { q: "Eggs", category: "Dairy & Eggs", subcategory: "Eggs" },
  
  { q: "Apple", category: "Fresh Fruits", subcategory: "Apples & Pears" },
  { q: "Banana", category: "Fresh Fruits", subcategory: "Bananas & Melons" },
  { q: "Orange", category: "Fresh Fruits", subcategory: "Citrus & Exotic" },
  
  { q: "Onion", category: "Fresh Vegetables", subcategory: "Daily Veggies" },
  { q: "Potato", category: "Fresh Vegetables", subcategory: "Root Vegetables" },
  { q: "Tomato", category: "Fresh Vegetables", subcategory: "Daily Veggies" },
  { q: "Coriander", category: "Fresh Vegetables", subcategory: "Leafy Greens" },
  
  { q: "Bread", category: "Bread & Bakery", subcategory: "Breads & Buns" },
  { q: "Cake", category: "Bread & Bakery", subcategory: "Cakes & Muffins" },
  { q: "Toast", category: "Bread & Bakery", subcategory: "Toast & Khari" },
  
  { q: "Basmati Rice", category: "Rice, Atta & Dal", subcategory: "Basmati Rice" },
  { q: "Atta", category: "Rice, Atta & Dal", subcategory: "Wheat Atta" },
  { q: "Toor Dal", category: "Rice, Atta & Dal", subcategory: "Dals & Pulses" },
  { q: "Moong Dal", category: "Rice, Atta & Dal", subcategory: "Dals & Pulses" },
  
  { q: "Refined Oil", category: "Oils & Ghee", subcategory: "Refined Oil" },
  { q: "Mustard Oil", category: "Oils & Ghee", subcategory: "Mustard Oil" },
  { q: "Olive Oil", category: "Oils & Ghee", subcategory: "Olive Oil" },
  { q: "Ghee", category: "Oils & Ghee", subcategory: "Pure Ghee" },
  
  { q: "Tea", category: "Tea & Coffee", subcategory: "Premium Tea" },
  { q: "Green Tea", category: "Tea & Coffee", subcategory: "Green Tea" },
  { q: "Coffee", category: "Tea & Coffee", subcategory: "Instant Coffee" },
  
  { q: "Juice", category: "Juices & Cold Drinks", subcategory: "Fruit Juices" },
  { q: "Cold Drink", category: "Juices & Cold Drinks", subcategory: "Soft Drinks" },
  { q: "Energy Drink", category: "Juices & Cold Drinks", subcategory: "Energy Drinks" },
  
  { q: "Chips", category: "Snacks & Namkeen", subcategory: "Potato Chips" },
  { q: "Bhujia", category: "Snacks & Namkeen", subcategory: "Bhujia & Mixtures" },
  { q: "Popcorn", category: "Snacks & Namkeen", subcategory: "Nachos & Popcorn" },
  
  { q: "Chocolate", category: "Chocolates & Sweets", subcategory: "Milk Chocolate" },
  { q: "Dark Chocolate", category: "Chocolates & Sweets", subcategory: "Dark Chocolate" },
  
  { q: "Oats", category: "Breakfast & Cereals", subcategory: "Oats & Muesli" },
  { q: "Corn Flakes", category: "Breakfast & Cereals", subcategory: "Corn Flakes" },
  { q: "Honey", category: "Breakfast & Cereals", subcategory: "Honey" },
  
  { q: "Ketchup", category: "Sauces & Spreads", subcategory: "Tomato Ketchup" },
  { q: "Mayonnaise", category: "Sauces & Spreads", subcategory: "Mayonnaise" },
  { q: "Peanut Butter", category: "Sauces & Spreads", subcategory: "Peanut Butter" },
  
  { q: "Noodles", category: "Instant Food", subcategory: "Noodles & Pasta" },
  { q: "Soup", category: "Instant Food", subcategory: "Soups" },
  
  { q: "Ice Cream", category: "Frozen Food", subcategory: "Ice Creams" },
  { q: "Frozen Peas", category: "Frozen Food", subcategory: "Frozen Peas" },
  
  { q: "Almonds", category: "Dry Fruits & Nuts", subcategory: "Almonds & Cashews" },
  { q: "Cashews", category: "Dry Fruits & Nuts", subcategory: "Almonds & Cashews" },
  { q: "Raisins", category: "Dry Fruits & Nuts", subcategory: "Raisins & Figs" },
  
  { q: "Spices", category: "Spices & Masala", subcategory: "Powdered Spices" },
  { q: "Garam Masala", category: "Spices & Masala", subcategory: "Blended Masala" },
  
  { q: "Chicken", category: "Chicken, Meat & Fish", subcategory: "Fresh Chicken" },
  { q: "Mutton", category: "Chicken, Meat & Fish", subcategory: "Mutton" },
  
  { q: "Detergent", category: "Cleaning Essentials", subcategory: "Detergents" },
  { q: "Dishwash", category: "Cleaning Essentials", subcategory: "Dishwash" },
  { q: "Floor Cleaner", category: "Cleaning Essentials", subcategory: "Floor Cleaners" },
  
  { q: "Soap", category: "Personal Care", subcategory: "Soaps & Body Wash" },
  { q: "Shampoo", category: "Personal Care", subcategory: "Hair Care" },
  { q: "Toothpaste", category: "Personal Care", subcategory: "Oral Care" },
  
  { q: "Diapers", category: "Baby Care", subcategory: "Baby Diapers" },
  { q: "Dog Food", category: "Pet Care", subcategory: "Dog Food" },
  { q: "Tissue Paper", category: "Kitchen Essentials", subcategory: "Tissue Papers" }
];

const generateId = () => Math.random().toString(36).substring(2, 10);
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function fetchAll() {
  const catalog = {
    brands: [],
    categories: [],
    subcategories: [],
    products: []
  };

  const brandMap = new Map();
  const categoryMap = new Map();
  const subcategoryMap = new Map();
  
  console.log("Starting data fetch from QuickCommerce API...");
  
  for (const qObj of QUERIES) {
    try {
      console.log(`Fetching: ${qObj.q}...`);
      const response = await fetch(BASE_URL + encodeURIComponent(qObj.q), {
        headers: { 'X-API-Key': API_KEY }
      });
      const data = await response.json();
      
      if (!data.data || !data.data.products) continue;
      
      // Ensure category exists
      if (!categoryMap.has(qObj.category)) {
        const catId = generateId();
        const catSlug = slugify(qObj.category);
        categoryMap.set(qObj.category, catId);
        catalog.categories.push({
          id: catId,
          name: qObj.category,
          slug: catSlug,
          icon: data.data.products[0]?.images[0] || "",
          image: data.data.products[0]?.images[0] || "",
        });
      }
      const catId = categoryMap.get(qObj.category);
      
      // Ensure subcategory exists
      if (!subcategoryMap.has(qObj.subcategory)) {
        const subId = generateId();
        subcategoryMap.set(qObj.subcategory, subId);
        catalog.subcategories.push({
          id: subId,
          categoryId: catId,
          name: qObj.subcategory,
          slug: slugify(qObj.subcategory)
        });
      }
      const subId = subcategoryMap.get(qObj.subcategory);
      
      // Process products
      for (const item of data.data.products) {
        // Ensure brand exists
        const brandName = item.brand || "BlinkIt Essentials";
        if (!brandMap.has(brandName)) {
          const bId = generateId();
          brandMap.set(brandName, bId);
          catalog.brands.push({
            id: bId,
            name: brandName,
            logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(brandName)}&background=random&color=fff&size=200`
          });
        }
        const bId = brandMap.get(brandName);
        
        // Prevent exact duplicates
        if (catalog.products.some(p => p.sku === item.id)) continue;
        
        const price = item.mrp || 100;
        const offerPrice = item.offer_price || price;
        const discount = price > offerPrice ? Math.round(((price - offerPrice) / price) * 100) : 0;
        
        catalog.products.push({
          id: generateId(),
          name: item.name,
          slug: slugify(item.name) + '-' + generateId(),
          description: `Premium ${item.name} by ${brandName}. Sourced fresh and delivered quickly.`,
          brandId: bId,
          categoryId: catId,
          subcategoryId: subId,
          sku: item.id, // Using real blinkit ID as SKU
          barcode: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
          price: offerPrice,
          compareAt: price > offerPrice ? price : null,
          discount: discount,
          images: item.images,
          ingredients: "Refer to physical packaging for full ingredients list.",
          nutritionFacts: [
            { name: "Calories", value: `${Math.floor(Math.random() * 400) + 50} kcal` },
            { name: "Protein", value: `${Math.floor(Math.random() * 20)}g` },
            { name: "Carbs", value: `${Math.floor(Math.random() * 60)}g` },
          ],
          expiry: "Check package for expiry",
          storage: "Store in a cool dry place",
          unit: item.quantity.replace(/[0-9.]/g, '').trim() || "pack",
          weight: item.quantity.replace(/[^0-9.]/g, '') || "1",
          rating: item.rating ? item.rating.toFixed(1) : (Math.random() * 1.5 + 3.5).toFixed(1),
          reviews: item.rating_count || Math.floor(Math.random() * 500) + 10,
          deliveryTime: item.platform?.sla || "10 mins",
          inStock: item.inventory > 0 || item.available,
          stockQty: item.inventory || Math.floor(Math.random() * 50) + 5,
          country: "India",
          isOrganic: item.name.toLowerCase().includes("organic"),
        });
      }
      
    } catch (err) {
      console.error(`Failed to fetch ${qObj.q}:`, err.message);
    }
  }

  console.log(`\nSuccessfully compiled ${catalog.products.length} REAL products!`);
  console.log(`Extracted ${catalog.brands.length} real brands.`);
  
  const OUT_FILE = './src/lib/catalog.json';
  fs.writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2));
  console.log(`Data saved to ${OUT_FILE}`);
}

fetchAll();
