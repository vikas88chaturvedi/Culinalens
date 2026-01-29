import React, { useState } from 'react';
import { Recipe, DayOfWeek, MealType } from '../types';
import { Clock, Flame, BarChart, ChefHat, Star, CalendarPlus, Check, MessageSquare } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onAddToMealPlan: (recipe: Recipe, day: DayOfWeek, type: MealType) => void;
  onAddReview: (recipeId: string, rating: number, comment: string, userName: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onAddToMealPlan, onAddReview }) => {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Dinner');
  
  const [ratingInput, setRatingInput] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userName, setUserName] = useState('');

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

  const handlePlanSubmit = () => {
    onAddToMealPlan(recipe, selectedDay, selectedMeal);
    setShowPlanForm(false);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingInput > 0 && reviewText.trim() && userName.trim()) {
      onAddReview(recipe.id, ratingInput, reviewText, userName);
      setRatingInput(0);
      setReviewText('');
      setUserName('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
        <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold font-serif mb-2">{recipe.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white/20 backdrop-blur-sm`}>
                {recipe.difficulty}
            </span>
        </div>
        <p className="text-orange-50 text-sm italic opacity-90 pr-12">{recipe.description}</p>
        
        {/* Quick Stats */}
        <div className="flex gap-4 mt-4 text-sm font-medium">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame size={16} />
            <span>{recipe.nutrition.calories}</span>
          </div>
          <div className="flex items-center gap-1">
             <Star size={16} className="fill-current text-yellow-300" />
             <span>{recipe.rating > 0 ? recipe.rating.toFixed(1) : 'New'}</span>
             <span className="opacity-75 text-xs ml-1">({recipe.reviews.length})</span>
          </div>
        </div>

        {/* Meal Plan Button */}
        <button 
          onClick={() => setShowPlanForm(!showPlanForm)}
          className="absolute bottom-4 right-4 bg-white text-orange-600 p-2 rounded-full shadow-lg hover:bg-orange-50 transition-colors"
          title="Add to Meal Plan"
        >
          <CalendarPlus size={20} />
        </button>
      </div>

      {/* Meal Plan Form Overlay */}
      {showPlanForm && (
        <div className="bg-orange-50 p-4 border-b border-orange-100 animate-fade-in">
          <h4 className="text-sm font-bold text-orange-800 mb-2">Add to Meal Plan</h4>
          <div className="flex flex-wrap gap-2 mb-3">
             <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                className="px-3 py-1.5 rounded-lg border border-orange-200 text-sm"
             >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
             <select 
                value={selectedMeal} 
                onChange={(e) => setSelectedMeal(e.target.value as MealType)}
                className="px-3 py-1.5 rounded-lg border border-orange-200 text-sm"
             >
                {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePlanSubmit}
              className="flex-1 bg-orange-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700"
            >
              Save to Plan
            </button>
            <button 
              onClick={() => setShowPlanForm(false)}
              className="px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Nutritional Info */}
      <div className="grid grid-cols-4 border-b border-gray-100 divide-x divide-gray-100 bg-gray-50/50">
        {[
          { label: 'Calories', val: recipe.nutrition.calories },
          { label: 'Protein', val: recipe.nutrition.protein },
          { label: 'Carbs', val: recipe.nutrition.carbs },
          { label: 'Fats', val: recipe.nutrition.fat },
        ].map((item, i) => (
          <div key={i} className="p-3 text-center">
            <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider">{item.label}</span>
            <span className="block text-sm font-semibold text-gray-700">{item.val}</span>
          </div>
        ))}
      </div>

      <div className="p-6 flex-grow flex flex-col md:flex-row gap-8">
        {/* Ingredients */}
        <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
          <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <BarChart size={20} className="text-orange-500" />
            Ingredients
          </h4>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                <div className="min-w-[6px] h-[6px] rounded-full bg-orange-400 mt-1.5" />
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="md:w-2/3">
          <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <ChefHat size={20} className="text-orange-500" />
            Instructions
          </h4>
          <div className="space-y-4">
            {recipe.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gray-50 p-6 border-t border-gray-100">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare size={18} /> Reviews
        </h4>
        
        {recipe.reviews.length > 0 ? (
            <div className="space-y-4 mb-6">
                {recipe.reviews.map(review => (
                    <div key={review.id} className="bg-white p-3 rounded-lg border border-gray-100 text-sm shadow-sm">
                        <div className="flex justify-between mb-1">
                            <span className="font-semibold text-gray-900">{review.userName}</span>
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-gray-500 italic mb-4">No reviews yet. Be the first to try this!</p>
        )}

        {/* Add Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="mb-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rate this recipe</label>
                <div className="flex gap-1 text-gray-300">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            className={`transition-colors hover:text-yellow-400 ${ratingInput >= star ? 'text-yellow-400' : ''}`}
                        >
                            <Star size={20} fill={ratingInput >= star ? "currentColor" : "none"} />
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-3">
                 <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    className="w-full text-sm p-2 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:border-orange-500"
                    required
                 />
                 <textarea 
                    placeholder="Share your cooking experience..."
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 h-20 resize-none"
                    required
                 ></textarea>
            </div>
            <button 
                type="submit"
                disabled={ratingInput === 0}
                className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
                Submit Review
            </button>
        </form>
      </div>
      
      {/* Tags Footer */}
      <div className="bg-white px-6 py-3 border-t border-gray-100 flex gap-2 flex-wrap">
          {recipe.tags.map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded-md">
                  #{tag}
              </span>
          ))}
      </div>
    </div>
  );
};