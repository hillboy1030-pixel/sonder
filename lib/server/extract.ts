import type Anthropic from "@anthropic-ai/sdk";

/**
 * Pulls the structured result out of a response: the tool call if there is one,
 * otherwise a JSON object written as plain text (the model occasionally answers
 * that way because the tool can't be forced on Sonnet 5.5).
 */
export function extractStructured<T>(message: Anthropic.Message, toolName: string): T | null {
  const tool = message.content.find((b) => b.type === "tool_use" && b.name === toolName);
  if (tool && tool.type === "tool_use") return tool.input as T;

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
