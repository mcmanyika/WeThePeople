import { NextRequest, NextResponse } from 'next/server'
import { processChat } from '@/lib/chat-service'

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    const result = await processChat(message, conversationHistory)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Message is required' ? 400 : 500 }
      )
    }

    return NextResponse.json(
      { response: result.response },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
