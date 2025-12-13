"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Quote, User, Calendar } from "lucide-react"

// Simple quotes database - no images to prevent memory issues
const motivationalQuotes = [
  {
    "Day": 1,
    "Quote": "The future belongs to those who believe in the beauty of their dreams.",
    "Author": "Eleanor Roosevelt"
  },
  {
    "Day": 2,
    "Quote": "It is during our darkest moments that we must focus to see the light.",
    "Author": "Aristotle"
  },
  {
    "Day": 3,
    "Quote": "The way to get started is to quit talking and begin doing.",
    "Author": "Walt Disney"
  },
  {
    "Day": 4,
    "Quote": "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    "Author": "Roy T. Bennett"
  },
  {
    "Day": 5,
    "Quote": "The only impossible journey is the one you never begin.",
    "Author": "Tony Robbins"
  },
  {
    "Day": 6,
    "Quote": "In the middle of difficulty lies opportunity.",
    "Author": "Albert Einstein"
  },
  {
    "Day": 7,
    "Quote": "The only way to do great work is to love what you do.",
    "Author": "Steve Jobs"
  },
  {
    "Day": 8,
    "Quote": "If you can dream it, you can do it.",
    "Author": "Walt Disney"
  },
  {
    "Day": 9,
    "Quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Author": "Winston Churchill"
  },
  {
    "Day": 10,
    "Quote": "The future depends on what you do today.",
    "Author": "Mahatma Gandhi"
  },
  {
    "Day": 11,
    "Quote": "Life is what happens to you while you're busy making other plans.",
    "Author": "John Lennon"
  },
  {
    "Day": 12,
    "Quote": "The way I see it, if you want the rainbow, you gotta put up with the rain.",
    "Author": "Dolly Parton"
  },
  {
    "Day": 13,
    "Quote": "Don't cry because it's over, smile because it happened.",
    "Author": "Dr. Seuss"
  },
  {
    "Day": 14,
    "Quote": "You miss 100% of the shots you don't take.",
    "Author": "Wayne Gretzky"
  },
  {
    "Day": 15,
    "Quote": "The only person you are destined to become is the person you decide to be.",
    "Author": "Ralph Waldo Emerson"
  },
  {
    "Day": 16,
    "Quote": "Go confidently in the direction of your dreams. Live the life you have imagined.",
    "Author": "Henry David Thoreau"
  },
  {
    "Day": 17,
    "Quote": "I dream my painting and I paint my dream.",
    "Author": "Vincent van Gogh"
  },
  {
    "Day": 18,
    "Quote": "Learning never exhausts the mind.",
    "Author": "Leonardo da Vinci",
    "Image": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo_self.jpg",
    "Bio": "Renaissance polymath, painter, inventor, and scientist. Creator of the Mona Lisa and The Last Supper, he epitomized the Renaissance ideal of the universal genius."
  },
  {
    "Day": 19,
    "Quote": "Either write something worth reading or do something worth writing.",
    "Author": "Benjamin Franklin"
  },
  {
    "Day": 20,
    "Quote": "The only thing we have to fear is fear itself.",
    "Author": "Franklin D. Roosevelt"
  }
]

export function MotivationalQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  useEffect(() => {
    // Temporarily set to Day 18 to show Leonardo da Vinci's picture
    setCurrentQuoteIndex(17) // Index 17 = Day 18 (0-based indexing)
  }, [])

  const currentQuote = motivationalQuotes[currentQuoteIndex]

  if (!currentQuote) {
    return null
  }

  return (
    <div className="p-6 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Quote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Daily Inspiration</h3>
            <p className="text-sm text-muted-foreground">Today's motivational quote</p>
          </div>
        </div>
          
          <div className="opacity-100 transform translate-y-0">
            <blockquote className="text-base text-card-foreground mb-4 leading-relaxed italic">
              "{currentQuote.Quote}"
            </blockquote>
            <div className="flex items-center gap-2 text-card-foreground">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">— {currentQuote.Author}</span>
            </div>
          </div>
        </div>
        
        {/* Author Image Section - Right Side */}
        <div className="flex flex-col items-center justify-center ml-6">
          {currentQuote.Image ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
              <img 
                src={currentQuote.Image} 
                alt={currentQuote.Author}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-primary/20"><svg class="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>'
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <p className="text-sm text-card-foreground mt-2 text-center font-medium">
            {currentQuote.Author}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-card-foreground pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Daily Quote</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-muted-foreground">Fresh daily</span>
        </div>
        {currentQuote.Bio && (
          <div className="flex items-start gap-3 flex-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-sm leading-relaxed text-muted-foreground max-w-md">{currentQuote.Bio}</span>
          </div>
        )}
      </div>
    </div>
  )
}
