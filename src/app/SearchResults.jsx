'use client'

import SpotlightCard from './SpotlightCard.jsx';

export default function SearchResults({ results, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Discovering amazing places for you...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-200 mb-6 text-center">
        Found {results.length} amazing {results.length === 1 ? 'place' : 'places'} for you
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <SpotlightCard 
            key={result.id || index} 
            className="custom-spotlight-card" 
            spotlightColor="rgba(59, 130, 246, 0.2)"
          >
            <div className="h-full flex flex-col">
              {/* Image */}
              {result.image_url && (
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={result.image_url} 
                    alt={result.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h4 className="text-xl font-bold text-gray-200 mb-2">
                  {result.name || 'Unknown Place'}
                </h4>
                
                {result.description && (
                  <p className="text-gray-300 mb-3 flex-1">
                    {result.description.length > 150 
                      ? `${result.description.substring(0, 150)}...` 
                      : result.description
                    }
                  </p>
                )}
                
                {/* Tags/Categories */}
                {result.categories && result.categories.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {result.categories.slice(0, 3).map((category, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-blue-600 bg-opacity-20 text-blue-300 text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Popularity Score */}
                {result.popularity && (
                  <div className="mb-3">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Popularity:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${result.popularity}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300 ml-2">{result.popularity}%</span>
                    </div>
                  </div>
                )}
                
                {/* Location */}
                {result.location && (
                  <p className="text-sm text-gray-400 mb-3">
                    📍 {result.location.address || result.location.city || 'Location not specified'}
                  </p>
                )}
                
                {/* Action Button */}
                <div className="mt-auto">
                  {result.url ? (
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-center block"
                    >
                      Learn More
                    </a>
                  ) : (
                    <button 
                      className="w-full bg-gray-600 text-gray-300 py-2 px-4 rounded-lg cursor-default"
                      disabled
                    >
                      More info coming soon
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}
