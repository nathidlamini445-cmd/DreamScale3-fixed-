"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Send, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useSessionSafe } from "@/lib/session-context"
import { useAuth } from "@/contexts/AuthContext"
import * as supabaseData from "@/lib/supabase-data"

export default function FeedbackPage() {
  const { user } = useAuth()
  const sessionContext = useSessionSafe()
  const [feedback, setFeedback] = useState("")
  const [testimonial, setTestimonial] = useState("")
  const [email, setEmail] = useState(user?.email || sessionContext?.sessionData?.email || "")
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hadTestimonial, setHadTestimonial] = useState(false)

  // Enable scrolling on feedback page
  useEffect(() => {
    document.documentElement.setAttribute('data-feedback-page', 'true')
    document.body.setAttribute('data-feedback-page', 'true')
    
    return () => {
      document.documentElement.removeAttribute('data-feedback-page')
      document.body.removeAttribute('data-feedback-page')
    }
  }, [])

  const issueOptions = [
    "Bug",
    "App is glitching",
    "Software is slow",
    "Feature request",
    "UI/UX issue",
    "Login problem",
    "Data not saving",
    "Error message",
    "Missing feature",
    "Confusing interface",
    "Performance issue",
    "Other"
  ]

  const feedbackCategories = [
    "General Feedback",
    "Bug Report",
    "Feature Request",
    "UI/UX Improvement",
    "Performance Issue",
    "Documentation",
    "Integration Request",
    "Accessibility",
    "Security Concern",
    "Other"
  ]

  const priorityOptions = [
    "Low",
    "Medium",
    "High",
    "Critical"
  ]

  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedPriority, setSelectedPriority] = useState<string>("")

  const toggleIssue = (issue: string) => {
    setSelectedIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.trim() && !testimonial.trim()) {
      alert("Please enter your feedback or testimonial")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Save feedback to Supabase (if authenticated) or localStorage
      if (feedback.trim()) {
        const feedbackData = {
          feedback,
          email: email || "anonymous",
          category: selectedCategory,
          priority: selectedPriority,
          issues: selectedIssues,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          url: typeof window !== 'undefined' ? window.location.href : ''
        }

        try {
          // Save to Supabase if authenticated
          if (user?.id) {
            await supabaseData.saveFeedback(user.id, email || null, feedbackData)
            console.log('✅ Saved feedback to Supabase')
          }

          // Also save to localStorage as backup
          const existingFeedback = typeof window !== 'undefined' 
            ? JSON.parse(localStorage.getItem('dreamscale_feedback') || '[]')
            : []
          
          existingFeedback.push(feedbackData)
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('dreamscale_feedback', JSON.stringify(existingFeedback))
          }
        } catch (error) {
          console.error('Error saving feedback:', error)
          // Still save to localStorage as fallback
          const existingFeedback = typeof window !== 'undefined' 
            ? JSON.parse(localStorage.getItem('dreamscale_feedback') || '[]')
            : []
          existingFeedback.push(feedbackData)
          if (typeof window !== 'undefined') {
            localStorage.setItem('dreamscale_feedback', JSON.stringify(existingFeedback))
          }
        }
      }

      // Save testimonial separately if provided
      if (testimonial.trim()) {
        try {
          // Save to Supabase if authenticated
          if (user?.id) {
            await supabaseData.saveTestimonial(user.id, email || null, testimonial)
            console.log('✅ Saved testimonial to Supabase')
          }

          // Also save to localStorage as backup
          const testimonialData = {
            testimonial,
            email: email || "anonymous",
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            url: typeof window !== 'undefined' ? window.location.href : ''
          }

          const existingTestimonials = typeof window !== 'undefined' 
            ? JSON.parse(localStorage.getItem('dreamscale_testimonials') || '[]')
            : []
          
          existingTestimonials.push(testimonialData)
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('dreamscale_testimonials', JSON.stringify(existingTestimonials))
          }
        } catch (error) {
          console.error('Error saving testimonial:', error)
          // Still save to localStorage as fallback
          const testimonialData = {
            testimonial,
            email: email || "anonymous",
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            url: typeof window !== 'undefined' ? window.location.href : ''
          }
          const existingTestimonials = typeof window !== 'undefined' 
            ? JSON.parse(localStorage.getItem('dreamscale_testimonials') || '[]')
            : []
          existingTestimonials.push(testimonialData)
          if (typeof window !== 'undefined') {
            localStorage.setItem('dreamscale_testimonials', JSON.stringify(existingTestimonials))
          }
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setHadTestimonial(testimonial.trim().length > 0)
      setIsSubmitted(true)
      setFeedback("")
      setTestimonial("")
      setSelectedCategory("")
      setSelectedPriority("")
      setSelectedIssues([])
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="mt-2">
              Your feedback{hadTestimonial ? ' and testimonial' : ''} has been submitted successfully. We appreciate your input!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950" style={{ overflowY: 'auto', height: 'auto', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#39d2c0]/10 dark:bg-[#39d2c0]/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#39d2c0]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Share Your Feedback
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Help us improve DreamScale by sharing your thoughts, issues, or suggestions
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>What's on your mind?</CardTitle>
            <CardDescription>
              Your feedback helps us make DreamScale better. Whether it's a bug, feature request, or general feedback, we'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Category Chips */}
              <div className="space-y-2">
                <Label>Category (Select one)</Label>
                <div className="flex flex-wrap gap-2">
                  {feedbackCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-[#005DFF] text-white shadow-md hover:bg-[#0048cc] border-2 border-[#005DFF]'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Chips */}
              <div className="space-y-2">
                <Label>Priority (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setSelectedPriority(priority)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedPriority === priority
                          ? priority === "Critical"
                            ? 'bg-red-600 text-white shadow-md hover:bg-red-700 border-2 border-red-600'
                            : priority === "High"
                            ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600 border-2 border-orange-500'
                            : priority === "Medium"
                            ? 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600 border-2 border-yellow-500'
                            : 'bg-[#39d2c0] text-white shadow-md hover:bg-[#2bb3a3] border-2 border-[#39d2c0]'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue Type Chips */}
              <div className="space-y-2">
                <Label>Specific Issues (Select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {issueOptions.map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => toggleIssue(issue)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedIssues.includes(issue)
                          ? 'bg-[#39d2c0] text-white shadow-md hover:bg-[#2bb3a3] border-2 border-[#39d2c0]'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
                {selectedIssues.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Selected: {selectedIssues.join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We'll use this to follow up if needed. If you're logged in, your email is pre-filled.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback *</Label>
                <div className={`relative transition-all duration-300 ${
                  selectedIssues.includes("Other") || selectedIssues.includes("Feature request")
                    ? 'ring-4 ring-blue-500/50 dark:ring-blue-400/50 rounded-lg p-1 animate-pulse-twice' 
                    : ''
                }`}>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us about any issues you're facing, features you'd like to see, or general feedback about the software..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={10}
                    disabled={isSubmitting}
                    className={`resize-none transition-all duration-300 ${
                      selectedIssues.includes("Other") || selectedIssues.includes("Feature request")
                        ? 'border-blue-500 dark:border-blue-400 focus:border-blue-600 dark:focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20'
                        : ''
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Be as detailed as possible. The more information you provide, the better we can help!
                </p>
              </div>

              {/* Testimonial Section */}
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Label htmlFor="testimonial">Your Testimonial (Optional)</Label>
                <Textarea
                  id="testimonial"
                  placeholder="Share your success story with DreamScale! How has it helped you? What do you love about it? Your testimonial could inspire others..."
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  rows={8}
                  disabled={isSubmitting}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We'd love to hear about your positive experience! Testimonials help others discover the value of DreamScale.
                </p>
              </div>

              <Button
                type="submit"
                disabled={(!feedback.trim() && !testimonial.trim()) || isSubmitting}
                className="w-full bg-[#39d2c0] hover:bg-[#2bb3a3] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Send className="w-4 h-4 mr-2 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">Note:</strong> Your feedback is stored locally in your browser. 
            For production, this will be sent to our feedback system for review.
          </p>
        </div>
      </div>
    </div>
  )
}

