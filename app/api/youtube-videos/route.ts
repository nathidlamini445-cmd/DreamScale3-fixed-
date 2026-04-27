import { NextRequest, NextResponse } from 'next/server'
import { getPersonalizedContent } from '@/lib/filter-content'

// YouTube Data API v3 endpoint
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

// Generate search queries based on user profile
function generateSearchQueries(profile: any): string[] {
  const queries: string[] = []
  
  // Industry-based queries
  if (profile.industry) {
    const industries = Array.isArray(profile.industry) ? profile.industry : [profile.industry]
    industries.forEach((industry: string) => {
      queries.push(`${industry} entrepreneurship`)
      queries.push(`${industry} business tips`)
      queries.push(`${industry} startup advice`)
    })
  }
  
  // Business stage queries
  if (profile.businessStage) {
    const stages = Array.isArray(profile.businessStage) ? profile.businessStage : [profile.businessStage]
    stages.forEach((stage: string) => {
      if (stage === 'idea') {
        queries.push('startup idea validation')
        queries.push('how to start a business')
      } else if (stage === 'foundation') {
        queries.push('building a business foundation')
        queries.push('early stage startup')
      } else if (stage === 'established') {
        queries.push('scaling a business')
        queries.push('growing your company')
      }
    })
  }
  
  // Goals-based queries
  if (profile.goals && Array.isArray(profile.goals)) {
    profile.goals.forEach((goal: string) => {
      queries.push(`${goal.toLowerCase()} for entrepreneurs`)
      queries.push(`how to ${goal.toLowerCase()}`)
    })
  }
  
  // Challenges-based queries
  if (profile.challenges) {
    const challenges = Array.isArray(profile.challenges) ? profile.challenges : [profile.challenges]
    challenges.forEach((challenge: string) => {
      queries.push(`how to overcome ${challenge.toLowerCase()}`)
      queries.push(`${challenge.toLowerCase()} solutions`)
    })
  }
  
  // Hobbies-based queries (for inspiration)
  if (profile.hobbies && Array.isArray(profile.hobbies)) {
    profile.hobbies.forEach((hobby: string) => {
      queries.push(`${hobby} entrepreneur`)
      queries.push(`business and ${hobby}`)
    })
  }
  
  // Experience level queries
  if (profile.experienceLevel === 'beginner') {
    queries.push('entrepreneurship for beginners')
    queries.push('startup basics')
  } else if (profile.experienceLevel === 'advanced') {
    queries.push('advanced business strategies')
    queries.push('scaling strategies')
  }
  
  // Default queries if nothing specific
  if (queries.length === 0) {
    queries.push('entrepreneurship tips')
    queries.push('business advice')
    queries.push('startup success stories')
  }
  
  return queries.slice(0, 10) // Limit to 10 queries
}

// Search YouTube for videos dynamically using YouTube Data API v3
async function searchYouTube(query: string, maxResults: number = 5): Promise<any[]> {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    
    // If no API key, return empty array (will use static content as fallback)
    if (!API_KEY) {
      console.log('YouTube API key not configured - using static content')
      return []
    }
    
    // Search YouTube using Data API v3
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&order=relevance&key=${API_KEY}`
    
    const response = await fetch(searchUrl)
    
    if (!response.ok) {
      console.error('YouTube API error:', response.status, response.statusText)
      return []
    }
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return []
    }
    
    // Convert YouTube API response to our format
    return data.items.map((item: any) => {
      const videoId = item.id.videoId
      return {
        videoId: videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        // Note: duration and views require additional API calls
        duration: '0:00', // Would need video details API call
        views: '0' // Would need video details API call
      }
    })
  } catch (error) {
    console.error('Error searching YouTube:', error)
    return []
  }
}

// Get video details (duration, views) - requires additional API call
async function getVideoDetails(videoIds: string[]): Promise<Record<string, { duration: string; views: string }>> {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    
    if (!API_KEY || videoIds.length === 0) {
      return {}
    }
    
    // YouTube API allows up to 50 video IDs per request
    const ids = videoIds.slice(0, 50).join(',')
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${ids}&key=${API_KEY}`
    
    const response = await fetch(detailsUrl)
    
    if (!response.ok) {
      return {}
    }
    
    const data = await response.json()
    const details: Record<string, { duration: string; views: string }> = {}
    
    if (data.items) {
      data.items.forEach((item: any) => {
        // Parse ISO 8601 duration (e.g., PT15M33S) to MM:SS format
        const duration = parseDuration(item.contentDetails.duration)
        // Store raw view count - will format when used
        const viewCount = item.statistics?.viewCount || '0'
        
        details[item.id] = { duration, views: viewCount }
      })
    }
    
    return details
  } catch (error) {
    console.error('Error fetching video details:', error)
    return {}
  }
}

// Helper to parse ISO 8601 duration to readable format
function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Helper to format view count (e.g., 1234567 -> "1.2M" or "1.2M+")
function formatViews(viewCount: string | number): string {
  // Handle string with commas or already formatted
  let views: number
  if (typeof viewCount === 'string') {
    // Remove commas and any non-numeric characters except digits
    const cleaned = viewCount.replace(/[^\d]/g, '')
    views = parseInt(cleaned) || 0
  } else {
    views = viewCount || 0
  }
  
  if (views === 0 || isNaN(views)) return '0'
  
  if (views >= 1000000) {
    const millions = (views / 1000000).toFixed(1)
    // Remove trailing .0
    const formatted = millions.endsWith('.0') ? millions.slice(0, -2) : millions
    return `${formatted}M${views >= 10000000 ? '+' : ''}`
  } else if (views >= 1000) {
    const thousands = (views / 1000).toFixed(1)
    // Remove trailing .0
    const formatted = thousands.endsWith('.0') ? thousands.slice(0, -2) : thousands
    return `${formatted}K${views >= 10000 ? '+' : ''}`
  }
  return views.toLocaleString()
}

// Curated YouTube video IDs for entrepreneurship content
const CURATED_YOUTUBE_VIDEOS: Record<string, any[]> = {
  leadership: [
    {
      videoId: 'qp0HIF3SfI4',
      title: 'How Great Leaders Inspire Action | Simon Sinek',
      channel: 'TED',
      duration: '18:04',
      views: '65M',
      description: 'Simon Sinek has a simple but powerful model for inspirational leadership.',
      tags: ['leadership', 'business', 'motivation', 'team', 'management'],
      categories: ['leadership', 'business']
    },
    {
      videoId: 'UyyjU8fzEYU',
      title: 'The Power of Vulnerability | Brené Brown',
      channel: 'TED',
      duration: '20:19',
      views: '60M',
      description: 'Brené Brown studies human connection and vulnerability.',
      tags: ['leadership', 'wellness', 'communication', 'relationships'],
      categories: ['leadership', 'wellness']
    },
    {
      videoId: 'RcGyVTAoXEU',
      title: 'Your Body Language May Shape Who You Are',
      channel: 'TED',
      duration: '21:03',
      views: '65M',
      description: 'Amy Cuddy discusses how body language affects confidence.',
      tags: ['communication', 'confidence', 'presentation', 'leadership'],
      categories: ['communication', 'leadership']
    }
  ],
  startup: [
    {
      videoId: 'jvOz4eMq5d8',
      title: 'How to Start a Startup: Lecture 1 - How to Start a Startup',
      channel: 'Y Combinator',
      duration: '58:30',
      views: '2.5M',
      description: 'Sam Altman and Dustin Moskovitz discuss how to start a startup.',
      tags: ['startup', 'entrepreneurship', 'business', 'foundation'],
      categories: ['startup', 'business']
    },
    {
      videoId: 'CBYhVcO4WgI',
      title: 'The Single Biggest Reason Why Startups Succeed',
      channel: 'TED',
      duration: '6:20',
      views: '8M',
      description: 'Bill Gross discusses what makes startups succeed.',
      tags: ['startup', 'success', 'entrepreneurship', 'timing'],
      categories: ['startup']
    },
    {
      videoId: '0CDXJ6bMkMY',
      title: 'How to Build a Startup: Building Product',
      channel: 'Y Combinator',
      duration: '52:30',
      views: '1.5M',
      description: 'How to build products users love.',
      tags: ['product', 'startup', 'development', 'innovation'],
      categories: ['product', 'startup']
    }
  ],
  marketing: [
    {
      videoId: 'u6XAPnuFjJc',
      title: 'How to Get Your Ideas to Spread | Seth Godin',
      channel: 'TED',
      duration: '17:30',
      views: '12M',
      description: 'Seth Godin explains how to make your ideas spread.',
      tags: ['marketing', 'ideas', 'business', 'customers', 'branding'],
      categories: ['marketing']
    },
    {
      videoId: 'bJEyQ1qK2SU',
      title: 'The Art of Storytelling',
      channel: 'TED',
      duration: '19:15',
      views: '15M',
      description: 'Learn how to tell compelling stories that connect with your audience.',
      tags: ['marketing', 'storytelling', 'communication', 'branding'],
      categories: ['marketing', 'communication']
    }
  ],
  productivity: [
    {
      videoId: 'arj7oStGLkU',
      title: 'Inside the Mind of a Master Procrastinator',
      channel: 'TED',
      duration: '14:04',
      views: '40M',
      description: 'Tim Urban discusses procrastination and productivity.',
      tags: ['productivity', 'time-management', 'wellness', 'balance'],
      categories: ['productivity']
    },
    {
      videoId: 'H14bBuluwB8',
      title: 'Grit: The Power of Passion and Perseverance',
      channel: 'TED',
      duration: '6:13',
      views: '25M',
      description: 'Angela Lee Duckworth discusses grit and perseverance.',
      tags: ['motivation', 'perseverance', 'growth', 'discipline'],
      categories: ['motivation', 'productivity']
    }
  ],
  tech: [
    {
      videoId: 'jvOz4eMq5d8',
      title: 'How to Build a Startup: The Idea',
      channel: 'Y Combinator',
      duration: '45:20',
      views: '1.8M',
      description: 'How to come up with startup ideas.',
      tags: ['startup', 'ideas', 'entrepreneurship', 'technology'],
      categories: ['startup', 'tech']
    },
    {
      videoId: '0CDXJ6bMkMY',
      title: 'How to Build a Startup: Building Product',
      channel: 'Y Combinator',
      duration: '52:30',
      views: '1.5M',
      description: 'How to build products users love.',
      tags: ['product', 'startup', 'development', 'technology'],
      categories: ['product', 'tech']
    }
  ],
  default: [
    {
      videoId: 'qp0HIF3SfI4',
      title: 'How Great Leaders Inspire Action | Simon Sinek',
      channel: 'TED',
      duration: '18:04',
      views: '65M',
      description: 'Simon Sinek has a simple but powerful model for inspirational leadership.',
      tags: ['leadership', 'business', 'motivation'],
      categories: ['leadership', 'business']
    },
    {
      videoId: 'jvOz4eMq5d8',
      title: 'How to Start a Startup: Lecture 1',
      channel: 'Y Combinator',
      duration: '58:30',
      views: '2.5M',
      description: 'Sam Altman and Dustin Moskovitz discuss how to start a startup.',
      tags: ['startup', 'entrepreneurship', 'business'],
      categories: ['startup', 'business']
    },
    {
      videoId: 'UyyjU8fzEYU',
      title: 'The Power of Vulnerability | Brené Brown',
      channel: 'TED',
      duration: '20:19',
      views: '60M',
      description: 'Brené Brown studies human connection and vulnerability.',
      tags: ['leadership', 'wellness', 'communication'],
      categories: ['leadership', 'wellness']
    },
    {
      videoId: 'arj7oStGLkU',
      title: 'Inside the Mind of a Master Procrastinator',
      channel: 'TED',
      duration: '14:04',
      views: '40M',
      description: 'Tim Urban discusses procrastination.',
      tags: ['productivity', 'time-management'],
      categories: ['productivity']
    },
    {
      videoId: 'CBYhVcO4WgI',
      title: 'The Single Biggest Reason Why Startups Succeed',
      channel: 'TED',
      duration: '6:20',
      views: '8M',
      description: 'Bill Gross discusses what makes startups succeed.',
      tags: ['startup', 'success', 'entrepreneurship'],
      categories: ['startup']
    },
    {
      videoId: 'u6XAPnuFjJc',
      title: 'How to Get Your Ideas to Spread | Seth Godin',
      channel: 'TED',
      duration: '17:30',
      views: '12M',
      description: 'Seth Godin explains how to make your ideas spread.',
      tags: ['marketing', 'ideas', 'business'],
      categories: ['marketing']
    },
    {
      videoId: 'RcGyVTAoXEU',
      title: 'Your Body Language May Shape Who You Are',
      channel: 'TED',
      duration: '21:03',
      views: '65M',
      description: 'Amy Cuddy discusses body language and confidence.',
      tags: ['communication', 'confidence', 'presentation'],
      categories: ['communication']
    },
    {
      videoId: 'H14bBuluwB8',
      title: 'Grit: The Power of Passion and Perseverance',
      channel: 'TED',
      duration: '6:13',
      views: '25M',
      description: 'Angela Lee Duckworth discusses grit and perseverance.',
      tags: ['motivation', 'perseverance', 'growth'],
      categories: ['motivation']
    },
    {
      videoId: 'jvOz4eMq5d8',
      title: 'How to Build a Startup: The Idea',
      channel: 'Y Combinator',
      duration: '45:20',
      views: '1.8M',
      description: 'How to come up with startup ideas.',
      tags: ['startup', 'ideas', 'entrepreneurship'],
      categories: ['startup']
    },
    {
      videoId: '0CDXJ6bMkMY',
      title: 'How to Build a Startup: Building Product',
      channel: 'Y Combinator',
      duration: '52:30',
      views: '1.5M',
      description: 'How to build products users love.',
      tags: ['product', 'startup', 'development'],
      categories: ['product', 'startup']
    },
    {
      videoId: 'bJEyQ1qK2SU',
      title: 'The Art of Storytelling',
      channel: 'TED',
      duration: '19:15',
      views: '15M',
      description: 'Learn how to tell compelling stories that connect with your audience.',
      tags: ['marketing', 'storytelling', 'communication'],
      categories: ['marketing', 'communication']
    },
    {
      videoId: 'H14bBuluwB8',
      title: 'Grit: The Power of Passion and Perseverance',
      channel: 'TED',
      duration: '6:13',
      views: '25M',
      description: 'Angela Lee Duckworth discusses grit and perseverance.',
      tags: ['motivation', 'perseverance', 'growth'],
      categories: ['motivation']
    },
    {
      videoId: 'RcGyVTAoXEU',
      title: 'Your Body Language May Shape Who You Are',
      channel: 'TED',
      duration: '21:03',
      views: '65M',
      description: 'Amy Cuddy discusses how body language affects confidence.',
      tags: ['communication', 'confidence', 'presentation'],
      categories: ['communication']
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profile, refreshSeed } = body
    
    // Generate search queries based on profile
    const queries = generateSearchQueries(profile || {})
    
    // Try to fetch dynamic videos from YouTube API first (if API key is configured)
    let dynamicVideos: any[] = []
    const useDynamicSearch = !!process.env.YOUTUBE_API_KEY || !!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    
    if (useDynamicSearch && queries.length > 0) {
      // Search YouTube for each query and combine results
      const searchPromises = queries.slice(0, 3).map(query => searchYouTube(query, 5))
      const searchResults = await Promise.all(searchPromises)
      dynamicVideos = searchResults.flat()
      
      // Get video details (duration, views) if we have videos
      if (dynamicVideos.length > 0) {
        const videoIds = dynamicVideos.map(v => v.videoId)
        const details = await getVideoDetails(videoIds)
        
        // Add duration and views to videos - always fetch real data
        dynamicVideos = dynamicVideos.map(video => {
          const videoDetails = details[video.videoId]
          // Always use fetched details if available, otherwise use fallback
          return {
            ...video,
            duration: videoDetails?.duration || video.duration || '0:00',
            views: videoDetails?.views ? formatViews(videoDetails.views) : (video.views || '0')
          }
        })
      }
    }
    
    // Use the new smart filtering system with static content
    const userOnboardingData = {
      industry: profile?.industry || null,
      businessStage: profile?.businessStage || null,
      challenges: profile?.challenges || null,
      goals: profile?.goals || [],
      experienceLevel: profile?.experienceLevel || null,
      hobbies: profile?.hobbies || [],
      biggestGoal: profile?.biggestGoal || null
    }
    
    // Get personalized content using the new filtering system
    const personalizedContent = getPersonalizedContent(userOnboardingData)
    
    // Convert static content to the format expected by the frontend
    let staticVideos = personalizedContent.map(content => ({
      videoId: content.videoId,
      title: content.title,
      channel: content.channel || 'Unknown',
      duration: content.duration || '0:00',
      views: content.views || '0',
      description: content.description || '',
      url: content.videoUrl,
      thumbnail: content.thumbnail || `https://img.youtube.com/vi/${content.videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${content.videoId}`,
      tags: content.tags.industries.concat(
        content.tags.businessStages,
        content.tags.challenges,
        content.tags.goals || [],
        content.tags.hobbies || []
      ),
      categories: content.tags.industries,
      businessStage: content.tags.businessStages,
      experienceLevel: content.tags.experienceLevels || [],
      goals: content.tags.goals || [],
      hobby: content.tags.hobbies || [],
      score: (content as any).score || 0,
      matchReasons: (content as any).matchReasons || []
    }))
    
    // Fetch real duration and views for videos that have placeholder values or missing data
    const videosNeedingDetails = staticVideos.filter(v => 
      !v.duration || v.duration === '0:00' || !v.views || v.views === '0' || v.views === '0 views'
    )
    
    if (videosNeedingDetails.length > 0) {
      // Batch process in chunks of 50 (YouTube API limit)
      const videoIdChunks: string[][] = []
      const videoIdsToFetch = videosNeedingDetails.map(v => v.videoId)
      for (let i = 0; i < videoIdsToFetch.length; i += 50) {
        videoIdChunks.push(videoIdsToFetch.slice(i, i + 50))
      }
      
      // Fetch details for all chunks
      const allDetails: Record<string, { duration: string; views: string }> = {}
      for (const chunk of videoIdChunks) {
        const chunkDetails = await getVideoDetails(chunk)
        Object.assign(allDetails, chunkDetails)
      }
      
      // Update static videos with real data
      staticVideos = staticVideos.map(video => {
        if (allDetails[video.videoId]) {
          const rawViews = allDetails[video.videoId].views
          return {
            ...video,
            duration: allDetails[video.videoId].duration || video.duration || '0:00',
            views: formatViews(rawViews) || video.views || '0'
          }
        }
        return video
      })
    }
    
    // Combine dynamic and static videos (prioritize dynamic if available)
    let videos: any[] = []
    if (dynamicVideos.length > 0) {
      // Use dynamic videos as primary, supplement with top static videos
      videos = [...dynamicVideos, ...staticVideos.slice(0, 10)]
      
      // Remove duplicates by videoId
      const seen = new Set<string>()
      videos = videos.filter(v => {
        if (seen.has(v.videoId)) return false
        seen.add(v.videoId)
        return true
      })
    } else {
      // Use static videos only
      videos = staticVideos
    }
    
    // Shuffle videos based on refreshSeed for variation (while maintaining score order)
    if (refreshSeed !== undefined && videos.length > 0) {
      // Group by score ranges to maintain relevance while adding variety
      const highScore = videos.filter(v => (v as any).score >= 50)
      const mediumScore = videos.filter(v => (v as any).score >= 20 && (v as any).score < 50)
      const lowScore = videos.filter(v => (v as any).score > 0 && (v as any).score < 20)
      
      // Shuffle within each score group
      const shuffleGroup = (group: typeof videos, seed: number) => {
        const shuffled = [...group]
        let s = Math.abs(seed)
        for (let i = shuffled.length - 1; i > 0; i--) {
          s = (s * 9301 + 49297) % 233280
          const j = Math.floor((s / 233280) * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }
      
      const shuffledHigh = shuffleGroup(highScore, refreshSeed)
      const shuffledMedium = shuffleGroup(mediumScore, refreshSeed + 1000)
      const shuffledLow = shuffleGroup(lowScore, refreshSeed + 2000)
      
      // Recombine maintaining score priority
      videos = [...shuffledHigh, ...shuffledMedium, ...shuffledLow]
    }
    
    // Limit results to top 20
    videos = videos.slice(0, 20)
    
    // Fallback to old system if no personalized content found
    if (videos.length === 0) {
      let fallbackVideos: any[] = []
      
      // Get videos based on industry
      if (profile?.industry) {
        const industries = Array.isArray(profile.industry) ? profile.industry : [profile.industry]
        industries.forEach((industry: string) => {
          const industryKey = industry.toLowerCase().replace(/\s+/g, '')
          if (CURATED_YOUTUBE_VIDEOS[industryKey]) {
            fallbackVideos.push(...CURATED_YOUTUBE_VIDEOS[industryKey])
          }
        })
      }
      
      // If no specific videos found, use default
      if (fallbackVideos.length === 0) {
        fallbackVideos = CURATED_YOUTUBE_VIDEOS.default
      }
      
      // Remove duplicates
      const uniqueVideos = Array.from(
        new Map(fallbackVideos.map(v => [v.videoId, v])).values()
      )
      
      videos = uniqueVideos.slice(0, 20).map(video => ({
        ...video,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${video.videoId}`
      }))
    }
    
    return NextResponse.json({ videos, queries })
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    // Fallback to default videos
    return NextResponse.json(
      { 
        error: 'Failed to fetch YouTube videos', 
        videos: CURATED_YOUTUBE_VIDEOS.default.slice(0, 20).map(v => ({
          ...v,
          url: `https://www.youtube.com/watch?v=${v.videoId}`,
          thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${v.videoId}`
        })) 
      },
      { status: 500 }
    )
  }
}

