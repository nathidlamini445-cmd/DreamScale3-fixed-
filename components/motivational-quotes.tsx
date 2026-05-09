"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Quote, User, Calendar } from "lucide-react"

// Entrepreneur quotes database with images
const motivationalQuotes = [
  {
    "Quote": "Stay hungry, stay foolish.",
    "Author": "Steve Jobs",
    "Company": "Apple",
    "Image": "/Steve Jobs Daily inspo.png"
  },
  {
    "Quote": "When something is important enough, you do it even if the odds are not in your favor.",
    "Author": "Elon Musk",
    "Company": "Tesla, SpaceX",
    "Image": "/Elon Musk 07-12.jpg"
  },
  {
    "Quote": "Your brand is what other people say about you when you're not in the room.",
    "Author": "Jeff Bezos",
    "Company": "Amazon",
    "Image": "/Jeff Bezos 07-12.jpg"
  },
  {
    "Quote": "Screw it, let's do it.",
    "Author": "Richard Branson",
    "Company": "Virgin Group",
    "Image": "/Richard branson Daiy inspo.png"
  },
  {
    "Quote": "Move fast and break things.",
    "Author": "Mark Zuckerberg",
    "Company": "Facebook/Meta",
    "Image": "/Mark Zuckerberg 07-12.jpg"
  },
  {
    "Quote": "Don't be intimidated by what you don't know. That can be your greatest strength.",
    "Author": "Sara Blakely",
    "Company": "Spanx",
    "Image": "/sarah_blakely 07-12.jpg"
  },
  {
    "Quote": "It's fine to celebrate success, but it is more important to heed the lessons of failure.",
    "Author": "Bill Gates",
    "Company": "Microsoft",
    "Image": "/Bill gates daily inspo.png"
  },
  {
    "Quote": "The way to get started is to quit talking and begin doing.",
    "Author": "Walt Disney",
    "Company": "Disney",
    "Image": "/Walt disney daily inspo.png"
  },
  {
    "Quote": "Whether you think you can, or you think you can't – you're right.",
    "Author": "Henry Ford",
    "Company": "Ford Motor Company",
    "Image": "/placeholder-user.jpg" // TODO: Add Henry Ford image to public folder (e.g., "Henry Ford Daily inspo.png")
  },
  {
    "Quote": "Price is what you pay. Value is what you get.",
    "Author": "Warren Buffett",
    "Company": "Berkshire Hathaway",
    "Image": "/Warren Bufffet Daily inspo.png"
  }
]

export function MotivationalQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  useEffect(() => {
    // Get day of year (1-365/366) to rotate quotes daily
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    // Use day of year modulo number of quotes to cycle through them
    const quoteIndex = (dayOfYear - 1) % motivationalQuotes.length
    setCurrentQuoteIndex(quoteIndex)
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
              <div>
                <span className="font-medium text-muted-foreground">— {currentQuote.Author}</span>
                {currentQuote.Company && (
                  <span className="text-sm text-muted-foreground ml-2">({currentQuote.Company})</span>
                )}
              </div>
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
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] px-1 py-0.5 text-center">
                Images not our property
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <p className="text-sm text-card-foreground mt-2 text-center font-medium">
            {currentQuote.Author}
          </p>
          {currentQuote.Company && (
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {currentQuote.Company}
            </p>
          )}
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
      </div>
    </div>
  )
}
