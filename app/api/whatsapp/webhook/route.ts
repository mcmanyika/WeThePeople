import { NextRequest, NextResponse } from 'next/server'
import { processChat } from '@/lib/chat-service'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

// In-memory conversation history (for production, use Firestore)
const conversationHistory: Map<string, { role: 'user' | 'assistant'; content: string }[]> = new Map()

// Maximum history length per conversation
const MAX_HISTORY_LENGTH = 10

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

