'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Users, 
  Award,
  Filter,
  Download,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { parseAnalysisMarkdown } from '@/lib/competitive-intelligence/parse-analysis-markdown'
import { competitiveReportMarkdownComponents } from '@/lib/competitive-intelligence/report-markdown'

interface SkillRating {
  innovation: number
  execution: number
  leadership: number
  persistence: number
}

interface CompetitiveIntelligenceDashboardProps {
  analysisResult: string
  skillRating: SkillRating
  data: {
    intrapreneurName: string
    companyIndustry: string
    targetStakeholders: string[]
    initiativeFrequency: string
    projectTypes: string[]
    uniqueApproach: string
    weaknesses: string
    collaborationMethods: string[]
    valueCreation: string[]
    yourAdvantage: string
  }
}

// Minimalist color palette
const COLORS = {
  primary: '#6366f1', // Subtle indigo
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
}

// Minimalist chart colors - softer, more muted
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0']

// Parse analysis sections (supports ## and ### headers from Gemini)
function parseAnalysisSections(markdown: string) {
  return parseAnalysisMarkdown(markdown).sections
}

export default function CompetitiveIntelligenceDashboard({ 
  analysisResult, 
  skillRating,
  data 
}: CompetitiveIntelligenceDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('all')
  const [activeView, setActiveView] = useState<'visual' | 'analysis' | 'competitor'>('visual')
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0)
  const [currentIntelligenceIndex, setCurrentIntelligenceIndex] = useState<number>(0)

  // Parse analysis sections
  const analysisSections = useMemo(() => {
    return parseAnalysisSections(analysisResult)
  }, [analysisResult])

  // Extract specific sections
  const executiveSummary = analysisSections.find(s => 
    s.title.toLowerCase().includes('executive summary')
  )
  const competitivePositioning = analysisSections.find(s => 
    s.title.toLowerCase().includes('competitive positioning')
  )
  const skillAssessment = analysisSections.find(s => 
    s.title.toLowerCase().includes('skill assessment')
  )
  const winningActionPlan = analysisSections.find(s => 
    s.title.toLowerCase().includes('winning action plan') || 
    s.title.toLowerCase().includes('action plan')
  )
  const competitiveIntelligence = analysisSections.find(s => 
    s.title.toLowerCase().includes('competitive intelligence')
  )
  const strategicTimeline = analysisSections.find(s => 
    s.title.toLowerCase().includes('strategic timeline') || 
    s.title.toLowerCase().includes('timeline')
  )

  // Get competitive intelligence sections (how to beat competitor)
  const competitiveIntelligenceSections = analysisSections.filter(s => 
    s.title.toLowerCase().includes('competitive') ||
    s.title.toLowerCase().includes('winning') ||
    s.title.toLowerCase().includes('action plan') ||
    s.title.toLowerCase().includes('tactics') ||
    s.title.toLowerCase().includes('strategic timeline')
  )

  // Prepare skill rating data for radar chart (100% accurate from actual data)
  const skillData = [
    { skill: 'Innovation', value: skillRating.innovation, max: 5 },
    { skill: 'Execution', value: skillRating.execution, max: 5 },
    { skill: 'Leadership', value: skillRating.leadership, max: 5 },
    { skill: 'Persistence', value: skillRating.persistence, max: 5 }
  ]

  const radarData = skillData.map(s => ({
    skill: s.skill,
    value: s.value,
    fullMark: 5
  }))

  // Prepare bar chart data (100% accurate)
  const skillBarData = skillData.map(s => ({
    name: s.skill,
    value: s.value,
    max: 5
  }))

  // Calculate positioning scores based on actual skill ratings (not fake data)
  const positioningData = [
    { 
      category: 'Innovation', 
      score: skillRating.innovation * 20, 
      trend: skillRating.innovation >= 3 ? 'up' : 'down' 
    },
    { 
      category: 'Execution', 
      score: skillRating.execution * 20, 
      trend: skillRating.execution >= 3 ? 'up' : 'down' 
    },
    { 
      category: 'Leadership', 
      score: skillRating.leadership * 20, 
      trend: skillRating.leadership >= 3 ? 'up' : 'down' 
    },
    { 
      category: 'Persistence', 
      score: skillRating.persistence * 20, 
      trend: skillRating.persistence >= 3 ? 'up' : 'down' 
    }
  ]

  // Value creation distribution (based on actual data)
  const valueCreationData = data.valueCreation.map((value, index) => ({
    name: value.length > 25 ? value.substring(0, 22) + '...' : value,
    fullName: value,
    value: Math.max(15, 100 / data.valueCreation.length), // Equal distribution based on actual items
    color: CHART_COLORS[index % CHART_COLORS.length]
  }))

  // Stakeholder distribution (based on actual data)
  const stakeholderData = data.targetStakeholders.map((stakeholder, index) => ({
    name: stakeholder.length > 15 ? stakeholder.substring(0, 15) + '...' : stakeholder,
    fullName: stakeholder,
    value: Math.max(15, 100 / data.targetStakeholders.length), // Equal distribution
    color: CHART_COLORS[index % CHART_COLORS.length]
  }))

  // Calculate overall score (100% accurate)
  const overallScore = Math.round(
    (skillRating.innovation + skillRating.execution + skillRating.leadership + skillRating.persistence) / 4 * 20
  )

  const nextSection = () => {
    if (currentSectionIndex < analysisSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const nextIntelligence = () => {
    if (currentIntelligenceIndex < competitiveIntelligenceSections.length - 1) {
      setCurrentIntelligenceIndex(currentIntelligenceIndex + 1)
    }
  }

  const prevIntelligence = () => {
    if (currentIntelligenceIndex > 0) {
      setCurrentIntelligenceIndex(currentIntelligenceIndex - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters - Minimalistic Design */}
      <Card className="border-gray-200/30 dark:border-slate-800/30 shadow-sm bg-white dark:bg-slate-950">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-0.5">
                Competitive Intelligence Dashboard
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Visual insights for {data.intrapreneurName}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200/60 dark:border-slate-800/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('visual')}
                  className={`h-8 px-3 text-xs transition-all ${
                    activeView === 'visual' 
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-slate-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-transparent'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  Visual
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('analysis')}
                  className={`h-8 px-3 text-xs transition-all ${
                    activeView === 'analysis' 
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-slate-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-transparent'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  Analysis
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('competitor')}
                  className={`h-8 px-3 text-xs transition-all ${
                    activeView === 'competitor' 
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-slate-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-transparent'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 mr-1.5" />
                  Competitor
                </Button>
              </div>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[120px] h-8 text-xs border-gray-200/60 dark:border-slate-800/60">
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="positioning">Positioning</SelectItem>
                  <SelectItem value="stakeholders">Stakeholders</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 text-xs border-gray-200/60 dark:border-slate-800/60">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Analysis View */}
      {activeView === 'analysis' && (
        <div className="space-y-4">
          <Card className="border-gray-200 dark:border-slate-800 shadow-lg">
            <CardHeader className="pb-3 border-b border-gray-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                  {analysisSections[currentSectionIndex]?.title || 'Analysis'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select 
                    value={currentSectionIndex.toString()} 
                    onValueChange={(value) => setCurrentSectionIndex(parseInt(value))}
                  >
                    <SelectTrigger className="w-[200px] h-8 text-xs bg-white dark:bg-slate-800 border-gray-200/60 dark:border-slate-700/60 hover:border-gray-300 dark:hover:border-slate-600">
                      <SelectValue>
                        Section {currentSectionIndex + 1} of {analysisSections.length}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {analysisSections.map((section, index) => (
                        <SelectItem 
                          key={index} 
                          value={index.toString()}
                          className="text-sm"
                        >
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevSection}
                    disabled={currentSectionIndex === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2 font-medium whitespace-nowrap">
                    {currentSectionIndex + 1} / {analysisSections.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextSection}
                    disabled={currentSectionIndex === analysisSections.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 px-8 max-h-[min(80vh,900px)] overflow-y-auto">
              <div className="prose prose-base max-w-none dark:prose-invert">
                <ReactMarkdown components={competitiveReportMarkdownComponents}>
                  {analysisSections[currentSectionIndex]?.content || ''}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competitive Intelligence View - How to Beat Competitor */}
      {activeView === 'competitor' && competitiveIntelligenceSections.length > 0 && (
        <div className="space-y-4">
          <Card className="border-gray-200 dark:border-slate-800 shadow-lg">
            <CardHeader className="pb-3 border-b border-gray-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {competitiveIntelligenceSections[currentIntelligenceIndex]?.title || 'Competitive Intelligence'}
                  </CardTitle>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Strategic insights to outperform {data.intrapreneurName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={currentIntelligenceIndex.toString()} 
                    onValueChange={(value) => setCurrentIntelligenceIndex(parseInt(value))}
                  >
                    <SelectTrigger className="w-[200px] h-8 text-xs bg-white dark:bg-slate-800 border-gray-200/60 dark:border-slate-700/60 hover:border-gray-300 dark:hover:border-slate-600">
                      <SelectValue>
                        Section {currentIntelligenceIndex + 1} of {competitiveIntelligenceSections.length}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {competitiveIntelligenceSections.map((section, index) => (
                        <SelectItem 
                          key={index} 
                          value={index.toString()}
                          className="text-sm"
                        >
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevIntelligence}
                    disabled={currentIntelligenceIndex === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2 font-medium whitespace-nowrap">
                    {currentIntelligenceIndex + 1} / {competitiveIntelligenceSections.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextIntelligence}
                    disabled={currentIntelligenceIndex === competitiveIntelligenceSections.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 px-8 max-h-[min(80vh,900px)] overflow-y-auto">
              <div className="prose prose-base max-w-none dark:prose-invert">
                <ReactMarkdown components={competitiveReportMarkdownComponents}>
                  {competitiveIntelligenceSections[currentIntelligenceIndex]?.content || ''}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Dashboard */}
      {activeView === 'visual' && (
        <>
          {/* Key Metrics Cards - Minimalistic */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-200/30 dark:border-slate-800/30 shadow-sm bg-white dark:bg-slate-950">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Overall Score</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{overallScore}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 100</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/30 dark:border-slate-800/30 shadow-sm bg-white dark:bg-slate-950">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Innovation</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{skillRating.innovation}/5</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {skillRating.innovation >= 4 ? 'Excellent' : skillRating.innovation >= 3 ? 'Good' : 'Needs Improvement'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/30 dark:border-slate-800/30 shadow-sm bg-white dark:bg-slate-950">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Execution</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{skillRating.execution}/5</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {skillRating.execution >= 4 ? 'Strong' : skillRating.execution >= 3 ? 'Moderate' : 'Weak'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/30 dark:border-slate-800/30 shadow-sm bg-white dark:bg-slate-950">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Stakeholders</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{data.targetStakeholders.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">target groups</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Skill Radar Chart */}
            <Card className="border-gray-200/40 dark:border-slate-800/40 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  Skill Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" strokeWidth={0.5} />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 5]} 
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Skills"
                      dataKey="value"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Bar Chart */}
            <Card className="border-gray-200/40 dark:border-slate-800/40 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  Skill Ratings Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillBarData}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" strokeWidth={0.5} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: 'none',
                        borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        padding: '8px 12px'
                      }}
                    />
                    <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Competitive Positioning */}
            <Card className="border-gray-200/40 dark:border-slate-800/40 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  Competitive Positioning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={positioningData} layout="vertical">
                    <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" strokeWidth={0.5} />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: 'none',
                        borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        padding: '8px 12px'
                      }}
                    />
                    <Bar dataKey="score" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Value Creation Distribution */}
            {valueCreationData.length > 0 && (
              <Card className="border-gray-200/40 dark:border-slate-800/40 shadow-sm bg-white dark:bg-slate-950">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    Value Creation Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={valueCreationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={85}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {valueCreationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: any, props: any) => [
                            `${props.payload.fullName}: ${(value / valueCreationData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1)}%`,
                            'Value Creation'
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            border: 'none',
                            borderRadius: '6px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            padding: '8px 12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Value Creation List */}
                    <div className="space-y-1.5 pt-3 border-t border-gray-200/30 dark:border-slate-800/30">
                      {valueCreationData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 rounded-md hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div 
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={item.fullName}>
                              {item.fullName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0 font-medium">
                            {((item.value / valueCreationData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Stakeholder Analysis */}
          {stakeholderData.length > 0 && (
            <Card className="border-gray-200/40 dark:border-slate-800/40 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  Stakeholder Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={stakeholderData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {stakeholderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            border: 'none',
                            borderRadius: '6px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            padding: '8px 12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {stakeholderData.map((stakeholder, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 rounded-md hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: stakeholder.color }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{stakeholder.fullName}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stakeholder.value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
