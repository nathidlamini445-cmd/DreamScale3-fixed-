# DreamScale Workspace

A comprehensive AI-powered creative platform built with Next.js 14, featuring multiple tools for creative professionals.

## 🚀 Features

### Core Features
- **Bizora AI**: AI-powered chat assistant for creative workflows
- **HypeOS**: Gamified productivity system with streaks, goals, and rewards
- **DreamPulse**: Competitor intelligence dashboard
- **Calendar Integration**: Google Calendar integration for event management
- **Discover**: Curated content, videos, and inspiration
- **Session Persistence**: User data persists across sessions using localStorage

### AI-Powered Business Tools
- **SystemBuilder AI**: Build custom operational systems with AI-powered frameworks
- **LeaderForge AI**: Leadership coaching with style assessment, decision-making, and communication tools
- **TeamSync AI**: AI-powered team optimization with DNA analysis, smart task assignment, and health monitoring
- **RevenueOS**: AI-powered revenue growth engine with dashboards, optimization, pricing strategy, and scenario planning

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **AI**: Google Gemini API
- **State Management**: React Context API
- **Storage**: localStorage (client-side persistence)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v10.9.0 or higher)
- Google Gemini API key (for AI features)

## 🏃 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/DreamScale.git
cd DreamScale
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# DreamScale Environment Variables
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-pro
GEMINI_MAX_TOKENS=8192
GEMINI_TEMPERATURE=0.8
```

See `API_SETUP_GUIDE.md` for detailed API setup instructions.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── bizora/            # Bizora AI page
│   ├── hypeos/            # HypeOS pages
│   ├── dreampulse/        # DreamPulse pages
│   └── ...
├── components/             # React components
│   ├── ui/                # UI components (shadcn/ui)
│   └── ...
├── lib/                    # Utility functions and hooks
├── public/                 # Static assets
└── styles/                 # Global styles
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GEMINI_MODEL` | Gemini model to use | No (default: gemini-pro) |
| `GEMINI_MAX_TOKENS` | Maximum tokens per request | No (default: 8192) |
| `GEMINI_TEMPERATURE` | AI temperature setting | No (default: 0.8) |

## 📝 Key Features

### Session Persistence
- User email capture on first visit
- All data (calendar events, HypeOS goals/tasks, chat history) persists across page refreshes
- Data stored in localStorage (ready for backend API upgrade)

### HypeOS
- Daily goals and tasks
- Streak tracking
- Points and rewards system
- Mini-wins and quests

### Bizora AI
- Conversation history
- Persistent chat sessions
- Share and export functionality

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Add environment variables in Netlify dashboard
4. Deploy!

## 📚 Documentation

- `LOCAL_HOSTING_GUIDE.md` - Local development setup
- `API_SETUP_GUIDE.md` - API configuration guide
- `SESSION_PERSISTENCE_GUIDE.md` - Session management details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👤 Author

DreamScale Team

---

**Note**: Make sure to never commit your `.env.local` file or any sensitive API keys to the repository.

