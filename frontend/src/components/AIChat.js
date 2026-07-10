import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  FaRobot, FaUser, FaPaperPlane, FaStop, FaCopy, FaCheck,
  FaSync, FaImage, FaTrash, FaArrowDown
} from "react-icons/fa";

export default function AIChat({
  title = "AI Chat",
  subtitle = "Ask me anything about fitness",
  sendMessage,
  loading = false,
  onStop,
  suggestedPrompts = [],
  placeholder = "Ask me anything...",
  allowImageUpload = true,
  showHeader = true,
  minimal = false,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !imageBase64) return;
    if (loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      imageData: imageBase64,
      timestamp: Date.now(),
    };

    const capturedMimeType = imageMimeType;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
    setIsStreaming(true);

    try {
      console.log("AIChat - SENDING REQUEST:", { message: userMessage.content, hasImage: !!userMessage.imageData });
      const result = await sendMessage({
        message: userMessage.content,
        imageData: userMessage.imageData,
        mimeType: capturedMimeType,
      });
      console.log("AIChat - RECEIVED RESPONSE:", result);
      console.log("AIChat - result.reply:", result?.reply);
      console.log("AIChat - result.data?.reply:", result?.data?.reply);

      const replyText = result.reply || result.data?.reply;
      if (!replyText || replyText.trim() === "") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Unable to analyze. Please try again.",
            isError: true,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: replyText,
            xp: result.xp || result.data?.xp,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.error("========== AIChat ERROR ==========");
      console.error("Request:", { message: userMessage.content, hasImage: !!userMessage.imageData });
      console.error("Error:", err);
      console.error("Error Data:", err?.data);
      console.error("Message:", err?.message);
      console.error("==================================");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          isError: true,
          timestamp: Date.now(),
        },
      ]);
    }
    setIsStreaming(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setImageBase64(base64);
      setImageMimeType(file.type || "image/jpeg");
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {}
  };

  const clearChat = () => {
    setMessages([]);
    setImagePreview(null);
    setImageBase64(null);
  };

  const renderContent = (content) => {
    return (
      <div className="markdown-content" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
        <ReactMarkdown
          components={{
            code: ({ node, inline, className, children, ...props }) => (
              inline ? (
                <code style={{
                  background: "rgba(0,230,118,0.1)", padding: "2px 6px",
                  borderRadius: 4, fontSize: "0.85em", color: "var(--accent-green)"
                }} {...props}>{children}</code>
              ) : (
                <pre style={{
                  background: "rgba(0,0,0,0.4)", padding: 16, borderRadius: 12,
                  overflow: "auto", fontSize: "0.85rem", border: "1px solid rgba(255,255,255,0.06)",
                  margin: "12px 0"
                }}><code {...props}>{children}</code></pre>
              )
            ),
            table: ({ children }) => (
              <div style={{ overflow: "auto", margin: "12px 0" }}>
                <table style={{
                  width: "100%", borderCollapse: "collapse",
                  border: "1px solid rgba(255,255,255,0.06)"
                }}>{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th style={{
                padding: "8px 12px", borderBottom: "1px solid rgba(0,230,118,0.2)",
                background: "rgba(0,230,118,0.05)", fontWeight: 600, fontSize: "0.85rem"
              }}>{children}</th>
            ),
            td: ({ children }) => (
              <td style={{
                padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: "0.85rem"
              }}>{children}</td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const chatStyles = {
    container: {
      display: "flex", flexDirection: "column",
      height: minimal ? "100%" : "600px",
      maxHeight: minimal ? "100%" : "70vh",
      background: "rgba(3,7,18,0.4)", borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
    },
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    messages: {
      flex: 1, overflow: "auto", padding: "16px 20px",
      display: "flex", flexDirection: "column", gap: 16,
    },
    userBubble: {
      alignSelf: "flex-end", maxWidth: "80%",
      background: "linear-gradient(135deg, rgba(0,230,118,0.15), rgba(41,121,255,0.1))",
      borderRadius: "16px 16px 4px 16px",
      padding: "12px 16px",
      border: "1px solid rgba(0,230,118,0.1)",
    },
    aiBubble: {
      alignSelf: "flex-start", maxWidth: "85%",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "16px 16px 16px 4px",
      padding: "12px 16px",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    inputContainer: {
      padding: "12px 16px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(0,0,0,0.2)",
    },
    inputRow: {
      display: "flex", gap: 8, alignItems: "flex-end",
    },
    input: {
      flex: 1,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "10px 14px",
      color: "var(--text-primary)",
      fontSize: "0.85rem",
      outline: "none",
      resize: "none",
      minHeight: 40,
      maxHeight: 120,
      fontFamily: "inherit",
    },
    sendBtn: {
      width: 40, height: 40, borderRadius: 10, border: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", flexShrink: 0,
      background: loading ? "rgba(255,255,255,0.1)" : "var(--accent-green)",
      color: loading ? "var(--text-muted)" : "var(--bg-primary)",
    },
    suggestedChip: {
      padding: "6px 14px", borderRadius: 20,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "var(--text-secondary)", fontSize: "0.78rem",
      cursor: "pointer", transition: "all 0.2s",
      whiteSpace: "nowrap",
    },
  };

  return (
    <div style={chatStyles.container}>
      {showHeader && (
        <div style={chatStyles.header}>
          <div>
            <h6 style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>{title}</h6>
            <small style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{subtitle}</small>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {messages.length > 0 && (
              <button onClick={clearChat} style={{
                background: "rgba(255,255,255,0.04)", border: "none", color: "var(--text-muted)",
                width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
              }} title="Clear chat"><FaTrash size={12} /></button>
            )}
          </div>
        </div>
      )}

      <div ref={chatContainerRef} style={chatStyles.messages} onScroll={handleScroll}>
        {messages.length === 0 && suggestedPrompts.length > 0 && !minimal && (
          <div style={{ textAlign: "center", marginTop: 40, opacity: 0.6 }}>
            <FaRobot size={40} style={{ color: "var(--accent-green)", marginBottom: 12, opacity: 0.3 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 20 }}>
              Try asking:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {suggestedPrompts.map((prompt, i) => (
                <span
                  key={i}
                  style={chatStyles.suggestedChip}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => document.getElementById("chat-input")?.focus(), 100);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,230,118,0.08)";
                    e.currentTarget.style.color = "var(--accent-green)";
                    e.currentTarget.style.borderColor = "rgba(0,230,118,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  {prompt}
                </span>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.timestamp || i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                gap: 4,
              }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                marginBottom: 2, fontSize: "0.7rem", color: "var(--text-muted)",
              }}>
                {msg.role === "assistant" ? (
                  <><FaRobot size={10} style={{ color: "var(--accent-green)" }} /> ShapeUp AI</>
                ) : (
                  <><FaUser size={10} /> You</>
                )}
              </div>

              <div style={msg.role === "user" ? chatStyles.userBubble : chatStyles.aiBubble}>
                {msg.imageData && (
                  <img
                    src={`data:image/jpeg;base64,${msg.imageData}`}
                    alt="Uploaded"
                    style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, marginBottom: 8 }}
                  />
                )}
                {msg.role === "assistant" ? (
                  renderContent(msg.content)
                ) : (
                  <span style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>{msg.content}</span>
                )}

                {msg.xp && (
                  <div style={{
                    marginTop: 8, padding: "6px 10px", borderRadius: 8,
                    background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.1)",
                    fontSize: "0.72rem", color: "var(--accent-green)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    ⚡ +{msg.xp.totalXP ? "XP updated" : "XP earned"} | Level {msg.xp.level} {msg.xp.title}
                    {msg.xp.progressPercent !== undefined && (
                      <span style={{ marginLeft: "auto", opacity: 0.6 }}>{msg.xp.progressPercent}% to next</span>
                    )}
                  </div>
                )}
              </div>

              {msg.role === "assistant" && !msg.isError && (
                <div style={{ display: "flex", gap: 4, paddingLeft: 4 }}>
                  <button
                    onClick={() => copyToClipboard(msg.content, i)}
                    style={{
                      background: "none", border: "none", color: "var(--text-muted)",
                      fontSize: "0.65rem", cursor: "pointer", padding: "2px 4px",
                      borderRadius: 4, opacity: 0.5,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; }}
                  >
                    {copiedIndex === i ? <FaCheck size={10} /> : <FaCopy size={10} />}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ alignSelf: "flex-start", display: "flex", gap: 8, alignItems: "center", padding: "8px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)",
              animation: "typingDot 1.4s infinite ease-in-out", display: "inline-block"
            }} />
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)",
              animation: "typingDot 1.4s infinite ease-in-out", animationDelay: "0.2s", display: "inline-block"
            }} />
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)",
              animation: "typingDot 1.4s infinite ease-in-out", animationDelay: "0.4s", display: "inline-block"
            }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 4 }}>Thinking...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          style={{
            position: "absolute", bottom: 80, right: 24,
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--accent-green)", border: "none",
            color: "var(--bg-primary)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,230,118,0.3)",
          }}
        >
          <FaArrowDown size={14} />
        </button>
      )}

      <div style={chatStyles.inputContainer}>
        {imagePreview && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: 8, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <img src={imagePreview} alt="preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Image attached</span>
            <button
              onClick={() => { setImagePreview(null); setImageBase64(null); setImageMimeType(null); }}
              style={{ marginLeft: "auto", background: "rgba(255,23,68,0.1)", border: "1px solid rgba(255,23,68,0.2)", color: "#ff1744", cursor: "pointer", fontSize: "0.65rem", fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}
            >
              Remove
            </button>
          </motion.div>
        )}
        <form onSubmit={handleSubmit} style={chatStyles.inputRow}>
          {allowImageUpload && !minimal && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "none", border: "none", color: "var(--text-muted)",
                  cursor: "pointer", padding: "8px", fontSize: "1rem",
                  display: "flex", alignItems: "center",
                }}
                title="Upload image"
              >
                <FaImage />
              </button>
            </>
          )}
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholder}
            style={chatStyles.input}
            rows={1}
          />
          <motion.button
            type="submit"
            disabled={loading || (!input.trim() && !imageBase64)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              ...chatStyles.sendBtn,
              opacity: (!input.trim() && !imageBase64) || loading ? 0.5 : 1,
            }}
          >
            {loading ? <FaStop size={14} /> : <FaPaperPlane size={14} />}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
