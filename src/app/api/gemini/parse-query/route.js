import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { userQuery } = await request.json();
    
    if (!userQuery) {
      return Response.json({ error: 'User query is required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return Response.json({ error: 'Gemini API Key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an AI assistant that converts natural language travel queries into structured parameters for the Qloo API.

User query: "${userQuery}"

Please analyze this query and extract the following information in JSON format:
{
  "type": "string",
  "query": "string", 
  "popularity": "number"
}

Examples:
- "Find famous Italian restaurants" → {"type": "restaurant", "query": "Italian", "popularity": 80}
- "Show me hidden local cafes" → {"type": "restaurant", "query": "cafe local", "popularity": 20}
- "Popular tourist attractions" → {"type": "attraction", "query": "tourist attractions", "popularity": 85}

Respond ONLY with the JSON object, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const parsedParams = JSON.parse(cleanedText);
      
      if (!parsedParams.type || !parsedParams.query) {
        throw new Error('Invalid response structure from Gemini');
      }
      
      parsedParams.popularity = Math.max(1, Math.min(100, parsedParams.popularity || 50));
      
      return Response.json(parsedParams);

    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      
      return Response.json({
        type: "attraction",
        query: userQuery,
        popularity: 50
      });
    }

  } catch (error) {
    console.error('Gemini Parse Query Error:', error);
    return Response.json({ 
      error: 'Failed to parse query', 
      details: error.message 
    }, { status: 500 });
  }
}
