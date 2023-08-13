export function createConversationNameFromMessage(content: string): string {
  return content.length > 30 ? content.substring(0, 30) + '...' : content;
}
