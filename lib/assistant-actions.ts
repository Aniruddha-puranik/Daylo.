export type AssistantCreateAction =
  | { type: 'task'; title: string }
  | { type: 'goal'; title: string };

/** Recognizes explicit create/add requests, including polite phrasing, without inferring mutations from general chat. */
export function parseAssistantCreateAction(message: string): AssistantCreateAction | null {
  const normalized = message.trim().replace(/\s+/g, ' ');
  const match = normalized.match(/^(?:please\s+)?(?:(?:can|could|would|will)\s+you\s+)?(?:create|add|make)\s+(?:(?:me|us)\s+)?(?:a\s+)?(task|goal)(?:\s+(?:called|named|titled|to|for|about)\s+|\s*:\s*)(.+?)\s*[.!?]*$/i);
  if (!match) return null;
  const title = match[2].trim().replace(/^['“”"]|['“”"]$/g, '').trim();
  if (title.length < 2 || title.length > 160) return null;
  return { type: match[1].toLowerCase() as 'task' | 'goal', title };
}
