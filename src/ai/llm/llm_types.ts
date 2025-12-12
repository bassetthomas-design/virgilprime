export type LlmRole = "system" | "user" | "assistant";

export type LlmMessage = {
  role: LlmRole;
  content: string;
};

export type LlmGenerateParams = {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
};

export type LlmGenerateRequest = {
  messages: LlmMessage[];
  params?: LlmGenerateParams;
};

export type LlmGenerateResponse = {
  text: string;
  raw?: unknown;
};
