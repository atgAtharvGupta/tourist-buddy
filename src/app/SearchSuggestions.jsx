'use client'

export default function SearchSuggestions({ onSuggestionClick }) {
  const suggestions = [
    "Find famous Italian restaurants",
    "Show me hidden local cafes", 
    "Popular tourist attractions",
    "Best rooftop bars with views",
    "Authentic street food spots",
    "Art galleries and museums",
    "Shopping malls and markets",
    "Family-friendly activities"
  ];

  const handleSuggestionClick = (suggestion) => {
    console.log('Suggestion clicked:', suggestion);
    if (onSuggestionClick && typeof onSuggestionClick === 'function') {
      onSuggestionClick(suggestion);
    } else {
      console.error('onSuggestionClick is not a function or is undefined');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h4 className="text-lg font-medium text-gray-300 mb-4 text-center">
        Try asking TouristBuddy:
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="p-3 bg-[#1e1f20] border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-[#2a2b2c] hover:border-blue-500 transition-all duration-200 text-left"
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
}
