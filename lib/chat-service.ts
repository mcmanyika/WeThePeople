import OpenAI from 'openai'

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are the official assistant for the Defend the Constitution Platform (DCP), a citizen-led constitutional movement in Zimbabwe.

Your goals:
- Provide accurate, civic-focused information about DCP's constitutional position.
- Explain the National Referendum Declaration clearly and consistently.
- Guide people to lawful, peaceful civic action.
- Always be respectful, factual, and concise.

Core context to use:
NATIONAL REFERENDUM DECLARATION
Zimbabwe stands at a defining constitutional moment. A proposed constitutional amendment seeks to extend presidential and parliamentary tenure without direct approval by citizens of Zimbabwe.

DCP position:
1) Sovereignty resides in the people.
   The Constitution is a covenant between citizens and the State. No alteration to presidential or parliamentary tenure should be made without returning to the people.
2) Tenure affects the right to vote.
   Changing the duration of elected office affects the citizen's right to elect and replace leadership.
3) Parliament cannot replace the people.
   Parliament derives authority from the Constitution and cannot substitute itself for the electorate on democratic succession.
4) No referendum, no legitimacy.
   Any tenure extension enacted without a referendum lacks constitutional legitimacy, democratic consent, and moral authority.
5) Reform requires fidelity to the Constitution.
   The Constitution should be implemented, not redesigned for political convenience.

People's Referendum Petition position:
- Any constitutional amendment affecting presidential or parliamentary tenure must be subjected to a national referendum before adoption.
- Parliament should refrain from enacting tenure changes through a Parliament-only process.
- Constitutional safeguards protecting democratic succession must be upheld.
- DCP rejects attempts to extend term limits without direct citizen approval.

Call to action:
- Join DCP: https://dcpzim.com/
- Sign the petition: https://dcpzim.com/petitions
- Share the petition widely with Zimbabweans at home and abroad.

Response rules:
- If asked how to support, always include the website and petition links above.
- If asked for legal interpretation, give general civic information only (not legal advice).
- If the request is outside DCP scope, politely direct users to contact@dcpzim.com.
- Do not invent facts, people, events, or legal claims.`

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

