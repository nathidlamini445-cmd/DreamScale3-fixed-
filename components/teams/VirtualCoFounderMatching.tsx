"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Heart, AlertCircle, CheckCircle2 } from "lucide-react"
import { CoFounderMatch, CoFounderProfile } from '@/lib/teams-types'
import { Badge } from "@/components/ui/badge"
import { AIResponse } from '@/components/ai-response'
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'

interface VirtualCoFounderMatchingProps {
  matches: CoFounderMatch[]
  onAddMatch: (match: CoFounderMatch) => void
}

export default function VirtualCoFounderMatching({ matches, onAddMatch }: VirtualCoFounderMatchingProps) {
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
        profile2: matchData.matchedProfile || {
          id: 'ai-generated',
          name: 'AI Generated Profile',
          skills: [],
          values: [],
          availability: 'full-time',
          experience: 'AI-generated complementary profile',
          lookingFor: [],
          preferences: { equity: '', commitment: '', workingStyle: '' },
          date: new Date().toISOString()
        },
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

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Create Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#2563eb]" />
            Virtual Co-founder Matching
          </CardTitle>
          <CardDescription>
            Find your ideal co-founder based on complementary skills, values, and working style
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showProfileForm ? (
            <Button onClick={() => setShowProfileForm(true)} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Profile & Find Match
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={isMatching}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability *</Label>
                  <Select 
                    value={profile.availability} 
                    onValueChange={(value: CoFounderProfile['availability']) => setProfile({ ...profile, availability: value })}
                  >
                    <SelectTrigger id="availability" disabled={isMatching}>
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
              <div className="space-y-2">
                <Label htmlFor="experience">Experience *</Label>
                <Textarea
                  id="experience"
                  placeholder="10+ years in SaaS, built 2 successful startups..."
                  value={profile.experience || ''}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  rows={3}
                  disabled={isMatching}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  disabled={isMatching}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated) *</Label>
                <Input
                  id="skills"
                  placeholder="Product Management, Marketing, Sales"
                  value={profileInputs.skills}
                  onChange={(e) => setProfileInputs({ ...profileInputs, skills: e.target.value })}
                  disabled={isMatching}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="values">Values (comma-separated) *</Label>
                <Input
                  id="values"
                  placeholder="Transparency, Innovation, Work-life balance"
                  value={profileInputs.values}
                  onChange={(e) => setProfileInputs({ ...profileInputs, values: e.target.value })}
                  disabled={isMatching}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="looking-for">Looking For (comma-separated) *</Label>
                <Input
                  id="looking-for"
                  placeholder="Technical co-founder, Marketing expertise, Sales background"
                  value={profileInputs.lookingFor}
                  onChange={(e) => setProfileInputs({ ...profileInputs, lookingFor: e.target.value })}
                  disabled={isMatching}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equity">Equity Expectations</Label>
                  <Input
                    id="equity"
                    placeholder="50/50 split"
                    value={profile.preferences?.equity || ''}
                    onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences!, equity: e.target.value } })}
                    disabled={isMatching}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commitment">Commitment Level</Label>
                  <Input
                    id="commitment"
                    placeholder="Long-term partnership"
                    value={profile.preferences?.commitment || ''}
                    onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences!, commitment: e.target.value } })}
                    disabled={isMatching}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working-style">Working Style</Label>
                  <Input
                    id="working-style"
                    placeholder="Remote-first, async communication"
                    value={profile.preferences?.workingStyle || ''}
                    onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences!, workingStyle: e.target.value } })}
                    disabled={isMatching}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateProfile}
                  disabled={!profile.name?.trim() || !profile.experience?.trim() || isMatching}
                  className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8]"
                >
                  {isMatching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding Match...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find Co-founder Match
                    </>
                  )}
                </Button>
                <Button onClick={() => setShowProfileForm(false)} variant="outline" disabled={isMatching}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Co-founder Matches ({matches.length})</h3>
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#2563eb]" />
                    Match Found
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-2xl font-bold", getMatchColor(match.matchScore))}>
                      {match.matchScore}%
                    </span>
                    <Badge className={cn(
                      match.matchScore >= 80 && 'bg-green-100 text-green-800',
                      match.matchScore >= 60 && match.matchScore < 80 && 'bg-yellow-100 text-yellow-800',
                      match.matchScore < 60 && 'bg-red-100 text-red-800'
                    )}>
                      Match Score
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Matched on {new Date(match.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profiles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{match.profile1.name}</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Skills:</strong> {match.profile1.skills.join(', ') || 'N/A'}</p>
                        <p><strong>Values:</strong> {match.profile1.values.join(', ') || 'N/A'}</p>
                        <p><strong>Availability:</strong> {match.profile1.availability}</p>
                        {match.profile1.location && <p><strong>Location:</strong> {match.profile1.location}</p>}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 dark:bg-purple-900/20">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{match.profile2.name}</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Skills:</strong> {match.profile2.skills.join(', ') || 'N/A'}</p>
                        <p><strong>Values:</strong> {match.profile2.values.join(', ') || 'N/A'}</p>
                        <p><strong>Availability:</strong> {match.profile2.availability}</p>
                        {match.profile2.location && <p><strong>Location:</strong> {match.profile2.location}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Match Analysis */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Match Analysis</h4>
                    <div className="space-y-4">
                      {match.analysis.complementarySkills.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Complementary Skills
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {match.analysis.complementarySkills.map((skill, i) => (
                              <Badge key={i} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.analysis.sharedValues.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            Shared Values
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {match.analysis.sharedValues.map((value, i) => (
                              <Badge key={i} variant="outline">{value}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.analysis.potentialChallenges.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            Potential Challenges
                          </h5>
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                            {match.analysis.potentialChallenges.map((challenge, i) => (
                              <li key={i}>{challenge}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Collaboration Fit</h5>
                        <Progress value={match.analysis.collaborationFit} className="h-3 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{match.analysis.collaborationFit}% compatibility</p>
                      </div>
                      {match.analysis.recommendation && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Recommendation</h5>
                          <AIResponse content={match.analysis.recommendation} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Trial Period */}
                {match.trialPeriod && (
                  <Card className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Suggested Trial Period</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {new Date(match.trialPeriod.startDate).toLocaleDateString()} - {new Date(match.trialPeriod.endDate).toLocaleDateString()}
                      </p>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Milestones:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {match.trialPeriod.milestones.map((milestone, i) => (
                          <li key={i}>{milestone}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

