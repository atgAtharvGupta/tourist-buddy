'use client'

import { useState } from 'react';

export default function SearchBar({ onResults, onLoading, userLocation = "Indore" }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    onLoading?.(true);

    try {
      // 1. Call Gemini API to parse the natural language query
      const geminiResponse = await fetch('/api/gemini/parse-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuery: searchQuery,
          location: userLocation, // Pass location to the API
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error('Failed to parse query');
      }

      const parsedQlooParams = await geminiResponse.json();
      console.log('Parameters from Gemini:', parsedQlooParams);

      // 2. Use the parsed parameters to call Qloo API
      const qlooParams = new URLSearchParams({
        types: parsedQlooParams.type,
        query: `${parsedQlooParams.query} ${userLocation}`,
        filter_popularity_min: parsedQlooParams.popularity.toString(),
        location: userLocation
      });

      const qlooResponse = await fetch(`/api/qloo/search?${qlooParams}`);
      
      if (!qlooResponse.ok) {
        throw new Error('Failed to fetch search results');
      }

      const qlooData = await qlooResponse.json();
      console.log('Results from Qloo:', qlooData);

      // 3. Pass the results back to the parent component
      onResults?.(qlooData.results || []);

    } catch (error) {
      console.error('Search error:', error);
      onResults?.([]);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask TouristBuddy anything, e.g., 'Find famous Italian restaurants' or 'Show me hidden local cafes'..."
            className="w-full py-4 px-6 pr-24 text-lg bg-[#1e1f20] border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>
      
      {isLoading && (
        <div className="text-center mt-4">
          <p className="text-gray-400">TouristBuddy is finding the perfect spots for you...</p>
        </div>
      )}
    </div>
  );
}
