import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, ChefHat, Leaf, Flame, UtensilsCrossed, Clock, Star, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeService, RecipeFilters } from "@/lib/services/recipe-service";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { Recipe } from "@/lib/recipe-data";

export const Route = createFileRoute("/recipes/")({
  component: RecipesSearchPage,
});

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function RecipesSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = usePersistedState("recipe_query", "");
  const debouncedQuery = useDebounceValue(query, 300);
  
  const [category, setCategory] = usePersistedState<string | undefined>("recipe_cat", undefined);
  const [diet, setDiet] = usePersistedState<string | undefined>("recipe_diet", undefined);
  const [difficulty, setDifficulty] = usePersistedState<"Easy" | "Medium" | "Hard" | undefined>("recipe_diff", undefined);
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showFilters, setShowFilters] = usePersistedState("recipe_showFilters", false);

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      const results = await RecipeService.searchRecipes({
        query: debouncedQuery,
        category,
        diet,
        difficulty
      });
      setRecipes(results);
      setLoading(false);
    }
    fetchRecipes();
  }, [debouncedQuery, category, diet, difficulty]);

  const categories = ["Indian", "Breakfast", "Snacks", "Italian", "Desserts"];
  
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C2C2E] tracking-tight mb-4 flex items-center justify-center gap-3">
            <ChefHat className="size-10 md:size-12 text-emerald-500" />
            Discover Recipes
          </h1>
          <p className="text-slate-500 text-lg">Find the perfect dish for any occasion</p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-10 sticky top-24 z-30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input 
                type="text" 
                placeholder="Search by recipe name, ingredient, or cuisine..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium placeholder:font-normal"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="size-5" />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors ${showFilters ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <SlidersHorizontal className="size-5" />
              Filters
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2 border-t border-slate-100 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Cuisine / Category</h3>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setCategory(undefined)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${!category ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        All
                      </button>
                      {categories.map(c => (
                        <button 
                          key={c}
                          onClick={() => setCategory(c === category ? undefined : c)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${category === c ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diet Filter */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dietary</h3>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setDiet(diet === 'Healthy' ? undefined : 'Healthy')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${diet === 'Healthy' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                      >
                        <Leaf className="size-4" /> Healthy
                      </button>
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Difficulty</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Easy", "Medium", "Hard"].map((d) => (
                        <button 
                          key={d}
                          onClick={() => setDifficulty(difficulty === d ? undefined : d as any)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${difficulty === d ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-slate-500">Searching recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Search className="size-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No recipes found</h3>
            <p className="text-slate-500 max-w-md">Try adjusting your filters or searching for something else.</p>
            <button 
              onClick={() => { setQuery(''); setCategory(undefined); setDiet(undefined); setDifficulty(undefined); }}
              className="mt-6 text-emerald-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={recipe.id}
                className="group cursor-pointer"
                onClick={() => navigate({ to: '/recipe/$id', params: { id: recipe.id } })}
              >
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 h-full flex flex-col">
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    <img src={recipe.img} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                      <Clock className="size-3.5 text-slate-600" />
                      <span className="text-xs font-bold text-[#2C2C2E]">{recipe.time}</span>
                    </div>

                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                       <Star className="size-3.5 text-amber-400 fill-amber-400" />
                       <span className="text-xs font-bold text-white">{recipe.rating}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-[#2C2C2E] mb-2 line-clamp-1">{recipe.name}</h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-4">{recipe.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Difficulty</span>
                          <span className={`text-xs font-bold ${recipe.difficulty === 'Hard' ? 'text-rose-600' : recipe.difficulty === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>{recipe.difficulty}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calories</span>
                          <span className="text-xs font-bold text-[#2C2C2E] flex items-center gap-1"><Flame className="size-3 text-orange-500" /> {recipe.calories}</span>
                        </div>
                      </div>
                      
                      <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <ArrowRight className="size-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
