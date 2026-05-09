import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRewardConfig } from '@/lib/rewards/reward-config';

export async function POST(req: NextRequest) {
  try {
    const { rewardId } = await req.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: 'Reward ID is required' },
        { status: 400 }
      );
    }

    const rewardConfig = getRewardConfig(rewardId);
    if (!rewardConfig) {
      return NextResponse.json(
        { error: 'Invalid reward ID' },
        { status: 404 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      },
    });

    // Generate email templates based on reward type
    let prompt = '';
    
    switch (rewardId) {
      case 1: // Email Template Pack
        prompt = `Create a comprehensive Email Template Pack for entrepreneurs and business owners. Include:

1. **Welcome Email Template** - For new customers/subscribers
   - Professional greeting
   - Clear value proposition
   - Next steps
   - Professional closing

2. **Follow-up Email Template** - For prospects who haven't responded
   - Friendly reminder
   - Value reinforcement
   - Clear call-to-action
   - Professional tone

3. **Sales Email Template** - For pitching products/services
   - Attention-grabbing subject line suggestions
   - Problem-solution framework
   - Social proof elements
   - Clear pricing/offer
   - Strong call-to-action

4. **Thank You Email Template** - For after purchases/meetings
   - Gratitude expression
   - Next steps or resources
   - Request for feedback
   - Additional value offer

5. **Newsletter Template** - For regular updates
   - Engaging header
   - Content sections
   - Links and CTAs
   - Unsubscribe footer

6. **Abandoned Cart Email Template** - For e-commerce
   - Reminder of items
   - Urgency elements
   - Special offer/discount
   - Easy checkout link

7. **Customer Onboarding Email Sequence** (3 emails)
   - Welcome and setup
   - Getting started guide
   - Tips and best practices

8. **Re-engagement Email Template** - For inactive customers
   - Friendly check-in
   - Special offer
   - Value reminder
   - Easy opt-out option

Format each template with:
- Clear subject line suggestions
- Professional structure
- Placeholder text in [brackets] for personalization
- Tips for customization
- Best practices for each email type

Make it practical, professional, and immediately usable.`;
        break;
      
      case 2: // Social Media Templates
        prompt = `Create a comprehensive Social Media Template Pack for entrepreneurs. Include templates for:

1. **LinkedIn Post Templates** (5 variations)
   - Professional updates
   - Industry insights
   - Company announcements
   - Thought leadership
   - Engagement posts

2. **Instagram Caption Templates** (5 variations)
   - Product/service showcases
   - Behind-the-scenes
   - Customer testimonials
   - Educational content
   - Call-to-action posts

3. **Twitter/X Post Templates** (5 variations)
   - Quick tips
   - Industry news
   - Engagement questions
   - Promotional content
   - Value-driven posts

4. **Facebook Post Templates** (5 variations)
   - Community engagement
   - Event announcements
   - Storytelling posts
   - Promotional content
   - Educational posts

5. **Hashtag Strategy Guide**
   - Industry-specific hashtags
   - Trending hashtag tips
   - Hashtag research methods

Include best practices, posting schedules, and engagement tips for each platform.`;
        break;
      
      case 15: // LinkedIn Post Templates
        prompt = `Create a comprehensive LinkedIn Post Template Pack. Include:

1. **10 Professional LinkedIn Post Templates** covering:
   - Industry insights and analysis
   - Personal professional stories
   - Company updates and milestones
   - Thought leadership pieces
   - Problem-solving content
   - Career advice
   - Industry trends
   - Networking invitations
   - Achievement celebrations
   - Educational content

2. **Post Structure Guidelines**:
   - Hook/opening line
   - Value proposition
   - Personal story or example
   - Key takeaways
   - Call-to-action
   - Hashtag suggestions

3. **Engagement Strategies**:
   - Best times to post
   - Comment engagement tactics
   - Hashtag research tips
   - Content calendar ideas

4. **LinkedIn Best Practices**:
   - Character limits and formatting
   - Image and video tips
   - LinkedIn algorithm insights
   - Networking strategies

Make each template ready to use with placeholders for personalization.`;
        break;
      
      default:
        prompt = `Create a comprehensive template pack for: ${rewardConfig.title}. Include practical, professional templates that entrepreneurs can immediately use. Provide clear structure, best practices, and customization tips.`;
    }

    const result = await model.generateContent(prompt);
    const templateContent = result.response.text();

    return NextResponse.json({
      success: true,
      content: templateContent,
      title: rewardConfig.title,
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template', success: false },
      { status: 500 }
    );
  }
}
