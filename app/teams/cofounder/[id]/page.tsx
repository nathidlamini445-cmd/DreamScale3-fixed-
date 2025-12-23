"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, AlertCircle, CheckCircle2, Calendar } from "lucide-react"
import { CoFounderMatch } from '@/lib/teams-types'
import { AIResponse } from '@/components/ai-response'
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
          const foundMatch = teamsData.coFounderMatches.find((m: CoFounderMatch) => m.id === params.id)
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
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
        <SidebarNav />
        <main className="ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Match not found</p>
              <Button onClick={() => router.push('/teams')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Teams
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground">
      <SidebarNav />
      <main className="ml-64 pt-8">
        <div className="w-full px-12 py-12">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Button
              onClick={() => router.push('/teams')}
              variant="ghost"
              className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                  <Heart className="w-7 h-7 text-purple-600" />
                  Co-founder Match Details
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Match Profile: {match.profile1.name}
                </p>
              </div>
              <Badge 
                variant={match.matchScore >= 80 ? 'default' : match.matchScore >= 60 ? 'secondary' : 'outline'}
                className="text-base px-4 py-1.5"
              >
                {match.matchScore}% Match
              </Badge>
            </div>
          </div>

          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Match Score */}
            <Card className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className={cn("text-5xl font-semibold mb-3", getMatchColor(match.matchScore))}>
                      {match.matchScore}%
                    </div>
                    <p className="text-base text-gray-500 dark:text-gray-400 mb-6">Compatibility Score</p>
                    <div className="w-80 mx-auto">
                      <Progress value={match.matchScore} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Profile */}
            <Card className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
              <CardContent className="pt-6 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Profile</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{match.profile1.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Availability</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{match.profile1.availability}</p>
                  </div>
                  {match.profile1.location && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</p>
                      <p className="font-medium text-gray-900 dark:text-white">{match.profile1.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date Created</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(match.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {match.profile1.skills.map((skill, i) => (
                        <Badge key={i} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Values</p>
                    <div className="flex flex-wrap gap-2">
                      {match.profile1.values.map((value, i) => (
                        <Badge key={i} variant="outline">{value}</Badge>
                      ))}
                    </div>
                  </div>
                  {match.profile1.experience && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Experience</p>
                      <p className="text-gray-900 dark:text-white">{match.profile1.experience}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Matching Characteristics */}
            {match.matchingCharacteristics ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Must Match */}
                <Card className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 shadow-sm border-l-4 border-l-red-500">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Must Match
                      </h2>
                      <Badge className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                        Required
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      These characteristics are ESSENTIAL - a co-founder MUST have these to be compatible with you.
                    </p>
                    <div className="space-y-4">
                      {match.matchingCharacteristics.mustMatch.skills.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matchingCharacteristics.mustMatch.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.values.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">Values:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matchingCharacteristics.mustMatch.values.map((value, i) => (
                              <Badge key={i} variant="outline" className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                                {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.availability && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Availability:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.availability}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.experience && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Experience:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.experience}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.commitment && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Commitment:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.commitment}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.workingStyle && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Working Style:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.workingStyle}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.personalityTraits && match.matchingCharacteristics.mustMatch.personalityTraits.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">Personality Traits:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matchingCharacteristics.mustMatch.personalityTraits.map((trait, i) => (
                              <Badge key={i} variant="outline" className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.riskTolerance && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Risk Tolerance:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.riskTolerance}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.financialSituation && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Financial Situation:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.financialSituation}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.network && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Network:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.network}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.technicalProficiency && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Technical Proficiency:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.technicalProficiency}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.leadershipStyle && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Leadership Style:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.leadershipStyle}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.mustMatch.communicationStyle && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Communication Style:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.mustMatch.communicationStyle}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Can Match */}
                <Card className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 shadow-sm border-l-4 border-l-green-500">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Can Match
                      </h2>
                      <Badge className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                        Preferred
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      These characteristics are PREFERRED but not required - they would make the match even better.
                    </p>
                    <div className="space-y-4">
                      {match.matchingCharacteristics.canMatch.skills.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matchingCharacteristics.canMatch.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.values && match.matchingCharacteristics.canMatch.values.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">Values:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matchingCharacteristics.canMatch.values.map((value, i) => (
                              <Badge key={i} variant="outline" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                                {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.location && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Location:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.location}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.additionalTraits && match.matchingCharacteristics.canMatch.additionalTraits.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">Additional Traits:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matchingCharacteristics.canMatch.additionalTraits.map((trait, i) => (
                              <Badge key={i} variant="outline" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.industryExperience && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Industry Experience:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.industryExperience}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.education && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Education:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.education}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.ageRange && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Age Range:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.ageRange}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.lifestyle && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Lifestyle:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.lifestyle}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.hobbies && match.matchingCharacteristics.canMatch.hobbies.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-2">Hobbies/Interests:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matchingCharacteristics.canMatch.hobbies.map((hobby, i) => (
                              <Badge key={i} variant="outline" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                                {hobby}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.previousStartupExperience && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Previous Startup Experience:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.previousStartupExperience}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.investorRelationships && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Investor Relationships:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.investorRelationships}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.customerRelationships && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Customer Relationships:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.customerRelationships}</p>
                        </div>
                      )}
                      {match.matchingCharacteristics.canMatch.mediaPresence && (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Media Presence:</p>
                          <p className="text-gray-700 dark:text-gray-300">{match.matchingCharacteristics.canMatch.mediaPresence}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : match.profile2 ? (
              // Fallback for old matches
              <Card className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                <CardContent className="pt-6 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Ideal Co-founder Profile</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Name:</p>
                      <p className="text-gray-700 dark:text-gray-300">{match.profile2.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.profile2.skills.map((skill, i) => (
                          <Badge key={i} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Values:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.profile2.values.map((value, i) => (
                          <Badge key={i} variant="outline">{value}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Availability:</p>
                      <p className="text-gray-700 dark:text-gray-300 capitalize">{match.profile2.availability}</p>
                    </div>
                    {match.profile2.location && (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">Location:</p>
                        <p className="text-gray-700 dark:text-gray-300">{match.profile2.location}</p>
                      </div>
                    )}
                    {match.profile2.experience && (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">Experience:</p>
                        <p className="text-gray-700 dark:text-gray-300">{match.profile2.experience}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Match Analysis */}
            <Card className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
              <CardContent className="pt-6 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Match Analysis</h2>
                <div className="space-y-6">
                  {match.analysis.complementarySkills.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Complementary Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {match.analysis.complementarySkills.map((skill, i) => (
                          <Badge key={i} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.analysis.sharedValues.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Shared Values
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {match.analysis.sharedValues.map((value, i) => (
                          <Badge key={i} variant="outline">{value}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.analysis.potentialChallenges.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        Potential Challenges
                      </h3>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {match.analysis.potentialChallenges.map((challenge, i) => (
                          <li key={i}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Collaboration Fit</h3>
                    <Progress value={match.analysis.collaborationFit} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{match.analysis.collaborationFit}% compatibility</p>
                  </div>
                  {match.analysis.recommendation && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recommendation</h3>
                      <AIResponse content={match.analysis.recommendation} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trial Period */}
            {match.trialPeriod && (
              <Card className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 shadow-sm border-l-4 border-l-green-500">
                <CardContent className="pt-6 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Suggested Trial Period</h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {new Date(match.trialPeriod.startDate).toLocaleDateString()} - {new Date(match.trialPeriod.endDate).toLocaleDateString()}
                  </p>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Milestones:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {match.trialPeriod.milestones.map((milestone, i) => (
                      <li key={i}>{milestone}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Back Button Footer */}
            <div className="flex justify-center pt-8">
              <Button onClick={() => router.push('/teams')} variant="outline" size="lg" className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Teams
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

