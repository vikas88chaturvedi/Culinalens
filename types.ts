export interface Nutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
  userName: string;
}

export interface Recipe {
  id: string; // Unique ID for state management
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  tags: string[];
  nutrition: Nutrition;
  reviews: Review[];
  rating: number; // Average rating
}

export type SearchMode = 'camera' | 'search' | 'pantry' | 'planner';

export interface LoadingState {
  isLoading: boolean;
  message: string;
}

export interface ApiError {
  message: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export interface MealPlanItem {
  recipe: Recipe;
  mealType: MealType;
}

export type MealPlan = Record<DayOfWeek, MealPlanItem[]>;
