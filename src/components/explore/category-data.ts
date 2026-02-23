import {
  Layers,
  Megaphone,
  Share2,
  BarChart3,
  Code2,
  Music,
  Palette,
  Search,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'

export interface Category {
  id: string
  label: string
  icon: LucideIcon
  bg: string
  iconColor: string
}

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', icon: Layers, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, bg: 'bg-rose-100', iconColor: 'text-rose-600' },
  { id: 'social-media', label: 'Social Media', icon: Share2, bg: 'bg-sky-100', iconColor: 'text-sky-600' },
  { id: 'data', label: 'Data', icon: BarChart3, bg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { id: 'build-apps', label: 'Build Apps', icon: Code2, bg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { id: 'music', label: 'Music', icon: Music, bg: 'bg-pink-100', iconColor: 'text-pink-600' },
  { id: 'art', label: 'Art', icon: Palette, bg: 'bg-fuchsia-100', iconColor: 'text-fuchsia-600' },
  { id: 'research', label: 'Research', icon: Search, bg: 'bg-teal-100', iconColor: 'text-teal-600' },
  { id: 'more', label: 'More', icon: MoreHorizontal, bg: 'bg-gray-100', iconColor: 'text-gray-600' },
]

export const PLACEHOLDER_LESSONS: Record<string, Array<{ title: string; description: string }>> = {
  all: [
    { title: 'Getting Started with AI', description: 'Learn the fundamentals of artificial intelligence and how it works.' },
    { title: 'Prompt Engineering 101', description: 'Master the art of writing effective prompts for AI models.' },
    { title: 'AI Ethics & Safety', description: 'Understand the ethical considerations when working with AI.' },
    { title: 'Building Your First Chatbot', description: 'Create a simple chatbot using modern AI tools.' },
  ],
  marketing: [
    { title: 'AI-Powered Ad Copy', description: 'Generate compelling ad copy using AI writing assistants.' },
    { title: 'SEO with AI Tools', description: 'Boost your search rankings with AI-driven SEO strategies.' },
    { title: 'Email Marketing Automation', description: 'Automate personalized email campaigns with AI.' },
    { title: 'Content Calendar with AI', description: 'Plan and schedule content using AI recommendations.' },
  ],
  'social-media': [
    { title: 'AI Content Creation', description: 'Create engaging social posts with AI assistance.' },
    { title: 'Scheduling & Analytics', description: 'Use AI to optimize posting times and analyze performance.' },
    { title: 'Hashtag Strategy', description: 'Find trending hashtags with AI-powered research.' },
    { title: 'Viral Content Patterns', description: 'Learn what makes content go viral using AI analysis.' },
  ],
  data: [
    { title: 'Data Visualization with AI', description: 'Create stunning charts and dashboards using AI tools.' },
    { title: 'Predictive Analytics', description: 'Forecast trends using machine learning models.' },
    { title: 'Data Cleaning Automation', description: 'Automate tedious data cleaning tasks with AI.' },
    { title: 'SQL with AI Assistants', description: 'Write complex queries faster with AI code helpers.' },
  ],
  'build-apps': [
    { title: 'No-Code AI Apps', description: 'Build functional apps without writing code using AI platforms.' },
    { title: 'AI API Integration', description: 'Connect AI services to your applications via APIs.' },
    { title: 'Rapid Prototyping', description: 'Use AI to quickly prototype and iterate on app ideas.' },
    { title: 'Deploy Your AI App', description: 'Take your AI-powered app from development to production.' },
  ],
  music: [
    { title: 'AI Music Generation', description: 'Compose original music using AI composition tools.' },
    { title: 'Audio Enhancement', description: 'Improve audio quality with AI-powered mastering.' },
    { title: 'Lyric Writing with AI', description: 'Co-write song lyrics with AI creative assistants.' },
    { title: 'Sound Design', description: 'Create unique sounds and effects using AI synthesis.' },
  ],
  art: [
    { title: 'AI Image Generation', description: 'Create stunning visuals with text-to-image AI models.' },
    { title: 'Style Transfer', description: 'Apply artistic styles to photos using neural networks.' },
    { title: 'Digital Illustration', description: 'Enhance your illustrations with AI-powered tools.' },
    { title: 'AI Animation Basics', description: 'Bring still images to life with AI animation.' },
  ],
  research: [
    { title: 'AI Literature Review', description: 'Speed up research with AI-powered paper analysis.' },
    { title: 'Data Collection with AI', description: 'Automate data gathering for research projects.' },
    { title: 'Summarizing Papers', description: 'Get concise summaries of academic papers using AI.' },
    { title: 'Research Writing Assistant', description: 'Improve your research writing with AI feedback.' },
  ],
}
