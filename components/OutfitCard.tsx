
import React from 'react';
import { Outfit } from '../types';

interface OutfitCardProps {
  outfit: Outfit;
}

const LoadingPlaceholder: React.FC = () => (
    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="aspect-w-1 aspect-h-1 w-full">
        {outfit.isLoading || !outfit.imageUrl ? (
            <LoadingPlaceholder />
        ) : (
          <img
            src={outfit.imageUrl}
            alt={`Outfit for ${outfit.title}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="text-lg font-bold text-gray-900 text-center">{outfit.title}</h3>
      </div>
    </div>
  );
};
