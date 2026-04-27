import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"
export const maxDuration = 60

const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/ogg",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/flac",
])

const MAX_BYTES = 25 * 1024 * 1024

function mapToGeminiMime(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.startsWith("audio/webm")) return "audio/ogg"
  if (lower.startsWith("audio/mp4")) return "audio/mp4"
  if (lower.startsWith("audio/mpeg") || lower.startsWith("audio/mp3")) return "audio/mp3"
  if (lower.startsWith("audio/x-wav") || lower.startsWith("audio/wav")) return "audio/wav"
  if (lower.startsWith("audio/aac")) return "audio/aac"
  if (lower.startsWith("audio/flac")) return "audio/flac"
  if (lower.startsWith("audio/ogg")) return "audio/ogg"
  return "audio/ogg"
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      )
    }

    const form = await request.formData().catch(() => null)
    if (!form) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with an 'audio' field." },
        { status: 400 }
      )
    }
    const audioField = form.get("audio")
    const languageHint = (form.get("language") as string | null) || ""

    if (!audioField || !(audioField instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing 'audio' file in form data." },
        { status: 400 }
      )
    }

    const blob = audioField as Blob
    if (blob.size === 0) {
      return NextResponse.json({ text: "" })
    }
    if (blob.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Audio is too large (${blob.size} bytes). Max ${MAX_BYTES}.` },
        { status: 413 }
      )
    }

    const incomingMime = (blob.type || "audio/webm").split(";")[0].trim() || "audio/webm"
    if (!ALLOWED_MIME.has(blob.type) && !ALLOWED_MIME.has(incomingMime)) {
      console.warn("transcribe: unusual mime type, attempting anyway:", blob.type)
    }
    const geminiMime = mapToGeminiMime(blob.type || incomingMime)

    const arrayBuffer = await blob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    const genAI = new GoogleGenerativeAI(apiKey)
    const transcribeModel = process.env.GEMINI_TRANSCRIBE_MODEL || "gemini-2.5-flash"
    const model = genAI.getGenerativeModel({
      model: transcribeModel,
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 2048,
      },
    })

    const promptText =
      "Transcribe the speech in this audio recording verbatim. " +
      "Return ONLY the transcribed text, no quotation marks, no commentary, no labels. " +
      "If no speech is present or it is unintelligible, return an empty string." +
      (languageHint ? ` The speaker is likely speaking ${languageHint}.` : "")

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: geminiMime,
          data: base64,
        },
      },
      { text: promptText },
    ])

    const text = (result.response.text() || "").trim()

    return NextResponse.json({ text })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Transcription failed."
    console.error("transcribe error:", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
