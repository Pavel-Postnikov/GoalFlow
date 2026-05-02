export async function formatTaskDescription(description: string): Promise<string> {
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
