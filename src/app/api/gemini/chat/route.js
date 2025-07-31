import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize the Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Force reload comment

export async function POST(request) {
  let message = "" // Initialize message variable at function scope
  
  try {
    const requestData = await request.json()
    message = requestData.message
    const { location, conversationHistory } = requestData

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Build conversation context
    let conversationContext = ""
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = "\n\nRecent conversation:\n" + 
        conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
    }

    // Create a comprehensive prompt for travel assistance with strict instructions
    const prompt = `You are TouristBuddy, an expert AI travel companion. You MUST provide specific, actionable travel recommendations with real place names, addresses, and practical details.

STRICT REQUIREMENTS:
1. Always provide 3-5 specific restaurant/place names with actual addresses when possible
2. Include practical details like operating hours, price ranges, or contact info
3. Be specific and factual, not generic or templated
4. Use a friendly but informative tone
5. Include emojis for visual appeal
6. Focus on real, existing places in the specified location

Current user location: ${location || 'Unknown location'}
User query: "${message}"
${conversationContext}

EXAMPLES OF GOOD RESPONSES:
- For restaurants: "Here are 3 excellent Italian restaurants in Indore: 1) Olive Garden (M.G. Road, ₹800-1200, open 11am-11pm), 2) Italiano (Sarafa Bazaar, ₹600-900, famous for wood-fired pizza), 3) La Bella Vista (Palasia, ₹1000-1500, rooftop dining)"
- For attractions: "Top 3 must-visit places in Indore: 1) Rajwada Palace (old city center, 9am-6pm, ₹20 entry), 2) Lal Bagh Palace (A.B. Road, 10am-5pm, ₹15 entry), 3) Sarafa Bazaar (evening food street, 7pm-1am)"

Now provide a specific, helpful response with real place names and details for the user's query.`

    // Generate response with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 8000) // 8 second timeout
    })

    try {
      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ])
      const response = result.response
      const text = response.text()
      return NextResponse.json({ response: text })
    } catch (apiError) {
      console.warn('Gemini API unavailable, using fallback response:', apiError.message)
      // Immediate fallback without delay
      throw apiError
    }

  } catch (error) {
    console.error('Gemini chat API error:', error)
    
    // Smart fallback based on message content
    let fallbackResponse = ""
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('movie') || lowerMessage.includes('film') || lowerMessage.includes('cinema')) {
      fallbackResponse = `🎬 **Top Movie Theaters in Indore:**

1. **INOX Treasure Island Mall** - C21 Mall, A.B. Road
   • Latest movies, premium screens
   • Timing: 10:00 AM - 11:00 PM

2. **PVR Cinemas** - Malhar Mega Mall, Vijay Nagar  
   • 4DX experience, IMAX screens
   • Timing: 9:00 AM - 12:00 AM

3. **Big Cinemas** - Orbit Mall, A.B. Road
   • Budget-friendly, family theater
   • Timing: 10:00 AM - 10:30 PM

🍿 Popular recent releases and show timings available at these locations!`
    } else if (lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      fallbackResponse = `🍽️ **Best Restaurants in Indore:**

1. **Olive Garden** - M.G. Road, Indore
   • Italian cuisine, ₹800-1200 per person
   • Famous for: Wood-fired pizza, pasta

2. **Guru Kripa** - Old Palasia
   • North Indian, ₹300-500 per person  
   • Famous for: Dal bafla, traditional thali

3. **Chappan Dukan** - New Palasia
   • Street food paradise, ₹100-300
   • Famous for: Pani puri, dahi vada, jalebi

4. **The Yellow Chilli** - Vijay Nagar
   • Celebrity chef restaurant, ₹600-900
   • Famous for: Modern Indian cuisine`
    } else if (lowerMessage.includes('attraction') || lowerMessage.includes('visit') || lowerMessage.includes('place')) {
      fallbackResponse = `🏛️ **Must-Visit Places in Indore:**

1. **Rajwada Palace** - Old City Center
   • Historic 7-story palace
   • Entry: ₹20, Timing: 9:00 AM - 6:00 PM

2. **Lal Bagh Palace** - A.B. Road
   • Royal architecture, museum
   • Entry: ₹15, Timing: 10:00 AM - 5:00 PM

3. **Sarafa Bazaar** - Old City
   • Famous night food market
   • Best time: 7:00 PM - 1:00 AM

4. **Patalpani Waterfall** - 35km from city
   • Beautiful monsoon destination
   • Best visit: July - September`
    } else {
      fallbackResponse = `🌟 **Welcome to Indore, Madhya Pradesh!**

I'm here to help you discover the best of this amazing city! You can ask me about:

🍽️ **Restaurants & Food** - Best local eateries and street food
🎬 **Movies & Entertainment** - Cinemas and theaters  
🏛️ **Tourist Attractions** - Historical places and sightseeing
🛍️ **Shopping** - Markets and malls
🎯 **Activities** - Things to do and places to visit

What would you like to explore today?`
    }

    return NextResponse.json({ response: fallbackResponse })
  }
}
