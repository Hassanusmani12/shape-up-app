import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ReplayIcon from "@mui/icons-material/Replay";
import axios from "axios";
import { useSelector } from "react-redux";

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hi! I am Shape Up AI. Select a topic below or ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { userInfo } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isLoading, isOpen]);

  const predefinedQA = {
    "How to log food?": "Open Nutrition Checker, search food, and click Add. Calories are tracked automatically.",
    "Calculate BMR?": "Go to the BMR page, enter age, height, and weight to calculate daily calories.",
    "Is this Free?": "Yes! Shape Up v1.0 is completely free.",
    "Set Reminders?": "Go to Alerts page to create custom reminders for workouts, meals, or water intake.",
  };

  const quickQuestions = Object.keys(predefinedQA);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text }]);
    setInput("");
    setIsLoading(true);

    if (predefinedQA[text]) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", text: predefinedQA[text] }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      console.log("SupportChatbot - SENDING:", { message: text });
      const { data } = await axios.post('/api/ai/chat', {
        message: text,
        stream: false,
      }, { withCredentials: true });
      console.log("SupportChatbot - RESPONSE DATA:", data);
      console.log("SupportChatbot - data.reply:", data?.reply);
      const replyText = data?.reply;
      if (!replyText || replyText.trim() === "") {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", text: "Unable to analyze. Please try again.", isError: true }]);
      } else {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", text: replyText }]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("========== SupportChatbot ERROR ==========");
      console.error("Request:", { message: text });
      console.error("Response:", error?.response?.data);
      console.error("Status:", error?.response?.status);
      console.error("Message:", error?.message);
      console.error("==========================================");
      const errorMessage = error?.response?.data?.message || error?.message || "Connection Error. Please try again.";
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", text: errorMessage, isError: true }]);
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        drag
        dragMomentum={false}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, var(--accent-gold), #00c853)',
          color: 'var(--bg-primary)', cursor: 'grab', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0, 230, 118, 0.4)',
        }}
      >
        <ChatIcon style={{ fontSize: 20 }} />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="chatbox"
        drag
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 320, height: 450,
        zIndex: 9999, maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 48px)',
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(0, 230, 118, 0.15)',
        background: 'rgba(6, 10, 19, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 230, 118, 0.05)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Drag handle + Header */}
      <div
        style={{
          padding: '10px 14px',
          background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.12), rgba(184, 134, 11, 0.08))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'grab',
        }}
        onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
        onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DragIndicatorIcon style={{ fontSize: 16, color: 'var(--text-muted)', opacity: 0.5 }} />
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent-gold), #00c853)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AutoAwesomeIcon style={{ fontSize: 14, color: 'var(--bg-primary)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Shape Up AI
            </div>
            <div style={{ fontSize: 10, color: 'var(--accent-gold)' }}>
              {isLoading ? 'Thinking...' : 'Online'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: 6,
            width: 26, height: 26, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)',
          }}
        >
          <CloseIcon style={{ fontSize: 14 }} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex', justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: '85%', padding: '8px 12px',
              borderRadius: msg.sender === "user" ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.sender === "user"
                ? 'linear-gradient(135deg, var(--accent-gold), #00c853)'
                : 'rgba(255, 255, 255, 0.05)',
              color: msg.sender === "user" ? 'var(--bg-primary)' : 'var(--text-primary)',
              fontSize: 12, lineHeight: 1.5, fontWeight: msg.sender === "user" ? 600 : 400,
              border: msg.sender === "user" ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              {msg.sender === "bot" && (
                <SmartToyIcon style={{ fontSize: 12, marginRight: 4, color: 'var(--accent-gold)', verticalAlign: 'middle' }} />
              )}
              {msg.text}
              {msg.isError && (
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => handleSend(msg.text === "Unable to analyze. Please try again." ? "Create a weekly workout plan" : "")} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 10, cursor: 'pointer', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <ReplayIcon style={{ fontSize: 12 }} /> Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '8px 12px', borderRadius: '12px 12px 12px 4px',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--accent-gold)',
                  animation: `dotPulse 1.4s infinite ease-in-out ${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(6, 10, 19, 0.5)',
      }}>
        <div style={{
          display: 'flex', gap: 4, marginBottom: 8,
          overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none',
        }}>
          {quickQuestions.map((q, i) => (
            <button key={i} disabled={isLoading} onClick={() => handleSend(q)} style={{
              flexShrink: 0, fontSize: 10, padding: '3px 8px', borderRadius: 16,
              border: '1px solid rgba(0, 230, 118, 0.2)',
              background: 'rgba(0, 230, 118, 0.05)', color: 'var(--accent-gold)',
              cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
            }}>
              {q}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <input
            ref={inputRef}
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-primary)', fontSize: 12, outline: 'none',
            }}
          />
          <motion.button
            onClick={() => handleSend()}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 34, height: 34, borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, var(--accent-gold), #00c853)',
              color: 'var(--bg-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <SendIcon style={{ fontSize: 16 }} />
          </motion.button>
        </div>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </motion.div>
    </AnimatePresence>
  );
};

export default SupportChatbot;
