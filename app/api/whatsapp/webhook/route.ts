import { NextRequest, NextResponse } from 'next/server'
import { processChat } from '@/lib/chat-service'
import { getPetitions, signPetition } from '@/lib/firebase/firestore'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

// In-memory conversation history (for production, use Firestore)
const conversationHistory: Map<string, { role: 'user' | 'assistant'; content: string }[]> = new Map()

// Maximum history length per conversation
const MAX_HISTORY_LENGTH = 10

function toBool(value: string): boolean {
  const normalized = (value || '').trim().toLowerCase()
  return ['true', 'yes', 'y', '1', 'anon', 'anonymous'].includes(normalized)
}

function parseSignCommand(text: string) {
  // Expected format:
  // SIGN|petitionId|Full Name|email@example.com|anonymous(optional)
  const parts = text.split('|').map((p) => p.trim())
  if (parts.length < 4) return null
  if (parts[0].toUpperCase() !== 'SIGN') return null

  return {
    petitionId: parts[1],
    name: parts[2],
    email: parts[3],
    anonymous: parts[4] ? toBool(parts[4]) : false,
  }
}

/**
 * Webhook verification (GET request from Meta)
 * Meta sends this to verify your webhook URL
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  console.log('WhatsApp webhook verification:', { mode, token, challenge: challenge?.substring(0, 20) })

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!')
    return new NextResponse(challenge, { status: 200 })
  }

  console.log('Webhook verification failed')
  return new NextResponse('Forbidden', { status: 403 })
}

/**
 * Receive incoming messages (POST request from Meta)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract message data from Meta's webhook format
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (messages && messages.length > 0) {
      const message = messages[0]
      const from = message.from // Sender's phone number
      const messageType = message.type

      // Only handle text messages for now
      if (messageType === 'text') {
        const text = message.text?.body

        console.log(`WhatsApp message from ${from}: ${text}`)

        const trimmedText = (text || '').trim()
        const upperText = trimmedText.toUpperCase()

        // 1) Petition helper command: list active petitions with IDs
        if (upperText === 'PETITIONS' || upperText === 'LIST PETITIONS') {
          try {
            const petitions = await getPetitions(true, true)
            if (!petitions.length) {
              await sendWhatsAppMessage(from, 'No active petitions are available at the moment.')
              return NextResponse.json({ success: true })
            }

            const top = petitions.slice(0, 8)
            const lines = top.map((p, i) => `${i + 1}. ${p.title}\nID: ${p.id}`)
            const reply =
              `Active petitions:\n\n${lines.join('\n\n')}\n\n` +
              'To sign, send:\nSIGN|petitionId|Your Full Name|your@email.com|anonymous(optional)'

            await sendWhatsAppMessage(from, reply)
            return NextResponse.json({ success: true })
          } catch (err) {
            console.error('Error listing petitions on WhatsApp:', err)
            await sendWhatsAppMessage(from, 'Sorry, I could not load petitions right now. Please try again shortly.')
            return NextResponse.json({ success: true })
          }
        }

        // 2) Petition sign command: SIGN|petitionId|name|email|anonymous(optional)
        const signPayload = parseSignCommand(trimmedText)
        if (signPayload) {
          if (!signPayload.petitionId || !signPayload.name || !signPayload.email || !signPayload.email.includes('@')) {
            await sendWhatsAppMessage(
              from,
              'Invalid sign format.\n\nUse:\nSIGN|petitionId|Your Full Name|your@email.com|anonymous(optional)'
            )
            return NextResponse.json({ success: true })
          }

          try {
            await signPetition(signPayload.petitionId, {
              userId: undefined,
              name: signPayload.name,
              email: signPayload.email,
              anonymous: signPayload.anonymous,
            })

            await sendWhatsAppMessage(
              from,
              `Thank you, ${signPayload.name}. Your petition signature has been recorded successfully.`
            )
            return NextResponse.json({ success: true })
          } catch (err: any) {
            console.error('Error signing petition from WhatsApp:', err)
            const message = err?.message || 'Failed to sign petition'
            await sendWhatsAppMessage(
              from,
              `Could not sign petition: ${message}\n\nTip: send PETITIONS to get valid petition IDs.`
            )
            return NextResponse.json({ success: true })
          }
        }

        // Get or initialize conversation history for this user
        let history = conversationHistory.get(from) || []

        // Process the message through the shared chat service
        const result = await processChat(text, history)

        if (result.success && result.response) {
          // Add to conversation history
          history.push({ role: 'user', content: text })
          history.push({ role: 'assistant', content: result.response })

          // Trim history if too long
          if (history.length > MAX_HISTORY_LENGTH * 2) {
            history = history.slice(-MAX_HISTORY_LENGTH * 2)
          }

          conversationHistory.set(from, history)

          // Send response back via WhatsApp
          await sendWhatsAppMessage(from, result.response)
        } else {
          // Send error message
          await sendWhatsAppMessage(
            from,
            'Sorry, I encountered an error. Please try again or visit our website at dcpzim.com for assistance.'
          )
        }
      } else if (messageType === 'image' || messageType === 'audio' || messageType === 'video') {
        // Handle media messages
        await sendWhatsAppMessage(
          from,
          "I can only process text messages at the moment. Please type your question and I'll be happy to help!"
        )
      }
    }

    // Always return 200 to Meta to acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ success: true })
  }
}

/**
 * Send a message via WhatsApp API
 */
async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials not configured')
    return false
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', data)
      return false
    }

    console.log('WhatsApp message sent successfully to:', to)
    return true
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return false
  }
}

