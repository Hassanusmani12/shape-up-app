const FETCH_TIMEOUT = 25000;
const MAX_RETRIES = 2;

function isNetworkError(err) {
  const msg = (err.message || "").toLowerCase();
  return err.name === "TypeError" || msg.includes("network") || msg.includes("fetch");
}

export async function streamChat(body, onChunk, onError, signal) {
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const combinedSignal = signal
        ? combineAbortSignals(controller.signal, signal)
        : controller.signal;

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: combinedSignal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        lastError = errData.error || `Request failed (${response.status})`;
        if (attempt < MAX_RETRIES && response.status >= 500) {
          const delay = 1000 * attempt;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        onError(lastError);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        let result;
        try {
          result = await reader.read();
        } catch (readError) {
          if (readError.name === "AbortError") {
            onError("Cancelled");
            return;
          }
          if (isNetworkError(readError) && attempt < MAX_RETRIES) {
            const delay = 1000 * attempt;
            await new Promise((r) => setTimeout(r, delay));
            break;
          }
          onError(readError.message || "Stream connection lost.");
          return;
        }

        const { done, value } = result;

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
              onChunk({ done: true, conversationId: data.conversationId });
            } else if (data.error) {
              onError(data.error);
              return;
            } else if (data.content) {
              onChunk({ content: data.content });
            }
          } catch (parseError) {
            // silent parse warning
          }
        }

        if (done) break;
      }

      if (!buffer.includes("error")) {
        return;
      }
    } catch (err) {
      if (err.name === "AbortError") {
        onError("Cancelled");
        return;
      }
      lastError = err.message;
      if (isNetworkError(err) && attempt < MAX_RETRIES) {
        const delay = 1000 * attempt;
        await new Promise((r) => setTimeout(r, delay));
      } else {
        onError(lastError);
        return;
      }
    }
  }

  if (lastError) {
    onError(lastError);
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
