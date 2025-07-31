import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize the Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { message, location, conversationHistory } = await request.json()

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

    // Generate response
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ response: text })

  } catch (error) {
    console.error('Gemini chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    )
  }
}
