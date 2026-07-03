import avocado from "@/assets/prod-avocado.jpg";
import sourdough from "@/assets/prod-sourdough.jpg";
import tomatoes from "@/assets/prod-tomatoes.jpg";
import oatmilk from "@/assets/prod-oatmilk.jpg";
import apples from "@/assets/prod-apples.jpg";
import ribeye from "@/assets/prod-ribeye.jpg";
import grapes from "@/assets/prod-grapes.jpg";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: "Fruits" | "Vegetables" | "Dairy" | "Bakery" | "Butcher" | "Drinks";
  price: number;
  compareAt?: number;
  image: string;
  tag?: "Organic" | "Vegan" | "Hot Deal" | "Bestseller" | null;
  rating: number;
  reviews: number;
  description: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "hass-avocado",
    name: "Ripe Hass Avocados",
    subtitle: "3 units · 450g",
    category: "Fruits",
    price: 4.5,
    compareAt: 5.8,
    image: avocado,
    tag: "Hot Deal",
    rating: 4.8,
    reviews: 214,
    description:
      "Hand-picked Hass avocados, delivered at peak ripeness. Buttery texture, perfect for toast, guacamole, or a mid-day snack.",
  },
  {
    id: "wild-sourdough",
    name: "Wild Sourdough Loaf",
    subtitle: "800g · baked today",
    category: "Bakery",
    price: 6.2,
    image: sourdough,
    tag: "Bestseller",
    rating: 4.9,
    reviews: 512,
    description:
      "48-hour cold-fermented sourdough with a crackly crust and open crumb. Baked before sunrise by our neighborhood bakers.",
  },
  {
    id: "heirloom-tomatoes",
    name: "Heirloom Tomatoes",
    subtitle: "Mixed variety · 1kg",
    category: "Vegetables",
    price: 5.9,
    image: tomatoes,
    tag: "Organic",
    rating: 4.7,
    reviews: 128,
    description:
      "A rainbow mix of heirloom tomatoes from upstate growers. Peak-of-season sweetness, no cold storage.",
  },
  {
    id: "oat-milk",
    name: "Organic Oat Milk",
    subtitle: "Unsweetened · 1L",
    category: "Drinks",
    price: 3.8,
    image: oatmilk,
    tag: "Vegan",
    rating: 4.6,
    reviews: 302,
    description:
      "Creamy organic oat milk with zero added sugar. Barista-friendly texture, perfect for lattes and cereal.",
  },
  {
    id: "pink-lady-apples",
    name: "Pink Lady Apples",
    subtitle: "6 unit bag · 800g",
    category: "Fruits",
    price: 4.2,
    image: apples,
    rating: 4.5,
    reviews: 96,
    description:
      "Crisp, sweet-tart Pink Lady apples. Perfect crunch for lunchboxes, pies, and cheese boards.",
  },
  {
    id: "grass-fed-ribeye",
    name: "Grass-Fed Ribeye",
    subtitle: "Pasture raised · 250g",
    category: "Butcher",
    price: 14.0,
    compareAt: 16.5,
    image: ribeye,
    tag: "Hot Deal",
    rating: 4.9,
    reviews: 78,
    description:
      "Dry-aged, grass-fed ribeye from a family ranch. Rich marbling, deep flavor, ready for the pan.",
  },
  {
    id: "concord-grapes",
    name: "Concord Grapes",
    subtitle: "1lb · fresh picked",
    category: "Fruits",
    price: 3.2,
    compareAt: 5.3,
    image: grapes,
    tag: "Hot Deal",
    rating: 4.4,
    reviews: 44,
    description:
      "Sweet, aromatic Concord grapes with that unmistakable jammy flavor. Great for snacking or juicing.",
  },
];

export const CATEGORIES = [
  { name: "Fruits", emoji: "🍎", tint: "bg-orange-50" },
  { name: "Vegetables", emoji: "🥦", tint: "bg-emerald-50" },
  { name: "Dairy", emoji: "🥛", tint: "bg-sky-50" },
  { name: "Bakery", emoji: "🥖", tint: "bg-amber-50" },
  { name: "Butcher", emoji: "🥩", tint: "bg-rose-50" },
  { name: "Drinks", emoji: "🧃", tint: "bg-violet-50" },
] as const;

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
