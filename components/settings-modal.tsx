"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, User, Settings as SettingsIcon, Bell, Users, Building, Zap, CreditCard, UserCircle, Sliders, Check, Crown, MessageSquare, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { type Language } from "@/lib/translations"
import { useSessionSafe } from "@/lib/session-context"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

interface SettingsData {
  name: string
  email: string
  theme: string
  language: string
  timezone: string
  startWeekOnMonday: boolean
  autoTimezone: boolean
  openLinksInDesktop: boolean
  openOnStart: string
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: SettingsData) => void
  initialData?: SettingsData
}

export function SettingsModal({ isOpen, onClose, onSave, initialData }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const sessionContext = useSessionSafe()
  const { user } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("account")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  
  // Secret sequence to unlock feedback view: General -> People -> Teamspaces -> Teamspaces -> People -> General -> Upgrade -> General
  const secretSequence = ["general", "people", "teamspaces", "teamspaces", "people", "general", "upgrade", "general"]
  const [clickSequence, setClickSequence] = useState<string[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get user data from session
  const userName = sessionContext?.sessionData?.entrepreneurProfile?.name || ''
  const userEmail = sessionContext?.sessionData?.email || ''
  
  const [settingsData, setSettingsData] = useState<SettingsData>(
    initialData || {
      name: userName || "",
      email: userEmail || "",
      theme: theme || "system",
      language: language,
      timezone: "GMT+2:00",
      startWeekOnMonday: true,
      autoTimezone: true,
      openLinksInDesktop: true,
      openOnStart: "top-page-in-sidebar",
      notifications: {
        email: true,
        push: true,
        marketing: false
      }
    }
  )

  // Update settings data when session data loads
  useEffect(() => {
    if (userName || userEmail) {
      setSettingsData(prev => ({
        ...prev,
        name: userName || prev.name,
        email: userEmail || prev.email
      }))
    }
  }, [userName, userEmail])

  // Sync language from context
  useEffect(() => {
    setSettingsData(prev => ({ ...prev, language }))
  }, [language])

  // Update theme when it changes
  useEffect(() => {
    if (theme) {
      setSettingsData(prev => ({ ...prev, theme }))
    }
  }, [theme])

  const sidebarSections = [
    {
      title: t("settings.account"),
      items: [
        { id: "account", label: userName || t("settings.account"), icon: UserCircle },
        { id: "preferences", label: t("settings.preferences"), icon: Sliders },
        { id: "notifications", label: t("settings.notifications"), icon: Bell },
        { id: "feedback", label: "Feedback", icon: MessageSquare }
      ]
    },
    {
      title: "Workspace",
      items: [
        { id: "general", label: t("settings.general"), icon: SettingsIcon },
        { id: "people", label: t("settings.people"), icon: Users },
        { id: "teamspaces", label: t("settings.teamspaces"), icon: Building }
      ]
    },
    {
      title: "",
      items: [
        { id: "upgrade", label: t("settings.upgradePlan"), icon: CreditCard }
      ]
    }
  ]

  // Handle secret sequence for accessing feedback view
  const handleSectionClick = (sectionId: string) => {
    // Always update active section for normal behavior
    setActiveSection(sectionId)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Check secret sequence
    const newSequence = [...clickSequence, sectionId]
    
    // Check if we're still on the right track
    const expectedNext = secretSequence[newSequence.length - 1]
    if (sectionId === expectedNext) {
      setClickSequence(newSequence)
      
      // Check if sequence is complete
      if (newSequence.length === secretSequence.length) {
        // Sequence complete! Redirect to feedback view
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setClickSequence([]) // Reset sequence
        onClose() // Close modal first
        // Small delay to ensure modal closes, then navigate
        setTimeout(() => {
          router.push('/feedback/view')
        }, 100)
        return
      }
      
      // Set timeout to reset sequence after 5 seconds of inactivity
      timeoutRef.current = setTimeout(() => {
        setClickSequence([])
        timeoutRef.current = null
      }, 5000)
    } else {
      // Wrong click, reset sequence immediately
      setClickSequence([])
    }
  }

  // Reset sequence when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setClickSequence([])
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } else {
      // Reset when modal closes
      setClickSequence([])
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isOpen])
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSave = () => {
    // Update language in context when saved
    if (settingsData.language !== language) {
      setLanguage(settingsData.language as Language)
    }
    
    // Update session data with name and email changes
    if (sessionContext) {
      // Always update name if it's different (even if empty, to allow clearing)
      if (settingsData.name !== userName) {
        sessionContext.updateEntrepreneurProfile({
          name: settingsData.name || null
        })
        console.log('✅ Updated name in session:', settingsData.name)
      }
      // Always update email if it's different
      if (settingsData.email && settingsData.email !== userEmail) {
        sessionContext.updateEmail(settingsData.email)
        console.log('✅ Updated email in session:', settingsData.email)
      }
    }
    
    // Call the parent's onSave callback
    onSave(settingsData)
    
    // Show success feedback
    console.log('✅ Settings saved successfully')
    
    // Close modal after a brief delay to show the update
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("settings.account")}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.manageAccount")}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("settings.usersName")}
                </Label>
                <Input
                  id="name"
                  value={settingsData.name}
                  onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("settings.usersEmail")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={settingsData.email}
                  onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              {/* Reset Onboarding Button for Testing */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Testing & Development
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (confirm('Reset onboarding? This will allow you to go through onboarding again. Your other data will be preserved.')) {
                      // Update Supabase profile to mark onboarding as incomplete
                      if (user?.id) {
                        try {
                          const { supabase } = await import('@/lib/supabase')
                          const { error } = await supabase
                            .from('user_profiles')
                            .update({ onboarding_completed: false })
                            .eq('id', user.id)
                          
                          if (error) {
                            console.error('Error resetting onboarding:', error)
                            alert('Failed to reset onboarding. Please try again.')
                            return
                          }
                          
                          // Update session context
                          if (sessionContext) {
                            sessionContext.updateEntrepreneurProfile({
                              onboardingCompleted: false
                            })
                          }
                          
                          alert('Onboarding reset! Please refresh the page to see the onboarding flow again.')
                          window.location.reload()
                        } catch (error) {
                          console.error('Error resetting onboarding:', error)
                          alert('Failed to reset onboarding. Please try again.')
                        }
                      } else {
                        alert('Please sign in to reset onboarding')
                      }
                    }
                  }}
                  className="w-full"
                >
                  Reset Onboarding (For Testing)
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will reset onboarding flags so you can go through onboarding again.
                </p>
              </div>

              {/* Delete Account Section */}
              <div className="pt-6 border-t border-red-200 dark:border-red-800">
                <Label className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 block">
                  Danger Zone
                </Label>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => {
                    const confirmed = confirm(
                      '⚠️ WARNING: This will permanently delete your account and all associated data.\n\n' +
                      'This action cannot be undone. Your account will be removed from Supabase and all local data will be cleared.\n\n' +
                      'Are you absolutely sure you want to delete your account?'
                    )
                    
                    if (!confirmed) return

                    const doubleConfirmed = confirm(
                      'This is your last chance to cancel.\n\n' +
                      'Clicking OK will permanently delete your account. This cannot be undone.\n\n' +
                      'Are you 100% sure?'
                    )

                    if (!doubleConfirmed) return

                    setIsDeletingAccount(true)

                    try {
                      // Clear all local data first
                      if (typeof window !== 'undefined') {
                        // Clear ALL localStorage data
                        localStorage.clear()
                        
                        // Clear ALL sessionStorage data
                        sessionStorage.clear()
                      }

                      // Clear session context
                      if (sessionContext) {
                        sessionContext.clearSession()
                      }

                      // Delete account from Supabase if user is authenticated
                      if (user?.id && supabase) {
                        try {
                          // Get the current session token for authorization
                          const { data: { session } } = await supabase.auth.getSession()
                          const token = session?.access_token

                          // Call API route to delete account
                          const response = await fetch('/api/delete-account', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              ...(token && { 'Authorization': `Bearer ${token}` }),
                            },
                            body: JSON.stringify({ userId: user.id }),
                          })

                          if (!response.ok) {
                            const errorData = await response.json()
                            throw new Error(errorData.error || 'Failed to delete account')
                          }

                          // Sign out from Supabase after deletion
                          await supabase.auth.signOut()
                        } catch (error) {
                          console.error('Error deleting account:', error)
                          alert('Error deleting account. Please try again or contact support.')
                          setIsDeletingAccount(false)
                          return
                        }
                      }

                      // Close modal
                      onClose()

                      // Redirect to home page (onboarding will show)
                      window.location.href = '/'
                    } catch (error) {
                      console.error('Error in delete account process:', error)
                      alert('An error occurred while deleting your account. Please try again.')
                      setIsDeletingAccount(false)
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeletingAccount}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeletingAccount ? 'Deleting Account...' : 'Delete Account Permanently'}
                </Button>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  This will permanently delete your account from Supabase and clear all local data. You can create a new account with the same email if you wish.
                </p>
              </div>
            </div>
          </div>
        )
      case "preferences":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("settings.preferences")}</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">{t("settings.appearance")}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t("settings.customizeAppearance")}</p>
                <Select
                  value={settingsData.theme}
                  onValueChange={(value) => {
                    setSettingsData({ ...settingsData, theme: value })
                    setTheme(value)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("settings.light")}</SelectItem>
                    <SelectItem value="dark">{t("settings.dark")}</SelectItem>
                    <SelectItem value="system">{t("settings.useSystemSetting")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">{t("settings.languageAndTime")}</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t("settings.language")}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("settings.changeLanguage")}</p>
                    <Select
                      value={settingsData.language}
                      onValueChange={(value) => {
                        setSettingsData({ ...settingsData, language: value })
                        // Immediately update language when changed
                        setLanguage(value as Language)
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Espa�ol (Spanish)</SelectItem>
                        <SelectItem value="fr">Fran�ais (French)</SelectItem>
                        <SelectItem value="de">Deutsch (German)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.startWeekOnMonday")}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">This will change how all calendars in your app look.</p>
                    </div>
                    <Switch
                      checked={settingsData.startWeekOnMonday}
                      onCheckedChange={(checked) => 
                        setSettingsData({ ...settingsData, startWeekOnMonday: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.setTimezoneAutomatically")}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reminders, notifications and emails are delivered based on your time zone.</p>
                    </div>
                    <Switch
                      checked={settingsData.autoTimezone}
                      onCheckedChange={(checked) => 
                        setSettingsData({ ...settingsData, autoTimezone: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t("settings.timezone")}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current timezone setting.</p>
                    <Select
                      value={settingsData.timezone}
                      onValueChange={(value) => setSettingsData({ ...settingsData, timezone: value })}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GMT+2:00">(GMT+2:00) Johannesburg</SelectItem>
                        <SelectItem value="GMT+0:00">(GMT+0:00) London</SelectItem>
                        <SelectItem value="GMT-5:00">(GMT-5:00) New York</SelectItem>
                        <SelectItem value="GMT+1:00">(GMT+1:00) Paris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">{t("settings.desktopApp")}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.openLinksInDesktop")}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">You must have the Windows app installed.</p>
                    </div>
                    <Switch
                      checked={settingsData.openLinksInDesktop}
                      onCheckedChange={(checked) => 
                        setSettingsData({ ...settingsData, openLinksInDesktop: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t("settings.openOnStart")}</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Choose what to show when Notion starts or when you switch workspaces.</p>
                    <Select
                      value={settingsData.openOnStart}
                      onValueChange={(value) => setSettingsData({ ...settingsData, openOnStart: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-page-in-sidebar">{t("settings.topPageInSidebar")}</SelectItem>
                        <SelectItem value="last-visited">{t("settings.lastVisitedPage")}</SelectItem>
                        <SelectItem value="home">{t("settings.home")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "feedback":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Feedback</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Share your thoughts and help us improve DreamScale</p>
            </div>
            <div className="space-y-4">
              <div className="pt-4">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Feedback
                </Label>
                <Link href="/feedback" onClick={onClose}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  Share your thoughts, report issues, or suggest features to help us improve DreamScale.
                </p>
              </div>
            </div>
          </div>
        )
      case "upgrade":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Upgrade Plan</h2>
              <p className="text-sm text-gray-500">Choose the plan that works best for you</p>
            </div>
            
            <div className="grid gap-6">
              {/* Free Plan */}
              <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Free</h3>
                      <span className="text-2xl font-bold text-gray-900">$0</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Perfect for getting started</p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      <li>� Basic features</li>
                      <li>� Limited projects</li>
                      <li>� Community support</li>
                    </ul>
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50/30 relative">
                <div className="absolute -top-3 left-6">
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-blue-900">Pro</h3>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-900">$0</span>
                        <span className="text-sm text-blue-600">/month</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 mb-4">Prices are coming soon</p>
                    <ul className="text-sm text-blue-700 space-y-2 mb-4">
                      <li>� All Free features</li>
                      <li>� Unlimited projects</li>
                      <li>� Priority support</li>
                      <li>� Advanced analytics</li>
                    </ul>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Upgrade to Pro
                    </Button>
                  </div>
                </div>
              </div>

              {/* Yearly Plan */}
              <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50/30 relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-green-900">Yearly</h3>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-900">$0</span>
                        <span className="text-sm text-green-600">/year</span>
                      </div>
                    </div>
                    <p className="text-sm text-green-600 mb-4">Prices are coming soon</p>
                    <ul className="text-sm text-green-700 space-y-2 mb-4">
                      <li>� All Pro features</li>
                      <li>� Team collaboration</li>
                      <li>� Custom integrations</li>
                      <li>� Dedicated support</li>
                    </ul>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Upgrade to Yearly
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{activeSection}</h2>
              <p className="text-sm text-gray-500">This section is coming soon.</p>
            </div>
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl h-[600px] flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("settings.preferences")}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {sidebarSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-all duration-300 group ${
                        activeSection === item.id
                          ? 'bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 transition-all duration-300 ${
                        activeSection === item.id 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {renderContent()}
          </div>
          
          {/* Save Button - Fixed at bottom */}
          <div className="sticky bottom-0 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}