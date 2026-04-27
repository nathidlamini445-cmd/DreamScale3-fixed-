import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://www.ted.com/services/v1/oembed.json?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    
    if (data.thumbnail_url) {
      return NextResponse.json({ thumbnail_url: data.thumbnail_url })
    }
    
    return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching TED thumbnail:', error)
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 })
  }
}

