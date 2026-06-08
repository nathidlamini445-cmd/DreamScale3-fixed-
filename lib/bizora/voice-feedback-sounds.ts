let feedbackAudioContext: AudioContext | null = null

function getFeedbackAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!feedbackAudioContext || feedbackAudioContext.state === 'closed') {
    const Ctor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    feedbackAudioContext = new Ctor()
  }
  return feedbackAudioContext
}

function playNote(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  peakGain: number
) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.02)
}

async function playSequence(
  notes: Array<{ frequency: number; delay: number; duration: number; gain: number }>
) {
  const ctx = getFeedbackAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const t0 = ctx.currentTime + 0.01
  for (const note of notes) {
    playNote(ctx, note.frequency, t0 + note.delay, note.duration, note.gain)
  }
}

/** Soft ascending chime when voice input activates. */
export function playVoiceStartSound() {
  void playSequence([
    { frequency: 523.25, delay: 0, duration: 0.1, gain: 0.045 },
    { frequency: 783.99, delay: 0.07, duration: 0.14, gain: 0.035 },
  ])
}

/** Soft descending tone when voice input stops. */
export function playVoiceStopSound() {
  void playSequence([
    { frequency: 622.25, delay: 0, duration: 0.09, gain: 0.04 },
    { frequency: 392, delay: 0.06, duration: 0.16, gain: 0.03 },
  ])
}
