import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: { prompt?: string; workspaceName?: string; displayName?: string } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    body = {}
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) {
    return NextResponse.json({ error: 'Enter a question' }, { status: 400 })
  }

  const workspaceName = body.workspaceName?.trim() || 'this workspace'
  const guestName = body.displayName?.trim() || 'Guest'

  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({
      reply: `Hi ${guestName} — Bizora is in guest mode for ${workspaceName}. Add GEMINI_API_KEY to enable full AI replies. Your question was: "${prompt}"`,
    })
  }

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Bizora, a helpful business AI assistant. The user "${guestName}" is a guest collaborator in the DreamScale workspace "${workspaceName}". Answer concisely and practically.\n\nQuestion: ${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!res.ok) {
      return NextResponse.json({ reply: 'Bizora could not respond right now. Try again shortly.' })
    }

    const data = await res.json()
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      'Bizora could not generate a reply.'

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ reply: 'Bizora request failed.' }, { status: 500 })
  }
}
