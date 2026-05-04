export type Industry = 'fashion' | 'arts' | 'music' | 'tech' | 'food' | 'fitness' | 'consulting' | 'e-commerce' | 'education' | 'healthcare'

export interface IndustryContent {
  industry: Industry
  displayName: string
  videos: Array<{
    id: string
    title: string
    channel: string
    duration: string
    views: string
    thumbnail: string
    url: string
    videoId: string
    description: string
  }>
  articles: Array<{
    title: string
    description: string
    url?: string
  }>
  legalResources: Array<{
    title: string
    description: string
    category: string
  }>
  entrepreneurStories: Array<{
    id: string
    title: string
    entrepreneur: string
    company: string
    year: string
    image: string
    description: string
    businessLesson: string
  }>
  tips: string[]
  nextSteps: {
    beginner: string[]
    intermediate: string[]
    advanced: string[]
  }
}

const industryContentMap: Record<Industry, IndustryContent> = {
  fashion: {
    industry: 'fashion',
    displayName: 'Fashion',
    videos: [
      {
        id: 'f1',
        title: 'Building a Sustainable Fashion Brand',
        channel: 'Fashion Business Academy',
        duration: '15:30',
        views: '2.5M+',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop',
        url: 'https://www.ted.com/talks',
        videoId: 'sustainable_fashion_brand',
        description: 'Learn how to build a fashion brand that prioritizes sustainability and ethical practices.'
      },
      {
        id: 'f2',
        title: 'Fashion E-commerce: From Idea to Launch',
        channel: 'Entrepreneur',
        duration: '12:45',
        views: '1.8M+',
        thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=450&fit=crop',
        url: 'https://www.ted.com/talks',
        videoId: 'fashion_ecommerce_launch',
        description: 'A comprehensive guide to launching your fashion e-commerce business.'
      }
    ],
    articles: [
      {
        title: 'Fashion Industry Legal Requirements',
        description: 'Understanding trademarks, copyrights, and business licenses for fashion businesses.'
      },
      {
        title: 'Sustainable Fashion: A Complete Guide',
        description: 'How to build an eco-friendly fashion brand that resonates with modern consumers.'
      },
      {
        title: 'Fashion Marketing Strategies That Work',
        description: 'Proven marketing tactics for fashion brands in the digital age.'
      }
    ],
    legalResources: [
      {
        title: 'Trademark Your Brand Name',
        category: 'Intellectual Property',
        description: 'Protect your fashion brand name and logo with proper trademark registration.'
      },
      {
        title: 'Fashion Business Licenses',
        category: 'Business Registration',
        description: 'Required licenses and permits for operating a fashion business in your state.'
      },
      {
        title: 'Copyright Protection for Designs',
        category: 'Intellectual Property',
        description: 'Understanding copyright protection for your fashion designs and patterns.'
      },
      {
        title: 'Import/Export Regulations',
        category: 'International Trade',
        description: 'Legal requirements for importing fabrics and exporting finished products.'
      }
    ],
    entrepreneurStories: [
      {
        id: 'fs1',
        title: 'The Zara Revolution',
        entrepreneur: 'Amancio Ortega',
        company: 'Zara (Inditex)',
        year: '1975-Present',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=480&fit=crop',
        description: 'Amancio Ortega built Zara into the world\'s largest fashion retailer by revolutionizing fast fashion. He created a vertically integrated supply chain that could design, produce, and deliver new styles to stores in just two weeks.',
        businessLesson: 'Ortega demonstrated the power of speed and vertical integration in fashion. By controlling the entire supply chain, Zara could respond to trends faster than competitors. The lesson: in fashion, speed to market and customer responsiveness create massive competitive advantages. Build systems that let you move quickly.'
      },
      {
        id: 'fs2',
        title: 'Sustainable Fashion Pioneer',
        entrepreneur: 'Yvon Chouinard',
        company: 'Patagonia',
        year: '1973-Present',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=480&fit=crop',
        description: 'Yvon Chouinard built Patagonia into a billion-dollar brand by prioritizing environmental responsibility over profit. He famously ran ads telling customers not to buy his products unless they needed them.',
        businessLesson: 'Chouinard proved that authentic values can drive business success. By genuinely caring about the environment, Patagonia attracted customers who shared those values. The lesson: your brand values aren\'t marketing—they\'re your foundation. Authentic purpose creates loyal customers.'
      }
    ],
    tips: [
      'Start with a niche—don\'t try to appeal to everyone',
      'Invest in quality photography—fashion is visual',
      'Build relationships with suppliers early',
      'Understand your target customer deeply',
      'Focus on sustainable and ethical practices',
      'Create a strong brand identity and story',
      'Leverage social media, especially Instagram and TikTok',
      'Consider starting with a capsule collection'
    ],
    nextSteps: {
      beginner: [
        'Define your fashion niche and target customer',
        'Research competitors and identify gaps in the market',
        'Create initial designs or select products to sell',
        'Set up basic business structure (LLC, business license)',
        'Build a simple e-commerce website or use platforms like Etsy',
        'Create social media accounts and start building an audience',
        'Develop a brand identity (logo, colors, style)',
        'Find suppliers or manufacturers for your products'
      ],
      intermediate: [
        'Expand your product line based on customer feedback',
        'Invest in professional photography and marketing',
        'Build an email list and implement email marketing',
        'Explore wholesale opportunities with boutiques',
        'Attend fashion trade shows and networking events',
        'Develop relationships with fashion influencers',
        'Optimize your supply chain for faster production',
        'Consider opening a physical store or pop-up shop'
      ],
      advanced: [
        'Scale production while maintaining quality',
        'Expand into new markets or product categories',
        'Build a team (designers, marketers, operations)',
        'Develop strategic partnerships with retailers',
        'Invest in sustainable and ethical production methods',
        'Create a strong brand that transcends products',
        'Consider international expansion',
        'Build systems for consistent growth and quality'
      ]
    }
  },
  arts: {
    industry: 'arts',
    displayName: 'Arts',
    videos: [
      {
        id: 'a1',
        title: 'Turning Your Art into a Business',
        channel: 'Creative Business',
        duration: '18:20',
        views: '3.2M+',
        thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=450&fit=crop',
        url: 'https://www.ted.com/talks',
        videoId: 'art_into_business',
        description: 'Learn how to monetize your artistic talent and build a sustainable creative business.'
      },
      {
        id: 'a2',
        title: 'Building an Art Brand Online',
        channel: 'Artpreneur',
        duration: '14:15',
        views: '2.1M+',
        thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=450&fit=crop',
        url: 'https://www.ted.com/talks',
        videoId: 'art_brand_online',
        description: 'Strategies for building your art brand and selling artwork online.'
      }
    ],
    articles: [
      {
        title: 'Copyright Protection for Artists',
        description: 'How to protect your artwork and understand your rights as an artist.'
      },
      {
        title: 'Pricing Your Artwork',
        description: 'A guide to pricing your art fairly while building a sustainable business.'
      },
      {
        title: 'Selling Art Online: Complete Guide',
        description: 'Everything you need to know about selling your art through online platforms.'
      }
    ],
    legalResources: [
      {
        title: 'Copyright Your Artwork',
        category: 'Intellectual Property',
        description: 'Register copyrights for your original artwork to protect against infringement.'
      },
      {
        title: 'Artist Business License',
        category: 'Business Registration',
        description: 'Required business licenses for selling art and operating as a professional artist.'
      },
      {
        title: 'Art Sales Tax Requirements',
        category: 'Tax Compliance',
        description: 'Understanding sales tax obligations when selling artwork.'
      },
      {
        title: 'Gallery Contracts and Agreements',
        category: 'Business Contracts',
        description: 'Key terms to include in gallery representation and consignment agreements.'
      }
    ],
    entrepreneurStories: [
      {
        id: 'as1',
        title: 'The Pop Art Revolution',
        entrepreneur: 'Andy Warhol',
        company: 'The Factory',
        year: '1960s-1980s',
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=480&fit=crop',
        description: 'Andy Warhol transformed the art world by treating art as a business. He created The Factory, a studio that mass-produced art, challenging traditional notions of artistic authenticity.',
        businessLesson: 'Warhol showed that art and business aren\'t mutually exclusive. He understood branding, marketing, and production at scale. The lesson: don\'t be afraid to commercialize your art. Building systems and treating your art as a business doesn\'t diminish its value—it amplifies its reach.'
      }
    ],
    tips: [
      'Document all your work with high-quality photos',
      'Build an online portfolio and social media presence',
      'Network with other artists and gallery owners',
      'Understand the value of your time and materials',
      'Don\'t undervalue your work—price it appropriately',
      'Create multiple revenue streams (originals, prints, commissions)',
      'Protect your work with proper copyright registration',
      'Build relationships with collectors and art enthusiasts'
    ],
    nextSteps: {
      beginner: [
        'Build a portfolio of your best work',
        'Create an online presence (website, social media)',
        'Research pricing strategies for your medium',
        'Start selling on platforms like Etsy, Artfinder, or Saatchi Art',
        'Attend local art shows and markets',
        'Network with other artists in your area',
        'Learn about copyright protection',
        'Set up a simple business structure (sole proprietorship or LLC)'
      ],
      intermediate: [
        'Approach galleries for representation',
        'Develop a consistent body of work',
        'Build an email list of collectors and fans',
        'Create prints or reproductions of popular pieces',
        'Offer commissions and custom work',
        'Participate in juried exhibitions',
        'Develop relationships with art consultants',
        'Consider teaching workshops or classes'
      ],
      advanced: [
        'Secure gallery representation in multiple cities',
        'Build a waiting list for your work',
        'Develop relationships with collectors and museums',
        'Create limited edition series',
        'Expand into new mediums or styles',
        'Build a team (assistants, framers, photographers)',
        'Develop international recognition',
        'Create a legacy through teaching or mentorship'
      ]
    }
  },
  music: {
    industry: 'music',
    displayName: 'Music',
    videos: [
      {
        id: 'm1',
        title: 'Building a Music Career in the Digital Age',
        channel: 'Music Business',
        duration: '16:45',
        views: '4.1M+',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop',
        url: 'https://www.ted.com/talks',
        videoId: 'music_career_digital',
        description: 'How to build a sustainable music career using modern tools and platforms.'
      },
      {
        id: 'm2',
        title: 'Music Licensing and Royalties Explained',
        channel: 'Music Law',
        duration: '13:30',
        views: '2.9M+',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop',
        url: 'https://www.ted.com/talks',
        videoId: 'music_licensing_royalties',
        description: 'Understanding music licensing, royalties, and how to monetize your music.'
      }
    ],
    articles: [
      {
        title: 'Music Business Legal Essentials',
        description: 'Understanding contracts, royalties, and legal requirements for musicians.'
      },
      {
        title: 'Building Your Music Brand',
        description: 'How to create a strong brand identity as a musician or music producer.'
      },
      {
        title: 'Music Distribution Strategies',
        description: 'Best practices for distributing your music across platforms and reaching audiences.'
      }
    ],
    legalResources: [
      {
        title: 'Copyright Your Music',
        category: 'Intellectual Property',
        description: 'Register copyrights for your songs and recordings to protect your work.'
      },
      {
        title: 'Music Publishing Rights',
        category: 'Intellectual Property',
        description: 'Understanding publishing rights and how to collect royalties.'
      },
      {
        title: 'Performance Rights Organizations',
        category: 'Royalties',
        description: 'Join ASCAP, BMI, or SESAC to collect performance royalties.'
      },
      {
        title: 'Recording Contracts',
        category: 'Business Contracts',
        description: 'Key terms to understand in recording and distribution contracts.'
      }
    ],
    entrepreneurStories: [
      {
        id: 'ms1',
        title: 'The Streaming Revolution',
        entrepreneur: 'Daniel Ek',
        company: 'Spotify',
        year: '2006-Present',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=480&fit=crop',
        description: 'Daniel Ek disrupted the music industry by creating Spotify, making music accessible to millions while changing how artists get paid.',
        businessLesson: 'Ek showed that you can disrupt entire industries by solving real problems. Spotify solved piracy by making legal music more convenient than illegal downloads. The lesson: find the friction in your industry and eliminate it. Sometimes the best business model is making something easier and more accessible.'
      }
    ],
    tips: [
      'Register your music with copyright offices',
      'Join a performance rights organization (ASCAP, BMI)',
      'Build a strong online presence across platforms',
      'Network with other musicians and industry professionals',
      'Understand your rights and contracts',
      'Diversify your income streams',
      'Invest in quality recordings and production',
      'Build a loyal fanbase before focusing on monetization'
    ],
    nextSteps: {
      beginner: [
        'Record and produce your first songs',
        'Register copyrights for your music',
        'Join a performance rights organization',
        'Create profiles on streaming platforms (Spotify, Apple Music)',
        'Build social media presence (Instagram, TikTok, YouTube)',
        'Start performing at local venues',
        'Network with other musicians',
        'Learn about music business basics'
      ],
      intermediate: [
        'Build a mailing list of fans',
        'Release music consistently',
        'Develop relationships with playlist curators',
        'Perform at larger venues and festivals',
        'Collaborate with other artists',
        'Work with a music manager or agent',
        'Explore sync licensing opportunities',
        'Build a team (producer, mixer, mastering engineer)'
      ],
      advanced: [
        'Secure major label or distribution deals',
        'Build international touring presence',
        'Develop multiple revenue streams (touring, merch, licensing)',
        'Build a brand beyond just music',
        'Mentor emerging artists',
        'Start your own label or production company',
        'Develop strategic partnerships',
        'Create a sustainable long-term career'
      ]
    }
  },
  tech: {
    industry: 'tech',
    displayName: 'Technology',
    videos: [
      {
        id: 't1',
        title: 'From Idea to Tech Startup',
        channel: 'TechCrunch',
        duration: '20:10',
        views: '5.2M+',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
        url: 'https://www.ted.com/talks',
        videoId: 'tech_startup_guide',
        description: 'A comprehensive guide to building and launching a tech startup.'
      }
    ],
    articles: [
      {
        title: 'Tech Startup Legal Structure',
        description: 'Choosing the right legal structure for your tech startup (LLC vs C-Corp).'
      },
      {
        title: 'Intellectual Property for Tech Companies',
        description: 'Protecting your code, patents, and trade secrets.'
      }
    ],
    legalResources: [
      {
        title: 'Patent Your Technology',
        category: 'Intellectual Property',
        description: 'File patents for your innovative technology and processes.'
      },
      {
        title: 'Software Copyright Protection',
        category: 'Intellectual Property',
        description: 'Copyright protection for your code and software applications.'
      },
      {
        title: 'Terms of Service and Privacy Policies',
        category: 'Legal Compliance',
        description: 'Essential legal documents for tech companies handling user data.'
      }
    ],
    entrepreneurStories: [
      {
        id: 'ts1',
        title: 'The iPhone Revolution',
        entrepreneur: 'Steve Jobs',
        company: 'Apple Inc.',
        year: '2007',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1024px-Apple_logo_black.svg.png',
        description: 'Steve Jobs revolutionized the mobile phone industry by introducing the iPhone in 2007.',
        businessLesson: 'Jobs demonstrated the power of visionary thinking and refusing to accept industry limitations.'
      }
    ],
    tips: [
      'Protect your intellectual property early',
      'Build an MVP (Minimum Viable Product) first',
      'Focus on solving real problems',
      'Build a strong technical team',
      'Understand your market deeply',
      'Secure proper funding or bootstrap wisely',
      'Focus on user experience',
      'Iterate based on user feedback'
    ],
    nextSteps: {
      beginner: [
        'Validate your idea with potential users',
        'Build a minimum viable product (MVP)',
        'Choose the right tech stack',
        'Set up proper business structure',
        'Protect your intellectual property',
        'Build a landing page and start collecting emails',
        'Get initial users and gather feedback',
        'Iterate based on user feedback'
      ],
      intermediate: [
        'Raise seed funding or bootstrap effectively',
        'Build a core team (developers, designers)',
        'Develop a go-to-market strategy',
        'Build partnerships with complementary services',
        'Focus on user acquisition and retention',
        'Develop a clear monetization strategy',
        'Build systems for scaling',
        'Establish company culture and values'
      ],
      advanced: [
        'Scale your team and operations',
        'Raise Series A or later funding',
        'Expand into new markets',
        'Build strategic partnerships',
        'Develop multiple product lines',
        'Build a strong brand',
        'Consider acquisitions or mergers',
        'Plan for long-term sustainability'
      ]
    }
  },
  food: {
    industry: 'food',
    displayName: 'Food & Beverage',
    videos: [],
    articles: [],
    legalResources: [
      {
        title: 'Food Business Licenses',
        category: 'Business Registration',
        description: 'Required licenses and permits for operating a food business.'
      },
      {
        title: 'Health Department Regulations',
        category: 'Health & Safety',
        description: 'Compliance with health department regulations and food safety standards.'
      }
    ],
    entrepreneurStories: [],
    tips: [],
    nextSteps: {
      beginner: [],
      intermediate: [],
      advanced: []
    }
  },
  fitness: {
    industry: 'fitness',
    displayName: 'Fitness & Wellness',
    videos: [],
    articles: [],
    legalResources: [
      {
        title: 'Fitness Business Insurance',
        category: 'Insurance',
        description: 'Liability insurance requirements for fitness businesses.'
      }
    ],
    entrepreneurStories: [],
    tips: [],
    nextSteps: {
      beginner: [],
      intermediate: [],
      advanced: []
    }
  },
  consulting: {
    industry: 'consulting',
    displayName: 'Consulting',
    videos: [],
    articles: [],
    legalResources: [
      {
        title: 'Consulting Contracts',
        category: 'Business Contracts',
        description: 'Essential terms for consulting service agreements.'
      }
    ],
    entrepreneurStories: [],
    tips: [],
    nextSteps: {
      beginner: [],
      intermediate: [],
      advanced: []
    }
  },
  'e-commerce': {
    industry: 'e-commerce',
    displayName: 'E-commerce',
    videos: [],
    articles: [],
    legalResources: [
      {
        title: 'E-commerce Business Licenses',
        category: 'Business Registration',
        description: 'Required licenses for operating an e-commerce business.'
      }
    ],
    entrepreneurStories: [],
    tips: [],
    nextSteps: {
      beginner: [],
      intermediate: [],
      advanced: []
    }
  },
  education: {
    industry: 'education',
    displayName: 'Education',
    videos: [],
    articles: [],
    legalResources: [
      {
        title: 'Education Business Licenses',
        category: 'Business Registration',
        description: 'Licensing requirements for educational businesses.'
      }
    ],
    entrepreneurStories: [],
    tips: [],
    nextSteps: {
      beginner: [],
      intermediate: [],
      advanced: []
    }
  },
  healthcare: {
    industry: 'healthcare',
    displayName: 'Healthcare',
    videos: [],
    articles: [],
    legalResources: [
      {
        title: 'Healthcare Business Compliance',
        category: 'Legal Compliance',
        description: 'HIPAA and other healthcare compliance requirements.'
      }
    ],
    entrepreneurStories: [],
    tips: [],
    nextSteps: {
      beginner: [],
      intermediate: [],
      advanced: []
    }
  }
}

export function getIndustryContent(industry: Industry | null): IndustryContent | null {
  if (!industry) return null
  return industryContentMap[industry] || null
}

export function getPersonalizedGuidance(profile: {
  industry: string | null
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
  businessStage: 'idea' | 'foundation' | 'established' | null
}) {
  const content = getIndustryContent(profile.industry as Industry)
  if (!content) return null

  const nextSteps = content.nextSteps[profile.experienceLevel || 'beginner'] || []
  
  return {
    industry: content.displayName,
    nextSteps,
    tips: content.tips,
    legalResources: content.legalResources
  }
}

export function getNextSteps(profile: {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
  businessStage: 'idea' | 'foundation' | 'established' | null
  industry: string | null
}): string[] {
  const content = getIndustryContent(profile.industry as Industry)
  if (!content) return []
  
  return content.nextSteps[profile.experienceLevel || 'beginner'] || []
}

export function getMindsetQuestions(profile: {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null
  businessStage: 'idea' | 'foundation' | 'established' | null
}): Array<{ id: string; question: string; type: 'text' | 'select'; options?: string[] }> {
  const questions: Array<{ id: string; question: string; type: 'text' | 'select'; options?: string[] }> = []

  if (profile.businessStage === 'idea') {
    questions.push({
      id: 'idea_validation',
      question: 'What is your biggest concern about starting your business?',
      type: 'select',
      options: ['Not sure if there\'s demand', 'Lack of funding', 'Not having the right skills', 'Fear of failure', 'Time constraints']
    })
  }

  if (profile.experienceLevel === 'beginner') {
    questions.push({
      id: 'learning_priority',
      question: 'What area do you want to learn about most right now?',
      type: 'select',
      options: ['Marketing and sales', 'Legal and compliance', 'Operations and systems', 'Financial management', 'Product development']
    })
  }

  if (profile.businessStage === 'foundation') {
    questions.push({
      id: 'growth_focus',
      question: 'What is your main focus for growth right now?',
      type: 'select',
      options: ['Getting more customers', 'Improving operations', 'Building a team', 'Expanding products/services', 'Increasing revenue']
    })
  }

  questions.push({
    id: 'current_challenge',
    question: 'What is your biggest challenge right now?',
    type: 'text'
  })

  return questions
}

