# VirgilPrime

Windows caretaker + supervisor.

## Dev quickstart

```bash
npm i
npm run build
npm run dev:e2e
```

### Offline LLM (llama.cpp)

```bash
# Start llama.cpp server separately
# export LLAMA_BASE_URL=http://127.0.0.1:8080

npm run build
npm run dev:e2e:llm
```

### Actions (dev)

```bash
npm run build
npm run dev:action:noop

# Disable HKCU Run entry by value name
node dist/dev/runner_disable_hkcu_run.js --name "SomeValueName"
```
