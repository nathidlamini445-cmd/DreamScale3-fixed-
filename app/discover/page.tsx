"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { SettingsModal } from "@/components/settings-modal"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { HolographicPlanet } from "@/components/ui/holographic-planet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, ExternalLink, Calendar, User, TrendingUp, Eye, Save, Maximize2, HelpCircle, MessageSquare, BookOpen, Scale, Lightbulb, Sparkles, RefreshCw } from "lucide-react"
import { UpgradeDropdown } from "@/components/upgrade-dropdown"
import { useState, useEffect, useMemo } from "react"
import { useSessionSafe } from "@/lib/session-context"
import { getIndustryContent } from "@/lib/content/industry-content"
import { personalizeContent, type ContentItem } from "@/lib/content/personalization-algorithm"

// TED Talk video data with tags for personalization
const featuredVideos: ContentItem[] = [
  {
    id: "1",
    title: "How Great Leaders Inspire Action",
    channel: "Simon Sinek",
    duration: "18:04",
    views: "65M+",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
    url: "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action",
    videoId: "simon_sinek_how_great_leaders_inspire_action",
    description: "Simon Sinek has a simple but powerful model for inspirational leadership -- starting with a golden circle and the question 'Why?'",
    tags: ["leadership", "business", "motivation", "team", "management", "strategy"],
    categories: ["leadership", "business"],
    businessStage: ["idea", "foundation", "established"],
    experienceLevel: ["beginner", "intermediate", "advanced"],
    goals: ["Build a team", "Improve operations", "Learn new skills"]
  },
  {
    id: "2", 
    title: "The Power of Vulnerability",
    channel: "Brené Brown",
    duration: "20:19",
    views: "60M+",
    thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=450&fit=crop",
    url: "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability",
    videoId: "brene_brown_the_power_of_vulnerability",
    description: "Brené Brown studies human connection -- our ability to empathize, belong, love. In a poignant, funny talk, she shares a deep insight from her research.",
    tags: ["leadership", "wellness", "balance", "communication", "relationships", "networking"],
    categories: ["leadership", "wellness"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Improve work-life balance", "Build partnerships", "Learn new skills"],
    hobby: ["reading", "networking"]
  }
]

const recommendedVideos: ContentItem[] = [
  {
    id: "r1",
    title: "Inside the Mind of a Master Procrastinator",
    channel: "Tim Urban",
    duration: "14:04",
    views: "40M+",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/tim_urban_inside_the_mind_of_a_master_procrastinator",
    videoId: "tim_urban_inside_the_mind_of_a_master_procrastinator",
    tags: ["productivity", "time-management", "wellness", "balance", "learning"],
    categories: ["productivity", "wellness"],
    businessStage: ["idea", "foundation"],
    experienceLevel: ["beginner", "intermediate"],
    goals: ["Improve work-life balance", "Learn new skills"],
    hobby: ["reading", "writing"]
  },
  {
    id: "r2",
    title: "Your Body Language May Shape Who You Are",
    channel: "Amy Cuddy",
    duration: "21:03",
    views: "65M+",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are",
    videoId: "amy_cuddy_your_body_language_may_shape_who_you_are",
    tags: ["communication", "networking", "leadership", "confidence", "presentation"],
    categories: ["communication", "leadership"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Build partnerships", "Get more customers", "Build brand awareness"],
    hobby: ["networking", "reading"]
  },
  {
    id: "r3",
    title: "The Puzzle of Motivation",
    channel: "Dan Pink",
    duration: "18:36",
    views: "30M+",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/dan_pink_the_puzzle_of_motivation",
    videoId: "dan_pink_the_puzzle_of_motivation",
    tags: ["motivation", "team", "leadership", "management", "productivity"],
    categories: ["leadership", "management"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Build a team", "Improve operations", "Scale the business"],
    hobby: ["reading", "networking"]
  },
  {
    id: "r4",
    title: "Grit: The Power of Passion and Perseverance",
    channel: "Angela Lee Duckworth",
    duration: "6:13",
    views: "25M+",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/angela_lee_duckworth_grit_the_power_of_passion_and_perseverance",
    videoId: "angela_lee_duckworth_grit_the_power_of_passion_and_perseverance",
    tags: ["motivation", "perseverance", "learning", "growth", "discipline"],
    categories: ["motivation", "learning"],
    businessStage: ["idea", "foundation"],
    experienceLevel: ["beginner", "intermediate"],
    goals: ["Learn new skills", "Scale the business"],
    hobby: ["reading", "sports", "gym"]
  }
]

// Entrepreneur business stories with tags for personalization
const entrepreneurStories: ContentItem[] = [
  {
    id: "1",
    title: "The iPhone Revolution",
    entrepreneur: "Steve Jobs",
    company: "Apple Inc.",
    year: "2007",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1024px-Apple_logo_black.svg.png",
    description: "Steve Jobs revolutionized the mobile phone industry by introducing the iPhone in 2007. Instead of creating just another phone, he reimagined what a phone could be—a computer, music player, camera, and communication device all in one. Jobs famously said, 'People don't know what they want until you show it to them.'",
    businessLesson: "Jobs demonstrated the power of visionary thinking and refusing to accept industry limitations. He didn't just improve existing products—he created entirely new categories. The iPhone's success came from obsessing over user experience, design simplicity, and solving problems customers didn't even know they had. This teaches us that true innovation requires bold vision and the courage to disrupt established markets.",
    tags: ["innovation", "product", "technology", "design", "vision"],
    categories: ["tech", "innovation"],
    industry: ["tech"],
    businessStage: ["idea", "foundation"],
    experienceLevel: ["beginner", "intermediate", "advanced"],
    goals: ["Launch new products/services", "Build brand awareness", "Innovation"]
  },
  {
    id: "2",
    title: "From PayPal to Mars",
    entrepreneur: "Elon Musk",
    company: "Tesla & SpaceX",
    year: "2002-2024",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/800px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
    description: "Elon Musk took the money from selling PayPal and invested it into two 'impossible' ventures: electric cars and space exploration. When everyone said electric cars were impractical and space was too expensive, Musk proved them wrong. Tesla became the most valuable car company, and SpaceX revolutionized space travel with reusable rockets.",
    businessLesson: "Musk's approach shows that massive problems require massive solutions. He didn't just build better cars—he built an entire ecosystem (charging stations, solar panels, energy storage). He also demonstrated the power of vertical integration and controlling your supply chain. The lesson: think bigger than your immediate product. Build systems, not just products, and don't be afraid to tackle industries others consider impossible.",
    tags: ["innovation", "scaling", "vision", "technology", "systems"],
    categories: ["tech", "innovation", "scaling"],
    industry: ["tech"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Scale the business", "Launch new products/services", "Innovation"],
    hobby: ["technology", "gaming"]
  },
  {
    id: "3",
    title: "The Oil Empire Builder",
    entrepreneur: "John D. Rockefeller",
    company: "Standard Oil",
    year: "1870-1911",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/John_D._Rockefeller_1885.jpg/1024px-John_D._Rockefeller_1885.jpg",
    description: "Rockefeller built Standard Oil into the world's first great trust, controlling 90% of America's oil refining by 1880. He achieved this through ruthless efficiency, vertical integration, and strategic acquisitions. He cut costs relentlessly, even saving on barrel materials, and used his scale to negotiate better railroad rates.",
    businessLesson: "Rockefeller mastered the art of operational efficiency and scale. He understood that controlling costs at every level creates competitive advantages. His strategy of vertical integration—owning everything from oil wells to refineries to distribution—allowed him to eliminate middlemen and maximize profits. The lesson: efficiency and scale create moats. Find ways to reduce costs continuously and control more of your value chain.",
    tags: ["operations", "efficiency", "scaling", "optimization", "revenue"],
    categories: ["operations", "scaling"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Improve operations", "Scale the business", "Increase revenue"],
    challenges: ["Operations", "Scaling"]
  },
  {
    id: "4",
    title: "The Amazon Everything Store",
    entrepreneur: "Jeff Bezos",
    company: "Amazon",
    year: "1994-Present",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png",
    description: "Jeff Bezos started Amazon as an online bookstore in his garage, but his vision was always bigger. He famously said, 'Your margin is my opportunity.' Amazon expanded relentlessly into new categories, then into cloud computing (AWS), streaming, and logistics. Bezos prioritized long-term growth over short-term profits.",
    businessLesson: "Bezos demonstrated the power of customer obsession and long-term thinking. He was willing to lose money for years to build infrastructure and market share. Amazon's success came from focusing on what won't change (customers want low prices, fast delivery, vast selection) rather than what might change. The lesson: think long-term, obsess over customers, and be willing to sacrifice short-term profits for market dominance.",
    tags: ["customers", "growth", "e-commerce", "scaling", "marketing"],
    categories: ["e-commerce", "growth"],
    industry: ["e-commerce", "tech"],
    businessStage: ["idea", "foundation", "established"],
    experienceLevel: ["beginner", "intermediate", "advanced"],
    goals: ["Get more customers", "Scale the business", "Increase revenue"],
    challenges: ["Customer Acquisition", "Scaling"]
  },
  {
    id: "5",
    title: "The Social Network",
    entrepreneur: "Mark Zuckerberg",
    company: "Meta (Facebook)",
    year: "2004-Present",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/800px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
    description: "Zuckerberg started Facebook in his Harvard dorm room, initially just for college students. He turned down billion-dollar acquisition offers, believing the platform could connect the entire world. Facebook grew from a college network to 3 billion users, fundamentally changing how people communicate and share information.",
    businessLesson: "Zuckerberg showed the power of network effects—each new user makes the platform more valuable for everyone else. He also demonstrated the importance of moving fast, even if it means breaking things. Facebook's success came from understanding human psychology and creating features that people genuinely wanted to use daily. The lesson: build products with network effects, move quickly, and deeply understand your users' motivations.",
    tags: ["technology", "networking", "marketing", "customers", "growth"],
    categories: ["tech", "marketing"],
    industry: ["tech"],
    businessStage: ["idea", "foundation"],
    experienceLevel: ["beginner", "intermediate"],
    goals: ["Get more customers", "Build brand awareness", "Build partnerships"],
    hobby: ["technology", "networking", "gaming"]
  },
  {
    id: "6",
    title: "The Microsoft Monopoly",
    entrepreneur: "Bill Gates",
    company: "Microsoft",
    year: "1975-2000",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Bill_Gates_2017_%28cropped%29.jpg/800px-Bill_Gates_2017_%28cropped%29.jpg",
    description: "Bill Gates built Microsoft by licensing software to IBM and other PC manufacturers, rather than selling hardware. His insight was that software would become more valuable than hardware. He created a de facto standard with MS-DOS and Windows, ensuring Microsoft software ran on virtually every PC.",
    businessLesson: "Gates understood the power of platforms and standards. By making Windows the operating system for PCs, he created a moat that lasted decades. He also demonstrated the value of partnerships—Microsoft worked with hardware manufacturers rather than competing with them. The lesson: create standards and platforms that others build on. Sometimes the best strategy is to enable others' success while controlling the foundational layer.",
    tags: ["technology", "partnerships", "platforms", "strategy", "innovation"],
    categories: ["tech", "strategy"],
    industry: ["tech"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Build partnerships", "Launch new products/services", "Scale the business"],
    hobby: ["technology", "reading"]
  },
]

const additionalVideos: ContentItem[] = [
  {
    id: "a1",
    title: "The Happy Secret to Better Work",
    channel: "Shawn Achor",
    duration: "12:20",
    views: "20M+",
    thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/shawn_achor_the_happy_secret_to_better_work",
    videoId: "shawn_achor_the_happy_secret_to_better_work",
    tags: ["productivity", "wellness", "balance", "motivation", "happiness"],
    categories: ["wellness", "productivity"],
    businessStage: ["idea", "foundation", "established"],
    experienceLevel: ["beginner", "intermediate", "advanced"],
    goals: ["Improve work-life balance", "Learn new skills"],
    hobby: ["reading", "wellness"]
  },
  {
    id: "a2",
    title: "How to Speak So That People Want to Listen",
    channel: "Julian Treasure",
    duration: "9:58",
    views: "35M+",
    thumbnail: "https://images.unsplash.com/photo-1543269664-7eef42226a21?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen",
    videoId: "julian_treasure_how_to_speak_so_that_people_want_to_listen",
    tags: ["communication", "presentation", "networking", "marketing", "sales"],
    categories: ["communication", "marketing"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Get more customers", "Build partnerships", "Build brand awareness"],
    hobby: ["networking", "reading", "podcasts"]
  },
  {
    id: "a3",
    title: "5 Ways to Listen Better",
    channel: "Julian Treasure",
    duration: "7:55",
    views: "15M+",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/julian_treasure_5_ways_to_listen_better",
    videoId: "julian_treasure_5_ways_to_listen_better",
    tags: ["communication", "networking", "relationships", "sales", "customers"],
    categories: ["communication"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Get more customers", "Build partnerships"],
    hobby: ["networking", "podcasts"]
  },
  {
    id: "a4",
    title: "The Single Biggest Reason Why Startups Succeed",
    channel: "Bill Gross",
    duration: "6:20",
    views: "8M+",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/bill_gross_the_single_biggest_reason_why_startups_succeed",
    videoId: "bill_gross_startups_succeed",
    tags: ["startup", "timing", "idea", "validation", "foundation"],
    categories: ["startup", "validation"],
    businessStage: ["idea", "foundation"],
    experienceLevel: ["beginner", "intermediate"],
    goals: ["Launch new products/services"],
    challenges: ["Product Development"]
  },
  {
    id: "a5",
    title: "How to Get Your Ideas to Spread",
    channel: "Seth Godin",
    duration: "17:30",
    views: "12M+",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/seth_godin_on_sliced_bread",
    videoId: "seth_godin_ideas_spread",
    tags: ["marketing", "customers", "branding", "awareness", "growth"],
    categories: ["marketing", "growth"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Get more customers", "Build brand awareness"],
    challenges: ["Customer Acquisition", "Marketing"]
  },
  {
    id: "a6",
    title: "Why We Do What We Do",
    channel: "Tony Robbins",
    duration: "21:40",
    views: "25M+",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/tony_robbins_why_we_do_what_we_do",
    videoId: "tony_robbins_why_we_do",
    tags: ["motivation", "leadership", "growth", "mindset", "discipline"],
    categories: ["motivation", "leadership"],
    businessStage: ["idea", "foundation", "established"],
    experienceLevel: ["beginner", "intermediate", "advanced"],
    goals: ["Learn new skills", "Scale the business"],
    hobby: ["gym", "sports", "reading"]
  },
  {
    id: "a7",
    title: "The Art of Innovation",
    channel: "Guy Kawasaki",
    duration: "19:15",
    views: "15M+",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/guy_kawasaki_the_art_of_innovation",
    videoId: "guy_kawasaki_innovation",
    tags: ["innovation", "product", "technology", "startup", "creativity"],
    categories: ["innovation", "tech"],
    industry: ["tech"],
    businessStage: ["idea", "foundation"],
    experienceLevel: ["beginner", "intermediate"],
    goals: ["Launch new products/services", "Innovation"],
    hobby: ["technology", "art", "gaming"]
  },
  {
    id: "a8",
    title: "The Future of Money",
    channel: "Neha Narula",
    duration: "14:25",
    views: "10M+",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/neha_narula_the_future_of_money",
    videoId: "neha_narula_future_money",
    tags: ["finance", "revenue", "money", "technology", "innovation"],
    categories: ["finance", "tech"],
    industry: ["tech", "finance"],
    businessStage: ["foundation", "established"],
    experienceLevel: ["intermediate", "advanced"],
    goals: ["Increase revenue"],
    challenges: ["Funding"]
  }
]

export default function DiscoverPage() {
  const sessionContext = useSessionSafe()
  const [selectedVideo, setSelectedVideo] = useState<{videoId: string, embedUrl: string, url: string} | null>(null)
  const [savedVideos, setSavedVideos] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshSeed, setRefreshSeed] = useState<number>(() => {
    // Generate initial seed based on timestamp and user profile
    return Date.now() % 1000000
  })
  const [youtubeVideos, setYoutubeVideos] = useState<ContentItem[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)

  // Get personalized content based on user profile
  const entrepreneurProfile = sessionContext?.sessionData?.entrepreneurProfile
  const industryContent = getIndustryContent(entrepreneurProfile?.industry as any)
  
  // Create user profile for personalization - include email for better account differentiation
  const userProfile = useMemo(() => {
    const profile = {
      industry: entrepreneurProfile?.industry || null,
      hobbies: entrepreneurProfile?.hobbies || [],
      businessStage: entrepreneurProfile?.businessStage || null,
      experienceLevel: entrepreneurProfile?.experienceLevel || null,
      goals: entrepreneurProfile?.goals || [],
      challenges: entrepreneurProfile?.challenges || null,
      biggestGoal: entrepreneurProfile?.biggestGoal || null,
      mindsetAnswers: entrepreneurProfile?.mindsetAnswers || {},
      email: sessionContext?.sessionData?.email || null // Include email for account differentiation
    };
    return profile;
  }, [entrepreneurProfile, sessionContext?.sessionData?.email])
  
  // Fetch YouTube videos based on user profile
  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      setIsLoadingVideos(true)
      try {
        // Include refreshSeed in the request to get different videos on refresh
        const response = await fetch('/api/youtube-videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            profile: userProfile,
            refreshSeed: refreshSeed // Pass seed to API for variation
          }),
        })
        
        const data = await response.json()
        if (data.videos && Array.isArray(data.videos)) {
          // Convert YouTube videos to ContentItem format and ensure thumbnails are set
          const convertedVideos: ContentItem[] = data.videos.map((v: any, index: number) => {
            // Ensure thumbnail is always set - use provided or generate YouTube URL
            // Try multiple thumbnail sizes for better reliability
            // Use hqdefault as primary since maxresdefault may not exist for all videos
            const thumbnail = v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`
            
            return {
              id: `yt-${v.videoId}-${refreshSeed}-${index}`, // Make ID unique per refresh
              title: v.title,
              channel: v.channel,
              duration: v.duration,
              views: v.views,
              thumbnail: thumbnail,
              url: v.url || `https://www.youtube.com/watch?v=${v.videoId}`,
              videoId: v.videoId,
              embedUrl: v.embedUrl || `https://www.youtube.com/embed/${v.videoId}`,
              description: v.description || '',
              tags: v.tags || [],
              categories: v.categories || [],
              businessStage: v.businessStage || ['idea', 'foundation', 'established'],
              experienceLevel: v.experienceLevel || ['beginner', 'intermediate', 'advanced'],
              goals: v.goals || [],
              hobby: v.hobby || []
            }
          })
          
          setYoutubeVideos(convertedVideos)
          // Preload thumbnails - ensure all videos have thumbnails
          const thumbnails: Record<string, string> = {}
          convertedVideos.forEach(video => {
            thumbnails[video.videoId] = video.thumbnail
          })
          setVideoThumbnails(thumbnails)
        }
      } catch (error) {
        console.error('Error fetching YouTube videos:', error)
        // Fallback to default videos
        setYoutubeVideos([])
      } finally {
        setIsLoadingVideos(false)
      }
    }
    
    fetchYouTubeVideos()
  }, [userProfile, refreshKey, refreshSeed])

  // Combine all videos and personalize them
  const allVideos = useMemo(() => {
    // Use YouTube videos if available, otherwise fallback to hardcoded videos
    const baseVideos = youtubeVideos.length > 0 
      ? youtubeVideos
      : (industryContent?.videos && industryContent.videos.length > 0 
        ? industryContent.videos.map(v => ({ ...v, tags: v.tags || [], categories: v.categories || [] }))
        : featuredVideos)
    
    // Only add hardcoded videos if we don't have YouTube videos
    const combined = youtubeVideos.length > 0 
      ? baseVideos
      : [...baseVideos, ...recommendedVideos, ...additionalVideos]
    
    const personalized = personalizeContent(combined, userProfile, refreshSeed)
    
    // Calculate scores to identify highly personalized content
    const scoredVideos = personalized.map((video, index) => {
      // First 10 videos are considered "highly personalized" (top matches)
      return {
        ...video,
        _isPersonalized: index < 10,
        _personalizedRank: index + 1
      }
    })
    
    return scoredVideos
  }, [industryContent, userProfile, refreshKey, refreshSeed, youtubeVideos])
  
  // Use personalized videos - filter to show only top matches
  const displayVideos = allVideos.filter(v => v._isPersonalized).slice(0, 2) // Top 2 for featured
  const personalizedRecommendedVideos = allVideos.filter(v => v._isPersonalized).slice(2, 6) // Next 4 for recommended
  const personalizedAdditionalVideos = allVideos.filter(v => v._isPersonalized).slice(6, 10) // Show more personalized content
  
  // Personalize stories - also use refresh seed for diversity
  const allStories = useMemo(() => {
    const baseStories = industryContent?.entrepreneurStories && industryContent.entrepreneurStories.length > 0
      ? [...industryContent.entrepreneurStories.map(s => ({ ...s, tags: s.tags || [], categories: s.categories || [] })), ...entrepreneurStories]
      : entrepreneurStories
    return personalizeContent(baseStories, userProfile, refreshSeed)
  }, [industryContent, userProfile, refreshKey, refreshSeed])
  
  const displayStories = allStories.slice(0, 6)
  
  const pageTitle = industryContent 
    ? `Discover ${industryContent.displayName} Entrepreneurship`
    : 'Discover Entrepreneurship'
  
  const pageDescription = industryContent
    ? `Explore videos, resources, and inspiration tailored for ${industryContent.displayName} entrepreneurs`
    : 'Explore videos, resources, and inspiration for entrepreneurs and business builders'

  // Ensure thumbnails are always available - YouTube thumbnails are set in fetchYouTubeVideos
  // This effect ensures fallback thumbnails for any videos that don't have them
  useEffect(() => {
    if (youtubeVideos.length > 0) {
      // YouTube videos already have thumbnails set, but ensure they're in videoThumbnails state
      const thumbnails: Record<string, string> = {}
      youtubeVideos.forEach(video => {
        if (video.thumbnail) {
          thumbnails[video.videoId] = video.thumbnail
        }
      })
      setVideoThumbnails(prev => ({ ...prev, ...thumbnails }))
    }
  }, [youtubeVideos])

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTablet = /tablet|ipad/i.test(userAgent)
      const isSmallScreen = window.innerWidth < 1024
      
      setIsMobile(isMobileDevice || isTablet || isSmallScreen)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const handleVideoClick = (video: ContentItem) => {
    // Check if video has embedUrl (YouTube) or use videoId for TED
    const embedUrl = (video as any).embedUrl || `https://www.youtube.com/embed/${video.videoId}`
    const url = video.url || `https://www.youtube.com/watch?v=${video.videoId}`
    const selectedVideoData = {
      videoId: video.videoId,
      embedUrl,
      url
    }
    setSelectedVideo(selectedVideoData)
  }

  const handleCloseVideo = () => {
    setSelectedVideo(null)
  }

  const handleSaveVideo = (videoId: string) => {
    setSavedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }
  
  const handleOpenInYouTube = () => {
    if (selectedVideo?.url) {
      window.open(selectedVideo.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleFullscreen = () => {
    const iframe = document.querySelector('iframe')
    if (iframe && iframe.requestFullscreen) {
      iframe.requestFullscreen()
    }
  }

  const handleSettingsSave = (settings: any) => {
    console.log('Settings saved:', settings)
    // Here you would typically save to localStorage, database, etc.
  }

  // Show mobile restriction message
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white text-foreground flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-900 to-purple-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Desktop Only</h1>
          <p className="text-muted-foreground text-lg mb-6">
            DreamScale is designed for desktop and laptop computers. Please access this application from a computer for the best experience.
          </p>
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Supported devices:</strong> Desktop computers, laptops, and tablets with screen width 1024px or larger.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-y-auto">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-foreground">{pageTitle}</h1>
                  {Object.keys(userProfile.mindsetAnswers || {}).length > 0 && (
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Personalized
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-lg">{pageDescription}</p>
                {Object.keys(userProfile.mindsetAnswers || {}).length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Content tailored based on your check-in answers
                  </p>
                )}
              </div>
              {Object.keys(userProfile.mindsetAnswers || {}).length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Generate new seed for different content - use more randomness
                    const newSeed = Date.now() % 1000000 + Math.floor(Math.random() * 10000) + Math.random() * 1000
                    setRefreshSeed(newSeed)
                    setRefreshKey(prev => prev + 1)
                    // Force re-fetch of videos
                    setIsLoadingVideos(true)
                  }}
                  className="flex items-center gap-2"
                  disabled={isLoadingVideos}
                >
                  {isLoadingVideos ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh Recommendations
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content - Left Side */}
              <div className="xl:col-span-3 space-y-8">
                {/* Personalized Section Header */}
                {Object.keys(userProfile.mindsetAnswers || {}).length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
                    </div>
                    <p className="text-muted-foreground">
                      Based on your check-in answers, we've personalized these videos and stories to match your current focus and challenges.
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {isLoadingVideos && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <span className="ml-4 text-muted-foreground">Loading personalized videos...</span>
                    </div>
                  </div>
                )}

                {/* Featured Video */}
                {!isLoadingVideos && displayVideos.length > 0 && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 relative">
                    <div 
                      className="aspect-video bg-muted rounded-lg mb-4 relative overflow-hidden group cursor-pointer"
                      onClick={() => handleVideoClick(displayVideos[0])}
                    >
                      <img 
                        src={displayVideos[0].thumbnail || videoThumbnails[displayVideos[0].videoId] || `https://img.youtube.com/vi/${displayVideos[0].videoId}/hqdefault.jpg`} 
                        alt={displayVideos[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Try different YouTube thumbnail sizes as fallback - start with hqdefault
                          if (displayVideos[0].videoId && !target.src.includes('placeholder')) {
                            if (target.src.includes('hqdefault')) {
                              target.src = `https://img.youtube.com/vi/${displayVideos[0].videoId}/mqdefault.jpg`;
                            } else if (target.src.includes('mqdefault')) {
                              target.src = `https://img.youtube.com/vi/${displayVideos[0].videoId}/sddefault.jpg`;
                            } else if (target.src.includes('sddefault')) {
                              target.src = `https://img.youtube.com/vi/${displayVideos[0].videoId}/maxresdefault.jpg`;
                            } else {
                              // Use a better placeholder with gradient
                              target.src = `https://via.placeholder.com/800x450/6366f1/ffffff?text=${encodeURIComponent(displayVideos[0].title.substring(0, 30))}`;
                            }
                          } else {
                            target.src = `https://via.placeholder.com/800x450/6366f1/ffffff?text=${encodeURIComponent(displayVideos[0].title.substring(0, 30))}`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="lg" className="bg-gradient-to-r from-blue-900 to-purple-600 hover:from-blue-900 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <Play className="w-6 h-6 mr-2" />
                          Play Now
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-foreground">{displayVideos[0].title}</h2>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {displayVideos[0].channel}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{displayVideos[0].description}</p>
                    </div>
                  </div>
                )}

                {/* Industry Insights Section */}
                {industryContent && industryContent.articles.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-primary" />
                      {industryContent.displayName} Industry Insights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {industryContent.articles.map((article, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                          <h3 className="text-lg font-semibold text-foreground mb-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground">{article.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal & Compliance Section */}
                {industryContent && industryContent.legalResources.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <Scale className="w-8 h-8 text-primary" />
                      Legal & Compliance for {industryContent.displayName}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {industryContent.legalResources.map((resource, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{resource.title}</h3>
                            <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Industry Tips Section */}
                {industryContent && industryContent.tips.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <Lightbulb className="w-8 h-8 text-primary" />
                      {industryContent.displayName} Success Tips
                    </h2>
                    <Card className="p-6">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {industryContent.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-primary text-sm font-semibold">{index + 1}</span>
                            </div>
                            <span className="text-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}

                {/* Entrepreneur Stories Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-foreground">
                      {industryContent ? `${industryContent.displayName} Success Stories` : 'Business Legends & Their Stories'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    {displayStories.map((story, index) => (
                      <div key={story.id} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 relative">
                        {/* Images removed from stories on discover page as requested */}
                        <div className="space-y-4" key={`story-${story.id}-${refreshSeed}`}>
                          <div className="flex items-start justify-between">
                            <h3 className="text-2xl font-bold text-foreground">{story.title}</h3>
                            <Badge variant="outline" className="text-sm px-3 py-1">
                              {story.year}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <p className="text-muted-foreground text-lg">
                              <strong>Entrepreneur:</strong> {story.entrepreneur}
                            </p>
                            <p className="text-muted-foreground text-lg">
                              <strong>Company:</strong> {story.company}
                            </p>
                          </div>
                          <p className="text-base text-muted-foreground leading-relaxed">
                            {story.description}
                          </p>
                          <div className="pt-4 border-t border-border">
                            <p className="text-base font-medium text-foreground mb-2">Business Lesson:</p>
                            <p className="text-base text-muted-foreground leading-relaxed">
                              {story.businessLesson}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Videos */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      More videos
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personalizedAdditionalVideos.length > 0 
                      ? personalizedAdditionalVideos.map((video) => (
                      <div 
                        key={video.id} 
                        className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer relative"
                        onClick={() => handleVideoClick(video)}
                      >
                        <div className="flex gap-4">
                          <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative group">
                            <img 
                              src={video.thumbnail || videoThumbnails[video.videoId] || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} 
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Try different YouTube thumbnail sizes as fallback
                                if (video.videoId && !target.src.includes('placeholder')) {
                                  if (target.src.includes('hqdefault')) {
                                    target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
                                  } else if (target.src.includes('mqdefault')) {
                                    target.src = `https://img.youtube.com/vi/${video.videoId}/sddefault.jpg`;
                                  } else if (target.src.includes('sddefault')) {
                                    target.src = `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
                                  } else {
                                    target.src = `https://via.placeholder.com/320x180/6366f1/ffffff?text=${encodeURIComponent(video.title.substring(0, 20))}`;
                                  }
                                } else {
                                  target.src = `https://via.placeholder.com/320x180/6366f1/ffffff?text=${encodeURIComponent(video.title.substring(0, 20))}`;
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-foreground line-clamp-2">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">{video.channel}</p>
                            <Button asChild size="sm" className="w-full">
                              <a href={video.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Watch
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                      : additionalVideos.map((video) => (
                      <div 
                        key={video.id} 
                        className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => handleVideoClick(video)}
                      >
                        <div className="flex gap-4">
                          <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative group">
                            <img 
                              src={videoThumbnails[video.videoId] || video.thumbnail} 
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/320x180/1a1a2e/ffffff?text=TED+Talk";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-foreground line-clamp-2">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">{video.channel}</p>
                            <Button asChild size="sm" className="w-full">
                              <a href={video.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Watch
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Right Side */}
              <div className="xl:col-span-1 space-y-6">
                {/* Recommended Videos */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Recommended for You</h3>
                  </div>
                  <div className="space-y-4">
                    {personalizedRecommendedVideos.length > 0 ? (
                      personalizedRecommendedVideos.map((video) => (
                        <div 
                          key={video.id} 
                          className="flex gap-3 cursor-pointer group relative"
                          onClick={() => handleVideoClick(video)}
                        >
                          <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                            <img 
                              src={video.thumbnail || videoThumbnails[video.videoId] || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} 
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Try different YouTube thumbnail sizes as fallback
                                if (video.videoId && !target.src.includes('placeholder')) {
                                  if (target.src.includes('hqdefault')) {
                                    target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
                                  } else if (target.src.includes('mqdefault')) {
                                    target.src = `https://img.youtube.com/vi/${video.videoId}/sddefault.jpg`;
                                  } else if (target.src.includes('sddefault')) {
                                    target.src = `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
                                  } else {
                                    target.src = `https://via.placeholder.com/384x216/6366f1/ffffff?text=${encodeURIComponent(video.title.substring(0, 20))}`;
                                  }
                                } else {
                                  target.src = `https://via.placeholder.com/384x216/6366f1/ffffff?text=${encodeURIComponent(video.title.substring(0, 20))}`;
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                              {video.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Complete your check-in to see personalized recommendations</p>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Your Progress</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Videos Available</span>
                      <span className="font-semibold text-foreground">{displayVideos.length + recommendedVideos.length + additionalVideos.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Saved Videos</span>
                      <span className="font-semibold text-foreground">{savedVideos.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Stories Explored</span>
                      <span className="font-semibold text-foreground">{entrepreneurStories.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold text-foreground">
                        {Math.round((savedVideos.length / (featuredVideos.length + recommendedVideos.length + additionalVideos.length)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* YouTube Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">Watch Video</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveVideo(selectedVideo.videoId)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savedVideos.includes(selectedVideo.videoId) ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Fullscreen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenInYouTube}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in YouTube
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseVideo}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={selectedVideo.embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-b-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSettingsSave}
      />
    </div>
  )
}
