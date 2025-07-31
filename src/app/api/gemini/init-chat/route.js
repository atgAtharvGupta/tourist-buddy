import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { location } = await request.json();
    
    if (!location) {
      return Response.json({ error: 'Location is required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return Response.json({ error: 'Gemini API Key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are TouristBuddy, a friendly and knowledgeable travel companion AI. 
    A user has just opened the app and their current location is: ${location}
    
    Please write a warm, personal greeting message that:
    1. Welcomes them to TouristBuddy
    2. Acknowledges their location in a friendly way
    3. Briefly mentions what you can help them discover (restaurants, attractions, experiences)
    4. Encourages them to start exploring by asking what they're interested in
    
    Keep it conversational, enthusiastic, and under 100 words. Make it feel like talking to a knowledgeable local friend.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ response: text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return Response.json({ 
      error: 'Failed to generate greeting', 
      details: error.message 
    }, { status: 500 });
  }
}
