const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../src/lib/catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Helper to generate a random price within a range
function getRandomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Adjust price slightly based on organic status, premium brand, or discount
function applyModifiers(price, product) {
  let modifiedPrice = price;
  
  if (product.isOrganic) {
    modifiedPrice *= 1.3; // 30% premium for organic
  }
  
  // Make it look like a real price (e.g., ending in 9, 5, or 0)
  modifiedPrice = Math.floor(modifiedPrice);
  
  // Add some realistic endings
  if (modifiedPrice > 100) {
    const remainder = modifiedPrice % 10;
    if (remainder > 5) modifiedPrice = modifiedPrice - remainder + 9;
    else if (remainder > 0) modifiedPrice = modifiedPrice - remainder + 5;
  }
  
  return modifiedPrice;
}

let modifiedCount = 0;

if (Array.isArray(catalog.products)) {
  catalog.products = catalog.products.map(product => {
    let newPrice = 100;
    const nameLower = product.name.toLowerCase();
    
    // Category mapping
    const category = catalog.categories.find(c => c.id === product.categoryId);
    const catName = category ? category.name : "";
    
    if (catName === 'Dairy & Eggs') {
      if (nameLower.includes('milk')) {
        if (nameLower.includes('500ml') || product.weight === '500' || product.weight === '500ml') {
          newPrice = getRandomPrice(28, 38);
        } else {
          newPrice = getRandomPrice(55, 75); // Assume 1L default
        }
      } else if (nameLower.includes('paneer')) {
        newPrice = getRandomPrice(90, 140);
      } else if (nameLower.includes('butter')) {
        newPrice = getRandomPrice(55, 75);
      } else if (nameLower.includes('cheese')) {
        newPrice = getRandomPrice(110, 350);
      } else if (nameLower.includes('egg')) {
        newPrice = getRandomPrice(60, 90);
      } else {
        newPrice = getRandomPrice(50, 200);
      }
    } else if (catName === 'Fresh Vegetables') {
      newPrice = getRandomPrice(20, 180);
    } else if (catName === 'Fresh Fruits') {
      newPrice = getRandomPrice(40, 300);
    } else if (catName === 'Bread & Bakery') {
      newPrice = getRandomPrice(25, 250);
    } else if (catName === 'Snacks & Namkeen') {
      newPrice = getRandomPrice(10, 150);
    } else if (catName === 'Rice, Atta & Dal') {
      if (nameLower.includes('rice') || nameLower.includes('basmati')) {
        newPrice = getRandomPrice(300, 900); // For larger packs, typically 5kg
        product.weight = "5";
        product.unit = "kg";
      } else if (nameLower.includes('atta') || nameLower.includes('flour')) {
        newPrice = getRandomPrice(220, 450); // For 5kg
        product.weight = "5";
        product.unit = "kg";
      } else if (nameLower.includes('dal') || nameLower.includes('lentil')) {
        newPrice = getRandomPrice(80, 200);
      } else {
        newPrice = getRandomPrice(100, 500);
      }
    } else if (catName === 'Oils & Ghee') {
      if (nameLower.includes('ghee')) {
        newPrice = getRandomPrice(500, 800);
      } else {
        newPrice = getRandomPrice(120, 250);
      }
    } else if (catName === 'Chocolates & Sweets') {
      newPrice = getRandomPrice(20, 350);
    } else if (catName === 'Tea & Coffee') {
      newPrice = getRandomPrice(150, 450);
    } else if (catName === 'Juices & Cold Drinks') {
      newPrice = getRandomPrice(40, 120);
    } else if (catName === 'Spices & Masala') {
      newPrice = getRandomPrice(40, 150);
    } else {
      // Fallback
      newPrice = getRandomPrice(50, 400);
    }

    newPrice = applyModifiers(newPrice, product);
    product.price = newPrice;
    
    // Set realistic discount if applicable
    if (product.discount && product.discount > 0) {
      product.compareAt = Math.floor(newPrice / (1 - product.discount / 100));
      // Round compareAt nicely
      if (product.compareAt > 100) {
        const remainder = product.compareAt % 10;
        product.compareAt = product.compareAt - remainder + 9;
      }
    } else {
      product.compareAt = null;
    }
    
    modifiedCount++;
    return product;
  });
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Successfully applied realistic Indian pricing to ${modifiedCount} products!`);
