const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./src/lib/catalog.json', 'utf8'));

const initialCount = data.products.length;

// Remove all electronics
const keywordsToRemove = [
    "usb", "cable", "adapter", "charger", "lightning", "type c", "20w", "60w", "power adapter",
    "macbook", "iphone", "watch", "ipad", "airpods", "airtag", "earpods", "gps",
    "headphone", "bluetooth", "smartphone", "laptop", "tablet", "monitor", "speaker",
    "power bank", "smartwatch", "case", "cover", "screen protector", "keyboard", "mouse",
    "apple tv", "imac", "mac mini", "mac studio", "pencil", "mag-safe", "magsafe", "wifi", "cellular", "playstation", "xbox", "nintendo"
];

data.products = data.products.filter(p => {
    const nameStr = p.name.toLowerCase();
    const isElectronic = keywordsToRemove.some(k => nameStr.includes(k));
    if (isElectronic) {
        console.log("Removed: " + p.name);
        return false;
    }
    return true;
});

const removedCount = initialCount - data.products.length;
console.log(`\nRemoved ${removedCount} items.`);

fs.writeFileSync('./src/lib/catalog.json', JSON.stringify(data, null, 2));
console.log('Saved cleaned catalog.');
