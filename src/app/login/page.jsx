'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ElevatedBlueButton from '../ElevatedBlueButton.jsx'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Dummy credentials check
    if (username === 'admin' && password === 'abc123') {
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true')
      router.push('/chat')
    } else {
      setError('Invalid credentials. Use username: admin, password: abc123')
    }
  }

  const handleSignup = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Simulate account creation
    setSuccess('Account created successfully! You can now sign in.')
    setIsSignup(false)
    setUsername('')
    setPassword('')
    setConfirmPassword('')
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setError('')
    setSuccess('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-200 mb-8">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        
        <div className="bg-[#1e1f20] py-8 px-6 shadow-lg rounded-lg border border-gray-700">
          <form className="space-y-6" onSubmit={isSignup ? handleSignup : handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-[#131314] border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-[#131314] border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 bg-[#131314] border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            )}

            {error && (
                <div className="bg-red-800/50 text-red-300 px-4 py-3 rounded-md border border-red-700">
                  <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-800/50 text-green-300 px-4 py-3 rounded-md border border-green-700">
                  <p>{success}</p>
                </div>
            )}

            <div className="flex justify-center">
              <ElevatedBlueButton
                type="submit"
                className="w-max py-3 px-6"
              >
                {isSignup ? 'Sign up' : 'Sign in'}
              </ElevatedBlueButton>
            </div>
            
            {!isSignup && (
              <div className="text-center text-sm text-gray-400">
                Demo credentials: admin / abc123
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
