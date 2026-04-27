'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function EmailsPage() {
  const [emails, setEmails] = useState<Array<{ email: string; hasData: boolean; dataSize: number; data?: any }>>([])

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = () => {
    if (typeof window === 'undefined') return

    const emailList: Array<{ email: string; hasData: boolean; dataSize: number; data?: any }> = []
    
    // Check all localStorage keys
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

    // Also check for current email
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

  const formatDataSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              All Emails Stored in Database (LocalStorage)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emails.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No emails found in database
                </p>
              ) : (
                <>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <strong>Total Emails Found:</strong> {emails.length}
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {emails.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                              {item.email}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <div>Data Size: {formatDataSize(item.dataSize)}</div>
                              {item.data && (
                                <>
                                  <div>Has Chat Data: {item.data.chat?.conversations?.length || 0} conversations</div>
                                  <div>Has Calendar Data: {item.data.calendarEvents?.length || 0} events</div>
                                  <div>Has Venture Quest Data: {item.data.hypeos?.allGoals?.length || 0} goals</div>
                                  <div>Onboarding Completed: {item.data.entrepreneurProfile?.onboardingCompleted ? 'Yes' : 'No'}</div>
                                  {item.data.entrepreneurProfile?.name && (
                                    <div>Name: {item.data.entrepreneurProfile.name}</div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={loadEmails}
                      className="px-4 py-2 bg-[#005DFF] hover:bg-[#0048CC] text-white rounded-lg"
                    >
                      Refresh List
                    </button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

