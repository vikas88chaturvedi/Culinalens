import React from 'react';
import { Camera, Search, UtensilsCrossed, CalendarDays } from 'lucide-react';
import { SearchMode } from '../types';

interface NavigationProps {
  currentMode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentMode, onModeChange }) => {
  const navItems: { mode: SearchMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'camera', icon: <Camera size={20} />, label: 'Snap Food' },
    { mode: 'search', icon: <Search size={20} />, label: 'Search' },
    { mode: 'pantry', icon: <UtensilsCrossed size={20} />, label: 'Pantry' },
    { mode: 'planner', icon: <CalendarDays size={20} />, label: 'Meal Plan' },
  ];

  return (
    <div className="flex justify-center mb-8 overflow-x-auto">
      <div className="bg-white p-1 rounded-full shadow-md border border-gray-100 flex gap-1 min-w-max">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => onModeChange(item.mode)}
            className={`
              flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${
                currentMode === item.mode
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};