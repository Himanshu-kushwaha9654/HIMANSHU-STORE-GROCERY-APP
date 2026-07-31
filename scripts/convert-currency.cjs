const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../src/lib/catalog.json');
console.log('Reading catalog from:', catalogPath);

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Helper to make prices realistic in INR
function convertPrice(usdPrice) {
  if (!usdPrice) return usdPrice;
  // Multiply by 80 as a baseline conversion
  let inr = usdPrice * 80;
  
  // Round to nearest 9 or 99 to make it look like realistic retail pricing
  if (inr < 50) return Math.ceil(inr);
  if (inr < 200) return Math.floor(inr / 10) * 10 + 9; // e.g. 149
  if (inr < 1000) return Math.floor(inr / 50) * 50 - 1; // e.g. 249, 299, 499
  if (inr < 5000) return Math.floor(inr / 100) * 100 - 1; // e.g. 1499
  return Math.floor(inr / 500) * 500 - 1; // e.g. 4999
}

let modifiedCount = 0;

if (Array.isArray(catalog.products)) {
  catalog.products = catalog.products.map(product => {
    const oldPrice = product.price;
    const oldCompareAt = product.compareAt;
    
    product.price = convertPrice(oldPrice);
    if (oldCompareAt) {
      product.compareAt = convertPrice(oldCompareAt);
    }
    
    modifiedCount++;
    return product;
  });
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Successfully converted ${modifiedCount} products to INR pricing!`);
