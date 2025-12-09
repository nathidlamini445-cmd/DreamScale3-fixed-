import { NextRequest, NextResponse } from 'next/server'

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

// Search YouTube for videos
async function searchYouTube(query: string, maxResults: number = 5): Promise<any[]> {
  try {
    // Use YouTube's oEmbed API for simpler access (no API key needed)
    // Or use a public search approach
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    
    // For now, we'll use a curated list approach with YouTube video IDs
    // In production, you'd use YouTube Data API v3 with an API key
    
    // Return popular entrepreneurship videos as fallback
    return []
  } catch (error) {
    console.error('Error searching YouTube:', error)
    return []
  }
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
    const { profile } = body
    
    // Generate search queries based on profile
    const queries = generateSearchQueries(profile || {})
    
    // Determine which curated videos to return based on profile
    let videos: any[] = []
    
    // Get videos based on industry
    if (profile?.industry) {
      const industries = Array.isArray(profile.industry) ? profile.industry : [profile.industry]
      industries.forEach((industry: string) => {
        const industryKey = industry.toLowerCase().replace(/\s+/g, '')
        if (CURATED_YOUTUBE_VIDEOS[industryKey]) {
          videos.push(...CURATED_YOUTUBE_VIDEOS[industryKey])
        }
      })
    }
    
    // Get videos based on goals
    if (profile?.goals && Array.isArray(profile.goals)) {
      profile.goals.forEach((goal: string) => {
        const goalKey = goal.toLowerCase().replace(/\s+/g, '')
        if (goalKey.includes('team') && CURATED_YOUTUBE_VIDEOS.leadership) {
          videos.push(...CURATED_YOUTUBE_VIDEOS.leadership)
        }
        if (goalKey.includes('customer') && CURATED_YOUTUBE_VIDEOS.marketing) {
          videos.push(...CURATED_YOUTUBE_VIDEOS.marketing)
        }
      })
    }
    
    // Get videos based on business stage
    if (profile?.businessStage) {
      const stages = Array.isArray(profile.businessStage) ? profile.businessStage : [profile.businessStage]
      if (stages.some((s: string) => s === 'idea' || s === 'foundation')) {
        videos.push(...CURATED_YOUTUBE_VIDEOS.startup)
      }
    }
    
    // If no specific videos found, use default
    if (videos.length === 0) {
      videos = CURATED_YOUTUBE_VIDEOS.default
    }
    
    // Remove duplicates and limit results
    const uniqueVideos = Array.from(
      new Map(videos.map(v => [v.videoId, v])).values()
    ).slice(0, 20)
    
    // Add YouTube URLs and thumbnails
    const videosWithUrls = uniqueVideos.map(video => ({
      ...video,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${video.videoId}`
    }))
    
    return NextResponse.json({ videos: videosWithUrls, queries })
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch YouTube videos', videos: CURATED_YOUTUBE_VIDEOS.default.map(v => ({
        ...v,
        url: `https://www.youtube.com/watch?v=${v.videoId}`,
        thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${v.videoId}`
      })) },
      { status: 500 }
    )
  }
}

