"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ArrowLeft, Heart, AlertCircle, CheckCircle2, Calendar, User, MapPin, Briefcase } from "lucide-react"
import { CoFounderMatch } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'

export default function CoFounderMatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [match, setMatch] = useState<CoFounderMatch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatch = () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('teams:data') : null
        if (saved) {
          const teamsData = JSON.parse(saved)
          // Ensure coFounderMatches exists
          const coFounderMatches = teamsData.coFounderMatches || []
          const foundMatch = coFounderMatches.find((m: CoFounderMatch) => m.id === params.id)
          if (foundMatch) {
            setMatch(foundMatch)
          }
        }
      } catch (e) {
        console.error('Failed to load match:', e)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()
  }, [params.id])

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading match details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Match not found</p>
              <button 
                onClick={() => router.push('/teams')}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Teams
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/teams')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold mb-3 text-title-shimmer">
                  Co-founder Match
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {match.profile1.name}
                  </span>
                  <span>•</span>
                  <span>Created on {new Date(match.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-3xl font-semibold mb-1", getMatchColor(match.matchScore))}>
                  {match.matchScore}%
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Match Score</p>
              </div>
            </div>
          </div>

          {/* Match Score Card */}
          <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Compatibility Score</h2>
              <span className={cn("text-2xl font-semibold", getMatchColor(match.matchScore))}>
                {match.matchScore}%
              </span>
            </div>
            <Progress value={match.matchScore} className="h-2" />
          </div>

          {/* Your Profile */}
          <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Profile</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{match.profile1.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Availability</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{match.profile1.availability}</p>
              </div>
              {match.profile1.location && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {match.profile1.location}
                  </p>
                </div>
              )}
              {(match.profile1.skills?.length || 0) > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {match.profile1.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-gray-200/60 dark:border-gray-800/60">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(match.profile1.values?.length || 0) > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Values</p>
                  <div className="flex flex-wrap gap-2">
                    {match.profile1.values.map((value, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-gray-200/60 dark:border-gray-800/60">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {match.profile1.experience && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                  <p className="text-sm text-gray-900 dark:text-white">{match.profile1.experience}</p>
                </div>
              )}
            </div>
          </div>

          {/* Matching Characteristics */}
          {match.matchingCharacteristics && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Must Match */}
              <div className="border-l-2 border-l-red-500 border border-gray-200/50 dark:border-gray-800/50 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Must Match</h2>
                  <Badge variant="outline" className="text-xs border-red-500 text-red-600 dark:text-red-400">
                    Required
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Essential characteristics for compatibility
                </p>
                <div className="space-y-3">
                  {(match.matchingCharacteristics.mustMatch?.skills?.length || 0) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingCharacteristics.mustMatch.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(match.matchingCharacteristics.mustMatch?.values?.length || 0) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Values</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingCharacteristics.mustMatch.values.map((value, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.availability && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Availability</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.availability}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.experience && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.experience}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.commitment && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Commitment</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.commitment}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.workingStyle && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Working Style</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.workingStyle}</p>
                    </div>
                  )}
                  {(match.matchingCharacteristics.mustMatch?.personalityTraits?.length || 0) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Personality Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingCharacteristics.mustMatch.personalityTraits.map((trait, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.riskTolerance && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Risk Tolerance</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.riskTolerance}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.financialSituation && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Financial Situation</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.financialSituation}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.network && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Network</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.network}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.technicalProficiency && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Technical Proficiency</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.technicalProficiency}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.leadershipStyle && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Leadership Style</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.leadershipStyle}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.mustMatch?.communicationStyle && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Communication Style</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.mustMatch.communicationStyle}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Can Match */}
              <div className="border-l-2 border-l-green-500 border border-gray-200/50 dark:border-gray-800/50 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Can Match</h2>
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600 dark:text-green-400">
                    Preferred
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Preferred but not required characteristics
                </p>
                <div className="space-y-3">
                  {(match.matchingCharacteristics.canMatch?.skills?.length || 0) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingCharacteristics.canMatch.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(match.matchingCharacteristics.canMatch?.values?.length || 0) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Values</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingCharacteristics.canMatch.values.map((value, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.location && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.location}</p>
                    </div>
                  )}
                  {(match.matchingCharacteristics.canMatch?.additionalTraits?.length || 0) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Additional Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingCharacteristics.canMatch.additionalTraits.map((trait, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.industryExperience && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Industry Experience</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.industryExperience}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.education && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Education</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.education}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.ageRange && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Age Range</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.ageRange}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.lifestyle && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Lifestyle</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.lifestyle}</p>
                    </div>
                  )}
                  {Array.isArray(match.matchingCharacteristics.canMatch?.hobbies) && match.matchingCharacteristics.canMatch.hobbies.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Hobbies/Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingCharacteristics.canMatch.hobbies.map((hobby, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.previousStartupExperience && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Previous Startup Experience</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.previousStartupExperience}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.investorRelationships && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Investor Relationships</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.investorRelationships}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.customerRelationships && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer Relationships</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.customerRelationships}</p>
                    </div>
                  )}
                  {match.matchingCharacteristics.canMatch?.mediaPresence && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Media Presence</p>
                      <p className="text-sm text-gray-900 dark:text-white">{match.matchingCharacteristics.canMatch.mediaPresence}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fallback for old matches without matchingCharacteristics */}
          {!match.matchingCharacteristics && match.profile2 && (
            <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ideal Co-founder Profile</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{match.profile2.name}</p>
                </div>
                {(match.profile2.skills?.length || 0) > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {match.profile2.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-gray-200/60 dark:border-gray-800/60">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(match.profile2.values?.length || 0) > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Values</p>
                    <div className="flex flex-wrap gap-2">
                      {match.profile2.values.map((value, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-gray-200/60 dark:border-gray-800/60">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Availability</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{match.profile2.availability}</p>
                </div>
                {match.profile2.location && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{match.profile2.location}</p>
                  </div>
                )}
                {match.profile2.experience && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                    <p className="text-sm text-gray-900 dark:text-white">{match.profile2.experience}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Match Analysis */}
          <div className="border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Match Analysis</h2>
            <div className="space-y-4">
              {(match.analysis?.complementarySkills?.length || 0) > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Complementary Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {match.analysis.complementarySkills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-gray-200/60 dark:border-gray-800/60">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(match.analysis?.sharedValues?.length || 0) > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Shared Values
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {match.analysis.sharedValues.map((value, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-gray-200/60 dark:border-gray-800/60">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(match.analysis?.potentialChallenges?.length || 0) > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Potential Challenges
                  </h3>
                  <ul className="space-y-1.5">
                    {match.analysis.potentialChallenges.map((challenge, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                        • {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {match.analysis?.collaborationFit !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Collaboration Fit</h3>
                  <Progress value={match.analysis.collaborationFit} className="h-2 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{match.analysis.collaborationFit}% compatibility</p>
                </div>
              )}
              {match.analysis?.recommendation && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recommendation</h3>
                  <AIResponse content={match.analysis.recommendation} />
                </div>
              )}
            </div>
          </div>

          {/* Trial Period */}
          {match.trialPeriod && (
            <div className="border-l-2 border-l-green-500 border border-gray-200/50 dark:border-gray-800/50 rounded p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Suggested Trial Period</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {new Date(match.trialPeriod.startDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} - {new Date(match.trialPeriod.endDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
              {(match.trialPeriod.milestones?.length || 0) > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Milestones</h3>
                  <ul className="space-y-1.5">
                    {match.trialPeriod.milestones.map((milestone, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3">
                        • {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
