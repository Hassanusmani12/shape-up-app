import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  FaRobot, FaImage, FaPaperPlane, FaStop, FaCopy, FaCheck,
  FaTrash, FaPlus, FaBars, FaCommentDots, FaMicrochip, FaEdit,
  FaRedo, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { streamChat } from "../utils/streamChat";

const CHATS_KEY = "shapeup_chats";
function getChats() { try { return JSON.parse(localStorage.getItem(CHATS_KEY)) || []; } catch { return []; } }
function saveChats(chats) { localStorage.setItem(CHATS_KEY, JSON.stringify(chats)); }
function genId() { return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

function getRelativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `${days}d ago` : new Date(ts).toLocaleDateString();
}

function truncateTitle(text) {
  if (!text || text === "(image uploaded)") return "Image analysis";
  const cleaned = text.replace(/<[^>]+>/g, "").trim();
  if (cleaned.length <= 42) return cleaned;
  return cleaned.substring(0, 42).trim() + "…";
}

/* ── Typing Indicator ── */
function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#00ff88",
          animation: `typingDot 1.4s infinite ease-in-out ${i * 0.2}s`,
          opacity: 0.5, display: "inline-block",
        }} />
      ))}
    </span>
  );
}

/* ── Memoized Markdown Components ── */
const mdComponents = {
  p: ({ children }) => <p style={{ marginBottom: 10, color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.88rem" }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>{children}</strong>,
  h1: ({ children }) => <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", margin: "16px 0 8px" }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: "14px 0 6px" }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", margin: "12px 0 4px" }}>{children}</h3>,
  ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: "8px 0", color: "var(--text-secondary)" }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: "8px 0", color: "var(--text-secondary)" }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4, fontSize: "0.85rem" }}>{children}</li>,
  code: ({ inline, children }) => inline
    ? <code style={{ background: "rgba(0,255,136,0.08)", padding: "2px 6px", borderRadius: 4, color: "#00ff88", fontSize: "0.85em" }}>{children}</code>
    : <pre style={{ background: "rgba(0,0,0,0.4)", padding: 16, borderRadius: 12, overflow: "auto", fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.06)", margin: "8px 0" }}><code>{children}</code></pre>,
  table: ({ children }) => <div style={{ overflow: "auto", margin: "8px 0" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table></div>,
  th: ({ children }) => <th style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.04)", fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>{children}</td>,
};

/* ── Sidebar ── */
function ChatSidebar({ chats, activeChatId, onSelect, onNew, onDelete, onRename, sidebarOpen, sidebarCollapsed, onToggleCollapse }) {
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const sorted = [...chats].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  const filtered = sorted.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.title || "").toLowerCase().includes(q) || c.messages?.some(m => m.content?.toLowerCase().includes(q));
  });

  const startRename = (chat) => {
    setRenamingId(chat.id);
    setRenameValue(chat.title || "");
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  if (sidebarCollapsed) {
    return (
      <div className="ai-sidebar ai-sidebar-collapsed">
        <div className="ai-sidebar-header" style={{ justifyContent: "center", padding: "12px 0" }}>
          <button onClick={onToggleCollapse} title="Expand sidebar" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,255,136,0.08)", color: "var(--neon-green)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaChevronRight size={10} />
          </button>
        </div>
        <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
          <button onClick={onNew} title="New chat" style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,255,136,0.08)", color: "var(--neon-green)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaPlus size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="ai-sidebar-header">
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, var(--neon-green), var(--neon-cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#000", flexShrink: 0 }}>
          <FaCommentDots />
        </div>
        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", flex: 1 }}>History</span>
        <button onClick={onToggleCollapse} title="Collapse sidebar" style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center" }} className="sidebar-collapse-btn">
          <FaChevronLeft size={10} />
        </button>
        <button onClick={onNew} title="New chat" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,255,136,0.08)", color: "var(--neon-green)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", flexShrink: 0 }}>
          <FaPlus />
        </button>
      </div>

      <div className="ai-sidebar-search">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats..." className="neon-input" style={{ width: "100%", height: 36, padding: "0 10px", fontSize: "0.78rem" }} />
      </div>

      <div className="ai-sidebar-list">
        {filtered.map(chat => (
          <div key={chat.id} className={`ai-sidebar-item ${chat.id === activeChatId ? "active" : ""}`} onClick={() => onSelect(chat.id)}>
            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", width: 16, textAlign: "center", flexShrink: 0 }}>
              <FaCommentDots size={9} />
            </span>
            <div className="chat-title" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {renamingId === chat.id ? (
                <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                  style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid var(--neon-green)", borderRadius: 4, padding: "2px 6px", color: "var(--text-primary)", fontSize: "0.8rem", outline: "none" }}
                />
              ) : (
                chat.title || "New Chat"
              )}
            </div>
            <div className="chat-actions">
              <button title="Rename" onClick={e => { e.stopPropagation(); startRename(chat); }}><FaEdit size={9} /></button>
              <button title="Delete" onClick={e => { e.stopPropagation(); onDelete(chat.id); }}><FaTrash size={9} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: "0.82rem" }}>
            <FaCommentDots size={20} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ margin: 0 }}>No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Chat Component ── */
export default function AIHub() {
  const { userInfo } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const fullContentRef = useRef("");
  const submittingRef = useRef(false);
  const abortRef = useRef(null);
  const msgIdCounter = useRef(0);

  useEffect(() => {
    setChats(getChats());
    return () => {
      setChats([]);
      setMessages([]);
      setActiveChatId(null);
    };
  }, [userInfo]);

  const updateChatInState = useCallback((chatId, updater) => {
    setChats(prev => {
      const next = prev.map(c => c.id === chatId ? updater(c) : c);
      saveChats(next);
      return next;
    });
  }, []);

  const msgId = () => `m_${++msgIdCounter.current}`;

  /* ── Auto scroll ── */
  useEffect(() => {
    const el = messagesRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages, loading]);

  /* ── Load messages when switching chats ── */
  useEffect(() => {
    if (activeChatId) {
      const chat = chats.find(c => c.id === activeChatId);
      if (chat) setMessages(chat.messages || []);
    } else {
      setMessages([]);
    }
  }, [activeChatId, chats]);

  /* ── Paste image ── */
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          if (file.size > 10 * 1024 * 1024) return;
          const reader = new FileReader();
          reader.onload = () => { setImageBase64(reader.result.split(",")[1]); setImagePreview(reader.result); };
          reader.readAsDataURL(file);
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  /* ── Drag & drop ── */
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) { return; }
    const reader = new FileReader();
    reader.onload = () => { setImageBase64(reader.result.split(",")[1]); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { return; }
    const reader = new FileReader();
    reader.onload = () => { setImageBase64(reader.result.split(",")[1]); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  /* ── Do stream ── */
  const doStream = useCallback(async (userContent, userImageB64, userImagePreview) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    const userMsg = {
      id: msgId(), role: "user",
      content: userContent || "(image uploaded)",
      image: userImagePreview,
      timestamp: Date.now(),
    };
    const currentMessages = messages;
    const newMessages = [...currentMessages, userMsg];
    setMessages(newMessages);
    setInput("");

    const chatId = activeChatId || genId();
    if (!activeChatId) {
      setActiveChatId(chatId);
    }

    const placeholderId = msgId();
    const placeholderMsg = { id: placeholderId, role: "assistant", content: "", loading: true, timestamp: Date.now() };
    setMessages([...newMessages, placeholderMsg]);
    fullContentRef.current = "";

    const abortController = new AbortController();
    abortRef.current = abortController;

    const body = { message: userContent };
    if (userImageB64) body.image = userImageB64;
    const existingChat = chats.find(c => c.id === chatId);
    if (existingChat?.conversationId) body.conversationId = existingChat.conversationId;

    try {
      await streamChat(body,
        (chunk) => {
          if (chunk.done) {
            const finalContent = fullContentRef.current;
            const backendId = chunk.conversationId;

            setMessages(prev => {
              const msgs = [...prev];
              const idx = msgs.findIndex(m => m.id === placeholderId);
              if (idx >= 0) msgs[idx] = { id: placeholderId, role: "assistant", content: finalContent, timestamp: Date.now() };
              return msgs;
            });

            const finalMsgs = [...newMessages, { id: placeholderId, role: "assistant", content: finalContent }];
            const title = truncateTitle(userContent);
            updateChatInState(chatId, (existing) => ({
              id: chatId, conversationId: backendId || existing?.conversationId,
              title: existing?.title || title, messages: finalMsgs,
              createdAt: existing?.createdAt || Date.now(), updatedAt: Date.now(),
            }));
            setChats(prev => {
              const exists = prev.find(c => c.id === chatId);
              if (!exists) {
                const entry = { id: chatId, conversationId: backendId, title, messages: finalMsgs, createdAt: Date.now(), updatedAt: Date.now() };
                const next = [...prev, entry];
                saveChats(next);
                return next;
              }
              return prev;
            });
          } else if (chunk.content) {
            fullContentRef.current += chunk.content;
            setMessages(prev => {
              const msgs = [...prev];
              const idx = msgs.findIndex(m => m.id === placeholderId);
              if (idx >= 0) msgs[idx] = { id: placeholderId, role: "assistant", content: fullContentRef.current, loading: true, timestamp: Date.now() };
              return msgs;
            });
          }
        },
        (error) => {
          setMessages(prev => {
            const msgs = [...prev];
            const idx = msgs.findIndex(m => m.id === placeholderId);
            if (idx >= 0) msgs[idx] = { id: placeholderId, role: "assistant", content: error === "Cancelled" ? "" : `Error: ${error}`, isError: error !== "Cancelled", isCancelled: error === "Cancelled", timestamp: Date.now() };
            return msgs;
          });
          if (error !== "Cancelled") {
            updateChatInState(chatId, (existing) => ({
              ...existing, id: chatId,
              messages: [...newMessages, { id: placeholderId, role: "assistant", content: "", isError: true }],
              updatedAt: Date.now(),
            }));
          }
        },
        abortController.signal
      );
    } finally {
      setLoading(false);
      submittingRef.current = false;
      abortRef.current = null;
    }
  }, [messages, activeChatId, chats, updateChatInState]);

  /* ── Submit ── */
  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text && !imageBase64) return;
    if (loading || submittingRef.current) return;
    const imgB64 = imageBase64;
    const imgPreview = imagePreview;
    setImageBase64(null);
    setImagePreview(null);
    doStream(text, imgB64, imgPreview);
  }, [input, imageBase64, imagePreview, loading, doStream]);

  /* ── Stop generating ── */
  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /* ── Retry / Regenerate ── */
  const handleRetry = useCallback(() => {
    const msgs = messages;
    if (msgs.length < 2) return;
    const lastUserMsg = [...msgs].reverse().find(m => m.role === "user");
    if (!lastUserMsg) return;
    const msgsWithoutLast = msgs.slice(0, -1);
    setMessages(msgsWithoutLast);
    doStream(lastUserMsg.content === "(image uploaded)" ? "" : lastUserMsg.content, null, lastUserMsg.image);
  }, [messages, doStream]);

  /* ── New chat ── */
  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
    setSidebarOpen(false);
  }, []);

  /* ── Select chat ── */
  const handleSelectChat = useCallback((id) => {
    setActiveChatId(id);
    setSidebarOpen(false);
  }, []);

  /* ── Delete chat ── */
  const handleDeleteChat = useCallback((id) => {
    setChats(prev => {
      const next = prev.filter(c => c.id !== id);
      saveChats(next);
      if (activeChatId === id) {
        setActiveChatId(null);
        setMessages([]);
      }
      return next;
    });
  }, [activeChatId]);

  /* ── Rename chat ── */
  const handleRenameChat = useCallback((id, title) => {
    updateChatInState(id, (c) => ({ ...c, title, updatedAt: Date.now() }));
  }, [updateChatInState]);

  /* ── Copy ── */
  const copyToClipboard = useCallback(async (text, idx) => {
    try { await navigator.clipboard.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000); } catch {}
  }, []);

  /* ── Sidebar collapsed state ── */
  const toggleCollapse = useCallback(() => setSidebarCollapsed(p => !p), []);

  /* ── Detect desktop for sidebar behavior ── */
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  /* ── Render ── */
  const sidebarContent = (
    <ChatSidebar chats={chats} activeChatId={activeChatId}
      onSelect={handleSelectChat} onNew={handleNewChat}
      onDelete={handleDeleteChat} onRename={handleRenameChat}
      sidebarOpen={sidebarOpen} sidebarCollapsed={sidebarCollapsed} onToggleCollapse={toggleCollapse} />
  );

  return (
    <div className="ai-hub-root">
      <div className={`ai-sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Desktop sidebar (static) */}
      {isDesktop && sidebarContent}

      {/* Mobile sidebar (modal) */}
      {!isDesktop && sidebarContent}

      {/* Main content */}
      <div className="ai-hub-main">
        {/* Header */}
        <div className="ai-hub-header">
          <button onClick={() => { isDesktop ? toggleCollapse() : setSidebarOpen(true); }}
            title={isDesktop ? "Toggle sidebar" : "Open history"}
            className="ai-hub-menu-btn">
            {sidebarCollapsed && isDesktop ? <FaChevronRight size={12} /> : <FaBars size={14} />}
          </button>
          <div className="ai-hub-brand">
            <div className="ai-hub-avatar">
              <FaRobot style={{ color: "#000" }} />
            </div>
            <div>
              <div className="ai-hub-name">ShapeUp AI</div>
              <div className="ai-hub-subtitle">Fitness Assistant</div>
            </div>
          </div>
          {loading && (
            <button onClick={handleStop} className="ai-hub-stop-btn" title="Stop generating">
              <FaStop size={12} />
            </button>
          )}
        </div>

        {/* Chat card */}
        <div className="ai-hub-card"
          ref={dropRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Messages */}
          <div ref={messagesRef} className="ai-hub-messages">
            {messages.length === 0 ? (
              <div className="ai-hub-empty">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                  <div className="ai-hub-empty-icon">
                    <FaRobot style={{ color: "#000" }} />
                  </div>
                  <h2 className="ai-hub-empty-title">ShapeUp AI</h2>
                  <p className="ai-hub-empty-desc">
                    Your fitness assistant. Ask about workouts, nutrition, meal plans, supplements, and more.
                  </p>
                  <div className="ai-hub-suggestions">
                    {["Create a workout plan", "Suggest a healthy meal", "How much protein do I need?", "Best exercises for chest", "Design a weight loss plan"].map((prompt, i) => (
                      <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                        onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                        className="ai-hub-suggestion-btn">
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className={`ai-hub-msg ${msg.role === "user" ? "ai-hub-msg-user" : "ai-hub-msg-assistant"}`}>
                    <div className="ai-hub-msg-label">
                      {msg.role === "assistant" ? (
                        <><span className="ai-hub-msg-avatar"><FaRobot /></span> ShapeUp AI</>
                      ) : (
                        <><span className="ai-hub-msg-avatar"><FaMicrochip /></span> You</>
                      )}
                      {msg.timestamp && <span className="ai-hub-msg-time">{getRelativeTime(msg.timestamp)}</span>}
                    </div>
                    <div className={`ai-hub-msg-bubble ${msg.isError ? "ai-hub-msg-error" : ""} ${msg.isCancelled ? "ai-hub-msg-cancelled" : ""}`}>
                      {msg.image && (
                        <div className="ai-hub-msg-img">
                          <img src={msg.image} alt="upload" />
                        </div>
                      )}
                      {msg.role === "assistant" ? (
                        msg.loading && !msg.content ? (
                          <TypingDots />
                        ) : msg.isCancelled ? (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontStyle: "italic" }}>Stopped</span>
                        ) : (
                          <div className="ai-hub-msg-md">
                            <ReactMarkdown components={mdComponents}>{msg.content || ""}</ReactMarkdown>
                          </div>
                        )
                      ) : (
                        <span className="ai-hub-msg-text">{msg.content}</span>
                      )}
                    </div>
                    {msg.role === "assistant" && msg.content && !msg.isError && !msg.loading && (
                      <button onClick={() => copyToClipboard(msg.content, i)} className="ai-hub-copy-btn">
                        {copiedIdx === i ? <><FaCheck size={9} style={{ marginRight: 3 }} />Copied</> : <><FaCopy size={9} style={{ marginRight: 3 }} />Copy</>}
                      </button>
                    )}
                    {msg.isError && !msg.isCancelled && (
                      <button onClick={handleRetry} className="ai-hub-retry-btn">
                        <FaRedo size={9} style={{ marginRight: 4 }} />Retry
                      </button>
                    )}
                    {!msg.isError && msg.role === "assistant" && msg.content && !msg.loading && (
                      <button onClick={handleRetry} className="ai-hub-retry-btn" style={{ marginLeft: 8 }}>
                        <FaRedo size={9} style={{ marginRight: 4 }} />Regenerate
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="ai-hub-img-preview">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ai-hub-img-preview-inner">
                <div className="ai-hub-img-preview-thumb">
                  <img src={imagePreview} alt="preview" />
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Image ready</span>
                <button type="button" onClick={() => { setImagePreview(null); setImageBase64(null); }} className="ai-hub-remove-btn">Remove</button>
              </motion.div>
            </div>
          )}

          {/* Input */}
          <div className="ai-hub-input-area">
            <form onSubmit={handleSubmit} className="ai-hub-input-form">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} style={{ display: "none" }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} title="Upload image" className="ai-hub-img-btn">
                <FaImage />
              </button>
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask about fitness, nutrition, workouts..."
                className="neon-input ai-hub-input"
                ref={inputRef}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(e); }}
              />
              <motion.button type="submit" disabled={loading || (!input.trim() && !imageBase64)}
                whileHover={(!input.trim() && !imageBase64) || loading ? {} : { scale: 1.05 }}
                whileTap={(!input.trim() && !imageBase64) || loading ? {} : { scale: 0.95 }}
                className="ai-hub-send-btn"
                style={{
                  background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #00ff88, #00e5ff)",
                  opacity: (!input.trim() && !imageBase64) || loading ? 0.4 : 1,
                  cursor: (loading || (!input.trim() && !imageBase64)) ? "not-allowed" : "pointer",
                }}>
                <FaPaperPlane size={14} />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
