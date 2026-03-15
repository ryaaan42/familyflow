const LEGACY_MODELS = new Set(["gpt-4o-mini", "gpt-4-mini", "gpt-4.1-mini"]);

export function resolveOpenAiModel(raw = process.env.OPENAI_MODEL): string {
  const value = String(raw ?? "").trim().toLowerCase();
  if (!value || LEGACY_MODELS.has(value)) return "gpt-5-mini";
  return value;
}

export const OPENAI_MODEL = resolveOpenAiModel();
