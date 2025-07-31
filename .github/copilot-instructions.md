# Copilot Instructions for TouristBuddy

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
TouristBuddy is a personalized travel companion web application built with Next.js (App Router) that helps tourists discover relevant local spots based on their unique taste preferences.

## Technology Stack
- **Framework**: Next.js 14+ with App Router (JavaScript)
- **Database & Auth**: Supabase
- **APIs**: Qloo API (cultural intelligence), Google Gemini API (LLM)
- **Geocoding**: OpenStreetMap Nominatim API
- **Styling**: Tailwind CSS

## Key Architecture Principles
1. **API Security**: All external API calls (Qloo, Gemini) MUST be made from Next.js API routes (server-side) to protect API keys
2. **Mobile-First**: All components should be responsive and mobile-optimized
3. **App Router**: Use Next.js 13+ App Router structure (`src/app/` directory)
4. **Component Structure**: Reusable components in `src/components/`

## API Integration Guidelines
- Qloo API calls should be proxied through `/api/qloo/*` routes
- Google Gemini API calls should be proxied through `/api/gemini/*` routes
- Never expose API keys in client-side code
- Use environment variables for all sensitive configuration

## Styling Guidelines
- Use Tailwind CSS for all styling
- Follow mobile-first responsive design principles
- Maintain consistent spacing and typography
- Use semantic HTML elements

## Component Guidelines
- Create reusable components in `src/components/`
- Use proper JSX and React patterns
- Include proper prop validation when helpful
- Keep components focused and single-purpose
