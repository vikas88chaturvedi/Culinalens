import React from 'react';
import { MealPlan, DayOfWeek, MealType } from '../types';
import { Trash2, Calendar, ChefHat } from 'lucide-react';

interface MealPlannerProps {
  mealPlan: MealPlan;
  onRemoveFromPlan: (day: DayOfWeek, mealType: MealType, recipeId: string) => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({ mealPlan, onRemoveFromPlan }) => {
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

  const hasMeals = Object.values(mealPlan).some(dayMeals => dayMeals?.length > 0);

  if (!hasMeals) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
        <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Your Weekly Plan is Empty</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Start exploring recipes and add them to your planner to organize your week!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {days.map((day) => {
        const dayMeals = mealPlan[day] || [];
        if (dayMeals.length === 0) return null;

        return (
          <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
              <Calendar size={18} className="text-orange-500" />
              <h3 className="font-bold text-gray-800">{day}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {mealTypes.map((type) => {
                const mealsForType = dayMeals.filter(m => m.mealType === type);
                if (mealsForType.length === 0) return null;

                return (
                  <div key={type} className="p-4 flex flex-col md:flex-row md:items-start gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="min-w-[100px] pt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {type}
                      </span>
                    </div>
                    <div className="flex-grow space-y-3">
                      {mealsForType.map((item, idx) => (
                        <div key={`${item.recipe.id}-${idx}`} className="flex items-center justify-between group bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                                <ChefHat size={20} />
                             </div>
                             <div>
                               <h4 className="font-bold text-gray-800 text-sm">{item.recipe.title}</h4>
                               <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                                 <span>{item.recipe.nutrition.calories}</span>
                                 <span>•</span>
                                 <span>{item.recipe.prepTime}</span>
                               </div>
                             </div>
                          </div>
                          <button
                            onClick={() => onRemoveFromPlan(day, type, item.recipe.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-2"
                            title="Remove from plan"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};