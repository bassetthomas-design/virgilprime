import { LlmGenerateRequest, LlmGenerateResponse } from "./llm_types";

export interface LlmClient {
  generate(req: LlmGenerateRequest): Promise<LlmGenerateResponse>;
  health?(): Promise<boolean>;
}
