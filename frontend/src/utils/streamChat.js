const TIMEOUT_MS = 20000;

const IMAGE_FALLBACK =
  "Sorry! Sometimes image analysis may not be available due to temporary AI model limitations.\n\nPlease describe the food or fitness item in text and I'll analyze it for you.";

const TEXT_FALLBACK =
  "Hi! I'm ShapeUp AI, your fitness assistant. I'm here to help with workouts, nutrition, meal plans, and health. Feel free to ask me anything fitness-related!";

export async function streamChat(body, onChunk, onError, signal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const combinedSignal = signal
    ? combineAbortSignals(controller.signal, signal)
    : controller.signal;

  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      signal: combinedSignal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const fallback = body.image ? IMAGE_FALLBACK : TEXT_FALLBACK;
      onChunk({ content: fallback });
      onChunk({ done: true });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let receivedContent = false;

    while (true) {
      let readResult;
      try {
        readResult = await reader.read();
      } catch (readError) {
        break;
      }

      const { done, value } = readResult;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.done) {
            if (!receivedContent) {
              const fallback = body.image ? IMAGE_FALLBACK : TEXT_FALLBACK;
              onChunk({ content: fallback });
            }
            onChunk({ done: true, conversationId: data.conversationId });
          } else if (data.error) {
            const fallback = body.image ? IMAGE_FALLBACK : TEXT_FALLBACK;
            onChunk({ content: fallback });
            onChunk({ done: true });
            return;
          } else if (data.content) {
            receivedContent = true;
            onChunk({ content: data.content });
          }
        } catch {}
      }

      if (done) break;
    }

    if (!receivedContent) {
      const fallback = body.image ? IMAGE_FALLBACK : TEXT_FALLBACK;
      onChunk({ content: fallback });
      onChunk({ done: true });
    }
  } catch (err) {
    clearTimeout(timer);
    const fallback = body.image ? IMAGE_FALLBACK : TEXT_FALLBACK;
    onChunk({ content: fallback });
    onChunk({ done: true });
  }
}

function combineAbortSignals(s1, s2) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  s1.addEventListener("abort", onAbort);
  s2.addEventListener("abort", onAbort);
  if (s1.aborted || s2.aborted) controller.abort();
  return controller.signal;
}
