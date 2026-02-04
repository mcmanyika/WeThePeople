import OpenAI from 'openai'

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful assistant for the Defend the Constitution Platform (DCP), a citizen-led movement in Zimbabwe. 
Your role is to:
- Answer questions about DCP's mission, values, and activities
- Provide information about constitutional rights and democratic governance
- Help users understand how to get involved with the movement
- Be respectful, informative, and supportive

Key information about DCP:
- DCP opposes the 2030 agenda
- Promotes constitutional supremacy and democratic governance
- Focuses on civic education, advocacy, and community engagement
- Works to protect constitutional rights and ensure accountability

Keep responses concise, helpful, and aligned with DCP's values. If asked about something outside your knowledge, politely redirect to the contact form.`

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  success: boolean
  response?: string
  error?: string
}

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

/**
 * Process a chat message using OpenAI
 * Used by both website chatbot and WhatsApp bot
 */
export async function processChat(
  message: string,
  conversationHistory: ConversationMessage[] = []
): Promise<ChatResponse> {
  try {
    if (!message || !message.trim()) {
      return {
        success: false,
        error: 'Message is required',
      }
    }

    const openai = getOpenAIClient()

    // Build conversation messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          })
        }
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message.trim() })

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return {
      success: true,
      response,
    }
  } catch (error: any) {
    console.error('Error in chat service:', error)
    return {
      success: false,
      error: error.message || 'Failed to process chat message',
    }
  }
}

/**
 * Get the system prompt (useful for debugging or display)
 */
export function getSystemPrompt(): string {
  return SYSTEM_PROMPT
}

