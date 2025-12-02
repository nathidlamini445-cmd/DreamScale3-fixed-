'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Bot, 
  Globe,
  Target,
  DollarSign,
  Star,
  Shield,
  Zap,
  AlertCircle,
  Plus,
  Download,
  Printer,
  Save,
  BookOpen,
  Trash2,
  RefreshCw,
  Users
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { downloadPDF, printPDF, PDFData } from '@/lib/pdf-generator'

interface AnalysisSection {
  title: string
  content: string
}

interface QuestionnaireData {
  intrapreneurName: string  // Name or LinkedIn profile of intrapreneur
  companyIndustry: string  // Industry their company operates in
  targetStakeholders: string[]  // Key stakeholders and decision-makers
  initiativeFrequency: string  // How often they launch initiatives
  projectTypes: string[]  // Types of projects they lead
  uniqueApproach: string  // What makes their approach stand out
  weaknesses: string
  collaborationMethods: string[]  // How they engage with stakeholders
  valueCreation: string[]  // Value their initiatives create
  skillRating: {  // Intrapreneurial skill ratings
    innovation: number
    execution: number
    leadership: number
    persistence: number
  }
  yourAdvantage: string
}

interface SavedAnalysis {
  id: string
  title: string
  competitorUrl: string
  analysisResult: string
  data: QuestionnaireData
  savedAt: string
  createdAt: string
}

interface ScrapeResult {
  success: boolean
  method: 'scraped' | 'failed' | 'blocked'
  platform?: 'youtube' | 'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'website' | 'unknown'
  dataQuality: number
  preFillData: {
    platformName?: string
    username?: string
    followers?: string
    contentCount?: string
    bio?: string
    contentNiche?: string
    verified?: boolean
  }
  message: string
}

const TARGET_STAKEHOLDERS_OPTIONS = [
  'C-Suite Executives',
  'Department Heads',
  'Middle Management',
  'Frontline Employees',
  'External Partners',
  'Customers/End Users',
  'Board Members',
  'Investors',
  'Cross-functional Teams',
  'IT/Technology Teams',
  'Marketing Teams',
  'Operations Teams'
]

const PROJECT_TYPES_OPTIONS = [
  'Making things better or faster',
  'Creating new products or services',
  'Using technology to improve',
  'Saving money or cutting costs',
  'Making customers happy',
  'Building tools or apps',
  'Expanding to new places',
  'Helping the environment',
  'Keeping employees happy',
  'Using data to make decisions',
  'Automating tasks',
  'Working with other companies'
]

const COLLABORATION_METHODS_OPTIONS = [
  'Working with different teams',
  'Having meetings or workshops',
  'Updating people regularly',
  'Keeping communication open',
  'Working together to create things',
  'Testing things before full launch',
  'Asking for feedback',
  'Teaching or mentoring others',
  'Presenting to their team',
  'Helping people adapt to changes'
]

const VALUE_CREATION_OPTIONS = [
  'Revenue growth',
  'Cost savings',
  'Efficiency improvements',
  'Customer satisfaction',
  'Employee engagement',
  'Market expansion',
  'Innovation pipeline',
  'Competitive advantage',
  'Risk mitigation',
  'Strategic positioning'
]

// Helper function to parse markdown into sections
const parseAnalysisResult = (markdown: string): AnalysisSection[] => {
  const sections: AnalysisSection[] = []
  const lines = markdown.split('\n')
  let currentSectionTitle = ''
  let currentSectionContent: string[] = []

  // Extract the main report title first, if present, and skip it for section parsing
  const reportTitleMatch = lines[0]?.match(/^# (.+)/)
  let startIndex = 0
  if (reportTitleMatch) {
    startIndex = 1
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      if (currentSectionTitle) {
        sections.push({
          title: currentSectionTitle,
          content: currentSectionContent.join('\n').trim(),
        })
      }
      currentSectionTitle = line.substring(3).trim() // Remove "## "
      currentSectionContent = []
    } else {
      currentSectionContent.push(line)
    }
  }

  // Add the last section
  if (currentSectionTitle) {
    sections.push({
      title: currentSectionTitle,
      content: currentSectionContent.join('\n').trim(),
    })
  }

  return sections
}

// Helper function to format content for better readability
const formatContentForReadability = (content: string): string => {
  return content
    // Add spacing around bullet points
    .replace(/^- /gm, '\n• ')
    .replace(/^\* /gm, '\n• ')
    // Add spacing around numbered lists
    .replace(/^(\d+)\. /gm, '\n$1. ')
    // Add spacing around bold text
    .replace(/\*\*(.*?)\*\*/g, '\n**$1**\n')
    // Add spacing around subheadings
    .replace(/^### (.*)$/gm, '\n### $1\n')
    .replace(/^#### (.*)$/gm, '\n#### $1\n')
    // Break long lines to prevent overflow
    .replace(/(.{80,}?)(\s)/g, '$1\n$2')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Detect platform from URL
function detectPlatform(url: string): { 
  platform: 'youtube' | 'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'website' | 'unknown', 
  username: string | null 
} {
  const urlLower = url.toLowerCase()
  
  // YouTube detection
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    // Extract channel handle or username
    // Formats: youtube.com/@username, youtube.com/c/username, youtube.com/channel/ID
    let username = null
    
    if (urlLower.includes('/@')) {
      username = url.split('/@')[1]?.split('/')[0]?.split('?')[0]
    } else if (urlLower.includes('/c/')) {
      username = url.split('/c/')[1]?.split('/')[0]?.split('?')[0]
    } else if (urlLower.includes('/channel/')) {
      username = url.split('/channel/')[1]?.split('/')[0]?.split('?')[0]
    }
    
    return { platform: 'youtube', username }
  }
  
  // Instagram detection
  if (urlLower.includes('instagram.com')) {
    // Format: instagram.com/username
    const username = url.split('instagram.com/')[1]?.split('/')[0]?.split('?')[0]
    return { platform: 'instagram', username }
  }
  
  // Twitter/X detection
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    // Format: twitter.com/username or x.com/username
    const username = url.split('.com/')[1]?.split('/')[0]?.split('?')[0]
    return { platform: 'twitter', username }
  }
  
  // TikTok detection
  if (urlLower.includes('tiktok.com')) {
    // Format: tiktok.com/@username
    let username = null
    if (urlLower.includes('/@')) {
      username = url.split('/@')[1]?.split('/')[0]?.split('?')[0]
    }
    return { platform: 'tiktok', username }
  }
  
  // LinkedIn detection
  if (urlLower.includes('linkedin.com')) {
    // Format: linkedin.com/in/username or linkedin.com/company/companyname
    const username = url.split('linkedin.com/')[1]?.split('/')[1]?.split('?')[0] || url.split('linkedin.com/')[1]?.split('/')[0]?.split('?')[0]
    return { platform: 'linkedin', username }
  }
  
  // Website detection (http/https)
  if (urlLower.startsWith('http://') || urlLower.startsWith('https://') || urlLower.includes('www.')) {
    return { platform: 'website', username: null }
  }
  
  return { platform: 'unknown', username: null }
}

// Format numbers (e.g., 1234567 → 1.2M)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Get YouTube channel data (requires YouTube Data API key)
async function getYouTubeData(username: string): Promise<ScrapeResult['preFillData'] | null> {
  try {
    // First, we need to resolve the username/handle to a channel ID
    // Note: You'll need a YouTube Data API key for this
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    
    if (!API_KEY) {
      console.log('YouTube API key not configured')
      return null
    }
    
    // Search for channel by username
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(username)}&type=channel&maxResults=1&key=${API_KEY}`
    )
    
    if (!searchResponse.ok) {
      throw new Error('YouTube search failed')
    }
    
    const searchData = await searchResponse.json()
    
    if (!searchData.items || searchData.items.length === 0) {
      return null
    }
    
    const channelId = searchData.items[0].id.channelId
    
    // Get detailed channel statistics
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`
    )
    
    if (!channelResponse.ok) {
      throw new Error('YouTube channel fetch failed')
    }
    
    const channelData = await channelResponse.json()
    
    if (!channelData.items || channelData.items.length === 0) {
      return null
    }
    
    const channel = channelData.items[0]
    
    return {
      platformName: 'YouTube',
      username: channel.snippet.title,
      followers: formatNumber(parseInt(channel.statistics.subscriberCount)),
      contentCount: formatNumber(parseInt(channel.statistics.videoCount)),
      bio: channel.snippet.description?.slice(0, 200) + '...',
      contentNiche: channel.snippet.description?.slice(0, 100),
      verified: channel.snippet.customUrl ? true : false
    }
    
  } catch (error) {
    console.error('YouTube API error:', error)
    return null
  }
}

export default function DreamPulseWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
  const [viewMode, setViewMode] = useState<'wizard' | 'saved'>('wizard')
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'fallback' | 'error'>('unknown')
  
  const [data, setData] = useState<QuestionnaireData>({
    intrapreneurName: '',
    companyIndustry: '',
    targetStakeholders: [],
    initiativeFrequency: '',
    projectTypes: [],
    uniqueApproach: '',
    weaknesses: '',
    collaborationMethods: [],
    valueCreation: [],
    skillRating: {
      innovation: 0,
      execution: 0,
      leadership: 0,
      persistence: 0
    },
    yourAdvantage: ''
  })

  const totalSteps = 10

  // Load saved analyses from localStorage on component mount
  useEffect(() => {
    const loadSavedAnalyses = () => {
      const saved = localStorage.getItem('dreamPulseSavedAnalyses')
      if (saved) {
        try {
          setSavedAnalyses(JSON.parse(saved))
        } catch (error) {
          console.error('Error loading saved analyses:', error)
        }
      }
    }
    
    loadSavedAnalyses()
    
    // Listen for custom event to switch to saved view
    const handleViewSaved = () => {
      setViewMode('saved')
    }
    
    window.addEventListener('dreampulse:viewSaved', handleViewSaved)
    
    return () => {
      window.removeEventListener('dreampulse:viewSaved', handleViewSaved)
    }
  }, [])

  // Save analysis to localStorage
  const saveAnalysis = async () => {
    console.log('Save analysis clicked!')
    console.log('Analysis result exists:', !!analysisResult)
    console.log('Intrapreneur name exists:', !!data.intrapreneurName)
    console.log('Analysis result length:', analysisResult?.length)
    
    if (!analysisResult || !data.intrapreneurName) {
      console.log('Cannot save: missing analysis result or intrapreneur name')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }

    try {
      setSaveStatus('saving')
      
      const newAnalysis: SavedAnalysis = {
        id: Date.now().toString(),
        title: `Analysis - ${data.intrapreneurName}`,
        competitorUrl: data.intrapreneurName,
        analysisResult,
        data: { ...data },
        savedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      console.log('New analysis created:', newAnalysis)

      const updatedAnalyses = [newAnalysis, ...savedAnalyses]
      setSavedAnalyses(updatedAnalyses)
      localStorage.setItem('dreamPulseSavedAnalyses', JSON.stringify(updatedAnalyses))
      
      // Trigger storage event to update nav bar count
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dreamPulseSavedAnalyses',
        newValue: JSON.stringify(updatedAnalyses)
      }))
      
      console.log('Analysis saved to localStorage')
      console.log('Updated analyses count:', updatedAnalyses.length)
      
      setSaveStatus('saved')
      
      // Navigate to saved analyses view after a brief delay
      setTimeout(() => {
        setViewMode('saved')
        setSelectedAnalysis(newAnalysis)
        setSaveStatus('idle')
        console.log('Navigated to saved view')
      }, 1000)
      
    } catch (error) {
      console.error('Error saving analysis:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // Delete saved analysis
  const deleteAnalysis = (id: string) => {
    const updatedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id)
    setSavedAnalyses(updatedAnalyses)
    localStorage.setItem('dreamPulseSavedAnalyses', JSON.stringify(updatedAnalyses))
    
    // Trigger storage event to update nav bar count
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dreamPulseSavedAnalyses',
      newValue: JSON.stringify(updatedAnalyses)
    }))
    
    if (selectedAnalysis?.id === id) {
      setSelectedAnalysis(null)
    }
  }

  // Load analysis for re-analysis
  const loadAnalysisForReanalysis = (analysis: SavedAnalysis) => {
    setData(analysis.data)
    setAnalysisResult(null)
    setScrapeResult(null)
    setCurrentStep(1)
    setViewMode('wizard')
  }

  const handleUrlSubmit = async () => {
    if (!data.intrapreneurName.trim()) return
    
    try {
      // Detect platform
      const { platform, username } = detectPlatform(data.intrapreneurName)
      
      console.log('Detected platform:', platform, 'Username:', username)
      
      // Accept any link type - don't reject unknown
      const platformNames: Record<string, string> = {
        youtube: 'YouTube',
        instagram: 'Instagram',
        twitter: 'Twitter',
        tiktok: 'TikTok',
        linkedin: 'LinkedIn',
        website: 'Website',
        unknown: 'Name or Link'
      }
      
      // Try to get data based on platform
      let profileData = null
      
      if (platform === 'youtube' && username) {
        profileData = await getYouTubeData(username)
      }
      // Add other platforms here when you implement their APIs
      
      if (profileData) {
        // Success! We got data
        setScrapeResult({
          success: true,
          method: 'scraped',
          platform: platform as any,
          dataQuality: 75,
          preFillData: profileData,
          message: `Found ${profileData.platformName} profile: ${profileData.username} with ${profileData.followers} followers!`
        })
        
        // Pre-fill some data
        if (profileData.contentNiche) {
          setData(prev => ({
            ...prev,
            contentNiche: profileData.contentNiche || prev.contentNiche
          }))
        }
      } else {
        // No data found, but we detected the platform or it's just a name/link
        setScrapeResult({
          success: false,
          method: 'failed',
          platform: platform as any,
          dataQuality: 30,
          preFillData: {
            platformName: platformNames[platform] || 'Link',
            username: username || undefined
          },
          message: platform !== 'unknown' && platform !== 'website' 
            ? `${platformNames[platform]} ${platform === 'linkedin' ? 'profile' : 'link'} detected${username ? ` (@${username})` : ''}. Please fill in details manually.`
            : 'Link or name entered. Please fill in the details below.'
        })
      }
      
    } catch (error) {
      console.error('Profile detection failed:', error)
      setScrapeResult({
        success: false,
        method: 'blocked',
        platform: 'unknown',
        dataQuality: 0,
        preFillData: {},
        message: 'Link or name entered. Please fill in the details below.'
      })
    }
  }

  const handleNext = () => {
      if (currentStep < totalSteps) {
        // If we're on step 1 and have a name, try to scrape it
        if (currentStep === 1 && data.intrapreneurName.trim() && !scrapeResult) {
          handleUrlSubmit()
        }
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setApiStatus('unknown')
    setAnalysisResult(null) // Clear any previous results
    const startTime = Date.now()
    
    try {
      // Create AbortController for timeout handling (90 seconds - reduced from 120)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout
      
      console.log('🚀 Starting analysis request...')
      const response = await fetch('/api/dreampulse/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`⏱️ Request completed in ${duration} seconds`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error', details: response.statusText }))
        throw new Error(errorData.error || errorData.details || `Server error: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Analysis result:', result)
      
      // Check if we got an error
      if (result.error) {
        throw new Error(result.error || 'Analysis failed')
      }
      
      // Check if we got a warning about fallback analysis
      if (result.warning) {
        console.log('⚠️ API warning:', result.warning)
        setApiStatus('fallback')
      } else {
        console.log('✅ Analysis successful - using real Gemini API')
        setApiStatus('working')
      }
      
      // Make sure we have analysis content
      if (result.analysis) {
        setAnalysisResult(result.analysis)
      } else {
        throw new Error('No analysis content received')
      }
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      console.error(`❌ Analysis failed after ${duration} seconds:`, error)
      
      let errorMessage = 'Analysis failed. Please try again.'
      
      if (error.name === 'AbortError') {
        errorMessage = 'Analysis timed out. The request took too long. Please try again with less data or check your connection.'
        setApiStatus('error')
      } else if (error.message) {
        errorMessage = error.message
        setApiStatus('error')
      } else {
        setApiStatus('error')
      }
      
      // Show error to user by setting a result with error message
      setAnalysisResult(`# Analysis Error\n\n**Error:** ${errorMessage}\n\nPlease check:\n- Your internet connection\n- That all required fields are filled\n- Try again in a few moments\n\nIf the problem persists, the API may be experiencing issues.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateData = (field: keyof QuestionnaireData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }


  const toggleArrayItem = (field: 'targetStakeholders' | 'projectTypes' | 'collaborationMethods' | 'valueCreation', value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (value: number) => void, label: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 rounded transition-all duration-150 hover:scale-110 ${
              value >= star 
                ? 'text-yellow-400 dark:text-yellow-500' 
                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
            }`}
          >
            <Star className={`w-6 h-6 ${value >= star ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {value > 0 ? `${value}/5 stars` : 'Click to rate'}
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Who or What Do You Want to Analyze?</h2>
              <p className="text-gray-600 dark:text-gray-400">Enter a name, website link, Instagram link, YouTube link, or LinkedIn link</p>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="e.g., John Smith, https://example.com, https://instagram.com/username, https://youtube.com/@channel, or https://linkedin.com/in/username"
                value={data.intrapreneurName}
                onChange={(e) => updateData('intrapreneurName', e.target.value)}
                className="text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              
              {scrapeResult && (
                <div className={`p-4 rounded-lg border ${
                  scrapeResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {scrapeResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {scrapeResult.success ? 'Profile Found!' : 'Manual Input Required'}
                    </span>
                    {scrapeResult.platform && scrapeResult.platform !== 'unknown' && (
                      <Badge variant={scrapeResult.success ? 'default' : 'secondary'}>
                        {scrapeResult.preFillData.platformName || scrapeResult.platform}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {scrapeResult.message}
                  </p>
                  
                  {scrapeResult.success && scrapeResult.preFillData && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-1">
                      {scrapeResult.preFillData.username && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {scrapeResult.preFillData.username}
                          </span>
                          {scrapeResult.preFillData.verified && (
                            <Badge variant="outline" className="text-xs">✓ Verified</Badge>
                          )}
                        </div>
                      )}
                      
                      {scrapeResult.preFillData.followers && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Target className="w-4 h-4" />
                          <span>{scrapeResult.preFillData.followers} followers/subscribers</span>
                        </div>
                      )}
                      
                      {scrapeResult.preFillData.contentCount && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Zap className="w-4 h-4" />
                          <span>{scrapeResult.preFillData.contentCount} posts/videos</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">What Business Are They In?</h2>
              <p className="text-gray-600 dark:text-gray-400">Just tell us what kind of business or work they do</p>
            </div>
            
            <Textarea
              placeholder="e.g., Tech company, Restaurant, Clothing store, Consulting, Real estate, Healthcare, etc."
              value={data.companyIndustry}
              onChange={(e) => updateData('companyIndustry', e.target.value)}
              className="min-h-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Who Do They Work With?</h2>
              <p className="text-gray-600 dark:text-gray-400">Who are their main customers, partners, or people they serve?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {TARGET_STAKEHOLDERS_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={data.targetStakeholders.includes(option)}
                    onCheckedChange={() => toggleArrayItem('targetStakeholders', option)}
                  />
                  <label htmlFor={option} className="text-sm font-medium text-gray-900 dark:text-white">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">How Often Do They Launch New Things?</h2>
              <p className="text-gray-600 dark:text-gray-400">How frequently do they start new projects, products, or campaigns?</p>
            </div>
            
            <Textarea
              placeholder="e.g., Every week, Once a month, 2-3 times per year, Daily, etc."
              value={data.initiativeFrequency}
              onChange={(e) => updateData('initiativeFrequency', e.target.value)}
              className="min-h-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">What Do They Work On?</h2>
              <p className="text-gray-600 dark:text-gray-400">What kinds of things do they create or work on? (Check all that apply)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {PROJECT_TYPES_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={data.projectTypes.includes(option)}
                    onCheckedChange={() => toggleArrayItem('projectTypes', option)}
                  />
                  <label htmlFor={option} className="text-sm font-medium text-gray-900 dark:text-white">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">What Makes Them Special?</h2>
              <p className="text-gray-600 dark:text-gray-400">What do they do differently or better than others?</p>
            </div>
            
            <Textarea
              placeholder="e.g., They use data to make decisions, They move fast, They take risks, They focus on customer needs, etc."
              value={data.uniqueApproach}
              onChange={(e) => updateData('uniqueApproach', e.target.value)}
              className="min-h-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">What Are Their Weaknesses?</h2>
              <p className="text-gray-600 dark:text-gray-400">Where do they struggle or what problems do they have?</p>
            </div>
            
            <Textarea
              placeholder="e.g., They're slow to make decisions, They don't have enough money, They don't adapt quickly, etc."
              value={data.weaknesses}
              onChange={(e) => updateData('weaknesses', e.target.value)}
              className="min-h-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">How Do They Work With People?</h2>
              <p className="text-gray-600 dark:text-gray-400">How do they work with their team, customers, or partners? (Check all that apply)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {COLLABORATION_METHODS_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={data.collaborationMethods.includes(option)}
                    onCheckedChange={() => toggleArrayItem('collaborationMethods', option)}
                  />
                  <label htmlFor={option} className="text-sm font-medium text-gray-900 dark:text-white">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">What Value Do They Create?</h2>
              <p className="text-gray-600 dark:text-gray-400">What benefits or results do they deliver?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {VALUE_CREATION_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={data.valueCreation.includes(option)}
                    onCheckedChange={() => toggleArrayItem('valueCreation', option)}
                  />
                  <label htmlFor={option} className="text-sm font-medium text-gray-900 dark:text-white">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Rate Their Skills</h2>
              <p className="text-gray-600 dark:text-gray-400">How good are they at these things? (1-5 stars)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <StarRating
                value={data.skillRating.innovation}
                onChange={(value) => updateData('skillRating', { ...data.skillRating, innovation: value })}
                label="Coming Up With New Ideas"
              />
              <StarRating
                value={data.skillRating.execution}
                onChange={(value) => updateData('skillRating', { ...data.skillRating, execution: value })}
                label="Getting Things Done"
              />
              <StarRating
                value={data.skillRating.leadership}
                onChange={(value) => updateData('skillRating', { ...data.skillRating, leadership: value })}
                label="Leading & Influencing Others"
              />
              <StarRating
                value={data.skillRating.persistence}
                onChange={(value) => updateData('skillRating', { ...data.skillRating, persistence: value })}
                label="Not Giving Up (Persistence)"
              />
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">How Will You Be Better?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">What will you do differently or better than them?</p>
              <Textarea
                placeholder="e.g., I'll move faster, I'll use better data, I'll communicate more clearly, I'll be more creative, etc."
                value={data.yourAdvantage}
                onChange={(e) => updateData('yourAdvantage', e.target.value)}
                className="min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (analysisResult) {
    const parsedSections = parseAnalysisResult(analysisResult)
    const reportTitleMatch = analysisResult.match(/^# (.+)/)
    const reportTitle = reportTitleMatch ? reportTitleMatch[1] : 'Competitive Analysis Report'

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{reportTitle}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Analysis for {data.intrapreneurName}</p>
          
          {/* API Status Indicator */}
          {apiStatus === 'fallback' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded text-sm inline-flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-2" />
              Using fallback analysis
            </div>
          )}
          {apiStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-1.5 rounded text-sm inline-flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-2" />
              Analysis error
            </div>
          )}
          {apiStatus === 'working' && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded text-sm inline-flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-2" />
              Analysis completed
            </div>
          )}
        </div>

        {/* Multiple Section Containers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {parsedSections.map((section, index) => (
            <Card key={index} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm hover:border-[#39d2c0]/30 dark:hover:border-[#39d2c0]/30 transition-colors duration-200 flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="break-words">{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 flex-1 overflow-x-auto overflow-y-auto min-h-0 min-w-0">
                <div>
                  <ReactMarkdown 
                    components={{
                      p: ({ children }) => <p className="mb-3 text-sm leading-relaxed whitespace-normal">{children}</p>,
                      ul: ({ children }) => <ul className="mb-3 space-y-1 text-sm">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-3 space-y-1 text-sm">{children}</ol>,
                      li: ({ children }) => <li className="text-sm leading-relaxed whitespace-normal">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                      h3: ({ children }) => <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-3 whitespace-normal">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 mt-2 whitespace-normal">{children}</h4>,
                    }}
                  >
                    {formatContentForReadability(section.content)}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Save Status Message */}
        {saveStatus === 'saved' && (
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-2 rounded-md flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Analysis saved successfully! Redirecting to saved analyses...
            </div>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-2 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Error saving analysis. Please try again.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button 
            onClick={async () => {
              const pdfData: PDFData = {
                title: `Intrapreneur Analysis Report - ${data.intrapreneurName}`,
                subtitle: 'Intrapreneur Intelligence Dashboard',
                companyName: data.intrapreneurName,
                analysisDate: new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                competitorUrl: data.intrapreneurName,
                content: analysisResult,
                metadata: {
                  author: 'DreamScale AI',
                  version: '1.0',
                  category: 'Intrapreneur Analysis'
                }
              }
              await downloadPDF(pdfData, `intrapreneur-analysis-${data.intrapreneurName.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.pdf`)
            }}
            variant="outline"
            size="lg"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            onClick={() => {
              const pdfData: PDFData = {
                title: `Intrapreneur Analysis Report - ${data.intrapreneurName}`,
                subtitle: 'Intrapreneur Intelligence Dashboard',
                companyName: data.intrapreneurName,
                analysisDate: new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                competitorUrl: data.intrapreneurName,
                content: analysisResult,
                metadata: {
                  author: 'DreamScale AI',
                  version: '1.0',
                  category: 'Intrapreneur Analysis'
                }
              }
              printPDF(pdfData)
            }}
            variant="outline"
            size="lg"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button 
            onClick={saveAnalysis}
            size="lg"
            disabled={saveStatus === 'saving'}
            className={`px-8 ${
              saveStatus === 'saved' 
                ? 'bg-green-700 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Error
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Analysis
              </>
            )}
          </Button>
          <Button 
            onClick={() => {
              setAnalysisResult(null)
                setCurrentStep(1)
                setData({
                  intrapreneurName: '',
                  companyIndustry: '',
                  targetStakeholders: [],
                  initiativeFrequency: '',
                  projectTypes: [],
                  uniqueApproach: '',
                  weaknesses: '',
                  collaborationMethods: [],
                  valueCreation: [],
                  skillRating: {
                    innovation: 0,
                    execution: 0,
                    leadership: 0,
                    persistence: 0
                  },
                  yourAdvantage: ''
                })
              setScrapeResult(null)
            }}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Analyze Another
          </Button>
        </div>
      </div>
    )
  }

  if (viewMode === 'saved') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setViewMode('wizard')}
                variant="outline"
                size="default"
                className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Analyses</h1>
            </div>
            <Button 
              onClick={() => setViewMode('wizard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </Button>
          </div>
        </div>

        {savedAnalyses.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Saved Analyses</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your saved competitive analyses will appear here.</p>
            <Button onClick={() => setViewMode('wizard')} className="bg-blue-600 hover:bg-blue-700">
              Start New Analysis
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Analysis List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Analyses</h2>
                <Badge variant="secondary" className="text-sm">
                  {savedAnalyses.length} saved
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {savedAnalyses.map((analysis) => (
                  <Card 
                    key={analysis.id} 
                    className={`cursor-pointer transition-colors hover:border-[#39d2c0]/50 ${
                      selectedAnalysis?.id === analysis.id 
                        ? 'ring-2 ring-[#39d2c0]/30 border-[#39d2c0]/50' 
                        : 'border-gray-200 dark:border-slate-800'
                    }`}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {analysis.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {analysis.competitorUrl}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Saved {new Date(analysis.savedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              loadAnalysisForReanalysis(analysis)
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Re-analyze
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteAnalysis(analysis.id)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Analysis View */}
            {selectedAnalysis && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Details</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {new Date(selectedAnalysis.savedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-6">
                  {/* Analysis Summary Card */}
                  <Card className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-gray-900 dark:text-white mb-2">
                            {selectedAnalysis.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Globe className="w-4 h-4" />
                            {selectedAnalysis.competitorUrl}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(selectedAnalysis.savedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Company Industry
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedAnalysis.data.companyIndustry || 'Not specified'}
                          </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Target Stakeholders
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedAnalysis.data.targetStakeholders.map((audience, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {audience}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Your Advantage
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedAnalysis.data.yourAdvantage || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Export Analysis</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Download or print this analysis for sharing and reference.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={async () => {
                          const pdfData: PDFData = {
                            title: `Intrapreneur Analysis Report - ${selectedAnalysis.competitorUrl}`,
                            subtitle: 'Intrapreneur Intelligence Dashboard',
                            companyName: selectedAnalysis.competitorUrl,
                            analysisDate: new Date(selectedAnalysis.savedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }),
                            competitorUrl: selectedAnalysis.competitorUrl,
                            content: selectedAnalysis.analysisResult,
                            metadata: {
                              author: 'DreamScale AI',
                              version: '1.0',
                              category: 'Intrapreneur Analysis'
                            }
                          }
                          await downloadPDF(pdfData, `intrapreneur-analysis-${selectedAnalysis.competitorUrl.replace(/[^a-z0-9]/gi, '_')}-${selectedAnalysis.id}.pdf`)
                        }}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        onClick={async () => {
                          const pdfData: PDFData = {
                            title: `Intrapreneur Analysis Report - ${selectedAnalysis.competitorUrl}`,
                            subtitle: 'Intrapreneur Intelligence Dashboard',
                            companyName: selectedAnalysis.competitorUrl,
                            analysisDate: new Date(selectedAnalysis.savedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }),
                            competitorUrl: selectedAnalysis.competitorUrl,
                            content: selectedAnalysis.analysisResult,
                            metadata: {
                              author: 'DreamScale AI',
                              version: '1.0',
                              category: 'Intrapreneur Analysis'
                            }
                          }
                          await downloadPDF(pdfData, `intrapreneur-analysis-${selectedAnalysis.competitorUrl.replace(/[^a-z0-9]/gi, '_')}-${selectedAnalysis.id}.pdf`)
                        }}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>

                  {/* Analysis Sections in Container Layout */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Full Analysis</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {parseAnalysisResult(selectedAnalysis.analysisResult).map((section, index) => (
                        <Card key={index} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm hover:border-[#39d2c0]/30 dark:hover:border-[#39d2c0]/30 transition-colors duration-200 flex flex-col">
                          <CardHeader className="pb-4 flex-shrink-0">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <span className="break-words">{section.title}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 flex-1 overflow-x-auto overflow-y-auto min-h-0 min-w-0">
                            <div>
                              <ReactMarkdown 
                                components={{
                                  p: ({ children }) => <p className="mb-3 text-sm leading-relaxed whitespace-normal">{children}</p>,
                                  ul: ({ children }) => <ul className="mb-3 space-y-1 text-sm">{children}</ul>,
                                  ol: ({ children }) => <ol className="mb-3 space-y-1 text-sm">{children}</ol>,
                                  li: ({ children }) => <li className="text-sm leading-relaxed whitespace-normal">{children}</li>,
                                  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                                  h3: ({ children }) => <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-3 whitespace-normal">{children}</h3>,
                                  h4: ({ children }) => <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 mt-2 whitespace-normal">{children}</h4>,
                                }}
                              >
                                {formatContentForReadability(section.content)}
                              </ReactMarkdown>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              )}
            </div>
        
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Intrapreneur Intelligence Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Step {currentStep} of {totalSteps}</span>
            <Button 
              onClick={() => setViewMode('saved')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              {savedAnalyses.length > 0 ? `Saved Analysis (${savedAnalyses.length})` : 'View Saved Analysis'}
            </Button>
          </div>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep === totalSteps ? (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !data.companyIndustry.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Analysis
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={currentStep === 1 && !data.intrapreneurName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
