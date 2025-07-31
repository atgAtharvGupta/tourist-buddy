import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ElevatedBlueButton from "./ElevatedBlueButton";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TouristBuddy - Your Personalized Travel Companion",
  description: "Discover amazing restaurants, movies, shopping, and attractions tailored to your unique taste with AI-powered recommendations.",
};

const Header = () => {
  return (
    <header className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-600 py-12 px-6 shadow-lg">
      <div className="max-w-6xl mx-auto relative flex items-center justify-between min-h-[60px]">
        {/* Left spacer for balance */}
        <div className="flex-1"></div>
        
        {/* Centered Title */}
        <h1 className="text-3xl font-bold text-white flex-1 text-center">
          TouristBuddy
        </h1>
        
        {/* Right Corner Buttons */}
        <nav className="flex items-center space-x-4 flex-1 justify-end">
          <ElevatedBlueButton href="/">
            Home
          </ElevatedBlueButton>
          <ElevatedBlueButton href="/login">
            Login
          </ElevatedBlueButton>
        </nav>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; 2025 TouristBuddy. All rights reserved.</p>
    </footer>
  );
};

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#111827] flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark bg-gray-900">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
        style={{ backgroundColor: '#111827', color: '#f3f4f6' }}
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
