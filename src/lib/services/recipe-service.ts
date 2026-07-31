import { supabase } from '@/integrations/supabase/client';
import { Recipe, MOCK_RECIPES } from '../recipe-data';

export interface RecipeFilters {
  query?: string;
  category?: string;
  diet?: string;
  maxTime?: string; // e.g. "30 min"
  difficulty?: "Easy" | "Medium" | "Hard";
}

function mapRecipe(dbRecipe: any): Recipe {
  return {
    id: dbRecipe.id,
    name: dbRecipe.name,
    time: dbRecipe.time,
    difficulty: dbRecipe.difficulty as any,
    calories: dbRecipe.calories,
    protein: dbRecipe.protein,
    servings: dbRecipe.servings,
    rating: dbRecipe.rating,
    img: dbRecipe.img,
    description: dbRecipe.description,
    nutrition: dbRecipe.nutrition,
    ingredientsList: dbRecipe.ingredients_list,
    steps: dbRecipe.steps
  };
}

export const RecipeService = {
  /**
   * Fetch all recipes from the backend
   */
  async getAllRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Fallback to dummy data for all recipes');
      return Object.values(MOCK_RECIPES);
    }
    return data.map(mapRecipe);
  },

  /**
   * Fetch a recipe by its ID
   */
  async getRecipeById(id: string): Promise<Recipe | undefined> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('Fallback to dummy data for recipe:', id);
      return MOCK_RECIPES[id];
    }
    
    if (!data) {
       return MOCK_RECIPES[id];
    }
    
    return mapRecipe(data);
  },

  /**
   * Fetch featured recipes for the homepage
   */
  async getFeaturedRecipes(): Promise<Recipe[]> {
    const featuredIds = ['paneer-butter-masala', 'chicken-biryani', 'white-sauce-pasta', 'quinoa-salad', 'gulab-jamun', 'maggi', 'brownie', 'smoothie-bowl', 'french-fries', 'nachos', 'palak-paneer', 'chole-bhature'];
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .in('id', featuredIds)
      .limit(12);

    if (error) {
      console.error('Error fetching featured recipes:', error);
    }
    
    // If DB is empty, fallback to the dummy data module to ensure cards are shown
    if (!data || data.length === 0) {
      return Object.values(MOCK_RECIPES)
        .filter(r => featuredIds.includes(r.id))
        .slice(0, 12);
    }
    
    return data.map(mapRecipe);
  },

  /**
   * Search and filter recipes
   */
  async searchRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    let query = supabase.from('recipes').select('*');

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    const { data, error } = await query;
    let results: Recipe[] = [];

    if (error || !data || data.length === 0) {
      console.warn('Fallback to dummy data for searchRecipes');
      results = Object.values(MOCK_RECIPES);
    } else {
      results = data.map(mapRecipe);
    }

    if (filters.query && filters.query.trim() !== '') {
      const q = filters.query.toLowerCase().trim();
      results = results.filter(
        (r: Recipe) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.ingredientsList.some((i: any) => i.name.toLowerCase().includes(q))
      );
    }

    if (filters.diet === 'Healthy') {
      const healthyIds = ['quinoa-salad', 'greek-salad', 'sprouts-bowl', 'smoothie-bowl', 'oats'];
      results = results.filter((r: Recipe) => healthyIds.includes(r.id));
    }

    if (filters.category === 'Breakfast') {
      const breakfastIds = ['poha', 'upma', 'oats', 'sandwich', 'omelette', 'idli', 'dosa'];
      results = results.filter((r: Recipe) => breakfastIds.includes(r.id));
    } else if (filters.category === 'Snacks') {
      const snackIds = ['maggi', 'french-fries', 'garlic-bread', 'nachos', 'samosa', 'paneer-tikka'];
      results = results.filter((r: Recipe) => snackIds.includes(r.id));
    } else if (filters.category === 'Desserts') {
      const dessertIds = ['gulab-jamun', 'brownie', 'ice-cream-sundae', 'kheer', 'jalebi'];
      results = results.filter((r: Recipe) => dessertIds.includes(r.id));
    } else if (filters.category === 'Indian') {
      const indianIds = ['paneer-butter-masala', 'rajma-chawal', 'dal-makhani', 'biryani', 'palak-paneer', 'chole-bhature', 'veg-pulao', 'butter-chicken', 'egg-curry'];
      results = results.filter((r: Recipe) => indianIds.includes(r.id));
    } else if (filters.category === 'Italian') {
      const italianIds = ['white-sauce-pasta', 'red-sauce-pasta', 'alfredo-pasta', 'lasagna'];
      results = results.filter((r: Recipe) => italianIds.includes(r.id));
    }

    return results;
  }
};
