import { NextRequest, NextResponse } from 'next/server'

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

/**
 * Send a WhatsApp message programmatically
 * Useful for notifications like petition updates, order confirmations, etc.
 * 
 * POST /api/whatsapp/send
 * Body: { to: string, message: string, type?: 'text' | 'template', templateName?: string, templateParams?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { to, message, type = 'text', templateName, templateParams } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Phone number (to) is required' },
        { status: 400 }
      )
    }

    if (type === 'text' && !message) {
      return NextResponse.json(
        { error: 'Message is required for text type' },
        { status: 400 }
      )
    }

    if (type === 'template' && !templateName) {
      return NextResponse.json(
        { error: 'Template name is required for template type' },
        { status: 400 }
      )
    }

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      return NextResponse.json(
        { error: 'WhatsApp credentials not configured' },
        { status: 500 }
      )
    }

    // Build message payload
    let payload: any = {
      messaging_product: 'whatsapp',
      to: to,
    }

    if (type === 'text') {
      payload.type = 'text'
      payload.text = { body: message }
    } else if (type === 'template') {
      payload.type = 'template'
      payload.template = {
        name: templateName,
        language: { code: 'en' },
      }

      // Add template parameters if provided
      if (templateParams && templateParams.length > 0) {
        payload.template.components = [
          {
            type: 'body',
            parameters: templateParams.map((param: string) => ({
              type: 'text',
              text: param,
            })),
          },
        ]
      }
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Failed to send message' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
    })
  } catch (error: any) {
    console.error('Error in WhatsApp send API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    )
  }
}

