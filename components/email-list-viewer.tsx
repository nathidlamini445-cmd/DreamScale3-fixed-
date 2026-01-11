'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Mail } from 'lucide-react'

export function EmailListViewer() {
  const [emails, setEmails] = useState<Array<{ email: string; hasData: boolean; dataSize: number }>>([])

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = () => {
    if (typeof window === 'undefined') return

    const emailList: Array<{ email: string; hasData: boolean; dataSize: number; data?: any }> = []
    
    // Check all localStorage keys - get ALL emails from ALL users
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      // Check for email-keyed session storage
      if (key.startsWith('dreamscale_session_')) {
        const email = key.replace('dreamscale_session_', '')
        const data = localStorage.getItem(key)
        
        if (data) {
          try {
            const parsed = JSON.parse(data)
            const dataSize = JSON.stringify(parsed).length
            emailList.push({
              email,
              hasData: true,
              dataSize,
              data: parsed
            })
          } catch (e) {
            emailList.push({
              email,
              hasData: false,
              dataSize: 0
            })
          }
        }
      }
    }

    // Also check for current email (in case it's not in session storage yet)
    const currentEmail = localStorage.getItem('dreamscale_current_email')
    if (currentEmail && !emailList.find(e => e.email === currentEmail)) {
      emailList.push({
        email: currentEmail,
        hasData: true,
        dataSize: 0
      })
    }

    // Sort by email
    emailList.sort((a, b) => a.email.localeCompare(b.email))
    setEmails(emailList)
  }

  const deleteEmail = (email: string) => {
    if (typeof window === 'undefined') return
    if (!confirm(`Are you sure you want to delete all data for ${email}? This cannot be undone.`)) return

    const storageKey = `dreamscale_session_${email}`
    localStorage.removeItem(storageKey)
    
    // If it's the current email, also remove that
    const currentEmail = localStorage.getItem('dreamscale_current_email')
    if (currentEmail === email) {
      localStorage.removeItem('dreamscale_current_email')
    }

    loadEmails() // Reload the list
  }

  const formatDataSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Stored Emails in Database (LocalStorage)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {emails.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No emails found in database
            </p>
          ) : (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Found {emails.length} email{emails.length !== 1 ? 's' : ''} with stored data
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {emails.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <div>{item.hasData ? `Data size: ${formatDataSize(item.dataSize)}` : 'No data'}</div>
                        {item.data && (
                          <>
                            <div>Chat: {item.data.chat?.conversations?.length || 0} conversations</div>
                            <div>Calendar: {item.data.calendarEvents?.length || 0} events</div>
                            <div>Venture Quest: {item.data.hypeos?.allGoals?.length || 0} goals</div>
                            <div>Onboarding: {item.data.entrepreneurProfile?.onboardingCompleted ? 'Completed' : 'Not completed'}</div>
                            {item.data.entrepreneurProfile?.name && (
                              <div>Name: {item.data.entrepreneurProfile.name}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEmail(item.email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={loadEmails}
                  className="w-full"
                >
                  Refresh List
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

