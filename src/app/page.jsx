'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link'
import SpotlightCard from './SpotlightCard.jsx'

export default function Home() {
  const [geminiGreeting, setGeminiGreeting] = useState('');
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(true);
  const [userLocation, setUserLocation] = useState('Indore, Madhya Pradesh, India');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Function to get user's current location
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
          
          // Use reverse geocoding to get location name
          // For now, we'll use a simple approach with city names
          // You could integrate with a geocoding service for better results
          const locationString = `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`;
          
          // Try to get a more readable location name using our custom API
          try {
            const response = await fetch(
              `/api/location/geocode?latitude=${latitude}&longitude=${longitude}`
            );
            
            if (response.ok) {
              const locationData = await response.json();
              setUserLocation(locationData.fullLocation || locationData.city || locationString);
            } else {
              setUserLocation(locationString);
            }
          } catch (geocodeError) {
            console.warn('Geocoding failed, using coordinates:', geocodeError);
            setUserLocation(locationString);
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
            setLocationError('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while getting location.');
            break;
        }
        console.warn('Geolocation error:', error);
      },
      {
        enableHighAccuracy: false, // Changed to false to reduce errors
        timeout: 15000, // Increased timeout
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  // Initial greeting and location detection when the page loads
  useEffect(() => {
    // First, try to get user's location
    getUserLocation();
  }, []);

  // Update greeting when location changes
  useEffect(() => {
    if (userLocation) {
      handleInitialGeminiChat(userLocation);
    }
  }, [userLocation]);

  const handleInitialGeminiChat = async (location) => {
    setIsLoadingGreeting(true);
    try {
      const response = await fetch('/api/gemini/init-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeminiGreeting(data.response);
      } else {
        setGeminiGreeting('Welcome to TouristBuddy! I\'m here to help you discover amazing places that match your taste. Please login to start exploring!');
      }
    } catch (error) {
      console.error('Initial chat error:', error);
      setGeminiGreeting('Welcome to TouristBuddy! I\'m here to help you discover amazing places that match your taste. Please login to start exploring!');
    } finally {
      setIsLoadingGreeting(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="text-center w-full">
          {/* Gemini Greeting Section */}
          <div className="mb-12">
            {/* Location Status */}
            <div className="mb-4 text-center">
              {isLoadingLocation ? (
                <div className="flex items-center justify-center text-sm text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  Detecting your location...
                </div>
              ) : locationError ? (
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <span className="text-yellow-400">📍 Using default location: {userLocation}</span>
                  <button
                    onClick={getUserLocation}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-4 text-sm text-green-400">
                  <span>📍 Your location: {userLocation}</span>
                  <button
                    onClick={getUserLocation}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Update Location
                  </button>
                </div>
              )}
            </div>

            {isLoadingGreeting ? (
              <div className="flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <p className="text-gray-400">TouristBuddy is getting ready...</p>
              </div>
            ) : (
              <div className="bg-[#1e1f20] border border-gray-600 rounded-lg p-6 mb-6 max-w-4xl mx-auto">
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

          {/* Login Prompt Section */}
          <div className="mb-16">
            <div className="bg-[#1e1f20] border border-blue-500 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-4">
                  Ready to Explore?
                </h3>
                <p className="text-gray-300 mb-6">
                  Login to start chatting with TouristBuddy and discover personalized recommendations based on your taste preferences.
                </p>
                <Link href="/login">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                    Login to Start Exploring
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="mb-16">
            <h2 className="text-5xl font-bold text-gray-200 mb-4">
              Beyond Generic Guides
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Powered by Qloo's Taste AI and natural language processing, TouristBuddy creates truly personalized travel experiences.
            </p>
          </div>

              {/* Circular Gallery */}
              <div className="flex justify-center mb-16">
                <div className="relative w-80 h-80">
                  {/* Center Circle */}
                  <div className="absolute inset-0 bg-gray-800 rounded-full flex items-center justify-center shadow-2xl">
                    <span className="text-4xl font-bold text-white">AI</span>
                  </div>
                  
                  {/* Orbiting Circles */}
                  <div className="absolute inset-0 animate-spin" style={{animationDuration: '20s'}}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🏛️</span>
                    </div>
                    <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🎭</span>
                    </div>
                    <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🛍️</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Three Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-gray-200 mb-3">
                  AI-Powered Recommendations
                </h3>
                <p className="text-gray-300">
                  Our advanced AI analyzes your preferences to suggest places you'll actually love, not just popular tourist spots.
                </p>
              </div>
            </SpotlightCard>

            {/* Card 2 */}
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(59, 130, 246, 0.2)">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🌍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-200 mb-3">
                  Tailored to Your Taste
                </h3>
                <p className="text-gray-300">
                  From foodie adventures to cultural experiences, get recommendations that match your unique travel style.
                </p>
              </div>
            </SpotlightCard>

            {/* Card 3 */}
            <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(139, 92, 246, 0.2)">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">📍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-200 mb-3">
                  Local Insights
                </h3>
                <p className="text-gray-300">
                  Discover hidden gems and local favorites that guidebooks miss, curated by our intelligent recommendation engine.
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  )
}
