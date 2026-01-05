'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Users,
  TrendingUp,
  FileText,
  Share
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { downloadPDF, printPDF, PDFData } from '@/lib/pdf-generator'
import CompetitiveIntelligenceDashboard from './CompetitiveIntelligenceDashboard'
import { ShareModal } from '@/components/share-modal'

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
  contentNiche?: string  // Content niche for social media profiles
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
  const [reportViewMode, setReportViewMode] = useState<'dashboard' | 'detailed'>('dashboard')
  const [shareModal, setShareModal] = useState<{isOpen: boolean, content: string, title: string}>({
    isOpen: false,
    content: '',
    title: ''
  })
  
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

  // State for "Other" custom inputs
  const [otherInputs, setOtherInputs] = useState<{
    companyIndustry?: string
    initiativeFrequency?: string
    uniqueApproach?: string
    weaknesses?: string
    yourAdvantage?: string
    targetStakeholders?: string
    projectTypes?: string
    collaborationMethods?: string
    valueCreation?: string
  }>({})
  
  // State for showing "Other" input fields
  const [showOtherIndustry, setShowOtherIndustry] = useState(false)
  const [showOtherFrequency, setShowOtherFrequency] = useState(false)
  const [showOtherApproach, setShowOtherApproach] = useState(false)
  const [showOtherWeakness, setShowOtherWeakness] = useState(false)
  const [showOtherAdvantage, setShowOtherAdvantage] = useState(false)
  const [showOtherTargetStakeholders, setShowOtherTargetStakeholders] = useState(false)
  const [showOtherProjectTypes, setShowOtherProjectTypes] = useState(false)
  const [showOtherCollaborationMethods, setShowOtherCollaborationMethods] = useState(false)
  const [showOtherValueCreation, setShowOtherValueCreation] = useState(false)

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
      
      // Make sure we have analysis content and convert to string if needed
      if (result.analysis) {
        // Ensure analysis is always a string (handle cases where API might return an object)
        const analysisString = typeof result.analysis === 'string' 
          ? result.analysis 
          : JSON.stringify(result.analysis, null, 2)
        setAnalysisResult(analysisString)
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

  // Choice Chip Component
  const ChoiceChip = ({ 
    label, 
    selected, 
    onClick 
  }: { 
    label: string
    selected: boolean
    onClick: () => void
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-600'
      }`}
    >
      {label}
    </button>
  )

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (value: number) => void, label: string }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-900 dark:text-white">{label}</label>
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-0.5 rounded transition-colors ${
              value >= star 
                ? 'text-yellow-400 dark:text-yellow-500' 
                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
            }`}
          >
            <Star className={`w-4 h-4 ${value >= star ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {value > 0 ? `${value}/5` : 'Click to rate'}
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Who or What Do You Want to Analyze?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter a name, website link, Instagram link, YouTube link, or LinkedIn link
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="e.g., John Smith, https://example.com, https://instagram.com/username"
                  value={data.intrapreneurName}
                  onChange={(e) => updateData('intrapreneurName', e.target.value)}
                  className="h-10 text-sm border-gray-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500"
                />
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {scrapeResult && (
                <div className={`p-3 rounded-lg border ${
                  scrapeResult.success 
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {scrapeResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {scrapeResult.success ? 'Profile Found!' : 'Manual Input Required'}
                    </span>
                    {scrapeResult.platform && scrapeResult.platform !== 'unknown' && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {scrapeResult.preFillData.platformName || scrapeResult.platform}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {scrapeResult.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        const industryOptions = [
          'Technology / SaaS',
          'E-commerce / Retail',
          'Healthcare',
          'Finance / Fintech',
          'Education',
          'Real Estate',
          'Consulting',
          'Manufacturing',
          'Food & Beverage',
          'Media / Entertainment',
          'Travel / Hospitality',
          'Energy / Utilities'
        ]
        
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                What Business Are They In?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select an industry or specify your own
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {industryOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={data.companyIndustry === option}
                    onClick={() => {
                      updateData('companyIndustry', option)
                      setShowOtherIndustry(false)
                      setOtherInputs(prev => ({ ...prev, companyIndustry: undefined }))
                    }}
                  />
                ))}
                <ChoiceChip
                  label="Other"
                  selected={showOtherIndustry}
                  onClick={() => {
                    setShowOtherIndustry(true)
                    updateData('companyIndustry', '')
                  }}
                />
              </div>
              
              {showOtherIndustry && (
                <Input
                  placeholder="Specify the industry..."
                  value={otherInputs.companyIndustry || ''}
                  onChange={(e) => {
                    setOtherInputs(prev => ({ ...prev, companyIndustry: e.target.value }))
                    updateData('companyIndustry', e.target.value)
                  }}
                  className="h-10 text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Who Do They Work With?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select all that apply - their main customers, partners, or people they serve
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {TARGET_STAKEHOLDERS_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={data.targetStakeholders.includes(option)}
                    onClick={() => {
                      toggleArrayItem('targetStakeholders', option)
                      setShowOtherTargetStakeholders(false)
                    }}
                  />
                ))}
                <ChoiceChip
                  label="Other"
                  selected={showOtherTargetStakeholders || data.targetStakeholders.some(item => item.startsWith('Other: '))}
                  onClick={() => {
                    setShowOtherTargetStakeholders(true)
                    // Extract existing "Other" value if present
                    const otherValue = data.targetStakeholders.find(item => item.startsWith('Other: '))
                    if (otherValue) {
                      setOtherInputs(prev => ({ ...prev, targetStakeholders: otherValue.replace('Other: ', '') }))
                    }
                  }}
                />
              </div>
              
              {showOtherTargetStakeholders && (
                <Input
                  placeholder="Specify other stakeholders..."
                  value={otherInputs.targetStakeholders || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setOtherInputs(prev => ({ ...prev, targetStakeholders: value }))
                    // Remove any previous "Other" value and add new one
                    const filtered = data.targetStakeholders.filter(item => !item.startsWith('Other: '))
                    if (value.trim()) {
                      updateData('targetStakeholders', [...filtered, `Other: ${value.trim()}`])
                    } else {
                      updateData('targetStakeholders', filtered)
                    }
                  }}
                  onBlur={() => {
                    if (!otherInputs.targetStakeholders?.trim()) {
                      setShowOtherTargetStakeholders(false)
                    }
                  }}
                  className="h-10 text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
        )

      case 4:
        const frequencyOptions = [
          'Daily',
          'Weekly',
          'Monthly',
          'Quarterly',
          '2-3 times per year',
          'Annually',
          'As needed / On-demand'
        ]
        
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                How Often Do They Launch New Things?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How frequently do they start new projects, products, or campaigns?
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {frequencyOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={data.initiativeFrequency === option}
                    onClick={() => {
                      updateData('initiativeFrequency', option)
                      setShowOtherFrequency(false)
                      setOtherInputs(prev => ({ ...prev, initiativeFrequency: undefined }))
                    }}
                  />
                ))}
                <ChoiceChip
                  label="Other"
                  selected={showOtherFrequency}
                  onClick={() => {
                    setShowOtherFrequency(true)
                    updateData('initiativeFrequency', '')
                  }}
                />
              </div>
              
              {showOtherFrequency && (
                <Input
                  placeholder="Specify frequency..."
                  value={otherInputs.initiativeFrequency || ''}
                  onChange={(e) => {
                    setOtherInputs(prev => ({ ...prev, initiativeFrequency: e.target.value }))
                    updateData('initiativeFrequency', e.target.value)
                  }}
                  className="h-10 text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                What Do They Work On?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select all that apply - what kinds of things do they create or work on?
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {PROJECT_TYPES_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={data.projectTypes.includes(option)}
                    onClick={() => {
                      toggleArrayItem('projectTypes', option)
                      setShowOtherProjectTypes(false)
                    }}
                  />
                ))}
                <ChoiceChip
                  label="Other"
                  selected={showOtherProjectTypes || data.projectTypes.some(item => item.startsWith('Other: '))}
                  onClick={() => {
                    setShowOtherProjectTypes(true)
                    // Extract existing "Other" value if present
                    const otherValue = data.projectTypes.find(item => item.startsWith('Other: '))
                    if (otherValue) {
                      setOtherInputs(prev => ({ ...prev, projectTypes: otherValue.replace('Other: ', '') }))
                    }
                  }}
                />
              </div>
              
              {showOtherProjectTypes && (
                <Input
                  placeholder="Specify other project types..."
                  value={otherInputs.projectTypes || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setOtherInputs(prev => ({ ...prev, projectTypes: value }))
                    // Remove any previous "Other" value and add new one
                    const filtered = data.projectTypes.filter(item => !item.startsWith('Other: '))
                    if (value.trim()) {
                      updateData('projectTypes', [...filtered, `Other: ${value.trim()}`])
                    } else {
                      updateData('projectTypes', filtered)
                    }
                  }}
                  onBlur={() => {
                    if (!otherInputs.projectTypes?.trim()) {
                      setShowOtherProjectTypes(false)
                    }
                  }}
                  className="h-10 text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
        )

      case 6:
        const uniqueApproachOptions = [
          'Data-driven decision making',
          'Fast execution / Speed',
          'Risk-taking / Innovation',
          'Customer-centric approach',
          'Technology-first mindset',
          'Strong brand / Marketing',
          'Cost efficiency',
          'Quality / Excellence',
          'Strategic partnerships',
          'Agile methodology'
        ]
        
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                What Makes Them Special?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                What do they do differently or better than others?
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {uniqueApproachOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={data.uniqueApproach === option}
                    onClick={() => {
                      updateData('uniqueApproach', option)
                      setShowOtherApproach(false)
                      setOtherInputs(prev => ({ ...prev, uniqueApproach: undefined }))
                    }}
                  />
                ))}
                <ChoiceChip
                  label="Other"
                  selected={showOtherApproach}
                  onClick={() => {
                    setShowOtherApproach(true)
                    updateData('uniqueApproach', '')
                  }}
                />
              </div>
              
              {showOtherApproach && (
                <Textarea
                  placeholder="Describe what makes them special..."
                  value={otherInputs.uniqueApproach || ''}
                  onChange={(e) => {
                    setOtherInputs(prev => ({ ...prev, uniqueApproach: e.target.value }))
                    updateData('uniqueApproach', e.target.value)
                  }}
                  className="min-h-[80px] text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
        )

      case 7:
        const weaknessOptions = [
          'Slow decision-making',
          'Limited resources / Funding',
          'Slow to adapt to change',
          'Poor communication',
          'Lack of innovation',
          'High employee turnover',
          'Weak market presence',
          'Outdated technology',
          'Limited scalability',
          'Regulatory challenges'
        ]
        
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                What Are Their Weaknesses?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Where do they struggle or what problems do they have?
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {weaknessOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={data.weaknesses === option}
                    onClick={() => {
                      updateData('weaknesses', option)
                      setShowOtherWeakness(false)
                      setOtherInputs(prev => ({ ...prev, weaknesses: undefined }))
                    }}
                  />
                ))}
                <ChoiceChip
                  label="Other"
                  selected={showOtherWeakness}
                  onClick={() => {
                    setShowOtherWeakness(true)
                    updateData('weaknesses', '')
                  }}
                />
              </div>
              
              {showOtherWeakness && (
                <Textarea
                  placeholder="Describe their weaknesses..."
                  value={otherInputs.weaknesses || ''}
                  onChange={(e) => {
                    setOtherInputs(prev => ({ ...prev, weaknesses: e.target.value }))
                    updateData('weaknesses', e.target.value)
                  }}
                  className="min-h-[80px] text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                How Do They Work With People?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select all that apply - how do they work with their team, customers, or partners?
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {COLLABORATION_METHODS_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={data.collaborationMethods.includes(option)}
                    onClick={() => {
                      toggleArrayItem('collaborationMethods', option)
                      setShowOtherCollaborationMethods(false)
                    }}
                  />
                ))}
                <ChoiceChip
                  label="Other"
                  selected={showOtherCollaborationMethods || data.collaborationMethods.some(item => item.startsWith('Other: '))}
                  onClick={() => {
                    setShowOtherCollaborationMethods(true)
                    // Extract existing "Other" value if present
                    const otherValue = data.collaborationMethods.find(item => item.startsWith('Other: '))
                    if (otherValue) {
                      setOtherInputs(prev => ({ ...prev, collaborationMethods: otherValue.replace('Other: ', '') }))
                    }
                  }}
                />
              </div>
              
              {showOtherCollaborationMethods && (
                <Input
                  placeholder="Specify other collaboration methods..."
                  value={otherInputs.collaborationMethods || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setOtherInputs(prev => ({ ...prev, collaborationMethods: value }))
                    // Remove any previous "Other" value and add new one
                    const filtered = data.collaborationMethods.filter(item => !item.startsWith('Other: '))
                    if (value.trim()) {
                      updateData('collaborationMethods', [...filtered, `Other: ${value.trim()}`])
                    } else {
                      updateData('collaborationMethods', filtered)
                    }
                  }}
                  onBlur={() => {
                    if (!otherInputs.collaborationMethods?.trim()) {
                      setShowOtherCollaborationMethods(false)
                    }
                  }}
                  className="h-10 text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                What Value Do They Create?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select all that apply - what benefits or results do they deliver?
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {VALUE_CREATION_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={data.valueCreation.includes(option)}
                    onClick={() => {
                      toggleArrayItem('valueCreation', option)
                      setShowOtherValueCreation(false)
                    }}
                  />
                ))}
                <ChoiceChip
                  label="Other"
                  selected={showOtherValueCreation || data.valueCreation.some(item => item.startsWith('Other: '))}
                  onClick={() => {
                    setShowOtherValueCreation(true)
                    // Extract existing "Other" value if present
                    const otherValue = data.valueCreation.find(item => item.startsWith('Other: '))
                    if (otherValue) {
                      setOtherInputs(prev => ({ ...prev, valueCreation: otherValue.replace('Other: ', '') }))
                    }
                  }}
                />
              </div>
              
              {showOtherValueCreation && (
                <Input
                  placeholder="Specify other value creation..."
                  value={otherInputs.valueCreation || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setOtherInputs(prev => ({ ...prev, valueCreation: value }))
                    // Remove any previous "Other" value and add new one
                    const filtered = data.valueCreation.filter(item => !item.startsWith('Other: '))
                    if (value.trim()) {
                      updateData('valueCreation', [...filtered, `Other: ${value.trim()}`])
                    } else {
                      updateData('valueCreation', filtered)
                    }
                  }}
                  onBlur={() => {
                    if (!otherInputs.valueCreation?.trim()) {
                      setShowOtherValueCreation(false)
                    }
                  }}
                  className="h-10 text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Rate Their Skills
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How good are they at these things? (1-5 stars)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
            
            <div className="mt-6 space-y-3 pt-4 border-t border-gray-200 dark:border-slate-800">
              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  How Will You Be Better?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  What will you do differently or better than them?
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    'Move faster / More agile',
                    'Better data-driven decisions',
                    'Clearer communication',
                    'More creative solutions',
                    'Better customer focus',
                    'Lower costs / More efficient',
                    'Better technology',
                    'Stronger team',
                    'Better market positioning',
                    'More innovative approach',
                    'Better user experience',
                    'Faster time to market'
                  ].map((option) => (
                    <ChoiceChip
                      key={option}
                      label={option}
                      selected={data.yourAdvantage === option}
                      onClick={() => {
                        updateData('yourAdvantage', option)
                        setShowOtherAdvantage(false)
                        setOtherInputs(prev => ({ ...prev, yourAdvantage: undefined }))
                      }}
                    />
                  ))}
                  <ChoiceChip
                    label="Other"
                    selected={showOtherAdvantage}
                    onClick={() => {
                      setShowOtherAdvantage(true)
                      updateData('yourAdvantage', '')
                    }}
                  />
                </div>
                
                {showOtherAdvantage && (
                  <Textarea
                    placeholder="Describe how you'll be better..."
                    value={otherInputs.yourAdvantage || ''}
                    onChange={(e) => {
                      setOtherInputs(prev => ({ ...prev, yourAdvantage: e.target.value }))
                      updateData('yourAdvantage', e.target.value)
                    }}
                    className="min-h-[80px] text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                    autoFocus
                  />
                )}
              </div>
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/50 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Analysis Complete</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
            {reportTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
            Analysis for <span className="font-semibold text-gray-900 dark:text-white">{data.intrapreneurName}</span>
          </p>
          
          {/* View Toggle */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant={reportViewMode === 'dashboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReportViewMode('dashboard')}
              className="h-9"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={reportViewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReportViewMode('detailed')}
              className="h-9"
            >
              <FileText className="w-4 h-4 mr-2" />
              Detailed Report
            </Button>
          </div>
          
          {/* API Status Indicator */}
          {apiStatus === 'fallback' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Using fallback analysis
            </div>
          )}
          {apiStatus === 'error' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Analysis error
            </div>
          )}
          {apiStatus === 'working' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Analysis completed successfully
            </div>
          )}
        </div>

        {/* Dashboard View */}
        {reportViewMode === 'dashboard' ? (
          <CompetitiveIntelligenceDashboard 
            analysisResult={analysisResult}
            skillRating={data.skillRating}
            data={data}
          />
        ) : (
          /* Detailed Report View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {parsedSections.map((section, index) => (
              <Card 
                key={index} 
                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-gray-200/50 dark:border-slate-800/50 shadow-lg shadow-gray-200/20 dark:shadow-black/20 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <CardHeader className="pb-4 flex-shrink-0 bg-gradient-to-r from-gray-50 to-transparent dark:from-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 shadow-sm"></div>
                    <span className="break-words">{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 flex-1 overflow-x-auto overflow-y-auto min-h-0 min-w-0 p-6 px-8">
                  <div>
                    <ReactMarkdown 
                      components={{
                        p: ({ children }) => <p className="mb-4 text-[15px] leading-relaxed whitespace-normal text-gray-700 dark:text-gray-300">{children}</p>,
                        ul: ({ children }) => {
                          // Filter out empty list items
                          const validChildren = React.Children.toArray(children).filter((child: any) => {
                            if (typeof child === 'string') return child.trim().length > 0
                            if (child?.props?.children) {
                              const text = typeof child.props.children === 'string' 
                                ? child.props.children 
                                : React.Children.toArray(child.props.children).join('')
                              return text.trim().length > 0
                            }
                            return false
                          })
                          if (validChildren.length === 0) return null
                          // Remove list styling since items will be rendered as headings
                          return <div className="mb-4 space-y-3">{validChildren}</div>
                        },
                        ol: ({ children }) => {
                          // Filter out empty list items
                          const validChildren = React.Children.toArray(children).filter((child: any) => {
                            if (typeof child === 'string') return child.trim().length > 0
                            if (child?.props?.children) {
                              const text = typeof child.props.children === 'string' 
                                ? child.props.children 
                                : React.Children.toArray(child.props.children).join('')
                              return text.trim().length > 0
                            }
                            return false
                          })
                          if (validChildren.length === 0) return null
                          return <ol className="mb-4 space-y-2 text-[15px] list-decimal list-inside">{validChildren}</ol>
                        },
                        li: ({ children }) => {
                          // Don't render if empty or only whitespace
                          const text = typeof children === 'string' 
                            ? children 
                            : React.Children.toArray(children).join('')
                          if (!text || text.trim().length === 0) return null
                          
                          // Check if this looks like a title (has colon followed by description)
                          const trimmedText = text.trim()
                          const hasColon = trimmedText.includes(':')
                          const parts = hasColon ? trimmedText.split(':') : []
                          const titlePart = parts[0]?.trim() || ''
                          const descriptionPart = parts.slice(1).join(':').trim()
                          
                          // If it has a colon and the title part is relatively short (likely a title), render as heading
                          if (hasColon && titlePart.length > 0 && titlePart.length < 100 && descriptionPart.length > 0) {
                            return (
                              <div className="mb-3">
                                <h5 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-2">{titlePart}:</h5>
                                <p className="text-[15px] leading-relaxed whitespace-normal text-gray-700 dark:text-gray-300 ml-0">{descriptionPart}</p>
                              </div>
                            )
                          }
                          
                          // Otherwise render as normal list item
                          return <li className="text-[15px] leading-relaxed whitespace-normal text-gray-700 dark:text-gray-300">{children}</li>
                        },
                        strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                        h3: ({ children }) => <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-5 whitespace-normal">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4 whitespace-normal">{children}</h4>,
                      }}
                    >
                      {formatContentForReadability(section.content)}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
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
        <div className="flex flex-wrap justify-center gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-slate-800">
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
            className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-900 px-6 py-6 font-semibold transition-all"
          >
            <Download className="w-5 h-5" />
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
            className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-900 px-6 py-6 font-semibold transition-all"
          >
            <Printer className="w-5 h-5" />
            Print Report
          </Button>
          <Button 
            onClick={() => {
              setShareModal({
                isOpen: true,
                content: analysisResult,
                title: `Competitor Analysis - ${data.intrapreneurName}`
              })
            }}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-900 px-6 py-6 font-semibold transition-all"
          >
            <Share className="w-5 h-5" />
            Share
          </Button>
          <Button 
            onClick={saveAnalysis}
            size="lg"
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-2 px-6 py-6 font-semibold transition-all ${
              saveStatus === 'saved' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30' 
                : saveStatus === 'error'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Error
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
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
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 px-6 py-6 font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            Analyze Another
          </Button>
        </div>
      </div>
    )
  }

  if (viewMode === 'saved') {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setViewMode('wizard')}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Analyses
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                View and manage your saved analyses
              </p>
            </div>
          </div>
            <Button 
              onClick={() => setViewMode('wizard')}
              size="sm"
              className="h-9 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Analysis
            </Button>
        </div>

        {savedAnalyses.length === 0 ? (
          <Card className="p-8 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
              <BookOpen className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Saved Analyses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your saved competitive analyses will appear here. Start your first analysis to get insights.
            </p>
            <Button 
              onClick={() => setViewMode('wizard')} 
              size="sm"
              className="h-9 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
            >
              Start New Analysis
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Analysis List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Saved Analyses</h2>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {savedAnalyses.length}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {savedAnalyses.map((analysis) => (
                  <Card 
                    key={analysis.id} 
                    className={`group cursor-pointer transition-all bg-white dark:bg-slate-900 border ${
                      selectedAnalysis?.id === analysis.id 
                        ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                              {analysis.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {analysis.competitorUrl}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(analysis.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              loadAnalysisForReanalysis(analysis)
                            }}
                            className="text-xs h-7 px-2 flex-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Re-analyze
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteAnalysis(analysis.id)
                            }}
                            className="h-7 px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3 h-3" />
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
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAnalysis.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span>{selectedAnalysis.competitorUrl}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        Saved {new Date(selectedAnalysis.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={reportViewMode === 'dashboard' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReportViewMode('dashboard')}
                      className="h-9"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant={reportViewMode === 'detailed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReportViewMode('detailed')}
                      className="h-9"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Detailed Report
                    </Button>
                  </div>
                </div>

                {/* Dashboard View */}
                {reportViewMode === 'dashboard' ? (
                  <CompetitiveIntelligenceDashboard 
                    analysisResult={selectedAnalysis.analysisResult}
                    skillRating={selectedAnalysis.data.skillRating}
                    data={selectedAnalysis.data}
                  />
                ) : (
                  /* Detailed Report View */
                  <div className="space-y-4">
                    {/* Analysis Summary Card */}
                    <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                          Analysis Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                            <h4 className="font-medium text-xs text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Industry
                            </h4>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {selectedAnalysis.data.companyIndustry || 'Not specified'}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                              <h4 className="font-medium text-xs text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Stakeholders
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedAnalysis.data.targetStakeholders.length > 0 ? (
                                selectedAnalysis.data.targetStakeholders.map((audience, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                                    {audience}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">Not specified</span>
                              )}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                            <h4 className="font-medium text-xs text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Advantage
                            </h4>
                            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                              {selectedAnalysis.data.yourAdvantage || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Export Analysis</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Download or print this analysis.
                        </p>
                      </div>
                      <div className="flex gap-2">
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
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
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
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1.5" />
                          Print
                        </Button>
                      </div>
                    </div>

                    {/* Analysis Sections in Container Layout */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Full Analysis</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {parseAnalysisResult(selectedAnalysis.analysisResult).map((section, index) => (
                          <Card key={index} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden">
                            <CardHeader className="pb-2 flex-shrink-0 border-b border-gray-100 dark:border-slate-800">
                              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <span className="break-words">{section.title}</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 flex-1 overflow-x-auto overflow-y-auto min-h-0 min-w-0 p-6 px-8">
                              <div>
                                <ReactMarkdown 
                                  components={{
                                    p: ({ children }) => <p className="mb-2 text-sm leading-relaxed whitespace-normal text-gray-700 dark:text-gray-300">{children}</p>,
                                    ul: ({ children }) => {
                                      // Filter out empty list items
                                      const validChildren = React.Children.toArray(children).filter((child: any) => {
                                        if (typeof child === 'string') return child.trim().length > 0
                                        if (child?.props?.children) {
                                          const text = typeof child.props.children === 'string' 
                                            ? child.props.children 
                                            : React.Children.toArray(child.props.children).join('')
                                          return text.trim().length > 0
                                        }
                                        return false
                                      })
                          if (validChildren.length === 0) return null
                          // Remove list styling since items will be rendered as headings
                          return <div className="mb-2 space-y-2">{validChildren}</div>
                        },
                                    ol: ({ children }) => {
                                      // Filter out empty list items
                                      const validChildren = React.Children.toArray(children).filter((child: any) => {
                                        if (typeof child === 'string') return child.trim().length > 0
                                        if (child?.props?.children) {
                                          const text = typeof child.props.children === 'string' 
                                            ? child.props.children 
                                            : React.Children.toArray(child.props.children).join('')
                                          return text.trim().length > 0
                                        }
                                        return false
                                      })
                          if (validChildren.length === 0) return null
                          return <ol className="mb-2 space-y-1 text-sm list-decimal list-inside">{validChildren}</ol>
                        },
                        li: ({ children }) => {
                          // Don't render if empty or only whitespace
                          const text = typeof children === 'string' 
                            ? children 
                            : React.Children.toArray(children).join('')
                          if (!text || text.trim().length === 0) return null
                          
                          // Check if this looks like a title (has colon followed by description)
                          const trimmedText = text.trim()
                          const hasColon = trimmedText.includes(':')
                          const parts = hasColon ? trimmedText.split(':') : []
                          const titlePart = parts[0]?.trim() || ''
                          const descriptionPart = parts.slice(1).join(':').trim()
                          
                          // If it has a colon and the title part is relatively short (likely a title), render as heading
                          if (hasColon && titlePart.length > 0 && titlePart.length < 100 && descriptionPart.length > 0) {
                            return (
                              <div className="mb-2">
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{titlePart}:</h5>
                                <p className="text-sm leading-relaxed whitespace-normal text-gray-700 dark:text-gray-300 ml-0">{descriptionPart}</p>
                              </div>
                            )
                          }
                          
                          // Otherwise render as normal list item
                          return <li className="text-sm leading-relaxed whitespace-normal text-gray-700 dark:text-gray-300">{children}</li>
                        },
                        strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                        h3: ({ children }) => <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-3 whitespace-normal">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5 mt-2 whitespace-normal">{children}</h4>,
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
                )}
              </div>
            )}
            </div>
        
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
          <Progress 
            value={(currentStep / totalSteps) * 100} 
            className="h-1 w-24 bg-gray-200 dark:bg-gray-700"
          />
        </div>
        <Button 
          onClick={() => setViewMode('saved')}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-8 text-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {savedAnalyses.length > 0 ? `Saved (${savedAnalyses.length})` : 'View Saved'}
        </Button>
      </div>

      {/* Main Card */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          size="sm"
          className="h-9"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Button>

        {currentStep === totalSteps ? (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !data.companyIndustry.trim()}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-1.5" />
                Generate Analysis
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={currentStep === 1 && !data.intrapreneurName.trim()}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, content: '', title: '' })}
        messageContent={shareModal.content}
        contentType="Competitor Analysis"
        contentTitle={shareModal.title}
      />
    </div>
  )
}
