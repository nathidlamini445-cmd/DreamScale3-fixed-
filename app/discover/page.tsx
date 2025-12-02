"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { SettingsModal } from "@/components/settings-modal"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { HolographicPlanet } from "@/components/ui/holographic-planet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, ExternalLink, Calendar, User, TrendingUp, Eye, Save, Maximize2, HelpCircle, MessageSquare, BookOpen, Scale, Lightbulb } from "lucide-react"
import { UpgradeDropdown } from "@/components/upgrade-dropdown"
import { useState, useEffect } from "react"
import { useSessionSafe } from "@/lib/session-context"
import { getIndustryContent } from "@/lib/content/industry-content"

// TED Talk video data
const featuredVideos = [
  {
    id: "1",
    title: "How Great Leaders Inspire Action",
    channel: "Simon Sinek",
    duration: "18:04",
    views: "65M+",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
    url: "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action",
    videoId: "simon_sinek_how_great_leaders_inspire_action",
    description: "Simon Sinek has a simple but powerful model for inspirational leadership -- starting with a golden circle and the question 'Why?'"
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
    description: "Brené Brown studies human connection -- our ability to empathize, belong, love. In a poignant, funny talk, she shares a deep insight from her research."
  }
]

const recommendedVideos = [
  {
    id: "r1",
    title: "Inside the Mind of a Master Procrastinator",
    channel: "Tim Urban",
    duration: "14:04",
    views: "40M+",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/tim_urban_inside_the_mind_of_a_master_procrastinator",
    videoId: "tim_urban_inside_the_mind_of_a_master_procrastinator"
  },
  {
    id: "r2",
    title: "Your Body Language May Shape Who You Are",
    channel: "Amy Cuddy",
    duration: "21:03",
    views: "65M+",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are",
    videoId: "amy_cuddy_your_body_language_may_shape_who_you_are"
  },
  {
    id: "r3",
    title: "The Puzzle of Motivation",
    channel: "Dan Pink",
    duration: "18:36",
    views: "30M+",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/dan_pink_the_puzzle_of_motivation",
    videoId: "dan_pink_the_puzzle_of_motivation"
  },
  {
    id: "r4",
    title: "Grit: The Power of Passion and Perseverance",
    channel: "Angela Lee Duckworth",
    duration: "6:13",
    views: "25M+",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/angela_lee_duckworth_grit_the_power_of_passion_and_perseverance",
    videoId: "angela_lee_duckworth_grit_the_power_of_passion_and_perseverance"
  }
]

// Entrepreneur business stories
const entrepreneurStories = [
  {
    id: "1",
    title: "The iPhone Revolution",
    entrepreneur: "Steve Jobs",
    company: "Apple Inc.",
    year: "2007",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1024px-Apple_logo_black.svg.png",
    description: "Steve Jobs revolutionized the mobile phone industry by introducing the iPhone in 2007. Instead of creating just another phone, he reimagined what a phone could be—a computer, music player, camera, and communication device all in one. Jobs famously said, 'People don't know what they want until you show it to them.'",
    businessLesson: "Jobs demonstrated the power of visionary thinking and refusing to accept industry limitations. He didn't just improve existing products—he created entirely new categories. The iPhone's success came from obsessing over user experience, design simplicity, and solving problems customers didn't even know they had. This teaches us that true innovation requires bold vision and the courage to disrupt established markets."
  },
  {
    id: "2",
    title: "From PayPal to Mars",
    entrepreneur: "Elon Musk",
    company: "Tesla & SpaceX",
    year: "2002-2024",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/800px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
    description: "Elon Musk took the money from selling PayPal and invested it into two 'impossible' ventures: electric cars and space exploration. When everyone said electric cars were impractical and space was too expensive, Musk proved them wrong. Tesla became the most valuable car company, and SpaceX revolutionized space travel with reusable rockets.",
    businessLesson: "Musk's approach shows that massive problems require massive solutions. He didn't just build better cars—he built an entire ecosystem (charging stations, solar panels, energy storage). He also demonstrated the power of vertical integration and controlling your supply chain. The lesson: think bigger than your immediate product. Build systems, not just products, and don't be afraid to tackle industries others consider impossible."
  },
  {
    id: "3",
    title: "The Oil Empire Builder",
    entrepreneur: "John D. Rockefeller",
    company: "Standard Oil",
    year: "1870-1911",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/John_D._Rockefeller_1885.jpg/1024px-John_D._Rockefeller_1885.jpg",
    description: "Rockefeller built Standard Oil into the world's first great trust, controlling 90% of America's oil refining by 1880. He achieved this through ruthless efficiency, vertical integration, and strategic acquisitions. He cut costs relentlessly, even saving on barrel materials, and used his scale to negotiate better railroad rates.",
    businessLesson: "Rockefeller mastered the art of operational efficiency and scale. He understood that controlling costs at every level creates competitive advantages. His strategy of vertical integration—owning everything from oil wells to refineries to distribution—allowed him to eliminate middlemen and maximize profits. The lesson: efficiency and scale create moats. Find ways to reduce costs continuously and control more of your value chain."
  },
  {
    id: "4",
    title: "The Amazon Everything Store",
    entrepreneur: "Jeff Bezos",
    company: "Amazon",
    year: "1994-Present",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png",
    description: "Jeff Bezos started Amazon as an online bookstore in his garage, but his vision was always bigger. He famously said, 'Your margin is my opportunity.' Amazon expanded relentlessly into new categories, then into cloud computing (AWS), streaming, and logistics. Bezos prioritized long-term growth over short-term profits.",
    businessLesson: "Bezos demonstrated the power of customer obsession and long-term thinking. He was willing to lose money for years to build infrastructure and market share. Amazon's success came from focusing on what won't change (customers want low prices, fast delivery, vast selection) rather than what might change. The lesson: think long-term, obsess over customers, and be willing to sacrifice short-term profits for market dominance."
  },
  {
    id: "5",
    title: "The Social Network",
    entrepreneur: "Mark Zuckerberg",
    company: "Meta (Facebook)",
    year: "2004-Present",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/800px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
    description: "Zuckerberg started Facebook in his Harvard dorm room, initially just for college students. He turned down billion-dollar acquisition offers, believing the platform could connect the entire world. Facebook grew from a college network to 3 billion users, fundamentally changing how people communicate and share information.",
    businessLesson: "Zuckerberg showed the power of network effects—each new user makes the platform more valuable for everyone else. He also demonstrated the importance of moving fast, even if it means breaking things. Facebook's success came from understanding human psychology and creating features that people genuinely wanted to use daily. The lesson: build products with network effects, move quickly, and deeply understand your users' motivations."
  },
  {
    id: "6",
    title: "The Microsoft Monopoly",
    entrepreneur: "Bill Gates",
    company: "Microsoft",
    year: "1975-2000",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Bill_Gates_2017_%28cropped%29.jpg/800px-Bill_Gates_2017_%28cropped%29.jpg",
    description: "Bill Gates built Microsoft by licensing software to IBM and other PC manufacturers, rather than selling hardware. His insight was that software would become more valuable than hardware. He created a de facto standard with MS-DOS and Windows, ensuring Microsoft software ran on virtually every PC.",
    businessLesson: "Gates understood the power of platforms and standards. By making Windows the operating system for PCs, he created a moat that lasted decades. He also demonstrated the value of partnerships—Microsoft worked with hardware manufacturers rather than competing with them. The lesson: create standards and platforms that others build on. Sometimes the best strategy is to enable others' success while controlling the foundational layer."
  },
]

const additionalVideos = [
  {
    id: "a1",
    title: "The Happy Secret to Better Work",
    channel: "Shawn Achor",
    duration: "12:20",
    views: "20M+",
    thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/shawn_achor_the_happy_secret_to_better_work",
    videoId: "shawn_achor_the_happy_secret_to_better_work"
  },
  {
    id: "a2",
    title: "How to Speak So That People Want to Listen",
    channel: "Julian Treasure",
    duration: "9:58",
    views: "35M+",
    thumbnail: "https://images.unsplash.com/photo-1543269664-7eef42226a21?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen",
    videoId: "julian_treasure_how_to_speak_so_that_people_want_to_listen"
  },
  {
    id: "a3",
    title: "5 Ways to Listen Better",
    channel: "Julian Treasure",
    duration: "7:55",
    views: "15M+",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    url: "https://www.ted.com/talks/julian_treasure_5_ways_to_listen_better",
    videoId: "julian_treasure_5_ways_to_listen_better"
  }
]

export default function DiscoverPage() {
  const sessionContext = useSessionSafe()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [savedVideos, setSavedVideos] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({})

  // Get personalized content based on industry
  const entrepreneurProfile = sessionContext?.sessionData?.entrepreneurProfile
  const industryContent = getIndustryContent(entrepreneurProfile?.industry as any)
  
  // Use industry-specific content if available, otherwise use default
  const displayVideos = industryContent?.videos && industryContent.videos.length > 0 
    ? industryContent.videos 
    : featuredVideos
  
  const displayStories = industryContent?.entrepreneurStories && industryContent.entrepreneurStories.length > 0
    ? [...industryContent.entrepreneurStories, ...entrepreneurStories].slice(0, 6)
    : entrepreneurStories
  
  const pageTitle = industryContent 
    ? `Discover ${industryContent.displayName} Entrepreneurship`
    : 'Discover Creativity'
  
  const pageDescription = industryContent
    ? `Explore videos, resources, and inspiration tailored for ${industryContent.displayName} entrepreneurs`
    : 'Explore videos, artworks, and inspiration from the creative world'

  // Fetch actual TED Talk thumbnails with caching
  useEffect(() => {
    const CACHE_KEY = 'ted_thumbnails_cache'
    const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days
    
    // Load cached thumbnails immediately
    const loadCachedThumbnails = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { thumbnails, timestamp } = JSON.parse(cached)
          const now = Date.now()
          if (now - timestamp < CACHE_EXPIRY) {
            setVideoThumbnails(thumbnails)
            return true
          }
        }
      } catch (error) {
        console.error('Error loading cached thumbnails:', error)
      }
      return false
    }
    
    // Save thumbnails to cache
    const saveToCache = (thumbnails: Record<string, string>) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          thumbnails,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error saving thumbnails to cache:', error)
      }
    }
    
    // Load from cache first (instant display)
    const hasCache = loadCachedThumbnails()
    
    // Fetch fresh thumbnails in background
    const fetchThumbnails = async () => {
      const allVideos = [...featuredVideos, ...recommendedVideos, ...additionalVideos]
      const thumbnailPromises = allVideos.map(async (video) => {
        try {
          const response = await fetch(`/api/ted-thumbnail?url=${encodeURIComponent(video.url)}`)
          const data = await response.json()
          if (data.thumbnail_url) {
            return { videoId: video.videoId, thumbnail: data.thumbnail_url }
          }
        } catch (error) {
          console.error(`Failed to fetch thumbnail for ${video.videoId}:`, error)
        }
        return null
      })
      
      const results = await Promise.all(thumbnailPromises)
      const thumbnails: Record<string, string> = {}
      results.forEach((result) => {
        if (result) {
          thumbnails[result.videoId] = result.thumbnail
        }
      })
      
      // Update state and cache
      setVideoThumbnails(thumbnails)
      saveToCache(thumbnails)
    }
    
    // Only fetch if cache is stale or doesn't exist
    if (!hasCache) {
      fetchThumbnails()
    } else {
      // Still fetch in background to update cache
      fetchThumbnails()
    }
  }, [])

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

  const handleVideoClick = (videoId: string) => {
    setSelectedVideo(videoId)
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
        <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground relative overflow-hidden">
      <div className="relative z-10 main-container">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="p-8 space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{pageTitle}</h1>
                <p className="text-muted-foreground text-lg">{pageDescription}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content - Left Side */}
              <div className="xl:col-span-3 space-y-8">
                {/* Featured Video */}
                {displayVideos.length > 0 && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
                    <div 
                      className="aspect-video bg-muted rounded-lg mb-4 relative overflow-hidden group cursor-pointer"
                      onClick={() => handleVideoClick(displayVideos[0].videoId)}
                    >
                      <img 
                        src={videoThumbnails[displayVideos[0].videoId] || displayVideos[0].thumbnail} 
                        alt={displayVideos[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/800x450/1a1a2e/ffffff?text=Video";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="lg" className="bg-gradient-to-r from-blue-900 to-purple-600 hover:from-blue-900 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <Play className="w-6 h-6 mr-2" />
                          Play Now
                        </Button>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-900 text-black dark:text-white px-2 py-1 rounded text-sm shadow-md">
                        {displayVideos[0].duration}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-foreground">{displayVideos[0].title}</h2>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {displayVideos[0].channel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {displayVideos[0].views} views
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
                  <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    {industryContent ? `${industryContent.displayName} Success Stories` : 'Business Legends & Their Stories'}
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    {displayStories.map((story) => (
                      <div key={story.id} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
                        <div className="aspect-[5/3] bg-muted rounded-lg mb-8 overflow-hidden">
                          <img 
                            src={story.image} 
                            alt={story.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Special fallback for Rockefeller
                              if (story.id === "3") {
                                target.src = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=480&fit=crop";
                              } else {
                                target.src = "https://via.placeholder.com/800x480/1a1a2e/ffffff?text=" + encodeURIComponent(story.entrepreneur);
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-4">
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
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    {industryContent ? `More ${industryContent.displayName} Content` : 'More Inspiring TED Talks'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(displayVideos.length > 1 ? displayVideos.slice(1) : additionalVideos).map((video) => (
                      <div 
                        key={video.id} 
                        className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => handleVideoClick(video.videoId)}
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
                            <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-medium shadow-lg">
                              {video.duration}
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-foreground line-clamp-2">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">{video.channel}</p>
                            <p className="text-xs text-muted-foreground">{video.views} views</p>
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recommended for You</h3>
                  <div className="space-y-4">
                    {recommendedVideos.map((video) => (
                      <div 
                        key={video.id} 
                        className="flex gap-3 cursor-pointer group"
                        onClick={() => handleVideoClick(video.videoId)}
                      >
                        <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img 
                            src={videoThumbnails[video.videoId] || video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/384x216/1a1a2e/ffffff?text=TED+Talk";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-medium shadow-lg">
                            {video.duration}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                          <p className="text-xs text-muted-foreground">{video.views} views</p>
                        </div>
                      </div>
                    ))}
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
                  onClick={() => handleSaveVideo(selectedVideo)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savedVideos.includes(selectedVideo) ? 'Saved' : 'Save'}
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
                  size="icon"
                  onClick={handleCloseVideo}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://embed.ted.com/talks/${selectedVideo}`}
                title="TED Talk video player"
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
