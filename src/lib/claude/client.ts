import Anthropic from "@anthropic-ai/sdk";

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
  reasoning: "claude-sonnet-4-6",
  fast: "claude-haiku-4-5-20251001",
} as const;
