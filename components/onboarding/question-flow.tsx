"use client"

import { useState, useEffect } from 'react'
import { UserType, OnboardingData } from './onboarding-types'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'

interface QuestionFlowProps {
  userType: UserType
  data: OnboardingData
  onUpdate: (data: OnboardingData) => void
  onComplete: (data: OnboardingData) => void
  onBackToSelection: () => void
  onReview: (data: OnboardingData) => void
  initialStep?: number
  onBackToReview?: () => void
  isEditingFromReview?: boolean
}

export type QuestionType = 'text' | 'dropdown' | 'chips' | 'story'

export interface Question {
  id: string
  label: string
  type: QuestionType
  placeholder?: string
  options?: string[]
}

export const ENTREPRENEUR_QUESTIONS: Question[] = [
  {
    id: 'businessName',
    label: 'What is your business name?',
    type: 'text',
    placeholder: 'e.g., TechStart Inc.',
  },
  {
    id: 'industry',
    label: 'What industry are you in?',
    type: 'chips',
    options: [
      'SaaS',
      'E-commerce',
      'Consulting',
      'Healthcare',
      'Finance',
      'Education',
      'Real Estate',
      'Food & Beverage',
      'Technology',
      'Marketing',
      'Other',
    ],
  },
  {
    id: 'businessStage',
    label: 'What stage is your business at?',
    type: 'chips',
    options: [
      'Idea/Planning',
      'MVP Development',
      'Early Stage',
      'Growth Stage',
      'Established',
      'Scaling',
      'Other',
    ],
  },
  {
    id: 'revenueGoal',
    label: 'What is your revenue goal for this year?',
    type: 'chips',
    options: [
      'Under $10K',
      '$10K - $50K',
      '$50K - $100K',
      '$100K - $500K',
      '$500K - $1M',
      '$1M+',
      'Other',
    ],
  },
  {
    id: 'targetMarket',
    label: 'Who is your target market?',
    type: 'chips',
    options: [
      'Small Businesses',
      'Enterprise',
      'Consumers',
      'B2B',
      'B2C',
      'Non-profit',
      'Government',
      'Other',
    ],
  },
  {
    id: 'teamSize',
    label: 'What is your current team size?',
    type: 'chips',
    options: ['Solo Founder', '2-5 People', '6-20 People', '21-50 People', '50+ People', 'Other'],
  },
  {
    id: 'challenges',
    label: 'What are your biggest challenges right now?',
    type: 'chips',
    options: [
      'Customer Acquisition',
      'Product Development',
      'Scaling',
      'Funding',
      'Team Building',
      'Marketing',
      'Operations',
      'Other',
    ],
  },
  {
    id: 'primaryRevenue',
    label: 'What is your primary revenue model?',
    type: 'chips',
    options: [
      'Subscription/Recurring',
      'One-time Sales',
      'Commission/Fees',
      'Advertising',
      'Licensing',
      'Freemium',
      'Marketplace',
      'Other',
    ],
  },
  {
    id: 'customerAcquisition',
    label: 'How do you primarily acquire customers?',
    type: 'chips',
    options: [
      'Social Media Marketing',
      'Content Marketing',
      'Paid Advertising',
      'Email Marketing',
      'Referrals',
      'SEO',
      'Partnerships',
      'Other',
    ],
  },
  {
    id: 'monthlyRevenue',
    label: 'What is your current monthly recurring revenue (MRR)?',
    type: 'chips',
    options: [
      'Under $1K',
      '$1K - $5K',
      '$5K - $10K',
      '$10K - $25K',
      '$25K - $50K',
      '$50K - $100K',
      '$100K+',
      'Other',
    ],
  },
  {
    id: 'keyMetrics',
    label: 'What key metrics do you track for your business?',
    type: 'chips',
    options: [
      'MRR/ARR',
      'Customer Acquisition Cost (CAC)',
      'Lifetime Value (LTV)',
      'Churn Rate',
      'Conversion Rate',
      'Monthly Active Users',
      'Net Promoter Score',
      'Other',
    ],
  },
  {
    id: 'growthStrategy',
    label: 'What is your primary growth strategy?',
    type: 'chips',
    options: [
      'Product-Led Growth',
      'Sales-Led Growth',
      'Marketing-Led Growth',
      'Partnership Growth',
      'Viral Growth',
      'Content Marketing',
      'Community Building',
      'Other',
    ],
  },
  {
    id: 'biggestGoal',
    label: 'What is your biggest goal for the next 6 months?',
    type: 'chips',
    options: [
      'Increase Revenue',
      'Acquire More Customers',
      'Launch New Product',
      'Scale Operations',
      'Raise Funding',
      'Build Team',
      'Improve Product',
      'Other',
    ],
  },
  {
    id: 'hobbies',
    label: 'What are your hobbies? What do you like to do?',
    type: 'chips',
    options: [
      'Reading',
      'Traveling',
      'Sports & Fitness',
      'Music',
      'Cooking',
      'Photography',
      'Gaming',
      'Art & Design',
      'Writing',
      'Outdoor Activities',
      'Technology & Coding',
      'Networking & Socializing',
      'Other',
    ],
  },
  {
    id: 'favoriteSong',
    label: 'What\'s your favorite song?',
    type: 'text',
    placeholder: 'e.g., Eye of the Tiger by Survivor',
  },
  {
    id: 'name',
    label: 'What should we call you?',
    type: 'text',
    placeholder: 'Enter your name',
  },
  {
    id: 'entrepreneurStories',
    label: 'Did you know?',
    type: 'story',
  },
]

export interface EntrepreneurStory {
  name: string
  company: string
  story: string[]
  image: string
}

export const ENTREPRENEUR_STORIES: EntrepreneurStory[] = [
  {
    name: 'Melanie Perkins',
    company: 'Canva',
    story: [
      'Did you know that Melanie Perkins started Canva in her living room at age 19?',
      'She was frustrated with how difficult it was to use design software while teaching design programs.',
      'Canva was rejected by over 100 investors before finally getting funding.',
      'Today, Canva is valued at over $40 billion and has over 100 million monthly users worldwide.',
    ],
    image: '/Melaine Perkins. Story. 07-12.jpg',
  },
  {
    name: 'Elon Musk',
    company: 'Tesla & X',
    story: [
      'Did you know that Elon Musk taught himself computer programming at age 12?',
      'He sold his first software, a space-themed game called Blastar, for $500.',
      'Musk co-founded PayPal, which was later sold to eBay for $1.5 billion.',
      'He used his proceeds to start SpaceX and invest in Tesla, revolutionizing both space travel and electric vehicles.',
    ],
    image: '/Elon musk. story. 07-12.jpg',
  },
  {
    name: 'Jeff Bezos',
    company: 'Amazon',
    story: [
      'Did you know that Jeff Bezos started Amazon from his garage in 1994?',
      'He originally called it Cadabra, but changed it to Amazon after the world\'s largest river.',
      'In the early days, Bezos personally packed and shipped books to customers.',
      'Amazon started as an online bookstore and grew into the world\'s largest e-commerce platform, now worth over $1 trillion.',
    ],
    image: '/Jeff Bezos. Story. 07-12.jpg',
  },
  {
    name: 'Jensen Huang',
    company: 'NVIDIA',
    story: [
      'Did you know that Jensen Huang co-founded NVIDIA in 1993 with just $40,000?',
      'The company struggled for years, almost going bankrupt multiple times.',
      'NVIDIA\'s breakthrough came with graphics processing units (GPUs) for gaming.',
      'Today, NVIDIA is a leader in AI computing, with a market cap exceeding $1 trillion, powering everything from gaming to autonomous vehicles.',
    ],
    image: '/Jensen Huang. Story. 07-12.jpg',
  },
  {
    name: 'Mark Zuckerberg',
    company: 'Meta',
    story: [
      'Did you know that Mark Zuckerberg launched Facebook from his Harvard dorm room in 2004?',
      'He originally created it as "TheFacebook" to connect Harvard students.',
      'Within a month, half of Harvard\'s students had signed up.',
      'Facebook expanded to other universities, then the world, and now Meta connects over 3 billion people globally.',
    ],
    image: '/Mark Zukerberg. Story. 07-12.jpg',
  },
  {
    name: 'Emma Grede',
    company: 'Good American & SKIMS',
    story: [
      'Did you know that Emma Grede co-founded Good American with Khloé Kardashian in 2016?',
      'The brand launched with the largest denim launch in history, selling $1 million worth in one day.',
      'She later co-founded SKIMS with Kim Kardashian, revolutionizing shapewear.',
      'SKIMS reached a $3.2 billion valuation in just a few years, making Grede one of the most successful Black female entrepreneurs.',
    ],
    image: '/Emma-Grede. Story 07-12.jpg',
  },
  {
    name: 'Robert F. Smith',
    company: 'Vista Equity Partners',
    story: [
      'Did you know that Robert F. Smith is the wealthiest Black person in America?',
      'He founded Vista Equity Partners in 2000, focusing on enterprise software companies.',
      'Smith made history by paying off the student debt of the entire 2019 Morehouse College graduating class.',
      'His firm manages over $100 billion in assets and has transformed how software companies operate.',
    ],
    image: '/Robert F smith. Story. 07-12.jpg',
  },
  {
    name: 'Satya Nadella',
    company: 'Microsoft',
    story: [
      'Did you know that Satya Nadella joined Microsoft in 1992 and worked his way up from engineer to CEO?',
      'He transformed Microsoft\'s culture from "know-it-all" to "learn-it-all".',
      'Under his leadership, Microsoft\'s market value tripled to over $2 trillion.',
      'Nadella shifted Microsoft\'s focus to cloud computing, making Azure one of the world\'s leading cloud platforms.',
    ],
    image: '/Satya-Nadella-Story-07-12.jpg',
  },
  {
    name: 'Sara Blakely',
    company: 'Spanx',
    story: [
      'Did you know that Sara Blakely started Spanx with just $5,000 from her savings?',
      'She cut the feet off her pantyhose to create the first Spanx product.',
      'Blakely became the youngest self-made female billionaire in 2012.',
      'She built Spanx into a billion-dollar company without any outside investors, owning 100% of the company.',
    ],
    image: '/Sara-Blakely-Story-07-12.jpg',
  },
  {
    name: 'Daniel Ek',
    company: 'Spotify',
    story: [
      'Did you know that Daniel Ek co-founded Spotify in 2006 to solve music piracy?',
      'He started coding at age 13 and sold his first company at age 18.',
      'Spotify launched in 2008, offering legal music streaming when piracy was rampant.',
      'Today, Spotify has over 600 million users and revolutionized how the world listens to music, making Ek a billionaire.',
    ],
    image: '/Ek-Daniel-Story. 07-12.jpg',
  },
  {
    name: 'Whitney Wolfe Herd',
    company: 'Bumble',
    story: [
      'Did you know that Whitney Wolfe Herd became the youngest woman to take a company public at age 31?',
      'She co-founded Tinder but left after facing harassment, then started Bumble in 2014.',
      'Bumble revolutionized dating by requiring women to make the first move.',
      'The company went public in 2021, making Wolfe Herd a billionaire and the youngest female self-made billionaire.',
    ],
    image: '/Whitney Wolfe Herd. Story.07-12.jpg',
  },
  {
    name: 'Indra Nooyi',
    company: 'PepsiCo',
    story: [
      'Did you know that Indra Nooyi was one of the first women of color to lead a Fortune 500 company?',
      'She joined PepsiCo in 1994 and became CEO in 2006, transforming the company\'s product portfolio.',
      'Nooyi led PepsiCo\'s shift toward healthier products and sustainability initiatives.',
      'Under her leadership, PepsiCo\'s revenue grew from $35 billion to $63 billion, and she became one of the most powerful women in business.',
    ],
    image: '/Indra nooyi. Story. 07-12.jpg',
  },
  {
    name: 'Arianna Huffington',
    company: 'Thrive Global',
    story: [
      'Did you know that Arianna Huffington was rejected by 36 publishers before her first book was accepted?',
      'She co-founded The Huffington Post in 2005, which was sold to AOL for $315 million in 2011.',
      'After collapsing from exhaustion, she left to start Thrive Global, focusing on well-being and productivity.',
      'She\'s written 15 books and is a leading voice on work-life balance and mental health.',
    ],
    image: '/Arianna Huffington. Story. 07-12.jpg',
  },
  {
    name: 'Brian Chesky',
    company: 'Airbnb',
    story: [
      'Did you know that Brian Chesky and his co-founders started Airbnb by renting out air mattresses in their apartment?',
      'They created the first Airbnb listing during a design conference when hotels were sold out.',
      'The company was rejected by many investors and struggled to find funding in its early days.',
      'Today, Airbnb is valued at over $90 billion and has hosted over 1 billion guest arrivals worldwide.',
    ],
    image: '/Brian Chesky. Story. 07-12.jpg',
  },
  {
    name: 'Sophia Amoruso',
    company: 'Nasty Gal',
    story: [
      'Did you know that Sophia Amoruso started Nasty Gal by selling vintage clothes on eBay from her apartment?',
      'She dropped out of community college and worked odd jobs before discovering her passion for fashion.',
      'Amoruso built Nasty Gal into a $100 million fashion empire by age 28, becoming a self-made millionaire.',
      'She wrote the bestseller "#GIRLBOSS" and became a symbol of female entrepreneurship, inspiring millions of women to start their own businesses.',
    ],
    image: '/sophia-amoruso-story-07-12.jpg',
  },
  {
    name: 'Daniela Amodei',
    company: 'Anthropic',
    story: [
      'Did you know that Daniela Amodei co-founded Anthropic in 2020 with her brother Dario, focusing on AI safety?',
      'She started her career with an English Literature degree, then worked at Stripe and OpenAI, where she helped develop GPT-2 and GPT-3.',
      'Amodei left OpenAI to start Anthropic, believing AI should be safe, beneficial, and understandable.',
      'In 2023, she was named one of Time\'s 100 Most Influential People in AI, and Anthropic has attracted billions in investments from Amazon and Google.',
    ],
    image: '/Daniela Amodei- story.png',
  },
]

export default function QuestionFlow({
  userType,
  data,
  onUpdate,
  onComplete,
  onBackToSelection,
  onReview,
  initialStep = 0,
  onBackToReview,
  isEditingFromReview = false,
}: QuestionFlowProps) {
  const questions = ENTREPRENEUR_QUESTIONS.filter(q => q.type !== 'story') // Filter out the standalone story question
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [storyIndex, setStoryIndex] = useState(0)
  
  // Preload all story images when component mounts
  useEffect(() => {
    ENTREPRENEUR_STORIES.forEach((story) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = story.image
      document.head.appendChild(link)
    })
  }, [])
  
  // Update currentStep when initialStep changes (e.g., when navigating from review)
  useEffect(() => {
    setCurrentStep(initialStep)
  }, [initialStep])
  
  // Map each question to a story (cycling through stories)
  const getStoryForQuestion = (questionIndex: number) => {
    return ENTREPRENEUR_STORIES[questionIndex % ENTREPRENEUR_STORIES.length]
  }
  
  // Get current and next story for preloading
  const currentStory = getStoryForQuestion(currentStep)
  const nextStory = getStoryForQuestion(currentStep + 1)
  
  // Initialize answers from existing data (in case user returns from review)
  const initialAnswers = Object.fromEntries(
    questions.map((q) => {
      const value = data[q.id as keyof OnboardingData]
      // If it's a chip question, convert string to array if needed
      if (q.type === 'chips') {
        if (Array.isArray(value)) {
          return [q.id, value]
        } else if (typeof value === 'string' && value) {
          return [q.id, [value]]
        }
        return [q.id, []]
      }
      return [q.id, value || '']
    })
  )
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initialAnswers)
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({})
  
  // Reset story index when entering story question
  useEffect(() => {
    if (questions[currentStep]?.type === 'story') {
      setStoryIndex(0)
    }
  }, [currentStep])

  const handleNext = () => {
    // Update data before moving
    const updatedData: OnboardingData = {
      ...data,
      ...answers,
    }
    onUpdate(updatedData)
    
    // Move to next question
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Navigate to review screen
      onReview(updatedData)
    }
  }

  const handleBack = () => {
    // Move to previous question
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      // Go back to selection screen
      onBackToSelection()
    }
  }

  const handleChipToggle = (option: string) => {
    const questionId = questions[currentStep].id
    const currentSelections = (answers[questionId] as string[]) || []
    
    if (option === 'Other') {
      // Toggle "Other" selection
      if (currentSelections.includes('Other')) {
        // Remove "Other" and its custom text
        const newSelections = currentSelections.filter(item => item !== 'Other')
        const newOtherTexts = { ...otherTexts }
        delete newOtherTexts[questionId]
        setOtherTexts(newOtherTexts)
        const newAnswers = { ...answers, [questionId]: newSelections }
        setAnswers(newAnswers)
        onUpdate({ ...data, ...newAnswers })
      } else {
        // Add "Other"
        const newSelections = [...currentSelections, 'Other']
        const newAnswers = { ...answers, [questionId]: newSelections }
        setAnswers(newAnswers)
        onUpdate({ ...data, ...newAnswers })
      }
    } else {
      // Toggle regular option
      const isSelected = currentSelections.includes(option)
      let newSelections: string[]
      
      if (isSelected) {
        newSelections = currentSelections.filter(item => item !== option)
      } else {
        newSelections = [...currentSelections, option]
      }
      
      const newAnswers = { ...answers, [questionId]: newSelections }
      setAnswers(newAnswers)
      onUpdate({ ...data, ...newAnswers })
    }
  }

  const handleOtherTextChange = (text: string) => {
    const questionId = questions[currentStep].id
    setOtherTexts({ ...otherTexts, [questionId]: text })
    
    // Update the answer with custom text
    const currentSelections = (answers[questionId] as string[]) || []
    const otherIndex = currentSelections.findIndex(item => item === 'Other' || item.startsWith('Other:'))
    
    if (otherIndex !== -1 && text.trim()) {
      // Replace "Other" or "Other: ..." with "Other: {text}" in the selections
      const newSelections = [...currentSelections]
      newSelections[otherIndex] = `Other: ${text.trim()}`
      const newAnswers = { ...answers, [questionId]: newSelections }
      setAnswers(newAnswers)
      onUpdate({ ...data, ...newAnswers })
    } else if (otherIndex !== -1 && !text.trim()) {
      // If text is cleared, keep "Other" but without custom text
      const newSelections = [...currentSelections]
      newSelections[otherIndex] = 'Other'
      const newAnswers = { ...answers, [questionId]: newSelections }
      setAnswers(newAnswers)
      onUpdate({ ...data, ...newAnswers })
    }
  }

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentStep].id]: value }
    setAnswers(newAnswers)
    onUpdate({ ...data, ...newAnswers })
  }

  const currentQuestion = questions[currentStep]
  const currentAnswer = answers[currentQuestion.id] || (currentQuestion.type === 'chips' ? [] : '')
  const currentOtherText = otherTexts[currentQuestion.id] || ''
  
  // Extract custom text from "Other: {text}" format if it exists
  const getOtherTextFromAnswer = () => {
    if (currentQuestion.type === 'chips') {
      const selections = currentAnswer as string[]
      const otherItem = selections.find(item => item.startsWith('Other:'))
      if (otherItem) {
        return otherItem.replace('Other:', '').trim()
      }
    }
    return ''
  }
  
  // Initialize otherTexts from existing answers when question changes
  useEffect(() => {
    if (currentQuestion.type === 'chips') {
      const selections = currentAnswer as string[]
      const otherItem = selections.find(item => item.startsWith('Other:'))
      if (otherItem) {
        const extractedText = otherItem.replace('Other:', '').trim()
        if (extractedText && !otherTexts[currentQuestion.id]) {
          setOtherTexts(prev => ({ ...prev, [currentQuestion.id]: extractedText }))
        }
      }
    }
  }, [currentStep, currentQuestion.id, currentAnswer])

  const renderInput = () => {
    switch (currentQuestion.type) {
      case 'text':
        const textAnswer = currentAnswer as string
        const isFavoriteSong = currentQuestion.id === 'favoriteSong'
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full bg-white border-2 border-gray-400 rounded-lg px-4 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970] transition-all hover:border-gray-600"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textAnswer.trim()) {
                  handleNext()
                }
              }}
            />
            {isFavoriteSong && (
              <button
                onClick={() => handleAnswer("I don't know")}
                className={`w-full px-4 py-2.5 rounded-lg border text-[15px] font-medium transition-all duration-200 ${
                  textAnswer === "I don't know"
                    ? 'bg-[#191970] dark:bg-[#39d2c0] border-[#191970] dark:border-[#39d2c0] text-white shadow-lg shadow-[#191970]/20 dark:shadow-[#39d2c0]/20'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#191970] dark:hover:border-[#39d2c0] hover:text-[#191970] dark:hover:text-[#39d2c0] hover:shadow-lg hover:shadow-[#191970]/20 dark:hover:shadow-[#39d2c0]/20 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                I don't know
              </button>
            )}
          </div>
        )

      case 'dropdown':
        return (
          <div className="relative">
            <select
              value={currentAnswer}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3.5 text-gray-900 dark:text-white text-[15px] font-normal focus:outline-none focus:border-[#191970] dark:focus:border-[#39d2c0] focus:ring-1 focus:ring-[#191970] dark:focus:ring-[#39d2c0] transition-all cursor-pointer appearance-none pr-10 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
              autoFocus
            >
              <option value="" className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Select an option...
              </option>
              {currentQuestion.options?.map((option) => (
                <option key={option} value={option} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-gray-500"
              >
                <path
                  d="M3.5 5.25L7 8.75L10.5 5.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )

      case 'chips':
        const selections = (currentAnswer as string[]) || []
        const isOtherSelected = selections.some(item => item === 'Other' || item.startsWith('Other:'))
        // Prioritize currentOtherText (what user is typing) over extracted text from answer
        const extractedText = getOtherTextFromAnswer()
        const displayOtherText = currentOtherText || extractedText
        
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = selections.some(item => 
                  item === option || (option === 'Other' && item.startsWith('Other:'))
                )
                return (
                  <button
                    key={option}
                    onClick={() => handleChipToggle(option)}
                    className={`px-4 py-2.5 rounded-lg border text-[15px] font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#191970] dark:bg-[#39d2c0] border-[#191970] dark:border-[#39d2c0] text-white shadow-lg shadow-[#191970]/20 dark:shadow-[#39d2c0]/20'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:border-[#191970] dark:hover:border-[#39d2c0] hover:text-[#191970] dark:hover:text-[#39d2c0] hover:shadow-lg hover:shadow-[#191970]/20 dark:hover:shadow-[#39d2c0]/20 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {isOtherSelected && (
              <div className="mt-3">
                <input
                  type="text"
                  value={displayOtherText}
                  onChange={(e) => handleOtherTextChange(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 rounded-lg px-4 py-3.5 text-[15px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#191970] dark:focus:border-[#39d2c0] focus:ring-2 focus:ring-[#191970] dark:focus:ring-[#39d2c0] transition-all hover:border-gray-600 dark:hover:border-gray-500"
                  autoFocus
                />
              </div>
            )}
          </div>
        )

      case 'story':
        const storyStory = ENTREPRENEUR_STORIES[storyIndex]
        return (
          <div className="space-y-6">
            <div className="relative w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden shadow-lg bg-gray-100">
              <Image
                src={storyStory.image}
                alt={storyStory.name}
                fill
                className="object-cover"
                quality={95}
                sizes="(max-width: 768px) 100vw, 500px"
                priority={storyIndex === 0 || storyIndex === 1}
                loading="eager"
              />
              {/* Disclaimer Notice */}
                <div className="absolute bottom-2 left-2 bg-slate-800/95 rounded px-2 py-1 image-disclaimer-overlay shadow-lg">
                  <p className="text-[10px] font-light image-disclaimer-text" style={{ color: '#FFFFFF' }}>
                    Images: Not our property
                  </p>
                </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-1 text-black dark:text-white">{storyStory.name}</h3>
                <p className="text-sm text-black dark:text-gray-300">{storyStory.company}</p>
              </div>
              <div className="space-y-3">
                {storyStory.story.map((line, index) => (
                  <p key={index} className="leading-relaxed text-black dark:text-gray-300">
                    {line}
                  </p>
                ))}
              </div>
              <div className="pt-2 text-sm text-gray-600 dark:text-gray-400">
                Story {storyIndex + 1} of {ENTREPRENEUR_STORIES.length}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed =
    currentQuestion.type === 'text'
      ? (currentAnswer as string).trim() !== '' || (currentQuestion.id === 'favoriteSong' && (currentAnswer as string) === "I don't know")
      : currentQuestion.type === 'chips'
      ? (currentAnswer as string[]).length > 0
      : currentQuestion.type === 'story'
      ? true // Stories are always ready to proceed
      : currentAnswer !== ''

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center px-4">
      {/* Logo - Top Left */}
      <div className="fixed top-4 left-10 z-50">
        <Image
          src="/Logo.png"
          alt="DreamScale Logo"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>
      {/* Theme Toggle Button - Only show after business name is entered (step > 0) */}
      {currentStep > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-black dark:text-white">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-black dark:text-white">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#191970] dark:bg-[#39d2c0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 leading-tight text-black dark:text-white">
            {currentQuestion.label}
          </h2>
          {renderInput()}
        </div>

        {/* Story Section */}
        {currentQuestion.type !== 'story' && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Story Text */}
              <div className="space-y-2">
                <div>
                  <h3 className="text-base font-bold mb-0.5 text-black dark:text-white">
                    {getStoryForQuestion(currentStep).name}
                  </h3>
                  <p className="text-xs text-black dark:text-gray-300">{getStoryForQuestion(currentStep).company}</p>
                </div>
                <div className="space-y-1.5">
                  {getStoryForQuestion(currentStep).story.map((line, index) => (
                    <p key={index} className="leading-relaxed text-xs text-black dark:text-gray-300">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              {/* Story Image */}
              <div className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden shadow-md bg-gray-100">
                {/* Preload next image */}
                <div className="hidden">
                  <Image
                    src={nextStory.image}
                    alt={nextStory.name}
                    width={200}
                    height={200}
                    quality={95}
                    priority={false}
                  />
                </div>
                <Image
                  src={currentStory.image}
                  alt={currentStory.name}
                  fill
                  className="object-cover object-top"
                  quality={95}
                  sizes="200px"
                  priority={currentStep === 0 || currentStep === 1}
                  loading={currentStep === 0 || currentStep === 1 ? "eager" : "eager"}
                />
                {/* Disclaimer Notice */}
                <div className="absolute bottom-1 left-1 bg-slate-800/95 rounded px-1.5 py-0.5 image-disclaimer-overlay shadow-lg">
                  <p className="text-[9px] font-light image-disclaimer-text" style={{ color: '#FFFFFF' }}>
                    Images: Not our property
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={isEditingFromReview && onBackToReview ? onBackToReview : handleBack}
            className="px-6 py-2 text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {isEditingFromReview && onBackToReview 
              ? 'Back to Review' 
              : currentStep === 0 
              ? 'Back to Welcome' 
              : 'Back'}
          </button>
          <div className="flex gap-3">
            {isEditingFromReview && onBackToReview && (
              <button
                onClick={() => {
                  const updatedData: OnboardingData = {
                    ...data,
                    ...answers,
                  }
                  onUpdate(updatedData)
                  onBackToReview()
                }}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg transition-colors"
              >
                Save & Return to Review
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="px-6 py-2 bg-[#191970] dark:bg-[#39d2c0] hover:bg-[#191970]/90 dark:hover:bg-[#39d2c0]/90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === questions.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

