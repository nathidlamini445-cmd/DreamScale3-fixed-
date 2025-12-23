"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Heart, AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { CoFounderMatch, CoFounderProfile } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AIResponse } from '@/components/ai-response'
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'
import { AnalysisItemCard } from './AnalysisItemCard'

interface VirtualCoFounderMatchingProps {
  matches: CoFounderMatch[]
  onAddMatch: (match: CoFounderMatch) => void
  onDeleteMatch?: (id: string) => void
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export default function VirtualCoFounderMatching({ matches, onAddMatch, onDeleteMatch }: VirtualCoFounderMatchingProps) {
  const [isMatching, setIsMatching] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profile, setProfile] = useState<Partial<CoFounderProfile>>({
    name: '',
    skills: [],
    values: [],
    availability: 'full-time',
    experience: '',
    location: '',
    lookingFor: [],
    preferences: {
      equity: '',
      commitment: '',
      workingStyle: ''
    }
  })
  const [profileInputs, setProfileInputs] = useState({
    skills: '',
    values: '',
    lookingFor: ''
  })

  const handleCreateProfile = async () => {
    if (!profile.name?.trim() || !profile.experience?.trim()) {
      alert('Please fill in name and experience')
      return
    }

    setIsMatching(true)
    
    try {
      const profileData: CoFounderProfile = {
        id: Date.now().toString(),
        name: profile.name!,
        skills: profileInputs.skills.split(',').map(s => s.trim()).filter(Boolean),
        values: profileInputs.values.split(',').map(v => v.trim()).filter(Boolean),
        availability: profile.availability || 'full-time',
        experience: profile.experience!,
        location: profile.location,
        lookingFor: profileInputs.lookingFor.split(',').map(l => l.trim()).filter(Boolean),
        preferences: {
          equity: profile.preferences?.equity || '',
          commitment: profile.preferences?.commitment || '',
          workingStyle: profile.preferences?.workingStyle || ''
        },
        date: new Date().toISOString()
      }

      // Use AI to generate ideal co-founder profile
      const response = await fetch('/api/teams/match-cofounder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData })
      })

      if (!response.ok) {
        throw new Error('Failed to find co-founder match')
      }

      const matchData = await response.json()
      
      const match: CoFounderMatch = {
        id: Date.now().toString(),
        profile1: profileData,
        matchingCharacteristics: matchData.matchingCharacteristics,
        matchScore: matchData.matchScore || 75,
        analysis: matchData.analysis || {
          complementarySkills: [],
          sharedValues: [],
          potentialChallenges: [],
          collaborationFit: 75,
          recommendation: ''
        },
        date: new Date().toISOString()
      }

      onAddMatch(match)
      
      // Reset form
      setProfile({ name: '', skills: [], values: [], availability: 'full-time', experience: '', location: '', lookingFor: [], preferences: { equity: '', commitment: '', workingStyle: '' } })
      setProfileInputs({ skills: '', values: '', lookingFor: '' })
      setShowProfileForm(false)
    } catch (error) {
      console.error('Failed to find co-founder match:', error)
      alert('Failed to find co-founder match. Please try again.')
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <>
    <div className="space-y-6">
      {/* Saved Matches - Show at Top */}
      {matches.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Your Co-founder Matches ({matches.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <AnalysisItemCard
                key={match.id}
                id={match.id}
                title={`Match Profile: ${match.profile1.name}`}
                subtitle={`${match.profile1.skills.slice(0, 2).join(', ')}...`}
                date={match.date}
                icon={<Heart className="w-5 h-5 text-purple-600" />}
                badges={[
                  { 
                    label: `${match.matchScore}% Match`, 
                    variant: match.matchScore >= 80 ? 'default' : match.matchScore >= 60 ? 'secondary' : 'outline' 
                  }
                ]}
                onDelete={(id) => {
                  if (onDeleteMatch) {
                    onDeleteMatch(id)
                  }
                }}
                type="cofounder"
              >
                {/* Detailed View Content */}
                <div className="space-y-6">
                  {/* Match Score */}
                  <div className="flex items-center justify-center p-6 bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                    <div className="text-center">
                      <div className={cn("text-4xl font-medium mb-2", getMatchColor(match.matchScore))}>
                        {match.matchScore}%
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Compatibility Score</p>
                    </div>
                  </div>

                  {/* Your Profile */}
                  <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Your Profile</h4>
                      <div className="space-y-2 text-base font-medium text-gray-600 dark:text-gray-400">
                        <p><span className="text-gray-900 dark:text-white">Name:</span> {match.profile1.name}</p>
                        <p><span className="text-gray-900 dark:text-white">Skills:</span> {match.profile1.skills.join(', ') || 'N/A'}</p>
                        <p><span className="text-gray-900 dark:text-white">Values:</span> {match.profile1.values.join(', ') || 'N/A'}</p>
                        <p><span className="text-gray-900 dark:text-white">Availability:</span> {match.profile1.availability}</p>
                        {match.profile1.location && <p><span className="text-gray-900 dark:text-white">Location:</span> {match.profile1.location}</p>}
                      </div>
                    </div>

                  {/* Matching Characteristics */}
                  {match.matchingCharacteristics ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Must Match */}
                      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-xl font-medium text-gray-900 dark:text-white">
                            Must Match
                          </h4>
                          <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                            Required
                          </span>
                        </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">
                            These characteristics are ESSENTIAL - a co-founder MUST have these to be compatible with you.
                          </p>
                          <div className="space-y-4 text-base">
                            {match.matchingCharacteristics.mustMatch.skills.length > 0 && (
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white mb-2">Skills:</p>
                                <div className="flex flex-wrap gap-2">
                                  {match.matchingCharacteristics.mustMatch.skills.map((skill, i) => (
                                    <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {match.matchingCharacteristics.mustMatch.values.length > 0 && (
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white mb-2">Values:</p>
                                <div className="flex flex-wrap gap-2">
                                  {match.matchingCharacteristics.mustMatch.values.map((value, i) => (
                                    <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                      {value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {match.matchingCharacteristics.mustMatch.availability && (
                              <p className="font-medium text-gray-600 dark:text-gray-400"><span className="text-gray-900 dark:text-white">Availability:</span> {match.matchingCharacteristics.mustMatch.availability}</p>
                            )}
                            {match.matchingCharacteristics.mustMatch.experience && (
                              <p className="font-medium text-gray-600 dark:text-gray-400"><span className="text-gray-900 dark:text-white">Experience:</span> {match.matchingCharacteristics.mustMatch.experience}</p>
                            )}
                            {match.matchingCharacteristics.mustMatch.commitment && (
                              <p className="font-medium text-gray-600 dark:text-gray-400"><span className="text-gray-900 dark:text-white">Commitment:</span> {match.matchingCharacteristics.mustMatch.commitment}</p>
                            )}
                            {match.matchingCharacteristics.mustMatch.workingStyle && (
                              <p className="font-medium text-gray-600 dark:text-gray-400"><span className="text-gray-900 dark:text-white">Working Style:</span> {match.matchingCharacteristics.mustMatch.workingStyle}</p>
                            )}
                          </div>
                        </div>

                      {/* Can Match */}
                      <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-xl font-medium text-gray-900 dark:text-white">
                            Can Match
                          </h4>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                            Preferred
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">
                          These characteristics are PREFERRED but not required - they would make the match even better.
                        </p>
                        <div className="space-y-4 text-base">
                          {match.matchingCharacteristics.canMatch.skills.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white mb-2">Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {match.matchingCharacteristics.canMatch.skills.map((skill, i) => (
                                  <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {match.matchingCharacteristics.canMatch.values && match.matchingCharacteristics.canMatch.values.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white mb-2">Values:</p>
                              <div className="flex flex-wrap gap-2">
                                {match.matchingCharacteristics.canMatch.values.map((value, i) => (
                                  <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                    {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {match.matchingCharacteristics.canMatch.location && (
                            <p className="font-medium text-gray-600 dark:text-gray-400"><span className="text-gray-900 dark:text-white">Location:</span> {match.matchingCharacteristics.canMatch.location}</p>
                          )}
                          {match.matchingCharacteristics.canMatch.additionalTraits && match.matchingCharacteristics.canMatch.additionalTraits.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white mb-2">Additional Traits:</p>
                              <div className="flex flex-wrap gap-2">
                                {match.matchingCharacteristics.canMatch.additionalTraits.map((trait, i) => (
                                  <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                    {trait}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : match.profile2 ? (
                    // Fallback to old display if profile2 exists (backward compatibility)
                    <Card className="bg-purple-50 dark:bg-purple-900/20">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{match.profile2.name}</h4>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Ideal Profile
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong>Skills:</strong> {match.profile2.skills.join(', ') || 'N/A'}</p>
                          <p><strong>Values:</strong> {match.profile2.values.join(', ') || 'N/A'}</p>
                          <p><strong>Availability:</strong> {match.profile2.availability}</p>
                          {match.profile2.location && <p><strong>Location:</strong> {match.profile2.location}</p>}
                          <p><strong>Experience:</strong> {match.profile2.experience || 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Match Analysis */}
                  <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-6">Match Analysis</h4>
                      <div className="space-y-4">
                        {match.analysis.complementarySkills.length > 0 && (
                          <div>
                            <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                              Complementary Skills
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {match.analysis.complementarySkills.map((skill, i) => (
                                <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {match.analysis.sharedValues.length > 0 && (
                          <div>
                            <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                              Shared Values
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {match.analysis.sharedValues.map((value, i) => (
                                <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{value}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {match.analysis.potentialChallenges.length > 0 && (
                          <div>
                            <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                              Potential Challenges
                            </h5>
                            <ul className="space-y-2">
                              {match.analysis.potentialChallenges.map((challenge, i) => (
                                <li key={i} className="flex items-start gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                                  <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">•</span>
                                  <span className="leading-relaxed">{challenge}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">Collaboration Fit</h5>
                          <Progress value={match.analysis.collaborationFit} className="h-3 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">{match.analysis.collaborationFit}% compatibility</p>
                        </div>
                        {match.analysis.recommendation && (
                          <div>
                            <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">Recommendation</h5>
                            <AIResponse content={match.analysis.recommendation} />
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Trial Period */}
                  {match.trialPeriod && (
                    <div className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
                      <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Suggested Trial Period</h4>
                      <p className="text-base font-medium text-gray-600 dark:text-gray-400 mb-4">
                        {new Date(match.trialPeriod.startDate).toLocaleDateString()} - {new Date(match.trialPeriod.endDate).toLocaleDateString()}
                      </p>
                      <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">Milestones:</h5>
                      <ul className="space-y-2">
                        {match.trialPeriod.milestones.map((milestone, i) => (
                          <li key={i} className="flex items-start gap-2 text-base font-medium text-gray-600 dark:text-gray-400">
                            <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                            <span className="leading-relaxed">{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AnalysisItemCard>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {matches.length > 0 && (
        <div className="border-t border-gray-200/60 dark:border-gray-800/60 pt-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">Create New Match</h3>
        </div>
      )}

      {/* Create Profile */}
      <div className="bg-white dark:bg-slate-950 border border-teal-200/60 dark:border-teal-800/30 rounded-lg p-6">
        {!showProfileForm ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Co-founder Matching
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Discover the ideal co-founder profile based on your skills, values, and goals
              </p>
            </div>
            <Button 
              onClick={() => setShowProfileForm(true)} 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium"
            >
              Create Profile & Find Match
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="border-b border-teal-200/60 dark:border-teal-800/30 pb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Create Profile
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm text-gray-700 dark:text-gray-300">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={isMatching}
                  className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="availability" className="text-sm text-gray-700 dark:text-gray-300">Availability *</Label>
                <Select 
                  value={profile.availability} 
                  onValueChange={(value: CoFounderProfile['availability']) => setProfile({ ...profile, availability: value })}
                >
                  <SelectTrigger id="availability" disabled={isMatching} className="border-teal-200/60 dark:border-teal-800/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="experience" className="text-sm text-gray-700 dark:text-gray-300">Experience *</Label>
              <Textarea
                id="experience"
                placeholder="Describe your background..."
                value={profile.experience || ''}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                rows={3}
                disabled={isMatching}
                className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-sm text-gray-700 dark:text-gray-300">Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                disabled={isMatching}
                className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skills" className="text-sm text-gray-700 dark:text-gray-300">Skills *</Label>
              <Input
                id="skills"
                placeholder="Comma-separated skills"
                value={profileInputs.skills}
                onChange={(e) => setProfileInputs({ ...profileInputs, skills: e.target.value })}
                disabled={isMatching}
                className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="values" className="text-sm text-gray-700 dark:text-gray-300">Values *</Label>
              <Input
                id="values"
                placeholder="Comma-separated values"
                value={profileInputs.values}
                onChange={(e) => setProfileInputs({ ...profileInputs, values: e.target.value })}
                disabled={isMatching}
                className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="looking-for" className="text-sm text-gray-700 dark:text-gray-300">Looking For *</Label>
              <Input
                id="looking-for"
                placeholder="What you need in a co-founder"
                value={profileInputs.lookingFor}
                onChange={(e) => setProfileInputs({ ...profileInputs, lookingFor: e.target.value })}
                disabled={isMatching}
                className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="equity" className="text-sm text-gray-700 dark:text-gray-300">Equity</Label>
                <Input
                  id="equity"
                  placeholder="50/50 split"
                  value={profile.preferences?.equity || ''}
                  onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences!, equity: e.target.value } })}
                  disabled={isMatching}
                  className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="commitment" className="text-sm text-gray-700 dark:text-gray-300">Commitment</Label>
                <Input
                  id="commitment"
                  placeholder="Long-term"
                  value={profile.preferences?.commitment || ''}
                  onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences!, commitment: e.target.value } })}
                  disabled={isMatching}
                  className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="working-style" className="text-sm text-gray-700 dark:text-gray-300">Working Style</Label>
                <Input
                  id="working-style"
                  placeholder="Remote-first"
                  value={profile.preferences?.workingStyle || ''}
                  onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences!, workingStyle: e.target.value } })}
                  disabled={isMatching}
                  className="border-teal-200/60 dark:border-teal-800/30 focus:border-teal-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreateProfile}
                disabled={!profile.name?.trim() || !profile.experience?.trim() || isMatching}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Match...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Find Match
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setShowProfileForm(false)} 
                variant="outline" 
                disabled={isMatching}
                className="border-teal-200/60 dark:border-teal-800/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
    </>
  )
}

