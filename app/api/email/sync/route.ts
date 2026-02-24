import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createInboundEmail } from '@/lib/firebase/firestore'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sync received emails from Resend API into Firestore.
 * GET /api/email/sync
 * 
 * Fetches received emails from Resend and stores them in Firestore.
 * Duplicates in a single payload are skipped by `email.id`.
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch received emails from Resend
    // @ts-ignore - Resend SDK types may not include emails.received yet
    const { data: receivedEmails, error } = await resend.emails.list()

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json({ error: 'Failed to fetch from Resend' }, { status: 500 })
    }

    let synced = 0
    const emails = receivedEmails?.data || receivedEmails || []
    const seenIds = new Set<string>()

    for (const email of emails) {
      // Skip duplicates returned in the same Resend response payload.
      if (email.id) {
        if (seenIds.has(email.id)) continue
        seenIds.add(email.id)
      }

      const from = email.from || ''
      const fromName = from.includes('<')
        ? from.split('<')[0].trim().replace(/"/g, '')
        : from.split('@')[0] || ''
      const fromEmail = from.includes('<')
        ? from.match(/<(.+?)>/)?.[1] || from
        : from

      const to = Array.isArray(email.to)
        ? email.to.join(', ')
        : (email.to || '')

      try {
        await createInboundEmail({
          from: fromEmail,
          fromName: fromName || undefined,
          to,
          subject: email.subject || '(No Subject)',
          body: (email as any).text || email.subject || '',
          html: (email as any).html || undefined,
          isRead: false,
          isStarred: false,
          resendEmailId: email.id || undefined,
        })
        synced++
      } catch (writeError) {
        console.error('Failed to store synced email:', email.id, writeError)
      }
    }

    return NextResponse.json({ success: true, synced, total: emails.length })
  } catch (error: any) {
    console.error('Error syncing emails:', error)
    return NextResponse.json(
      { error: 'Failed to sync emails: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}
