"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, Calendar, Share2, Copy, ExternalLink, X, Globe, MapPinIcon } from "lucide-react"

interface Event {
  id: string
  title: string
  type: "CONFERENCE" | "WORKSHOP" | "MEETUP" | "VIRTUAL" | "EXHIBITION"
  status: "Free" | "Paid"
  price?: string
  date: string
  time: string
  location: string
  address?: string
  city: string
  distance?: number
  attendees: string
  description: string
  fullDescription: string
  host: {
    name: string
    organization: string
    avatar?: string
  }
  tags: string[]
  coordinates: {
    lat: number
    lng: number
  }
  isVirtual: boolean
  registrationUrl?: string
}

// Business & Networking Events - Updated 2025
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Startup Founder Networking Mixer",
    type: "MEETUP",
    status: "Free",
    date: "Jan 15, 2025",
    time: "6:00 PM - 9:00 PM",
    location: "WeWork Times Square",
    address: "1460 Broadway, 12th Floor",
    city: "New York",
    distance: 2.3,
    attendees: "250",
    description: "Connect with fellow entrepreneurs, investors, and startup founders.",
    fullDescription: "Join us for an evening of networking with startup founders, investors, and business leaders. Share your journey, exchange ideas, and build valuable connections. Perfect for entrepreneurs at any stage looking to expand their network and learn from peers.",
    host: {
      name: "Sarah Johnson",
      organization: "Startup Network",
      avatar: "SJ"
    },
    tags: ["Networking", "Startups", "Entrepreneurship", "Business"],
    coordinates: { lat: 40.7128, lng: -74.0060 },
    isVirtual: false,
    registrationUrl: "https://www.eventbrite.com/e/startup-founder-networking-mixer-tickets-123456789"
  },
  {
    id: "2",
    title: "Business Strategy Workshop",
    type: "WORKSHOP",
    status: "Paid",
    price: "$149",
    date: "Jan 18, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Moscone Center",
    address: "747 Howard Street",
    city: "San Francisco",
    distance: 5.7,
    attendees: "120",
    description: "Learn strategic planning and business growth strategies from industry experts.",
    fullDescription: "Master the fundamentals of business strategy in this comprehensive workshop. Learn about market analysis, competitive positioning, growth strategies, and strategic planning frameworks. Includes case studies, group exercises, and one-on-one strategy sessions.",
    host: {
      name: "Michael Chen",
      organization: "Business Strategy Institute",
      avatar: "MC"
    },
    tags: ["Strategy", "Business", "Growth", "Planning"],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    isVirtual: false,
    registrationUrl: "https://www.meetup.com/business-strategy-institute/events/123456789"
  },
  {
    id: "3",
    title: "Digital Marketing Summit",
    type: "VIRTUAL",
    status: "Free",
    date: "Jan 20, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Virtual Event",
    city: "Online",
    attendees: "3.5k",
    description: "Explore the latest trends in digital marketing and growth strategies.",
    fullDescription: "Join leading marketing experts as they discuss the latest developments in digital marketing, SEO, social media strategy, content marketing, and growth hacking. Learn actionable strategies you can implement immediately to grow your business.",
    host: {
      name: "Dr. Lisa Martinez",
      organization: "Digital Marketing Academy",
      avatar: "LM"
    },
    tags: ["Marketing", "Digital", "Growth", "Strategy"],
    coordinates: { lat: 0, lng: 0 },
    isVirtual: true,
    registrationUrl: "https://www.zoom.us/webinar/register/123456789"
  },
  {
    id: "4",
    title: "Sales & Revenue Optimization",
    type: "WORKSHOP",
    status: "Paid",
    price: "$199",
    date: "Jan 22, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Chicago Marriott Downtown",
    address: "540 North Michigan Avenue",
    city: "Chicago",
    distance: 8.2,
    attendees: "85",
    description: "Master sales techniques and revenue optimization strategies.",
    fullDescription: "Deep dive into sales methodologies, customer acquisition, conversion optimization, and revenue growth strategies. Work on real sales scenarios and learn from experienced sales leaders. Includes role-playing exercises and sales process optimization.",
    host: {
      name: "David Thompson",
      organization: "Sales Excellence Group",
      avatar: "DT"
    },
    tags: ["Sales", "Revenue", "Business", "Growth"],
    coordinates: { lat: 41.8781, lng: -87.6298 },
    isVirtual: false,
    registrationUrl: "https://www.eventbrite.com/e/sales-revenue-optimization-tickets-987654321"
  },
  {
    id: "5",
    title: "Entrepreneur Pitch Night",
    type: "MEETUP",
    status: "Free",
    date: "Jan 25, 2025",
    time: "7:00 PM - 10:00 PM",
    location: "LA Tech Hub",
    address: "1234 Innovation Drive",
    city: "Los Angeles",
    distance: 12.5,
    attendees: "180",
    description: "Watch entrepreneurs pitch their ideas and network with investors.",
    fullDescription: "Experience live pitches from 5 entrepreneurs seeking funding. Network with investors, mentors, and fellow entrepreneurs. Perfect opportunity to practice your pitch, get feedback, and connect with potential investors and partners.",
    host: {
      name: "Jennifer Park",
      organization: "Entrepreneur Network",
      avatar: "JP"
    },
    tags: ["Pitching", "Investors", "Startups", "Networking"],
    coordinates: { lat: 34.0522, lng: -118.2437 },
    isVirtual: false,
    registrationUrl: "https://www.eventbrite.com/e/entrepreneur-pitch-night-tickets-456789123"
  },
  {
    id: "6",
    title: "Business Finance & Funding Workshop",
    type: "WORKSHOP",
    status: "Paid",
    price: "$129",
    date: "Jan 28, 2025",
    time: "2:00 PM - 6:00 PM",
    location: "Miami Financial Center",
    address: "200 South Biscayne Boulevard",
    city: "Miami",
    distance: 15.8,
    attendees: "65",
    description: "Learn about business financing, fundraising, and financial management.",
    fullDescription: "Discover how to secure funding for your business, manage finances effectively, and understand financial statements. Learn about different funding options including bootstrapping, angel investors, venture capital, and loans. Includes financial planning templates and investor pitch deck review.",
    host: {
      name: "Robert Williams",
      organization: "Business Finance Academy",
      avatar: "RW"
    },
    tags: ["Finance", "Funding", "Business", "Investment"],
    coordinates: { lat: 25.7617, lng: -80.1918 },
    isVirtual: false,
    registrationUrl: "https://www.meetup.com/business-finance-academy/events/789123456"
  },
  {
    id: "7",
    title: "Local Business Networking Meetup",
    type: "MEETUP",
    status: "Free",
    date: "Jan 30, 2025",
    time: "6:00 PM - 8:00 PM",
    location: "Chamber of Commerce",
    address: "100 Main Street",
    city: "Local City",
    distance: 1.2,
    attendees: "45",
    description: "Connect with local business owners and entrepreneurs in your area.",
    fullDescription: "Join our monthly business networking meetup where local entrepreneurs and business owners come together to share experiences, exchange referrals, and build relationships. Bring your business cards and be ready to network!",
    host: {
      name: "Local Business Network",
      organization: "Chamber of Commerce",
      avatar: "LBN"
    },
    tags: ["Networking", "Local Business", "Community", "Entrepreneurship"],
    coordinates: { lat: 40.7589, lng: -73.9851 },
    isVirtual: false,
    registrationUrl: "https://www.meetup.com/local-business-network/events/111222333"
  },
  {
    id: "8",
    title: "Leadership & Management Training",
    type: "WORKSHOP",
    status: "Paid",
    price: "$179",
    date: "Feb 2, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Executive Training Center",
    address: "500 Corporate Parkway",
    city: "Nearby Town",
    distance: 3.5,
    attendees: "40",
    description: "Develop leadership skills and learn effective team management strategies.",
    fullDescription: "Master the fundamentals of leadership and management in this intensive workshop. Learn about team building, communication, conflict resolution, delegation, and performance management. Includes leadership assessments and personalized development plans.",
    host: {
      name: "Amanda Foster",
      organization: "Leadership Development Institute",
      avatar: "AF"
    },
    tags: ["Leadership", "Management", "Business", "Skills"],
    coordinates: { lat: 40.7505, lng: -73.9934 },
    isVirtual: false,
    registrationUrl: "https://www.eventbrite.com/e/leadership-management-training-tickets-444555666"
  }
]

export function EventsTimeline() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [userCity, setUserCity] = useState<string>('')
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompting' | 'unknown'>('unknown')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyEvent, setNotifyEvent] = useState<Event | null>(null)

  // Reverse geocoding to get city name from coordinates
  const getCityFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
      const data = await response.json()
      return data.city || data.locality || data.principalSubdivision || 'Unknown Location'
    } catch (error) {
      console.error('Error getting city name:', error)
      return 'Unknown Location'
    }
  }

  // Request location permission and get user's location
  useEffect(() => {
    const getLocation = async () => {
      if (!navigator.geolocation) {
        setLocationPermission('denied')
        setEvents(mockEvents)
        return
      }

      setLocationPermission('prompting')
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          setLocationPermission('granted')
          
          // Get city name from coordinates
          const cityName = await getCityFromCoordinates(latitude, longitude)
          setUserCity(cityName)
          
          // Calculate distances and sort events
          const eventsWithDistance = mockEvents.map(event => ({
            ...event,
            distance: event.isVirtual ? 0 : calculateDistance(
              latitude, longitude, 
              event.coordinates.lat, event.coordinates.lng
            )
          })).sort((a, b) => a.distance - b.distance)
          
          setEvents(eventsWithDistance)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationPermission('denied')
          setEvents(mockEvents)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    }

    getLocation()
  }, [])

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 10) / 10
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
  }

  const handleCloseModal = () => {
    setSelectedEvent(null)
  }

  const handleShareInstagram = () => {
    if (selectedEvent) {
      const text = `Check out this amazing event: ${selectedEvent.title} on ${selectedEvent.date} at ${selectedEvent.location}!`
      const url = `https://www.instagram.com/stories/yourusername/`
      window.open(`https://www.instagram.com/`, '_blank')
    }
  }

  const handleCopyLink = async () => {
    if (selectedEvent) {
      const eventUrl = `${window.location.origin}/events/${selectedEvent.id}`
      try {
        await navigator.clipboard.writeText(eventUrl)
        // You could add a toast notification here
        alert('Event link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy: ', err)
      }
    }
  }

  const handleAddToCalendar = () => {
    if (selectedEvent) {
      const startDate = new Date(`${selectedEvent.date} ${selectedEvent.time.split(' - ')[0]}`)
      const endDate = new Date(`${selectedEvent.date} ${selectedEvent.time.split(' - ')[1]}`)
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }
      
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedEvent.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(selectedEvent.fullDescription)}&location=${encodeURIComponent(selectedEvent.location)}`
      
      window.open(calendarUrl, '_blank')
    }
  }

  const handleNotifyMe = (event: Event) => {
    setNotifyEvent(event)
    setShowNotifyModal(true)
  }

  const handleSubmitNotification = async () => {
    if (notifyEmail && notifyEvent) {
      // Here you would typically send the email to your backend
      // For now, we'll just show a success message
      alert(`We'll notify you at ${notifyEmail} when similar events to "${notifyEvent.title}" are available in your area!`)
      setShowNotifyModal(false)
      setNotifyEmail('')
      setNotifyEvent(null)
    }
  }

  const isInternationalEvent = (event: Event) => {
    if (!userCity || event.isVirtual) return false
    // Only consider events over 500 miles as international to show more local events
    return event.distance && event.distance > 500
  }

  const getLocationStatus = () => {
    switch (locationPermission) {
      case 'granted':
        return userCity ? `📍 Located in ${userCity}` : '📍 Location detected'
      case 'denied':
        return '📍 Location access denied - showing all events'
      case 'prompting':
        return '📍 Detecting your location...'
      default:
        return '📍 Detecting your location...'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Networking Events Near You</h2>
        <div className="flex items-center gap-2 text-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{getLocationStatus()}</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {events.map((event) => {
          // Get event icon based on type
          const getEventIcon = (type: string) => {
            switch (type) {
              case "MEETUP": return "👥"
              case "WORKSHOP": return "🎓"
              case "CONFERENCE": return "🎤"
              case "EXHIBITION": return "🖼️"
              case "VIRTUAL": return "💻"
              default: return "📅"
            }
          }

          // Get category color for badge
          const getCategoryColor = (type: string) => {
            switch (type) {
              case "MEETUP": return "bg-blue-100 dark:bg-blue-900 !text-gray-900 dark:!text-gray-100"
              case "WORKSHOP": return "bg-purple-100 dark:bg-purple-900 !text-gray-900 dark:!text-gray-100"
              case "CONFERENCE": return "bg-indigo-100 dark:bg-indigo-900 !text-gray-900 dark:!text-gray-100"
              case "EXHIBITION": return "bg-pink-100 dark:bg-pink-900 !text-gray-900 dark:!text-gray-100"
              case "VIRTUAL": return "bg-green-100 dark:bg-green-900 !text-gray-900 dark:!text-gray-100"
              default: return "bg-gray-100 dark:bg-gray-700 !text-gray-900 dark:!text-gray-100"
            }
          }

          return (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-lg">{getEventIcon(event.type)}</div>
                  <div>
                    <h4 className="font-medium text-card-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{event.host.organization}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={`text-xs font-medium ${getCategoryColor(event.type)}`}>
                  {event.type}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{event.date} • {event.time.split(' - ')[0]}</span>
                </div>
                {!event.isVirtual && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.city}</span>
                    {event.distance && event.distance > 0 && (
                      <span className="text-xs">({event.distance} mi)</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>

              {/* International Event Notification */}
              {isInternationalEvent(event) && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-muted-foreground">
                        Travel to {event.city} required
                      </span>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNotifyMe(event)
                      }}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    >
                      Notify Me
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">{selectedEvent.title}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {selectedEvent.type}
                    </Badge>
                    <Badge
                      variant={selectedEvent.status === "Free" ? "default" : "secondary"}
                      className={
                        selectedEvent.status === "Free"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {selectedEvent.status} {selectedEvent.price && `- ${selectedEvent.price}`}
                    </Badge>
                    {selectedEvent.isVirtual && (
                      <Badge variant="outline" className="bg-[#39d2c0]/10 text-[#39d2c0] border-[#39d2c0]/30">
                        <Globe className="w-3 h-3 mr-1" />
                        Virtual
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseModal}
                  className="text-card-foreground hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">About This Event</h3>
                  <p className="text-card-foreground leading-relaxed">{selectedEvent.fullDescription}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">{selectedEvent.date}</p>
                        <p className="text-sm text-card-foreground">{selectedEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">{selectedEvent.location}</p>
                        <p className="text-sm text-card-foreground">{selectedEvent.address}, {selectedEvent.city}</p>
                        {selectedEvent.distance && selectedEvent.distance > 0 && (
                          <p className="text-xs text-card-foreground">{(selectedEvent.distance)} miles away</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">{selectedEvent.attendees} attending</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-2">Hosted by</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{selectedEvent.host.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{selectedEvent.host.name}</p>
                          <p className="text-sm text-card-foreground">{selectedEvent.host.organization}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                  <Button onClick={handleShareInstagram} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on Instagram
                  </Button>
                  <Button onClick={handleCopyLink} className="bg-card text-card-foreground border border-border hover:bg-muted">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={handleAddToCalendar} className="bg-card text-card-foreground border border-border hover:bg-muted">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                  {selectedEvent.registrationUrl && (
                    <Button asChild className="bg-card text-card-foreground border border-border hover:bg-muted">
                      <a href={selectedEvent.registrationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Register Now
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotifyModal && notifyEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-card-foreground mb-2">Get Notified</h3>
                  <p className="text-card-foreground">
                    We'll notify you when similar events to <strong>"{notifyEvent.title}"</strong> are available in your area.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifyModal(false)}
                  className="text-card-foreground hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-card-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-card-foreground">
                  <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                  <span>We'll only send you relevant event notifications</span>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmitNotification}
                    disabled={!notifyEmail}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Notify Me
                  </Button>
                  <Button
                    onClick={() => setShowNotifyModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
