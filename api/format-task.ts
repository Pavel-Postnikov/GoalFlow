import OpenAI from 'openai'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { description } = await req.json()
  if (!description?.trim()) {
    return new Response(JSON.stringify({ error: 'Description is required' }), { status: 400 })
  }

  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  })

  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content:
          'Ты помощник по управлению задачами. Отформатируй описание задачи: структурируй мысли, исправь грамматику и пунктуацию, сделай текст лаконичным и ясным. Сохрани язык оригинала. Верни только отформатированный текст, без пояснений.',
      },
      { role: 'user', content: description },
    ],
    max_tokens: 1000,
  })

  const formatted = completion.choices[0]?.message?.content
  if (!formatted) {
    return new Response(JSON.stringify({ error: 'No response from AI' }), { status: 500 })
  }

  return new Response(JSON.stringify({ formatted }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
