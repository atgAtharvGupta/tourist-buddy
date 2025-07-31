# TouristBuddy - Your Personalized Travel Companion

A Next.js web application that acts as a personalized travel guide, helping tourists discover amazing local spots (restaurants, movies, shopping, attractions) tailored to their unique taste using AI-powered cultural intelligence.

## 🚀 Features

- **Personalized Recommendations**: Powered by Qloo's cultural intelligence API
- **AI-Powered Search**: Natural language query parsing with Google Gemini
- **Location-Aware**: Automatic location detection and manual location input
- **User Authentication**: Secure sign-up and login with Supabase
- **Interactive Maps**: Mapbox integration for location visualization
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Real-Time Search**: Instant search results with loading states

## 🛠 Technology Stack

- **Frontend & Backend**: Next.js 14+ with App Router (JavaScript)
- **Database & Auth**: Supabase
- **Cultural Intelligence**: Qloo API
- **AI/LLM**: Google Gemini API
- **Maps**: Mapbox GL JS
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## 🏗 Architecture

### API Integration Flow
1. **Frontend**: React components handle UI and user interactions
2. **API Routes**: Next.js API routes act as secure proxy layer for external APIs
3. **External APIs**: Qloo API for recommendations, Gemini for query parsing
4. **Database**: Supabase for user data and preferences

### Security
- All API keys are secured in server-side environment variables
- External API calls are made only from Next.js API routes
- No sensitive keys exposed to the client-side

## 📋 Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Qloo API Key** - [Sign up at Qloo](https://www.qloo.com/)
4. **Google Gemini API Key** - [Get it from Google AI Studio](https://aistudio.google.com/)
5. **Supabase Project** - [Create a project at Supabase](https://supabase.com/)
6. **Mapbox Access Token** - [Sign up at Mapbox](https://www.mapbox.com/)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd qloo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys in `.env.local`:
   ```env
   # Qloo API Configuration
   QLOO_API_KEY=your_qloo_api_key_here
   QLOO_API_URL=https://api.qloo.com

   # Google Gemini API Configuration
   GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Mapbox Configuration
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   ```

4. **Set up Supabase Database**
   
   Create the following tables in your Supabase project:
   
   ```sql
   -- User preferences table
   CREATE TABLE user_preferences (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     preferences JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Favorite places table
   CREATE TABLE favorite_places (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     type TEXT,
     location TEXT,
     rating DECIMAL,
     description TEXT,
     qloo_entity_id TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔌 API Integration

### Qloo API Integration

The app integrates with three main Qloo endpoints:

1. **Search API** (`/api/qloo/search`)
   - Finds entities by query, type, location
   - Used for general search functionality

2. **Tags API** (`/api/qloo/tags`)
   - Discovers valid Qloo tag IDs
   - Used for building user preferences

3. **Insights API** (`/api/qloo/insights`)
   - Generates personalized recommendations
   - Used for "Recommended Just For You" section

### Google Gemini Integration

- **Parse Query API** (`/api/gemini/parse-query`)
  - Parses natural language queries
  - Extracts intent, keywords, and preferences
  - Structures data for Qloo API calls

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Location**: Allow location access or enter manually
3. **Search**: Use natural language to search for places
4. **Explore**: Browse categorized recommendations
5. **Save**: Bookmark favorite places for later
6. **Personalize**: Get AI-powered recommendations based on your taste

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── qloo/         # Qloo API proxy routes
│   │   └── gemini/       # Gemini API proxy routes
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── layout.js         # Root layout
│   ├── page.js           # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── common/          # Reusable components
│   ├── home/            # Home page specific
│   └── Layout.js        # App layout wrapper
└── lib/                 # Utility libraries
    └── supabase.js      # Supabase client
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please check:
1. [Qloo API Documentation](https://docs.qloo.com/)
2. [Next.js Documentation](https://nextjs.org/docs)
3. [Supabase Documentation](https://supabase.com/docs)
4. [Mapbox Documentation](https://docs.mapbox.com/)

## 🎯 Roadmap

- [ ] Advanced filtering options
- [ ] Social sharing features
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Advanced map features
- [ ] Push notifications
- [ ] Integration with calendar apps

---

**Built for the Qloo LLM Hackathon** 🏆
