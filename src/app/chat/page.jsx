'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ElevatedBlueButton from '../ElevatedBlueButton.jsx'
import SearchBar from '../SearchBar.jsx'
import SearchResults from '../SearchResults.jsx'
import SearchSuggestions from '../SearchSuggestions.jsx'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState('Indore, Madhya Pradesh, India')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [geminiGreeting, setGeminiGreeting] = useState('')
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(true)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // First, try to get user's location
    getUserLocation()
  }, [])

  // Update greeting when location changes
  useEffect(() => {
    if (location) {
      handleInitialGeminiChat(location);
    }
  }, [location])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try to get a more readable location name using our custom API
          try {
            const response = await fetch(
              `/api/location/geocode?latitude=${latitude}&longitude=${longitude}`
            );
            
            if (response.ok) {
              const locationData = await response.json();
              const newLocation = locationData.fullLocation || locationData.city || `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`;
              setLocation(newLocation);
            } else {
              setLocation(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
            }
          } catch (geocodeError) {
            console.warn('Geocoding failed, using coordinates:', geocodeError);
            setLocation(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
          }
          
        } catch (error) {
          console.warn('Error processing location:', error);
          setLocationError('Error processing your location.');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn('Location access denied by user.');
            setLocationError('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn('Location information is unavailable.');
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            console.warn('Location request timed out.');
            setLocationError('Location request timed out.');
            break;
          default:
            console.warn('An unknown error occurred while getting location:', error);
            setLocationError('An unknown error occurred while getting location.');
            break;
        }
      },
      {
        enableHighAccuracy: false, // Changed to false to reduce errors
        timeout: 15000, // Increased timeout
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  const handleInitialGeminiChat = async (userLocation) => {
    setIsLoadingGreeting(true);
    try {
      const response = await fetch('/api/gemini/init-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: userLocation }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeminiGreeting(data.response);
      } else {
        setGeminiGreeting('Welcome to TouristBuddy! I\'m here to help you discover amazing places that match your taste. What are you interested in exploring today?');
      }
    } catch (error) {
      console.error('Initial chat error:', error);
      setGeminiGreeting('Welcome to TouristBuddy! I\'m here to help you discover amazing places that match your taste. What are you interested in exploring today?');
    } finally {
      setIsLoadingGreeting(false);
    }
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleSearchLoading = (loading) => {
    setIsSearching(loading);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearchWithQuery(suggestion);
  };

  const handleSearchWithQuery = async (query) => {
    setIsSearching(true);
    
    try {
      // Call Gemini API to parse the query
      const geminiResponse = await fetch('/api/gemini/parse-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuery: query,
          location: location, // Pass location to the API
        }),
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini parse-query error:', errorText);
        throw new Error('Failed to parse query');
      }

      const parsedQlooParams = await geminiResponse.json();
      console.log('Parsed parameters:', parsedQlooParams);

      // Call Qloo API
      const qlooParams = new URLSearchParams({
        types: parsedQlooParams.type || 'urn:entity:place',
        query: `${parsedQlooParams.query || query} ${location}`,
        filter_popularity_min: (parsedQlooParams.popularity || 0.5).toString(),
        location: location
      });

      console.log('Qloo search params:', qlooParams.toString());

      const qlooResponse = await fetch(`/api/qloo/search?${qlooParams}`);
      
      if (!qlooResponse.ok) {
        const errorText = await qlooResponse.text();
        console.error('Qloo search error:', errorText);
        throw new Error('Failed to fetch search results');
      }

      const qlooData = await qlooResponse.json();
      console.log('Qloo search results:', qlooData);
      setSearchResults(qlooData.results || []);

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      // Optionally show error message to user
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I apologize, but I encountered an error while searching. The error was: ${error.message}. Please try again with a different search term.`
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const detectLocation = () => {
    getUserLocation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Check if the user is asking for specific places - if so, trigger search
      const searchKeywords = ['restaurant', 'cafe', 'bar', 'attraction', 'museum', 'gallery', 'shopping', 'mall', 'hotel', 'food', 'eat', 'drink']
      const lowerInput = userInput.toLowerCase()
      const isSearchQuery = searchKeywords.some(keyword => lowerInput.includes(keyword))

      if (isSearchQuery) {
        // Trigger search functionality for place-related queries
        console.log('Triggering search for:', userInput)
        await handleSearchWithQuery(userInput)
        
        // Add a helpful message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `🔍 I'm searching for "${userInput}" in ${location}. Check the results above! You can also ask me for more specific recommendations or details about any of these places.`
        }])
      } else {
        // Send to Gemini API for general travel conversation
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userInput,
            location: location,
            conversationHistory: messages.slice(-5) // Send last 5 messages for context
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
        } else {
          throw new Error('Failed to get AI response')
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      // Smart fallback based on user query
      const lowerInput = userInput.toLowerCase()
      let fallbackResponse = `I apologize, but I'm having trouble connecting right now. However, I'd still love to help you explore ${location}!`
      
      if (lowerInput.includes('restaurant') || lowerInput.includes('food') || lowerInput.includes('eat')) {
        fallbackResponse = `🍽️ Here are some popular restaurant areas in ${location}:

• **Sarafa Bazaar** - Famous night food market with street food and local delicacies
• **M.G. Road** - Fine dining restaurants and cafes
• **Palasia** - Mix of restaurants, from casual to upscale dining
• **Vijay Nagar** - Student-friendly eateries and food courts

Would you like me to search for a specific type of cuisine or restaurant? Try using the search bar above for more detailed results!`
      } else if (lowerInput.includes('attraction') || lowerInput.includes('visit') || lowerInput.includes('see')) {
        fallbackResponse = `🏛️ Popular attractions in ${location}:

• **Rajwada Palace** - Historic palace in the heart of the city
• **Lal Bagh Palace** - Beautiful palace with European architecture
• **Kanch Mandir** - Stunning glass temple
• **Central Museum** - Rich collection of artifacts

Use the search above for more specific recommendations and details!`
      } else if (lowerInput.includes('bar') || lowerInput.includes('drink') || lowerInput.includes('nightlife')) {
        fallbackResponse = `🍻 Nightlife spots in ${location}:

• **10 Downing Street** - Popular pub and restaurant
• **The Creative Kitchen** - Rooftop bar with great ambiance
• **Chappan Dukan** - Food street with cafes and light drinks
• **Hotel Crown Palace** - Upscale bar and lounge

Try searching above for more specific recommendations!`
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fallbackResponse
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white flex flex-col">
      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        {/* Location Status and Gemini Greeting */}
        <div className="mb-6">
          {/* Location Status with Logout */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex-1 text-center">
              {isLoadingLocation ? (
                <div className="flex items-center justify-center text-sm text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  Detecting your location...
                </div>
              ) : locationError ? (
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <span className="text-yellow-400">📍 Using default location: {location}</span>
                  <button
                    onClick={getUserLocation}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-4 text-sm text-green-400">
                  <span>📍 Your location: {location}</span>
                  <button
                    onClick={getUserLocation}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Update Location
                  </button>
                </div>
              )}
            </div>
            <ElevatedBlueButton
              onClick={handleLogout}
              className="text-sm"
            >
              Logout
            </ElevatedBlueButton>
          </div>

          {/* Gemini Greeting */}
          {isLoadingGreeting ? (
            <div className="flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <p className="text-gray-400">TouristBuddy is getting ready...</p>
            </div>
          ) : (
            <div className="bg-[#1e1f20] border border-gray-600 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-200 leading-relaxed">{geminiGreeting}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        

        {/* Chat Interface - Takes remaining space */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages - Scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            <div className="w-full max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div key={index} className={`flex my-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl rounded-2xl p-4 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#1e1f20] text-gray-200'}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${message.role === 'user' ? 'bg-blue-500' : 'bg-gray-700'}`}>
                        {message.role === 'user' ? 'You' : 'AI'}
                      </div>
                      <div className="flex-1">
                        <div className="text-base leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start my-4">
                  <div className="max-w-2xl bg-[#1e1f20] rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                        AI
                      </div>
                      <div className="flex-1">
                        <div className="flex space-x-1 items-center h-full">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-gray-700 p-4 bg-gray-800/30 rounded-lg flex-shrink-0">
            <div className="w-full">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about restaurants, attractions, activities, or anything travel-related..."
                  className="w-full px-6 py-4 bg-[#1e1f20] border border-gray-600 rounded-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                  disabled={isLoading}
                />
                <ElevatedBlueButton
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 rounded-full !shadow-lg hover:!shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </ElevatedBlueButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
