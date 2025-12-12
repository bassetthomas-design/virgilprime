# Offline LLM choice for VirgilPrime

## Recommendation (best overall)

**Runtime:** `llama.cpp` (local HTTP server)

**Model:** **Qwen2.5 7B Instruct** (GGUF)

**Quantization:** **Q4_K_M** (default) / **Q5_K_M** (better quality if you can afford it)

Why this choice:
- Strong instruction-following for concise, structured text (perfect for “Virgil narration”).
- Excellent quality/size tradeoff for CPU-only machines while still scaling well on GPU.
- Broad ecosystem support in GGUF + llama.cpp.

This is the best “ships-to-users” option for an offline Windows caretaker: good outputs on average hardware, without requiring a datacenter.

## Operating mode

VirgilPrime uses the LLM only for:
- rewriting deterministic findings into Virgil voice
- prioritizing recommendations (safe/prudent/risky)
- producing *mood* + *avatarState*

The LLM **must not**:
- execute system actions
- decide without explicit user confirmation

## Suggested defaults

- temperature: **0.2 – 0.4**
- top_p: **0.9**
- max_tokens: **~256–512** (Virgil is not an essayist)
- response format: **strict JSON**

## Fallback

If the local LLM is unavailable, VirgilPrime falls back to the deterministic narrator already in `src/ai/dialogue/virgil_narrator.ts`.

## Next implementation step

Add:
- `src/ai/llm/llm_client.ts` (interface)
- `src/ai/llm/llama_cpp_client.ts` (localhost HTTP client)
- `src/ai/dialogue/llm_narrator.ts` (LLM-backed narrator + deterministic fallback)

