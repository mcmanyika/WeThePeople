import { NextRequest, NextResponse } from 'next/server'
import { createInboundEmail } from '@/lib/firebase/firestore'

/**
 * Resend Inbound Email Webhook
 * 
 * Receives POST requests from Resend when an email is sent to your domain.
 * Configure this URL in Resend dashboard → Webhooks → email.received event.
 * URL: https://dcpzim.com/api/email/inbound
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Only process email.received events
    if (event.type !== 'email.received') {
      return NextResponse.json({ received: true })
    }

    const data = event.data
    if (!data) {
      return NextResponse.json({ error: 'No data in event' }, { status: 400 })
    }

    // Extract email fields from the Resend webhook payload
    const from = data.from || ''
    const fromName = from.includes('<')
      ? from.split('<')[0].trim().replace(/"/g, '')
      : from.split('@')[0] || ''
    const fromEmail = from.includes('<')
      ? from.match(/<(.+?)>/)?.[1] || from
      : from

    const to = Array.isArray(data.to) ? data.to.join(', ') : (data.to || '')
    const subject = data.subject || '(No Subject)'
    const body = data.text || ''
    const html = data.html || ''

    // Store in Firestore
    const emailId = await createInboundEmail({
      from: fromEmail,
      fromName: fromName || undefined,
      to,
      subject,
      body,
      html: html || undefined,
      isRead: false,
      isStarred: false,
      resendEmailId: data.email_id || undefined,
    })

    console.log('Inbound email stored:', emailId, 'from:', fromEmail, 'subject:', subject)

    return NextResponse.json({ success: true, id: emailId })
  } catch (error: any) {
    console.error('Error processing inbound email webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process inbound email' },
      { status: 500 }
    )
  }
}
