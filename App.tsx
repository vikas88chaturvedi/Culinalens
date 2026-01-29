import React, { useState, useRef } from 'react';
import { RecipeCard } from './components/RecipeCard';
import { Navigation } from './components/Navigation';
import { MealPlanner } from './components/MealPlanner';
import { identifyFoodAndGetRecipe, getRecipeByName, getRecipesByIngredients } from './services/geminiService';
import { Recipe, SearchMode, LoadingState, MealPlan, DayOfWeek, MealType } from './types';
import { Upload, X, Loader2, Sparkles, ChefHat, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<SearchMode>('camera');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  // Ingredients state
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');

  // Meal Plan State
  const [mealPlan, setMealPlan] = useState<MealPlan>({} as MealPlan);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    setError(null);
    if (newMode !== 'planner' && newMode !== 'search' && newMode !== 'pantry') {
        // Optional: clear recipes if switching back to camera to start fresh
        // setRecipes([]);
    }
    // We don't clear recipes automatically when switching to Planner so users can go back.
  };

  const handleError = (err: unknown) => {
    console.error(err);
    setError(err instanceof Error ? err.message : "An unexpected error occurred");
    setLoading({ isLoading: false, message: '' });
  };

  // --- HANDLERS ---

  const handleAddToMealPlan = (recipe: Recipe, day: DayOfWeek, type: MealType) => {
    setMealPlan(prev => {
      const currentDayMeals = prev[day] || [];
      // Simple duplicate check
      const exists = currentDayMeals.some(m => m.mealType === type && m.recipe.id === recipe.id);
      if (exists) return prev;

      return {
        ...prev,
        [day]: [...currentDayMeals, { recipe, mealType: type }]
      };
    });
    // Visual feedback could be added here (toast)
    alert(`Added ${recipe.title} to ${day} ${type}`);
  };

  const handleRemoveFromMealPlan = (day: DayOfWeek, type: MealType, recipeId: string) => {
    setMealPlan(prev => {
      const currentDayMeals = prev[day] || [];
      return {
        ...prev,
        [day]: currentDayMeals.filter(item => !(item.mealType === type && item.recipe.id === recipeId))
      };
    });
  };

  const handleAddReview = (recipeId: string, rating: number, comment: string, userName: string) => {
      const newReview = {
          id: Math.random().toString(36).substr(2, 9),
          rating,
          comment,
          date: new Date().toISOString(),
          userName
      };

      setRecipes(prevRecipes => prevRecipes.map(r => {
          if (r.id === recipeId) {
              const updatedReviews = [...r.reviews, newReview];
              const avgRating = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) / updatedReviews.length;
              return { ...r, reviews: updatedReviews, rating: avgRating };
          }
          return r;
      }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading({ isLoading: true, message: 'Analyzing your food...' });
    setError(null);
    setRecipes([]);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        
        const recipe = await identifyFoodAndGetRecipe(base64Content, file.type);
        setRecipes([recipe]);
        setLoading({ isLoading: false, message: '' });
      };
      reader.readAsDataURL(file);
    } catch (e) {
      handleError(e);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading({ isLoading: true, message: 'Creating your recipe...' });
    setError(null);
    setRecipes([]);

    try {
      const recipe = await getRecipeByName(inputText);
      setRecipes([recipe]);
      setLoading({ isLoading: false, message: '' });
    } catch (e) {
      handleError(e);
    }
  };

  const handleIngredientSubmit = async () => {
    if (ingredients.length === 0) {
      setError("Please add at least one ingredient.");
      return;
    }

    setLoading({ isLoading: true, message: 'Dreaming up dishes...' });
    setError(null);
    setRecipes([]);

    try {
      const results = await getRecipesByIngredients(ingredients);
      setRecipes(results);
      setLoading({ isLoading: false, message: '' });
    } catch (e) {
      handleError(e);
    }
  };

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // --- RENDER HELPERS ---

  const renderCameraView = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
         onClick={() => fileInputRef.current?.click()}>
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Upload className="text-orange-500" size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Upload a Food Photo</h3>
      <p className="text-gray-500 text-center max-w-sm">
        Snap a picture of a dish, and our AI will identify it and write the recipe for you.
      </p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );

  const renderSearchView = () => (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. Spaghetti Carbonara, Falafel Wrap..."
          className="w-full px-6 py-4 text-lg rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="absolute right-2 top-2 bottom-2 bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </form>
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Type any dish name, and we'll generate a professional recipe.</p>
      </div>
    </div>
  );

  const renderPantryView = () => (
    <div className="max-w-xl mx-auto">
      <form onSubmit={addIngredient} className="flex gap-2 mb-6">
        <input
          type="text"
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          placeholder="Add an ingredient (e.g. Eggs, Spinach)"
          className="flex-grow px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          disabled={!ingredientInput.trim()}
          className="bg-gray-900 text-white px-4 rounded-xl hover:bg-gray-800 disabled:opacity-50"
        >
          <Plus size={24} />
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8 min-h-[60px]">
        {ingredients.length === 0 && (
          <span className="text-gray-400 text-sm italic w-full text-center py-4">
            No ingredients added yet. What's in your fridge?
          </span>
        )}
        {ingredients.map((ing, idx) => (
          <span key={idx} className="flex items-center gap-2 bg-orange-50 text-orange-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-orange-100 animate-fade-in">
            {ing}
            <button onClick={() => removeIngredient(idx)} className="hover:text-red-500">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      <button
        onClick={handleIngredientSubmit}
        disabled={ingredients.length === 0}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
      >
        <Sparkles size={20} />
        Find Recipes
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      <header className="pt-12 pb-6 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat className="text-orange-500" size={32} />
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Culina<span className="text-orange-500">Lens</span></h1>
        </div>
        <p className="text-gray-500">Your AI-powered kitchen companion</p>
      </header>

      <main className="container mx-auto px-4 pb-20 max-w-5xl">
        <Navigation currentMode={mode} onModeChange={handleModeChange} />

        {/* Input Area (Hidden in Planner Mode) */}
        {mode !== 'planner' && (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 mb-12 relative overflow-hidden">
            {loading.isLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-fade-in">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700 animate-pulse">{loading.message}</p>
              </div>
            )}

            {mode === 'camera' && renderCameraView()}
            {mode === 'search' && renderSearchView()}
            {mode === 'pantry' && renderPantryView()}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 animate-fade-in">
             <div className="w-2 h-2 rounded-full bg-red-500" />
             {error}
          </div>
        )}

        {/* Results Area */}
        {mode === 'planner' ? (
          <MealPlanner mealPlan={mealPlan} onRemoveFromPlan={handleRemoveFromMealPlan} />
        ) : (
          recipes.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
               <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">
                      {mode === 'pantry' ? 'Suggested Recipes' : 'Your Recipe'}
                  </h2>
                  <div className="h-px bg-gray-200 flex-grow ml-4"></div>
               </div>

              <div className={`grid grid-cols-1 ${recipes.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-8`}>
                  {recipes.map((recipe, index) => (
                      <div key={index} className="w-full">
                           <RecipeCard 
                              recipe={recipe} 
                              onAddToMealPlan={handleAddToMealPlan}
                              onAddReview={handleAddReview}
                           />
                      </div>
                  ))}
              </div>
            </div>
          )
        )}
      </main>
      
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-100 mt-auto">
        &copy; {new Date().getFullYear()} CulinaLens. Powered by Gemini.
      </footer>
    </div>
  );
};

export default App;