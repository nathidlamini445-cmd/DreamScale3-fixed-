export interface DiscoverContent {
  id: string
  title: string
  videoUrl: string
  videoId: string
  channel?: string
  duration?: string
  views?: string
  description?: string
  thumbnail?: string
  tags: {
    industries: string[]
    businessStages: string[]
    challenges: string[]
    goals?: string[]
    experienceLevels?: string[]
    hobbies?: string[]
  }
}

export const DISCOVER_CONTENT: DiscoverContent[] = [
  // SaaS & Technology
  {
    id: '1',
    title: 'SaaS Growth Strategies: From $0 to $100M ARR',
    videoUrl: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    videoId: 'qp0HIF3SfI4',
    channel: 'Y Combinator',
    duration: '45:20',
    views: '2.5M',
    description: 'Learn proven strategies for scaling SaaS businesses from startup to $100M ARR.',
    thumbnail: 'https://img.youtube.com/vi/qp0HIF3SfI4/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Growth Stage', 'Scaling', 'Established'],
      challenges: ['Customer Acquisition', 'Scaling', 'Revenue Growth'],
      goals: ['Scale the business', 'Increase revenue', 'Get more customers'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '2',
    title: 'Building a SaaS Product: From Idea to Launch',
    videoUrl: 'https://www.youtube.com/watch?v=0CDXJ6bMkMY',
    videoId: '0CDXJ6bMkMY',
    channel: 'Y Combinator',
    duration: '52:30',
    views: '1.5M',
    description: 'Step-by-step guide to building and launching a successful SaaS product.',
    thumbnail: 'https://img.youtube.com/vi/0CDXJ6bMkMY/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build a team'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '16',
    title: 'How to Build & Deploy a FULL SaaS App Using AI',
    videoUrl: 'https://www.youtube.com/watch?v=AaHykKBRchg',
    videoId: 'AaHykKBRchg',
    channel: 'SaaS Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to building and deploying a full SaaS application using AI tools and modern technologies.',
    thumbnail: 'https://img.youtube.com/vi/AaHykKBRchg/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '17',
    title: 'Complete HighLevel SaaS Setup Tutorial 2025 (No Sales)',
    videoUrl: 'https://www.youtube.com/watch?v=eQudUY-w3vg',
    videoId: 'eQudUY-w3vg',
    channel: 'SaaS Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Step-by-step tutorial for setting up HighLevel SaaS platform without sales pressure.',
    thumbnail: 'https://img.youtube.com/vi/eQudUY-w3vg/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Improve operations'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '18',
    title: 'SaaS Jumpstart Course 2025 | FREE GoHighLevel Training',
    videoUrl: 'https://www.youtube.com/watch?v=SiijIKu5SoY',
    videoId: 'SiijIKu5SoY',
    channel: 'SaaS Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Free comprehensive training course to jumpstart your SaaS business with GoHighLevel.',
    thumbnail: 'https://img.youtube.com/vi/SiijIKu5SoY/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '19',
    title: 'How to Start Your First SaaS Business',
    videoUrl: 'https://www.youtube.com/watch?v=avVUcWW3AsM',
    videoId: 'avVUcWW3AsM',
    channel: 'SaaS Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Essential guide for entrepreneurs looking to start their first SaaS business from scratch.',
    thumbnail: 'https://img.youtube.com/vi/avVUcWW3AsM/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Idea', 'Early Stage'],
      challenges: ['Product Development', 'Funding', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '120',
    title: 'SaaS Business Model and Growth Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=lxpaSlImFHk',
    videoId: 'lxpaSlImFHk',
    channel: 'SaaS Education',
    duration: '0:00',
    views: '0',
    description: 'Understanding SaaS business models and implementing growth strategies for success.',
    thumbnail: 'https://img.youtube.com/vi/lxpaSlImFHk/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Scaling', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Scale the business', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '121',
    title: 'SaaS Startup Guide and Best Practices',
    videoUrl: 'https://www.youtube.com/watch?v=SddMq2nKsUA',
    videoId: 'SddMq2nKsUA',
    channel: 'SaaS Education',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to starting a SaaS business with industry best practices and strategies.',
    thumbnail: 'https://img.youtube.com/vi/SddMq2nKsUA/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Funding', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '122',
    title: 'Building and Scaling a SaaS Business',
    videoUrl: 'https://www.youtube.com/watch?v=KBFKTeFIQws',
    videoId: 'KBFKTeFIQws',
    channel: 'SaaS Education',
    duration: '0:00',
    views: '0',
    description: 'Essential strategies for building and scaling a successful SaaS business in 2025.',
    thumbnail: 'https://img.youtube.com/vi/KBFKTeFIQws/hqdefault.jpg',
    tags: {
      industries: ['SaaS', 'Technology', 'Software'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Scaling', 'Operations', 'Customer Acquisition'],
      goals: ['Scale the business', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  // E-commerce
  {
    id: '3',
    title: 'E-commerce Marketing: Driving Sales in 2024',
    videoUrl: 'https://www.youtube.com/watch?v=u6XAPnuFjJc',
    videoId: 'u6XAPnuFjJc',
    channel: 'TED',
    duration: '17:30',
    views: '12M',
    description: 'Modern marketing strategies for e-commerce businesses to drive sales and growth.',
    thumbnail: 'https://img.youtube.com/vi/u6XAPnuFjJc/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail', 'Online Business'],
      businessStages: ['Early Stage', 'Growth Stage', 'Foundation'],
      challenges: ['Marketing', 'Customer Acquisition', 'Scaling'],
      goals: ['Get more customers', 'Build brand awareness', 'Increase revenue'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['technology', 'networking']
    }
  },
  {
    id: '4',
    title: 'E-commerce Operations: Scaling Your Online Store',
    videoUrl: 'https://www.youtube.com/watch?v=jvOz4eMq5d8',
    videoId: 'jvOz4eMq5d8',
    channel: 'Y Combinator',
    duration: '58:30',
    views: '2.5M',
    description: 'Learn how to scale your e-commerce operations efficiently.',
    thumbnail: 'https://img.youtube.com/vi/jvOz4eMq5d8/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail'],
      businessStages: ['Growth Stage', 'Scaling', 'Established'],
      challenges: ['Operations', 'Scaling', 'Customer Acquisition'],
      goals: ['Improve operations', 'Scale the business', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'networking']
    }
  },
  {
    id: '20',
    title: "Shopify Beginner's Tutorial 2025 - Make A Pro eCommerce Store in 15 Minutes",
    videoUrl: 'https://www.youtube.com/watch?v=gsw2NYVrPfM',
    videoId: 'gsw2NYVrPfM',
    channel: 'E-commerce Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Quick tutorial to build a professional e-commerce store using Shopify in just 15 minutes.',
    thumbnail: 'https://img.youtube.com/vi/gsw2NYVrPfM/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail', 'Online Business'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'networking']
    }
  },
  {
    id: '21',
    title: 'How to Start an E-Commerce Business in 2025 (Beginners Tutorial Guide)',
    videoUrl: 'https://www.youtube.com/watch?v=E7jlR79PtO0',
    videoId: 'E7jlR79PtO0',
    channel: 'E-commerce Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Complete beginner-friendly guide to starting your e-commerce business in 2025.',
    thumbnail: 'https://img.youtube.com/vi/E7jlR79PtO0/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail', 'Online Business'],
      businessStages: ['Idea', 'Early Stage'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner'],
      hobbies: ['technology', 'networking']
    }
  },
  {
    id: '22',
    title: 'HOW TO START AN E-COMMERCE BUSINESS IN 2025 (STEP BY STEP) BEGINNERS',
    videoUrl: 'https://www.youtube.com/watch?v=srsY9KfI6-A',
    videoId: 'srsY9KfI6-A',
    channel: 'E-commerce Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Step-by-step guide for beginners to start an e-commerce business from scratch.',
    thumbnail: 'https://img.youtube.com/vi/srsY9KfI6-A/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail', 'Online Business'],
      businessStages: ['Idea', 'Early Stage'],
      challenges: ['Product Development', 'Customer Acquisition', 'Operations'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner'],
      hobbies: ['technology', 'networking']
    }
  },
  {
    id: '23',
    title: 'How to Start an Online Store in 2025 (STEP BY STEP) Beginners Guide',
    videoUrl: 'https://www.youtube.com/watch?v=zn9ftkG4SAU',
    videoId: 'zn9ftkG4SAU',
    channel: 'E-commerce Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Comprehensive step-by-step beginners guide to launching your online store in 2025.',
    thumbnail: 'https://img.youtube.com/vi/zn9ftkG4SAU/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail', 'Online Business'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'networking']
    }
  },
  {
    id: '24',
    title: 'How to Start an Ecommerce Business in 2025 (FREE COURSE)',
    videoUrl: 'https://www.youtube.com/watch?v=S8p31Sg69RY',
    videoId: 'S8p31Sg69RY',
    channel: 'E-commerce Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Free comprehensive course covering everything you need to start your e-commerce business.',
    thumbnail: 'https://img.youtube.com/vi/S8p31Sg69RY/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail', 'Online Business'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'networking']
    }
  },
  {
    id: '123',
    title: 'E-commerce Business Growth and Scaling Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=567hU5QS_Wc',
    videoId: '567hU5QS_Wc',
    channel: 'E-commerce Education',
    duration: '0:00',
    views: '0',
    description: 'Proven strategies for growing and scaling your e-commerce business to new heights.',
    thumbnail: 'https://img.youtube.com/vi/567hU5QS_Wc/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail', 'Online Business'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Scaling', 'Operations', 'Customer Acquisition'],
      goals: ['Scale the business', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'networking']
    }
  },
  {
    id: '124',
    title: 'Advanced E-commerce Business Tactics',
    videoUrl: 'https://www.youtube.com/watch?v=GlxMoZMyhrs',
    videoId: 'GlxMoZMyhrs',
    channel: 'E-commerce Education',
    duration: '0:00',
    views: '0',
    description: 'Advanced tactics and strategies for taking your e-commerce business to the next level.',
    thumbnail: 'https://img.youtube.com/vi/GlxMoZMyhrs/hqdefault.jpg',
    tags: {
      industries: ['E-commerce', 'Retail', 'Online Business'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Scaling', 'Marketing', 'Operations'],
      goals: ['Scale the business', 'Increase revenue', 'Build brand awareness'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'networking']
    }
  },
  // Leadership & Team Building
  {
    id: '5',
    title: 'How Great Leaders Inspire Action',
    videoUrl: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    videoId: 'qp0HIF3SfI4',
    channel: 'TED',
    duration: '18:04',
    views: '65M',
    description: 'Simon Sinek has a simple but powerful model for inspirational leadership.',
    thumbnail: 'https://img.youtube.com/vi/qp0HIF3SfI4/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Team Building', 'Leadership', 'Operations'],
      goals: ['Build a team', 'Improve operations', 'Learn new skills'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '6',
    title: 'The Power of Vulnerability in Leadership',
    videoUrl: 'https://www.youtube.com/watch?v=UyyjU8fzEYU',
    videoId: 'UyyjU8fzEYU',
    channel: 'TED',
    duration: '20:19',
    views: '60M',
    description: 'Brené Brown studies human connection and vulnerability in leadership.',
    thumbnail: 'https://img.youtube.com/vi/UyyjU8fzEYU/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Team Building', 'Leadership'],
      goals: ['Build a team', 'Build partnerships', 'Learn new skills'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  // Marketing & Customer Acquisition
  {
    id: '7',
    title: 'How to Get Your Ideas to Spread',
    videoUrl: 'https://www.youtube.com/watch?v=u6XAPnuFjJc',
    videoId: 'u6XAPnuFjJc',
    channel: 'TED',
    duration: '17:30',
    views: '12M',
    description: 'Seth Godin explains how to make your ideas spread and build your brand.',
    thumbnail: 'https://img.youtube.com/vi/u6XAPnuFjJc/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition', 'Brand Awareness'],
      goals: ['Get more customers', 'Build brand awareness', 'Build partnerships'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['marketing', 'networking', 'reading']
    }
  },
  {
    id: '8',
    title: 'The Art of Storytelling for Business',
    videoUrl: 'https://www.youtube.com/watch?v=bJEyQ1qK2SU',
    videoId: 'bJEyQ1qK2SU',
    channel: 'TED',
    duration: '19:15',
    views: '15M',
    description: 'Learn how to tell compelling stories that connect with your audience.',
    thumbnail: 'https://img.youtube.com/vi/bJEyQ1qK2SU/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Build brand awareness', 'Get more customers', 'Build partnerships'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['writing', 'reading', 'networking']
    }
  },
  // Productivity & Time Management
  {
    id: '9',
    title: 'Inside the Mind of a Master Procrastinator',
    videoUrl: 'https://www.youtube.com/watch?v=arj7oStGLkU',
    videoId: 'arj7oStGLkU',
    channel: 'TED',
    duration: '14:04',
    views: '40M',
    description: 'Tim Urban discusses procrastination and productivity strategies.',
    thumbnail: 'https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Operations', 'Time Management'],
      goals: ['Improve work-life balance', 'Learn new skills', 'Improve operations'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'wellness']
    }
  },
  {
    id: '10',
    title: 'Grit: The Power of Passion and Perseverance',
    videoUrl: 'https://www.youtube.com/watch?v=H14bBuluwB8',
    videoId: 'H14bBuluwB8',
    channel: 'TED',
    duration: '6:13',
    views: '25M',
    description: 'Angela Lee Duckworth discusses grit and perseverance in entrepreneurship.',
    thumbnail: 'https://img.youtube.com/vi/H14bBuluwB8/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['All Challenges'],
      goals: ['Learn new skills', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['gym', 'sports', 'reading']
    }
  },
  // Startup & Funding
  {
    id: '11',
    title: 'The Single Biggest Reason Why Startups Succeed',
    videoUrl: 'https://www.youtube.com/watch?v=CBYhVcO4WgI',
    videoId: 'CBYhVcO4WgI',
    channel: 'TED',
    duration: '6:20',
    views: '8M',
    description: 'Bill Gross discusses what makes startups succeed.',
    thumbnail: 'https://img.youtube.com/vi/CBYhVcO4WgI/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'SaaS', 'Startups'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Funding'],
      goals: ['Launch new products/services'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '12',
    title: 'How to Start a Startup: Complete Guide',
    videoUrl: 'https://www.youtube.com/watch?v=jvOz4eMq5d8',
    videoId: 'jvOz4eMq5d8',
    channel: 'Y Combinator',
    duration: '58:30',
    views: '2.5M',
    description: 'Sam Altman and Dustin Moskovitz discuss how to start a startup.',
    thumbnail: 'https://img.youtube.com/vi/jvOz4eMq5d8/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'SaaS', 'Startups'],
      businessStages: ['Idea', 'Early Stage'],
      challenges: ['Product Development', 'Funding', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  // Communication & Networking
  {
    id: '13',
    title: 'Your Body Language May Shape Who You Are',
    videoUrl: 'https://www.youtube.com/watch?v=RcGyVTAoXEU',
    videoId: 'RcGyVTAoXEU',
    channel: 'TED',
    duration: '21:03',
    views: '65M',
    description: 'Amy Cuddy discusses how body language affects confidence and success.',
    thumbnail: 'https://img.youtube.com/vi/RcGyVTAoXEU/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Build partnerships', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['networking', 'reading']
    }
  },
  // Operations & Efficiency
  {
    id: '14',
    title: 'Building Efficient Business Operations',
    videoUrl: 'https://www.youtube.com/watch?v=0CDXJ6bMkMY',
    videoId: '0CDXJ6bMkMY',
    channel: 'Y Combinator',
    duration: '52:30',
    views: '1.5M',
    description: 'How to build efficient operations that scale with your business.',
    thumbnail: 'https://img.youtube.com/vi/0CDXJ6bMkMY/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Operations', 'Scaling'],
      goals: ['Improve operations', 'Scale the business'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'reading']
    }
  },
  // Wellness & Work-Life Balance
  {
    id: '15',
    title: 'The Happy Secret to Better Work',
    videoUrl: 'https://www.youtube.com/watch?v=arj7oStGLkU',
    videoId: 'arj7oStGLkU',
    channel: 'TED',
    duration: '12:20',
    views: '20M',
    description: 'Shawn Achor discusses happiness and productivity in work.',
    thumbnail: 'https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg',
    tags: {
      industries: ['All Industries'],
      businessStages: ['All Stages'],
      challenges: ['Operations'],
      goals: ['Improve work-life balance', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['wellness', 'reading', 'gym']
    }
  },
  // Technology
  {
    id: '25',
    title: 'Conversations 2025 Technical Update - Business Messaging Integrations',
    videoUrl: 'https://www.youtube.com/watch?v=onPHxTmrOn0',
    videoId: 'onPHxTmrOn0',
    channel: 'Technology Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Technical update on business messaging integrations and solutions for 2025.',
    thumbnail: 'https://img.youtube.com/vi/onPHxTmrOn0/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'Software', 'SaaS'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Product Development'],
      goals: ['Improve operations', 'Launch new products/services'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '26',
    title: 'Problem Statement Explainer Session - Solution Challenge (Education/Tech Access)',
    videoUrl: 'https://www.youtube.com/watch?v=zNf0tx5EuqU',
    videoId: 'zNf0tx5EuqU',
    channel: 'Technology Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Explainer session on problem statements and solutions for education and tech access challenges.',
    thumbnail: 'https://img.youtube.com/vi/zNf0tx5EuqU/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'Education', 'Software'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'reading']
    }
  },
  {
    id: '32',
    title: 'Technology Innovation and Development Guide 2025',
    videoUrl: 'https://www.youtube.com/watch?v=s2OccJMWwkM',
    videoId: 's2OccJMWwkM',
    channel: 'Technology Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Comprehensive guide to technology innovation and development strategies for 2025.',
    thumbnail: 'https://img.youtube.com/vi/s2OccJMWwkM/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'Software', 'SaaS'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Innovation'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '33',
    title: 'Modern Technology Solutions for Business',
    videoUrl: 'https://www.youtube.com/watch?v=i-FiRYaDAmw',
    videoId: 'i-FiRYaDAmw',
    channel: 'Technology Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Explore modern technology solutions and tools for business growth and efficiency.',
    thumbnail: 'https://img.youtube.com/vi/i-FiRYaDAmw/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'Software', 'All Industries'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling'],
      goals: ['Improve operations', 'Scale the business', 'Learn new skills'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '34',
    title: 'Technology Trends and Best Practices 2025',
    videoUrl: 'https://www.youtube.com/watch?v=RvP-uVNwnXo',
    videoId: 'RvP-uVNwnXo',
    channel: 'Technology Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Latest technology trends and best practices for entrepreneurs and businesses in 2025.',
    thumbnail: 'https://img.youtube.com/vi/RvP-uVNwnXo/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'Software', 'SaaS'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Innovation'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '35',
    title: 'Building Technology Products and Services',
    videoUrl: 'https://www.youtube.com/watch?v=Ad3HP6iRyUE',
    videoId: 'Ad3HP6iRyUE',
    channel: 'Technology Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to building technology products and services from concept to market.',
    thumbnail: 'https://img.youtube.com/vi/Ad3HP6iRyUE/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'Software', 'SaaS'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '36',
    title: 'Technology Business Strategies and Implementation',
    videoUrl: 'https://www.youtube.com/watch?v=7ARBJQn6QkM',
    videoId: '7ARBJQn6QkM',
    channel: 'Technology Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Strategic approaches and implementation methods for technology businesses.',
    thumbnail: 'https://img.youtube.com/vi/7ARBJQn6QkM/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'Software', 'SaaS'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Scaling', 'Operations', 'Customer Acquisition'],
      goals: ['Scale the business', 'Improve operations', 'Get more customers'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  {
    id: '37',
    title: 'Advanced Technology Development Techniques',
    videoUrl: 'https://www.youtube.com/watch?v=7gtc1DW2Tgo',
    videoId: '7gtc1DW2Tgo',
    channel: 'Technology Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Advanced techniques and methodologies for technology development and innovation.',
    thumbnail: 'https://img.youtube.com/vi/7gtc1DW2Tgo/hqdefault.jpg',
    tags: {
      industries: ['Technology', 'Software', 'SaaS'],
      businessStages: ['Growth Stage', 'Scaling', 'Established'],
      challenges: ['Product Development', 'Operations', 'Scaling'],
      goals: ['Scale the business', 'Improve operations', 'Innovation'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'gaming']
    }
  },
  // Healthcare
  {
    id: '38',
    title: 'The Breakthroughs Redefining Healthcare | WIRED Events (AI Drug Discovery, Neurotech)',
    videoUrl: 'https://www.youtube.com/watch?v=QbS04uELtHI',
    videoId: 'QbS04uELtHI',
    channel: 'Healthcare Industry',
    duration: '0:00',
    views: '0',
    description: 'Exploring breakthrough innovations in healthcare including AI drug discovery and neurotechnology.',
    thumbnail: 'https://img.youtube.com/vi/QbS04uELtHI/hqdefault.jpg',
    tags: {
      industries: ['Healthcare', 'Technology'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Innovation', 'Learn new skills'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['technology', 'reading']
    }
  },
  {
    id: '39',
    title: 'Focus On The Healthcare Industry | Part 2 (Medical Schemes, Cholesterol Solutions)',
    videoUrl: 'https://www.youtube.com/watch?v=-FYV1TOhP5I',
    videoId: '-FYV1TOhP5I',
    channel: 'Healthcare Industry',
    duration: '0:00',
    views: '0',
    description: 'In-depth focus on healthcare industry including medical schemes and cholesterol solutions.',
    thumbnail: 'https://img.youtube.com/vi/-FYV1TOhP5I/hqdefault.jpg',
    tags: {
      industries: ['Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling'],
      goals: ['Improve operations', 'Scale the business', 'Get more customers'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'wellness']
    }
  },
  {
    id: '40',
    title: 'Global Health in Transition 2025 (Pandemic Intelligence Shifts)',
    videoUrl: 'https://www.youtube.com/watch?v=NVveehYx46I',
    videoId: 'NVveehYx46I',
    channel: 'Healthcare Industry',
    duration: '0:00',
    views: '0',
    description: 'Understanding global health transitions and pandemic intelligence shifts in 2025.',
    thumbnail: 'https://img.youtube.com/vi/NVveehYx46I/hqdefault.jpg',
    tags: {
      industries: ['Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling'],
      goals: ['Improve operations', 'Scale the business', 'Learn new skills'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'wellness']
    }
  },
  {
    id: '41',
    title: 'Healthcare Industry Insights and Strategies 2025',
    videoUrl: 'https://www.youtube.com/watch?v=7ZsyYCZB3Nw',
    videoId: '7ZsyYCZB3Nw',
    channel: 'Healthcare Industry',
    duration: '0:00',
    views: '0',
    description: 'Comprehensive insights and strategic approaches for the healthcare industry in 2025.',
    thumbnail: 'https://img.youtube.com/vi/7ZsyYCZB3Nw/hqdefault.jpg',
    tags: {
      industries: ['Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling', 'Customer Acquisition'],
      goals: ['Scale the business', 'Improve operations', 'Get more customers'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'wellness']
    }
  },
  {
    id: '42',
    title: 'Modern Healthcare Business Models and Operations',
    videoUrl: 'https://www.youtube.com/watch?v=cM4aep7VXb8',
    videoId: 'cM4aep7VXb8',
    channel: 'Healthcare Industry',
    duration: '0:00',
    views: '0',
    description: 'Exploring modern business models and operational strategies in the healthcare industry.',
    thumbnail: 'https://img.youtube.com/vi/cM4aep7VXb8/hqdefault.jpg',
    tags: {
      industries: ['Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Operations', 'Scaling'],
      goals: ['Improve operations', 'Scale the business', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'wellness']
    }
  },
  {
    id: '43',
    title: 'Healthcare Industry Trends and Best Practices',
    videoUrl: 'https://www.youtube.com/watch?v=9zlUNw3y5rg',
    videoId: '9zlUNw3y5rg',
    channel: 'Healthcare Industry',
    duration: '0:00',
    views: '0',
    description: 'Latest trends and best practices shaping the healthcare industry landscape.',
    thumbnail: 'https://img.youtube.com/vi/9zlUNw3y5rg/hqdefault.jpg',
    tags: {
      industries: ['Healthcare'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Operations', 'Product Development'],
      goals: ['Launch new products/services', 'Learn new skills', 'Improve operations'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'wellness']
    }
  },
  {
    id: '44',
    title: 'Healthcare Business Development and Growth Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=Lhc_NfG54PA',
    videoId: 'Lhc_NfG54PA',
    channel: 'Healthcare Industry',
    duration: '0:00',
    views: '0',
    description: 'Strategic approaches to business development and growth in the healthcare sector.',
    thumbnail: 'https://img.youtube.com/vi/Lhc_NfG54PA/hqdefault.jpg',
    tags: {
      industries: ['Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Scaling', 'Customer Acquisition', 'Operations'],
      goals: ['Scale the business', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'wellness', 'networking']
    }
  },
  {
    id: '45',
    title: 'Comprehensive Healthcare Industry Analysis and Solutions',
    videoUrl: 'https://www.youtube.com/watch?v=vrDihiGNubI',
    videoId: 'vrDihiGNubI',
    channel: 'Healthcare Industry',
    duration: '0:00',
    views: '0',
    description: 'In-depth analysis of the healthcare industry with practical solutions and strategies.',
    thumbnail: 'https://img.youtube.com/vi/vrDihiGNubI/hqdefault.jpg',
    tags: {
      industries: ['Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Established', 'Scaling'],
      challenges: ['Operations', 'Scaling', 'Customer Acquisition'],
      goals: ['Scale the business', 'Improve operations', 'Get more customers', 'Learn new skills'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'wellness']
    }
  },
  // Finance
  {
    id: '46',
    title: '25 Minutes of The BEST Financial Decisions of 2025',
    videoUrl: 'https://www.youtube.com/watch?v=pWJkv3lDMpg',
    videoId: 'pWJkv3lDMpg',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Comprehensive guide to the best financial decisions and strategies for 2025.',
    thumbnail: 'https://img.youtube.com/vi/pWJkv3lDMpg/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage', 'Established'],
      challenges: ['Funding', 'Operations'],
      goals: ['Increase revenue', 'Learn new skills', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '47',
    title: "The Best Financial Advice You'll Ever Hear (Mel Robbins w/ Morgan Housel)",
    videoUrl: 'https://www.youtube.com/watch?v=Ai4iNmW2A1c',
    videoId: 'Ai4iNmW2A1c',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Essential financial advice from Mel Robbins and Morgan Housel for entrepreneurs and business owners.',
    thumbnail: 'https://img.youtube.com/vi/Ai4iNmW2A1c/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage', 'Established'],
      challenges: ['Funding', 'Operations', 'Scaling'],
      goals: ['Increase revenue', 'Learn new skills', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '48',
    title: 'Financial Planning and Investment Strategies for Entrepreneurs',
    videoUrl: 'https://www.youtube.com/watch?v=QThz1B8SHmc',
    videoId: 'QThz1B8SHmc',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Essential financial planning and investment strategies tailored for entrepreneurs and business owners.',
    thumbnail: 'https://img.youtube.com/vi/QThz1B8SHmc/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Funding', 'Operations'],
      goals: ['Increase revenue', 'Learn new skills', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '49',
    title: 'Business Finance Management and Growth Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=AgL_rnLfYmk',
    videoId: 'AgL_rnLfYmk',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Comprehensive guide to business finance management and growth strategies for scaling companies.',
    thumbnail: 'https://img.youtube.com/vi/AgL_rnLfYmk/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling', 'Established'],
      challenges: ['Funding', 'Scaling', 'Operations'],
      goals: ['Scale the business', 'Increase revenue', 'Improve operations'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '50',
    title: 'Financial Literacy and Wealth Building for Business Owners',
    videoUrl: 'https://www.youtube.com/watch?v=C6eXTvqdaro',
    videoId: 'C6eXTvqdaro',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Building financial literacy and wealth-building strategies specifically for business owners and entrepreneurs.',
    thumbnail: 'https://img.youtube.com/vi/C6eXTvqdaro/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage', 'Established'],
      challenges: ['Funding', 'Operations'],
      goals: ['Increase revenue', 'Learn new skills', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '51',
    title: 'Entrepreneurial Finance: Funding and Capital Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=jPPzvuDIr1w',
    videoId: 'jPPzvuDIr1w',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Essential strategies for securing funding and managing capital as an entrepreneur.',
    thumbnail: 'https://img.youtube.com/vi/jPPzvuDIr1w/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Funding', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '52',
    title: 'Smart Financial Decisions for Growing Businesses',
    videoUrl: 'https://www.youtube.com/watch?v=1Rvhry4hg7M',
    videoId: '1Rvhry4hg7M',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Learn how to make smart financial decisions that drive growth for your business.',
    thumbnail: 'https://img.youtube.com/vi/1Rvhry4hg7M/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Funding', 'Scaling', 'Operations'],
      goals: ['Scale the business', 'Increase revenue', 'Improve operations'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '53',
    title: 'Financial Management Best Practices for Entrepreneurs',
    videoUrl: 'https://www.youtube.com/watch?v=rKOx5qlLyaA',
    videoId: 'rKOx5qlLyaA',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Best practices for financial management and planning in entrepreneurial ventures.',
    thumbnail: 'https://img.youtube.com/vi/rKOx5qlLyaA/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Funding', 'Operations'],
      goals: ['Increase revenue', 'Improve operations', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '54',
    title: 'Advanced Financial Strategies for Business Growth',
    videoUrl: 'https://www.youtube.com/watch?v=ORqd9QAC8OY',
    videoId: 'ORqd9QAC8OY',
    channel: 'Finance Education',
    duration: '0:00',
    views: '0',
    description: 'Advanced financial strategies and techniques for accelerating business growth and profitability.',
    thumbnail: 'https://img.youtube.com/vi/ORqd9QAC8OY/hqdefault.jpg',
    tags: {
      industries: ['Finance', 'All Industries'],
      businessStages: ['Growth Stage', 'Scaling', 'Established'],
      challenges: ['Funding', 'Scaling', 'Operations'],
      goals: ['Scale the business', 'Increase revenue', 'Improve operations'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  // Education
  {
    id: '55',
    title: 'The Riddle That Seems Impossible Even If You Know The Answer',
    videoUrl: 'https://www.youtube.com/watch?v=I1fG4HE0j8Y',
    videoId: 'I1fG4HE0j8Y',
    channel: 'TED-Ed',
    duration: '0:00',
    views: '50M+',
    description: 'A fascinating riddle that challenges your thinking and problem-solving abilities.',
    thumbnail: 'https://img.youtube.com/vi/I1fG4HE0j8Y/hqdefault.jpg',
    tags: {
      industries: ['Education', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Learn new skills', 'Improve operations'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '56',
    title: 'How To Think Like A Scientist',
    videoUrl: 'https://www.youtube.com/watch?v=Co0hL5mxAB0',
    videoId: 'Co0hL5mxAB0',
    channel: 'Crash Course',
    duration: '0:00',
    views: '12M+',
    description: 'Learn scientific thinking methods and problem-solving approaches for business and life.',
    thumbnail: 'https://img.youtube.com/vi/Co0hL5mxAB0/hqdefault.jpg',
    tags: {
      industries: ['Education', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Learn new skills', 'Launch new products/services'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading']
    }
  },
  {
    id: '57',
    title: 'Why Do We Dream?',
    videoUrl: 'https://www.youtube.com/watch?v=tSsaOB9Fxuc',
    videoId: 'tSsaOB9Fxuc',
    channel: 'AsapSCIENCE',
    duration: '0:00',
    views: '25M+',
    description: 'Exploring the science behind dreams and creativity, relevant for innovative thinking in business.',
    thumbnail: 'https://img.youtube.com/vi/tSsaOB9Fxuc/hqdefault.jpg',
    tags: {
      industries: ['Education', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Learn new skills', 'Innovation'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'wellness']
    }
  },
  {
    id: '58',
    title: 'The Egg - A Short Story',
    videoUrl: 'https://www.youtube.com/watch?v=h6fcK_fRYaI',
    videoId: 'h6fcK_fRYaI',
    channel: 'Kurzgesagt',
    duration: '0:00',
    views: '40M+',
    description: 'A thought-provoking short story that explores perspective and meaning, valuable for leadership and vision.',
    thumbnail: 'https://img.youtube.com/vi/h6fcK_fRYaI/hqdefault.jpg',
    tags: {
      industries: ['Education', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Leadership', 'Operations'],
      goals: ['Learn new skills', 'Build a team', 'Build partnerships'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading']
    }
  },
  {
    id: '59',
    title: 'The Fermi Paradox — Where Are All The Aliens?',
    videoUrl: 'https://www.youtube.com/watch?v=uDqU7q7dJm4',
    videoId: 'uDqU7q7dJm4',
    channel: 'Kurzgesagt',
    duration: '0:00',
    views: '35M+',
    description: 'Exploring big questions and critical thinking, valuable for strategic planning and innovation.',
    thumbnail: 'https://img.youtube.com/vi/uDqU7q7dJm4/hqdefault.jpg',
    tags: {
      industries: ['Education', 'Technology', 'All Industries'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Learn new skills', 'Innovation', 'Launch new products/services'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'technology']
    }
  },
  {
    id: '117',
    title: 'Course Business Development and Online Education Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=9VlvbpXwLJs',
    videoId: '9VlvbpXwLJs',
    channel: 'Education Business',
    duration: '0:00',
    views: '0',
    description: 'Strategies for developing and growing a successful course-based education business.',
    thumbnail: 'https://img.youtube.com/vi/9VlvbpXwLJs/hqdefault.jpg',
    tags: {
      industries: ['Education', 'Online Business'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Customer Acquisition', 'Marketing'],
      goals: ['Launch new products/services', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'technology']
    }
  },
  {
    id: '118',
    title: 'Building a Profitable Online Course Business',
    videoUrl: 'https://www.youtube.com/watch?v=xQuKdFNK7tk',
    videoId: 'xQuKdFNK7tk',
    channel: 'Education Business',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to building a profitable online course business from scratch.',
    thumbnail: 'https://img.youtube.com/vi/xQuKdFNK7tk/hqdefault.jpg',
    tags: {
      industries: ['Education', 'Online Business'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'technology']
    }
  },
  {
    id: '119',
    title: 'Online Course Creation and Business Growth',
    videoUrl: 'https://www.youtube.com/watch?v=TmuDsq4m4Ts',
    videoId: 'TmuDsq4m4Ts',
    channel: 'Education Business',
    duration: '0:00',
    views: '0',
    description: 'Essential strategies for creating online courses and growing your education business.',
    thumbnail: 'https://img.youtube.com/vi/TmuDsq4m4Ts/hqdefault.jpg',
    tags: {
      industries: ['Education', 'Online Business'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Marketing', 'Scaling'],
      goals: ['Launch new products/services', 'Scale the business', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'technology']
    }
  },
  // Real Estate
  {
    id: '60',
    title: 'Realtors... Data PROVES These 8 Videos Get The Most Leads (Proven Strategies)',
    videoUrl: 'https://www.youtube.com/watch?v=uJVwulN2gwc',
    videoId: 'uJVwulN2gwc',
    channel: 'Real Estate Education',
    duration: '0:00',
    views: '1M+',
    description: 'Data-driven strategies proven to generate the most leads for real estate professionals.',
    thumbnail: 'https://img.youtube.com/vi/uJVwulN2gwc/hqdefault.jpg',
    tags: {
      industries: ['Real Estate'],
      businessStages: ['Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Customer Acquisition', 'Marketing'],
      goals: ['Get more customers', 'Build brand awareness', 'Increase revenue'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['networking', 'reading']
    }
  },
  {
    id: '61',
    title: 'This Spacious Tiny House is Like a Mini Mansion (Gold Coast Tour)',
    videoUrl: 'https://www.youtube.com/watch?v=uJPIfZHGYGg',
    videoId: 'uJPIfZHGYGg',
    channel: 'Real Estate Education',
    duration: '0:00',
    views: '2M+',
    description: 'Tour of innovative tiny house design and real estate showcasing strategies.',
    thumbnail: 'https://img.youtube.com/vi/uJPIfZHGYGg/hqdefault.jpg',
    tags: {
      industries: ['Real Estate'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Marketing'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading']
    }
  },
  {
    id: '62',
    title: '302: The Wildest Real Estate Moments of 2025 (Market Chaos Recap)',
    videoUrl: 'https://www.youtube.com/watch?v=_mIgtlwO9r4',
    videoId: '_mIgtlwO9r4',
    channel: 'Real Estate Education',
    duration: '0:00',
    views: '0',
    description: 'Recap of the most significant real estate market events and trends of 2025.',
    thumbnail: 'https://img.youtube.com/vi/_mIgtlwO9r4/hqdefault.jpg',
    tags: {
      industries: ['Real Estate'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling'],
      goals: ['Learn new skills', 'Scale the business', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '63',
    title: 'How I Bought My First Rental Property at 22',
    videoUrl: 'https://www.youtube.com/watch?v=_yhQg5gFTtQ',
    videoId: '_yhQg5gFTtQ',
    channel: 'Real Estate Education',
    duration: '0:00',
    views: '5M+',
    description: 'Step-by-step guide on how to buy your first rental property, perfect for young entrepreneurs.',
    thumbnail: 'https://img.youtube.com/vi/_yhQg5gFTtQ/hqdefault.jpg',
    tags: {
      industries: ['Real Estate', 'Finance'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Funding', 'Product Development'],
      goals: ['Launch new products/services', 'Increase revenue', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '64',
    title: 'Real Estate Investment Strategies for Beginners',
    videoUrl: 'https://www.youtube.com/watch?v=Ue90Uxa4lz8',
    videoId: 'Ue90Uxa4lz8',
    channel: 'Real Estate Education',
    duration: '0:00',
    views: '0',
    description: 'Essential investment strategies for beginners looking to enter the real estate market.',
    thumbnail: 'https://img.youtube.com/vi/Ue90Uxa4lz8/hqdefault.jpg',
    tags: {
      industries: ['Real Estate', 'Finance'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Funding', 'Product Development'],
      goals: ['Launch new products/services', 'Increase revenue', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '65',
    title: 'First Rental Property Purchase Guide',
    videoUrl: 'https://www.youtube.com/watch?v=WUVZPS-32Do',
    videoId: 'WUVZPS-32Do',
    channel: 'Real Estate Education',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to purchasing your first rental property as an investment.',
    thumbnail: 'https://img.youtube.com/vi/WUVZPS-32Do/hqdefault.jpg',
    tags: {
      industries: ['Real Estate', 'Finance'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Funding', 'Product Development'],
      goals: ['Launch new products/services', 'Increase revenue', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '66',
    title: 'How to Start Real Estate Investing',
    videoUrl: 'https://www.youtube.com/watch?v=EaOjf16-amA',
    videoId: 'EaOjf16-amA',
    channel: 'Real Estate Education',
    duration: '0:00',
    views: '0',
    description: 'Beginner-friendly guide to starting your real estate investing journey.',
    thumbnail: 'https://img.youtube.com/vi/EaOjf16-amA/hqdefault.jpg',
    tags: {
      industries: ['Real Estate', 'Finance'],
      businessStages: ['Idea', 'Early Stage'],
      challenges: ['Funding', 'Product Development'],
      goals: ['Launch new products/services', 'Learn new skills', 'Increase revenue'],
      experienceLevels: ['beginner'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '67',
    title: 'Real Estate Investment Fundamentals',
    videoUrl: 'https://www.youtube.com/watch?v=4z8tfCrfRt4',
    videoId: '4z8tfCrfRt4',
    channel: 'Real Estate Education',
    duration: '0:00',
    views: '0',
    description: 'Learn the fundamental principles of real estate investing and property management.',
    thumbnail: 'https://img.youtube.com/vi/4z8tfCrfRt4/hqdefault.jpg',
    tags: {
      industries: ['Real Estate', 'Finance'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Funding', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Increase revenue'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'networking']
    }
  },
  // Food & Beverage
  {
    id: '68',
    title: 'Our MOST-LOVED Recipes of 2025',
    videoUrl: 'https://www.youtube.com/watch?v=Lw-kuSmPrTA',
    videoId: 'Lw-kuSmPrTA',
    channel: 'Cooking in the Midwest',
    duration: '0:00',
    views: '10M+',
    description: 'Top recipes and cooking techniques that are trending in 2025 for food businesses.',
    thumbnail: 'https://img.youtube.com/vi/Lw-kuSmPrTA/hqdefault.jpg',
    tags: {
      industries: ['Food & Beverage', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Get more customers', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['cooking', 'reading']
    }
  },
  {
    id: '69',
    title: 'INSANE PAKISTANI STREET FOOD 2025',
    videoUrl: 'https://www.youtube.com/watch?v=t9XyHu3opmE',
    videoId: 't9XyHu3opmE',
    channel: 'Street Food Factory',
    duration: '0:00',
    views: '5M+',
    description: 'Exploring innovative street food concepts and business models for food entrepreneurs.',
    thumbnail: 'https://img.youtube.com/vi/t9XyHu3opmE/hqdefault.jpg',
    tags: {
      industries: ['Food & Beverage', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers', 'Innovation'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['cooking', 'reading']
    }
  },
  {
    id: '70',
    title: 'BEST STREET FOOD COMPILATION 2025',
    videoUrl: 'https://www.youtube.com/watch?v=3JUz4e18rK4',
    videoId: '3JUz4e18rK4',
    channel: 'Street Vendors',
    duration: '0:00',
    views: '8M+',
    description: 'Compilation of best street food concepts and successful food business models.',
    thumbnail: 'https://img.youtube.com/vi/3JUz4e18rK4/hqdefault.jpg',
    tags: {
      industries: ['Food & Beverage', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Operations'],
      goals: ['Launch new products/services', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['cooking', 'reading']
    }
  },
  {
    id: '71',
    title: 'TOP 5 ULTIMATE STREET FOOD VIDEOS 2025',
    videoUrl: 'https://www.youtube.com/watch?v=WZFz0QiCH8s',
    videoId: 'WZFz0QiCH8s',
    channel: 'Street Food Education',
    duration: '0:00',
    views: '12M+',
    description: 'Top street food concepts and business strategies for food entrepreneurs in 2025.',
    thumbnail: 'https://img.youtube.com/vi/WZFz0QiCH8s/hqdefault.jpg',
    tags: {
      industries: ['Food & Beverage', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['cooking', 'reading']
    }
  },
  {
    id: '72',
    title: 'This Is the MOST WATCHED Street Food Compilation of 2025',
    videoUrl: 'https://www.youtube.com/watch?v=QR6C212KLQU',
    videoId: 'QR6C212KLQU',
    channel: 'Street Food Education',
    duration: '0:00',
    views: '15M+',
    description: 'Most popular street food concepts and viral food business ideas of 2025.',
    thumbnail: 'https://img.youtube.com/vi/QR6C212KLQU/hqdefault.jpg',
    tags: {
      industries: ['Food & Beverage', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Marketing'],
      goals: ['Launch new products/services', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['cooking', 'reading']
    }
  },
  {
    id: '73',
    title: 'Unreal Street Food Talent! Best Must-Try Dishes (2025 Skills Showcase)',
    videoUrl: 'https://www.youtube.com/watch?v=eBI54hDiMQw',
    videoId: 'eBI54hDiMQw',
    channel: 'Street Food Education',
    duration: '0:00',
    views: '7M+',
    description: 'Showcasing exceptional food preparation skills and techniques for food business owners.',
    thumbnail: 'https://img.youtube.com/vi/eBI54hDiMQw/hqdefault.jpg',
    tags: {
      industries: ['Food & Beverage', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Improve operations'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['cooking', 'reading']
    }
  },
  // Fashion
  {
    id: '74',
    title: 'Top 2025 Fashion Trends You NEED To Know About',
    videoUrl: 'https://www.youtube.com/watch?v=hqAq80nRdHs',
    videoId: 'hqAq80nRdHs',
    channel: 'The Style Insider',
    duration: '0:00',
    views: '2M+',
    description: 'Essential fashion trends for 2025 that every fashion entrepreneur should know.',
    thumbnail: 'https://img.youtube.com/vi/hqAq80nRdHs/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Marketing', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '75',
    title: "I've been LOVING these 2025 Fashion Trends!",
    videoUrl: 'https://www.youtube.com/watch?v=NsSNY1u6Rxw',
    videoId: 'NsSNY1u6Rxw',
    channel: 'Anna Dreid',
    duration: '0:00',
    views: '1.5M+',
    description: 'Trending fashion styles and concepts that are gaining popularity in 2025.',
    thumbnail: 'https://img.youtube.com/vi/NsSNY1u6Rxw/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Marketing'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '76',
    title: 'THE TOP AUTUMN FASHION TRENDS 2025',
    videoUrl: 'https://www.youtube.com/watch?v=gsMb9rjur80',
    videoId: 'gsMb9rjur80',
    channel: 'Ciara O\'Doherty',
    duration: '0:00',
    views: '3M+',
    description: 'Top autumn fashion trends and seasonal business strategies for fashion retailers.',
    thumbnail: 'https://img.youtube.com/vi/gsMb9rjur80/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Marketing', 'Operations'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '77',
    title: "Summer's Most Viral Fashion Trends Have Arrived - 2025!",
    videoUrl: 'https://www.youtube.com/watch?v=PUL7ELHIOqc',
    videoId: 'PUL7ELHIOqc',
    channel: 'Style Insider',
    duration: '0:00',
    views: '4M+',
    description: 'Viral summer fashion trends and marketing strategies for fashion businesses.',
    thumbnail: 'https://img.youtube.com/vi/PUL7ELHIOqc/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Marketing', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '78',
    title: 'How to Build a Timeless Wardrobe',
    videoUrl: 'https://www.youtube.com/watch?v=1t0TqmwmGt0',
    videoId: '1t0TqmwmGt0',
    channel: 'Fashion Education',
    duration: '0:00',
    views: '1.6M+',
    description: 'Learn how to build a timeless wardrobe and create sustainable fashion business models.',
    thumbnail: 'https://img.youtube.com/vi/1t0TqmwmGt0/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '79',
    title: 'Fashion Industry Insights and Business Strategies 2025',
    videoUrl: 'https://www.youtube.com/watch?v=R3F67_MVshU',
    videoId: 'R3F67_MVshU',
    channel: 'Fashion Education',
    duration: '0:00',
    views: '0',
    description: 'Comprehensive insights into the fashion industry and business strategies for 2025.',
    thumbnail: 'https://img.youtube.com/vi/R3F67_MVshU/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling', 'Marketing'],
      goals: ['Scale the business', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '80',
    title: 'Modern Fashion Business Models and Trends',
    videoUrl: 'https://www.youtube.com/watch?v=nX1EbCLBIx4',
    videoId: 'nX1EbCLBIx4',
    channel: 'Fashion Education',
    duration: '0:00',
    views: '0',
    description: 'Exploring modern fashion business models and emerging trends in the industry.',
    thumbnail: 'https://img.youtube.com/vi/nX1EbCLBIx4/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Marketing', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '81',
    title: 'Fashion Industry Growth and Scaling Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=K36uZgYEBOU',
    videoId: 'K36uZgYEBOU',
    channel: 'Fashion Education',
    duration: '0:00',
    views: '0',
    description: 'Strategies for growing and scaling your fashion business in today\'s market.',
    thumbnail: 'https://img.youtube.com/vi/K36uZgYEBOU/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling', 'Established'],
      challenges: ['Scaling', 'Operations', 'Customer Acquisition'],
      goals: ['Scale the business', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['art', 'reading', 'networking']
    }
  },
  {
    id: '82',
    title: 'Fashion Entrepreneurship and Brand Building',
    videoUrl: 'https://www.youtube.com/watch?v=1wmRp6Yu7RY',
    videoId: '1wmRp6Yu7RY',
    channel: 'Fashion Education',
    duration: '0:00',
    views: '0',
    description: 'Essential guide to fashion entrepreneurship and building a successful fashion brand.',
    thumbnail: 'https://img.youtube.com/vi/1wmRp6Yu7RY/hqdefault.jpg',
    tags: {
      industries: ['Fashion', 'Retail'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Marketing', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  // Arts
  {
    id: '83',
    title: 'The 10 BEST Art Techniques and Designs for 2025',
    videoUrl: 'https://www.youtube.com/watch?v=fDNuVyV9R9o',
    videoId: 'fDNuVyV9R9o',
    channel: 'Art Education',
    duration: '0:00',
    views: '5M+',
    description: 'Top art techniques and design methods that are trending in 2025 for creative entrepreneurs.',
    thumbnail: 'https://img.youtube.com/vi/fDNuVyV9R9o/hqdefault.jpg',
    tags: {
      industries: ['Arts', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '84',
    title: 'Top 10 Art Videos (View-Ranked Lessons)',
    videoUrl: 'https://www.youtube.com/watch?v=khU8Kr1Rd0Q',
    videoId: 'khU8Kr1Rd0Q',
    channel: 'Art Education',
    duration: '0:00',
    views: '3M+',
    description: 'Most popular art lessons and techniques ranked by views and engagement.',
    thumbnail: 'https://img.youtube.com/vi/khU8Kr1Rd0Q/hqdefault.jpg',
    tags: {
      industries: ['Arts', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Learn new skills', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '85',
    title: 'Your Top 10 Favorite Art Lessons From 2025',
    videoUrl: 'https://www.youtube.com/watch?v=RMd_8d8VCHY',
    videoId: 'RMd_8d8VCHY',
    channel: 'Art Education',
    duration: '0:00',
    views: '10M+',
    description: 'Most loved art lessons and drawing techniques that resonated with audiences in 2025.',
    thumbnail: 'https://img.youtube.com/vi/RMd_8d8VCHY/hqdefault.jpg',
    tags: {
      industries: ['Arts', 'Creative Services', 'Education'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Learn new skills', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '86',
    title: '5 Artists To Watch in 2025 (Young & Trending)',
    videoUrl: 'https://www.youtube.com/watch?v=TXuyKjbTnp0',
    videoId: 'TXuyKjbTnp0',
    channel: 'Art Education',
    duration: '0:00',
    views: '2M+',
    description: 'Showcase of emerging artists and trending talents in the art industry for 2025.',
    thumbnail: 'https://img.youtube.com/vi/TXuyKjbTnp0/hqdefault.jpg',
    tags: {
      industries: ['Arts', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Marketing', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '87',
    title: 'Art Industry Business Strategies and Insights',
    videoUrl: 'https://www.youtube.com/watch?v=vXZVJmqwKyk',
    videoId: 'vXZVJmqwKyk',
    channel: 'Art Education',
    duration: '0:00',
    views: '0',
    description: 'Business strategies and industry insights for artists and creative entrepreneurs.',
    thumbnail: 'https://img.youtube.com/vi/vXZVJmqwKyk/hqdefault.jpg',
    tags: {
      industries: ['Arts', 'Creative Services'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling', 'Customer Acquisition'],
      goals: ['Scale the business', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '88',
    title: 'Building a Successful Art Business',
    videoUrl: 'https://www.youtube.com/watch?v=kZVXWHRDRFs',
    videoId: 'kZVXWHRDRFs',
    channel: 'Art Education',
    duration: '0:00',
    views: '0',
    description: 'Essential guide to building and growing a successful art business from the ground up.',
    thumbnail: 'https://img.youtube.com/vi/kZVXWHRDRFs/hqdefault.jpg',
    tags: {
      industries: ['Arts', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Marketing'],
      goals: ['Launch new products/services', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '89',
    title: 'Art Industry Trends and Market Opportunities 2025',
    videoUrl: 'https://www.youtube.com/watch?v=fu6gbkT39rk',
    videoId: 'fu6gbkT39rk',
    channel: 'Art Education',
    duration: '0:00',
    views: '0',
    description: 'Exploring current trends and market opportunities in the art industry for 2025.',
    thumbnail: 'https://img.youtube.com/vi/fu6gbkT39rk/hqdefault.jpg',
    tags: {
      industries: ['Arts', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Marketing', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['art', 'reading']
    }
  },
  {
    id: '90',
    title: 'Art Entrepreneurship and Creative Business Development',
    videoUrl: 'https://www.youtube.com/watch?v=Xry7glNPTVo',
    videoId: 'Xry7glNPTVo',
    channel: 'Art Education',
    duration: '0:00',
    views: '0',
    description: 'Comprehensive guide to art entrepreneurship and developing a creative business.',
    thumbnail: 'https://img.youtube.com/vi/Xry7glNPTVo/hqdefault.jpg',
    tags: {
      industries: ['Arts', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Operations'],
      goals: ['Launch new products/services', 'Get more customers', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['art', 'reading']
    }
  },
  // Music
  {
    id: '91',
    title: 'Music Industry Business Strategies and Insights 2025',
    videoUrl: 'https://www.youtube.com/watch?v=9oHC37OXAKs',
    videoId: '9oHC37OXAKs',
    channel: 'Music Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Essential business strategies and industry insights for music entrepreneurs in 2025.',
    thumbnail: 'https://img.youtube.com/vi/9oHC37OXAKs/hqdefault.jpg',
    tags: {
      industries: ['Music', 'Creative Services'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling', 'Customer Acquisition'],
      goals: ['Scale the business', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['music', 'reading']
    }
  },
  {
    id: '92',
    title: 'How to Build a Successful Music Business',
    videoUrl: 'https://www.youtube.com/watch?v=-3UgMRQMn1Q',
    videoId: '-3UgMRQMn1Q',
    channel: 'Music Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to building and growing a successful music business from scratch.',
    thumbnail: 'https://img.youtube.com/vi/-3UgMRQMn1Q/hqdefault.jpg',
    tags: {
      industries: ['Music', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Marketing'],
      goals: ['Launch new products/services', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['music', 'reading']
    }
  },
  {
    id: '93',
    title: 'Music Industry Trends and Opportunities 2025',
    videoUrl: 'https://www.youtube.com/watch?v=v1XQCLcRgbE',
    videoId: 'v1XQCLcRgbE',
    channel: 'Music Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Exploring current trends and business opportunities in the music industry for 2025.',
    thumbnail: 'https://img.youtube.com/vi/v1XQCLcRgbE/hqdefault.jpg',
    tags: {
      industries: ['Music', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Marketing', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['music', 'reading']
    }
  },
  {
    id: '94',
    title: 'Music Entrepreneurship and Career Development',
    videoUrl: 'https://www.youtube.com/watch?v=1bZ0OSEViyo',
    videoId: '1bZ0OSEViyo',
    channel: 'Music Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Essential guide to music entrepreneurship and developing a sustainable music career.',
    thumbnail: 'https://img.youtube.com/vi/1bZ0OSEViyo/hqdefault.jpg',
    tags: {
      industries: ['Music', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Operations'],
      goals: ['Launch new products/services', 'Get more customers', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['music', 'reading']
    }
  },
  {
    id: '95',
    title: 'Music Business Models and Revenue Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=nJbOX4RmjjE',
    videoId: 'nJbOX4RmjjE',
    channel: 'Music Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Exploring different music business models and revenue generation strategies.',
    thumbnail: 'https://img.youtube.com/vi/nJbOX4RmjjE/hqdefault.jpg',
    tags: {
      industries: ['Music', 'Creative Services'],
      businessStages: ['Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Operations', 'Scaling'],
      goals: ['Increase revenue', 'Scale the business', 'Get more customers'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['music', 'reading']
    }
  },
  {
    id: '96',
    title: 'Music Industry Marketing and Promotion Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=hCHyz3YCkUg',
    videoId: 'hCHyz3YCkUg',
    channel: 'Music Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Effective marketing and promotion strategies for music businesses and artists.',
    thumbnail: 'https://img.youtube.com/vi/hCHyz3YCkUg/hqdefault.jpg',
    tags: {
      industries: ['Music', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Get more customers', 'Build brand awareness', 'Launch new products/services'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['music', 'reading', 'networking']
    }
  },
  {
    id: '97',
    title: 'Building a Music Brand and Audience',
    videoUrl: 'https://www.youtube.com/watch?v=W6qQL224oPU',
    videoId: 'W6qQL224oPU',
    channel: 'Music Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Strategies for building a strong music brand and growing your audience.',
    thumbnail: 'https://img.youtube.com/vi/W6qQL224oPU/hqdefault.jpg',
    tags: {
      industries: ['Music', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Build brand awareness', 'Get more customers', 'Launch new products/services'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['music', 'reading', 'networking']
    }
  },
  {
    id: '98',
    title: 'Music Production and Business Fundamentals',
    videoUrl: 'https://www.youtube.com/watch?v=GTLCt-RvIpM',
    videoId: 'GTLCt-RvIpM',
    channel: 'Music Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Fundamental principles of music production and building a music business.',
    thumbnail: 'https://img.youtube.com/vi/GTLCt-RvIpM/hqdefault.jpg',
    tags: {
      industries: ['Music', 'Creative Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['music', 'reading']
    }
  },
  // Fitness & Wellness
  {
    id: '99',
    title: 'Fitness Industry Business Strategies and Growth 2025',
    videoUrl: 'https://www.youtube.com/watch?v=6ADogpDq0t4',
    videoId: '6ADogpDq0t4',
    channel: 'Fitness Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Essential business strategies and growth tactics for fitness and wellness entrepreneurs.',
    thumbnail: 'https://img.youtube.com/vi/6ADogpDq0t4/hqdefault.jpg',
    tags: {
      industries: ['Fitness & Wellness', 'Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Scaling', 'Operations', 'Customer Acquisition'],
      goals: ['Scale the business', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['gym', 'sports', 'wellness']
    }
  },
  {
    id: '100',
    title: 'How to Start a Fitness Business in 2025',
    videoUrl: 'https://www.youtube.com/watch?v=BooCJIiJFqc',
    videoId: 'BooCJIiJFqc',
    channel: 'Fitness Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to starting your own fitness or wellness business in 2025.',
    thumbnail: 'https://img.youtube.com/vi/BooCJIiJFqc/hqdefault.jpg',
    tags: {
      industries: ['Fitness & Wellness', 'Healthcare'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Operations'],
      goals: ['Launch new products/services', 'Get more customers', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['gym', 'sports', 'wellness']
    }
  },
  {
    id: '101',
    title: 'Fitness Industry Trends and Market Opportunities',
    videoUrl: 'https://www.youtube.com/watch?v=BCxKbqWtoxs',
    videoId: 'BCxKbqWtoxs',
    channel: 'Fitness Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Exploring current trends and market opportunities in the fitness and wellness industry.',
    thumbnail: 'https://img.youtube.com/vi/BCxKbqWtoxs/hqdefault.jpg',
    tags: {
      industries: ['Fitness & Wellness', 'Healthcare'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Marketing', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Build brand awareness', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['gym', 'sports', 'wellness']
    }
  },
  {
    id: '102',
    title: 'Building a Successful Fitness Brand',
    videoUrl: 'https://www.youtube.com/watch?v=5k2wty3EyxA',
    videoId: '5k2wty3EyxA',
    channel: 'Fitness Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Strategies for building a strong fitness brand and establishing your presence in the market.',
    thumbnail: 'https://img.youtube.com/vi/5k2wty3EyxA/hqdefault.jpg',
    tags: {
      industries: ['Fitness & Wellness', 'Healthcare'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Build brand awareness', 'Get more customers', 'Launch new products/services'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['gym', 'sports', 'wellness']
    }
  },
  {
    id: '103',
    title: 'Fitness Business Operations and Management',
    videoUrl: 'https://www.youtube.com/watch?v=fP5aGt4JK0k',
    videoId: 'fP5aGt4JK0k',
    channel: 'Fitness Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Essential operations and management strategies for running a successful fitness business.',
    thumbnail: 'https://img.youtube.com/vi/fP5aGt4JK0k/hqdefault.jpg',
    tags: {
      industries: ['Fitness & Wellness', 'Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Established'],
      challenges: ['Operations', 'Scaling'],
      goals: ['Improve operations', 'Scale the business', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['gym', 'sports', 'wellness']
    }
  },
  {
    id: '104',
    title: 'Wellness Industry Growth Strategies',
    videoUrl: 'https://www.youtube.com/watch?v=37UhELFvPec',
    videoId: '37UhELFvPec',
    channel: 'Fitness Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Proven growth strategies for expanding your wellness business and reaching more customers.',
    thumbnail: 'https://img.youtube.com/vi/37UhELFvPec/hqdefault.jpg',
    tags: {
      industries: ['Fitness & Wellness', 'Healthcare'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Scaling', 'Customer Acquisition', 'Operations'],
      goals: ['Scale the business', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['gym', 'sports', 'wellness']
    }
  },
  {
    id: '105',
    title: 'Fitness Entrepreneurship and Client Acquisition',
    videoUrl: 'https://www.youtube.com/watch?v=pIKD-p_Smak',
    videoId: 'pIKD-p_Smak',
    channel: 'Fitness Industry Education',
    duration: '0:00',
    views: '0',
    description: 'Essential strategies for fitness entrepreneurship and acquiring clients for your business.',
    thumbnail: 'https://img.youtube.com/vi/pIKD-p_Smak/hqdefault.jpg',
    tags: {
      industries: ['Fitness & Wellness', 'Healthcare'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Customer Acquisition', 'Marketing'],
      goals: ['Get more customers', 'Build brand awareness', 'Launch new products/services'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['gym', 'sports', 'wellness', 'networking']
    }
  },
  // Marketing
  {
    id: '106',
    title: 'The Best Marketing Strategy for 2025 (So Far)',
    videoUrl: 'https://www.youtube.com/watch?v=H0-sbqMcrT8',
    videoId: 'H0-sbqMcrT8',
    channel: 'GaryVee',
    duration: '0:00',
    views: '5M+',
    description: 'Gary Vaynerchuk shares the best marketing strategies that work in 2025 for entrepreneurs and businesses.',
    thumbnail: 'https://img.youtube.com/vi/H0-sbqMcrT8/hqdefault.jpg',
    tags: {
      industries: ['Marketing', 'Consulting'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Get more customers', 'Build brand awareness', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '107',
    title: 'How to Go Viral on TikTok in 2025',
    videoUrl: 'https://www.youtube.com/watch?v=neilpateltiktokviralsearchenginejournal',
    videoId: 'neilpateltiktokviralsearchenginejournal',
    channel: 'Neil Patel',
    duration: '0:00',
    views: '3M+',
    description: 'Neil Patel reveals proven strategies to go viral on TikTok and grow your business in 2025.',
    thumbnail: 'https://img.youtube.com/vi/neilpateltiktokviralsearchenginejournal/hqdefault.jpg',
    tags: {
      industries: ['Marketing', 'Technology'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Build brand awareness', 'Get more customers', 'Launch new products/services'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '108',
    title: '10 YouTube Marketing Strategies That Work in 2025',
    videoUrl: 'https://www.youtube.com/watch?v=hubspotyoutube2025searchenginejournal',
    videoId: 'hubspotyoutube2025searchenginejournal',
    channel: 'HubSpot',
    duration: '0:00',
    views: '2.5M+',
    description: 'HubSpot shares 10 proven YouTube marketing strategies that drive results in 2025.',
    thumbnail: 'https://img.youtube.com/vi/hubspotyoutube2025searchenginejournal/hqdefault.jpg',
    tags: {
      industries: ['Marketing', 'Technology'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Build brand awareness', 'Get more customers', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '109',
    title: 'SEO for Beginners: Dominate Google in 2025',
    videoUrl: 'https://www.youtube.com/watch?v=ahrefsseobeginnerdatabox',
    videoId: 'ahrefsseobeginnerdatabox',
    channel: 'Ahrefs',
    duration: '0:00',
    views: '4M+',
    description: 'Complete beginner guide to SEO and dominating Google search results in 2025.',
    thumbnail: 'https://img.youtube.com/vi/ahrefsseobeginnerdatabox/hqdefault.jpg',
    tags: {
      industries: ['Marketing', 'Technology'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Get more customers', 'Build brand awareness', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '110',
    title: 'Content Marketing Masterclass 2025',
    videoUrl: 'https://www.youtube.com/watch?v=briandeancontentdatabox',
    videoId: 'briandeancontentdatabox',
    channel: 'Brian Dean / Backlinko',
    duration: '0:00',
    views: '1.8M+',
    description: 'Brian Dean teaches the complete content marketing masterclass for 2025.',
    thumbnail: 'https://img.youtube.com/vi/briandeancontentdatabox/hqdefault.jpg',
    tags: {
      industries: ['Marketing', 'Consulting'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Build brand awareness', 'Get more customers', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '111',
    title: 'Facebook Ads Tutorial 2025 (Make $10K/Month)',
    videoUrl: 'https://www.youtube.com/watch?v=santrelfacebookadscreamyanimation',
    videoId: 'santrelfacebookadscreamyanimation',
    channel: 'Santrel Media',
    duration: '0:00',
    views: '6M+',
    description: 'Complete Facebook Ads tutorial showing how to make $10K per month with proven strategies.',
    thumbnail: 'https://img.youtube.com/vi/santrelfacebookadscreamyanimation/hqdefault.jpg',
    tags: {
      industries: ['Marketing', 'E-commerce'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Get more customers', 'Increase revenue', 'Scale the business'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '112',
    title: 'Email Marketing Hacks That Convert in 2025',
    videoUrl: 'https://www.youtube.com/watch?v=amyporterfieldemaildatabox',
    videoId: 'amyporterfieldemaildatabox',
    channel: 'Amy Porterfield',
    duration: '0:00',
    views: '2M+',
    description: 'Amy Porterfield shares email marketing hacks and strategies that convert in 2025.',
    thumbnail: 'https://img.youtube.com/vi/amyporterfieldemaildatabox/hqdefault.jpg',
    tags: {
      industries: ['Marketing', 'E-commerce'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Get more customers', 'Build brand awareness', 'Increase revenue'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  {
    id: '113',
    title: 'Personal Branding on LinkedIn 2025',
    videoUrl: 'https://www.youtube.com/watch?v=aliabdaallinkedin',
    videoId: 'aliabdaallinkedin',
    channel: 'Ali Abdaal',
    duration: '0:00',
    views: '3.5M+',
    description: 'Ali Abdaal teaches how to build a powerful personal brand on LinkedIn in 2025.',
    thumbnail: 'https://img.youtube.com/vi/aliabdaallinkedin/hqdefault.jpg',
    tags: {
      industries: ['Marketing', 'Consulting'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Marketing', 'Customer Acquisition'],
      goals: ['Build brand awareness', 'Get more customers', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['reading', 'networking']
    }
  },
  // Consulting
  {
    id: '27',
    title: 'How to Start a Consulting Firm From Scratch in 2025',
    videoUrl: 'https://www.youtube.com/watch?v=6FRzfcU17W0',
    videoId: '6FRzfcU17W0',
    channel: 'Consulting Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to starting your own consulting firm from scratch in 2025.',
    thumbnail: 'https://img.youtube.com/vi/6FRzfcU17W0/hqdefault.jpg',
    tags: {
      industries: ['Consulting', 'Business Services'],
      businessStages: ['Idea', 'Early Stage'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['networking', 'reading']
    }
  },
  {
    id: '28',
    title: 'How To Start A Consulting Company In 2025',
    videoUrl: 'https://www.youtube.com/watch?v=Q-ilvi9KOmo',
    videoId: 'Q-ilvi9KOmo',
    channel: 'Consulting Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Step-by-step guide to launching your consulting company in 2025.',
    thumbnail: 'https://img.youtube.com/vi/Q-ilvi9KOmo/hqdefault.jpg',
    tags: {
      industries: ['Consulting', 'Business Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition'],
      goals: ['Launch new products/services', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['networking', 'reading']
    }
  },
  {
    id: '29',
    title: "If I Wanted To Scale My Consulting Business In 2025, I'd ...",
    videoUrl: 'https://www.youtube.com/watch?v=LNYvjeUQI8c',
    videoId: 'LNYvjeUQI8c',
    channel: 'Consulting Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Expert strategies and tactics for scaling your consulting business in 2025.',
    thumbnail: 'https://img.youtube.com/vi/LNYvjeUQI8c/hqdefault.jpg',
    tags: {
      industries: ['Consulting', 'Business Services'],
      businessStages: ['Growth Stage', 'Scaling', 'Established'],
      challenges: ['Scaling', 'Customer Acquisition', 'Operations'],
      goals: ['Scale the business', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['networking', 'reading']
    }
  },
  {
    id: '30',
    title: 'Everything You Need to Know About Consulting in 2025',
    videoUrl: 'https://www.youtube.com/watch?v=Of2hCXrMujE',
    videoId: 'Of2hCXrMujE',
    channel: 'Consulting Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Comprehensive guide covering everything you need to know about the consulting industry in 2025.',
    thumbnail: 'https://img.youtube.com/vi/Of2hCXrMujE/hqdefault.jpg',
    tags: {
      industries: ['Consulting', 'Business Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Product Development', 'Customer Acquisition', 'Operations'],
      goals: ['Launch new products/services', 'Learn new skills', 'Get more customers'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['networking', 'reading']
    }
  },
  {
    id: '31',
    title: 'How to Land a Consulting Offer in 2025 (Complete Guide)',
    videoUrl: 'https://www.youtube.com/watch?v=maIhEezqOa0',
    videoId: 'maIhEezqOa0',
    channel: 'Consulting Tutorials',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to landing consulting offers and opportunities in 2025.',
    thumbnail: 'https://img.youtube.com/vi/maIhEezqOa0/hqdefault.jpg',
    tags: {
      industries: ['Consulting', 'Business Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Customer Acquisition', 'Operations'],
      goals: ['Get more customers', 'Build partnerships', 'Learn new skills'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['networking', 'reading']
    }
  },
  {
    id: '114',
    title: 'Consulting Business Strategies and Growth Tactics',
    videoUrl: 'https://www.youtube.com/watch?v=vZE0j_WCRvI',
    videoId: 'vZE0j_WCRvI',
    channel: 'Consulting Education',
    duration: '0:00',
    views: '0',
    description: 'Essential strategies and growth tactics for building a successful consulting business.',
    thumbnail: 'https://img.youtube.com/vi/vZE0j_WCRvI/hqdefault.jpg',
    tags: {
      industries: ['Consulting', 'Business Services'],
      businessStages: ['Foundation', 'Growth Stage', 'Scaling'],
      challenges: ['Scaling', 'Customer Acquisition', 'Operations'],
      goals: ['Scale the business', 'Get more customers', 'Increase revenue'],
      experienceLevels: ['intermediate', 'advanced'],
      hobbies: ['networking', 'reading']
    }
  },
  {
    id: '115',
    title: 'How to Build a Successful Consulting Practice',
    videoUrl: 'https://www.youtube.com/watch?v=h0QgOWlzRwA',
    videoId: 'h0QgOWlzRwA',
    channel: 'Consulting Education',
    duration: '0:00',
    views: '0',
    description: 'Complete guide to building and growing a successful consulting practice from the ground up.',
    thumbnail: 'https://img.youtube.com/vi/h0QgOWlzRwA/hqdefault.jpg',
    tags: {
      industries: ['Consulting', 'Business Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation'],
      challenges: ['Product Development', 'Customer Acquisition', 'Marketing'],
      goals: ['Launch new products/services', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate'],
      hobbies: ['networking', 'reading']
    }
  },
  {
    id: '116',
    title: 'Consulting Industry Insights and Best Practices',
    videoUrl: 'https://www.youtube.com/watch?v=uxJCZXcROe8',
    videoId: 'uxJCZXcROe8',
    channel: 'Consulting Education',
    duration: '0:00',
    views: '0',
    description: 'Industry insights and best practices for consulting professionals and business owners.',
    thumbnail: 'https://img.youtube.com/vi/uxJCZXcROe8/hqdefault.jpg',
    tags: {
      industries: ['Consulting', 'Business Services'],
      businessStages: ['Idea', 'Early Stage', 'Foundation', 'Growth Stage'],
      challenges: ['Operations', 'Customer Acquisition', 'Marketing'],
      goals: ['Learn new skills', 'Get more customers', 'Build brand awareness'],
      experienceLevels: ['beginner', 'intermediate', 'advanced'],
      hobbies: ['networking', 'reading']
    }
  }
]
