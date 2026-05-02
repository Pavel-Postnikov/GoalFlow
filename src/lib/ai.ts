export async function formatTaskDescription(description: string): Promise<string> {
  if (import.meta.env.DEV) {
    return formatDirect(description)
  }
  return formatViaProxy(description)
}

async function formatDirect(description: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'Ты помощник по управлению задачами. Отформатируй описание задачи: структурируй мысли, исправь грамматику и пунктуацию, сделай текст лаконичным и ясным. Сохрани язык оригинала. Верни только отформатированный текст, без пояснений.',
        },
        { role: 'user', content: description },
      ],
      max_tokens: 1000,
    }),
  })

  if (!res.ok) throw new Error('Ошибка DeepSeek API')

  const data = await res.json()
  return data.choices[0]?.message?.content ?? ''
}

async function formatViaProxy(description: string): Promise<string> {
  const res = await fetch('/api/format-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  })

  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Ошибка форматирования')
  }

  const { formatted } = await res.json()
  return formatted
}
