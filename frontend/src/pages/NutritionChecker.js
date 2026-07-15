import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaMicrochip,
  FaFire,
  FaDumbbell,
  FaLeaf,
  FaOilCan,
  FaBrain,
  FaHistory,
  FaCheckCircle,
  FaTrashAlt,
  FaClock,
  FaCamera,
  FaImage,
  FaUpload,
  FaTimes,
  FaRobot,
  FaStar,
  FaLightbulb,
  FaAppleAlt,
  FaArrowRight,
  FaCommentDots,
} from "react-icons/fa";
import {
  useAnalyzeAndLogMutation,
  useGetDailyStatsQuery,
  useDeleteNutritionEntryMutation,
} from "../slices/nutritionApiSlice";
import { getCalorieGoal, getMacroTargets } from "../utils/nutritionUtils";
import "../assets/css/MealLog.css";

const MacroRing = ({ current, target, size = 160, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / target, 1);
  const offset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <div className="macro-ring-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#calorieGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#ringGlow)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="macro-ring-text">
        <span className="macro-ring-current">{current}</span>
        <span className="macro-ring-separator">/</span>
        <span className="macro-ring-target">{target}</span>
        <span className="macro-ring-label">kcal</span>
      </div>
    </div>
  );
};

const MacroBar = ({ label, value, target, color, icon, unit = "g" }) => {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div className="macro-bar-wrapper">
      <div className="macro-bar-header">
        <span className="macro-bar-icon" style={{ color }}>
          {icon}
        </span>
        <span className="macro-bar-label">{label}</span>
        <span className="macro-bar-values">
          <span className="macro-bar-current">{value}</span>
          <span className="macro-bar-divider">/</span>
          <span className="macro-bar-target">{target}</span>
          <span className="macro-bar-unit">{unit}</span>
        </span>
      </div>
      <div className="macro-bar-track">
        <div
          className="macro-bar-fill"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 12px ${color}88`,
          }}
        />
      </div>
    </div>
  );
};

const HealthScoreBadge = ({ score }) => {
  const getColor = (s) => {
    if (s >= 8) return "#10b981";
    if (s >= 6) return "#f59e0b";
    return "#ef4444";
  };
  const getLabel = (s) => {
    if (s >= 8) return "Excellent";
    if (s >= 6) return "Good";
    return "Needs Improvement";
  };
  return (
    <div className="health-score-badge" style={{ borderColor: getColor(score) }}>
      <FaStar className="health-star" style={{ color: getColor(score) }} />
      <span className="health-score-value" style={{ color: getColor(score) }}>
        {score}/10
      </span>
      <span className="health-score-label" style={{ color: getColor(score) }}>
        {getLabel(score)}
      </span>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="skeleton-wrapper">
    <div className="skeleton-line skeleton-title" />
    <div className="skeleton-line skeleton-text skeleton-text-short" />
    <div className="skeleton-line skeleton-text" />
    <div className="skeleton-line skeleton-text skeleton-text-long" />
    <div className="skeleton-macro-row">
      <div className="skeleton-macro" />
      <div className="skeleton-macro" />
      <div className="skeleton-macro" />
      <div className="skeleton-macro" />
    </div>
  </div>
);

const NutritionChecker = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const userId = userInfo?._id;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const analysisRequestedRef = useRef(false);
  const abortRef = useRef(null);
  const objectUrlRef = useRef(null);
  const userNearBottomRef = useRef(true);

  const { data: statsData, isLoading: statsLoading, refetch } = useGetDailyStatsQuery(undefined, {
    skip: !userId,
    pollingInterval: 10000,
  });
  const [analyzeAndLog] = useAnalyzeAndLogMutation();
  const [deleteNutritionEntry] = useDeleteNutritionEntryMutation();

  const totals = statsData?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 };
  const recentLogs = statsData?.recentLogs || [];
  const avgHealthScore = statsData?.avgHealthScore || 0;

  const calorieGoal = useMemo(() => getCalorieGoal(userInfo), [userInfo]);
  const macroTargets = useMemo(() => getMacroTargets(userInfo?.weight), [userInfo]);

  // ── Smart scroll: only scrolls chat container, never the page ──
  useEffect(() => {
    if (messages.length === 0) return;
    if (userNearBottomRef.current) {
      const container = chatContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages.length]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const threshold = 100;
      userNearBottomRef.current = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      revokeObjectUrl();
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [revokeObjectUrl]);

  const buildConversationContext = useCallback(() => {
    if (messages.length === 0) return "";
    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant" && m.analysis);
    if (!lastAssistantMsg || !lastAssistantMsg.analysis) return "";
    const a = lastAssistantMsg.analysis;
    return `Last meal: "${lastAssistantMsg.contextText || "Unknown"}"
- Calories: ${a.calories}
- Protein: ${a.protein}g
- Carbs: ${a.carbs}g
- Fats: ${a.fats}g
- Health Score: ${a.healthScore}/10
- Feedback: ${a.aiFeedback}`;
  }, [messages]);

  const processImage = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    revokeObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImagePreview(objectUrl);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  }, [revokeObjectUrl]);

  const clearImage = useCallback(() => {
    revokeObjectUrl();
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [revokeObjectUrl]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
    if (e.target) e.target.value = "";
  }, [processImage]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processImage(file);
  }, [processImage]);

  const handleCameraCapture = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if (analysisRequestedRef.current) return;
    const q = inputText.trim();
    if (!q && !selectedImage) {
      toast.error("Describe your meal or upload an image");
      return;
    }

    analysisRequestedRef.current = true;
    setIsAnalyzing(true);

    const timestamp = Date.now();
    const userMessage = {
      role: "user",
      content: q || (selectedImage ? "Analyze this meal" : ""),
      image: selectedImage,
      timestamp,
    };
    setMessages((prev) => [...prev, userMessage]);

    const mutationPromise = analyzeAndLog({
      foodQuery: q || "Analyze this meal",
      userId,
      image: selectedImage || undefined,
      conversationContext: (() => {
        try { return buildConversationContext() || undefined; } catch { return undefined; }
      })(),
    });

    abortRef.current = mutationPromise;
    let handled = false;
    const timeoutId = setTimeout(() => {
      if (handled) return;
      handled = true;
      try { mutationPromise.abort?.(); } catch {}
      toast.error("Request timed out. Please try again.");
      setIsAnalyzing(false);
      analysisRequestedRef.current = false;
      setMessages((prev) => prev.filter((m) => m.timestamp !== timestamp));
    }, 35000);

    try {
      const res = await mutationPromise.unwrap();
      if (handled) return;
      handled = true;
      clearTimeout(timeoutId);
      abortRef.current = null;

      const analysis = res.nutrition;
      if (!analysis) {
        toast.error("Invalid response from server");
        clearImage();
        return;
      }

      setLastAnalysis(analysis);
      const assistantMessage = {
        role: "assistant",
        content: analysis.aiFeedback || "Analysis complete.",
        analysis: {
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fats: analysis.fats,
          healthScore: analysis.healthScore,
          aiFeedback: analysis.aiFeedback,
          suggestions: analysis.suggestions,
          mealType: analysis.mealType,
        },
        contextText: q || "Image analysis",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      clearImage();
      setInputText("");
      refetch();
    } catch (err) {
      if (handled) return;
      handled = true;
      clearTimeout(timeoutId);
      abortRef.current = null;
      const errorMsg = err?.data?.message || err?.message || "Analysis failed. Please try again.";
      toast.error(errorMsg);
      setMessages((prev) => prev.filter((m) => m.timestamp !== timestamp));
    } finally {
      if (!handled) {
        handled = true;
      }
      clearTimeout(timeoutId);
      abortRef.current = null;
      setIsAnalyzing(false);
      analysisRequestedRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputText, selectedImage, userId, analyzeAndLog, buildConversationContext, clearImage, refetch]);

  const handleDeleteEntry = useCallback(async (id) => {
    try {
      const res = await deleteNutritionEntry({ id, userId }).unwrap();
      if (res?.success) {
        toast.success("Entry removed");
        refetch();
      }
    } catch (err) {
      toast.error(err?.data?.error || err?.data?.message || err?.message || "Failed to delete");
    }
  }, [deleteNutritionEntry, refetch, userId]);

  const suggestedPrompts = [
    "I ate 2 eggs and avocado toast",
    "Chicken breast 200g with rice",
    "Is this meal healthy?",
    "How much protein is this?",
    "Greek yogurt with berries",
    "Grilled salmon with vegetables",
  ];

  const handleSuggestedPrompt = (prompt) => {
    setInputText(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="nutrition-vvip">
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      <Container fluid="xxl" className="vvip-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="vvip-header"
        >
          <div className="vvip-header-icon">
            <FaMicrochip />
          </div>
          <div>
            <h1 className="vvip-title">AI Nutrition Command</h1>
            <p className="vvip-subtitle">
              AI-powered analysis &bull; image recognition &bull; smart tracking
            </p>
          </div>
        </motion.div>

        <Row className="g-4">
          <Col xs={12} lg={7} xl={8}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="ai-terminal-card"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ position: "relative" }}
            >
              {isDragging && (
                <div className="chat-drag-overlay">
                  <div className="chat-drag-overlay-content">
                    <FaUpload />
                    <p>Drop your food image here</p>
                  </div>
                </div>
              )}
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <span className="terminal-title">
                  <FaRobot className="me-1" style={{ color: "#10b981" }} />
                  nutrition-assistant
                </span>
              </div>

              <div className="chat-messages-area" ref={chatContainerRef}>
                {messages.length === 0 && (
                  <div className="chat-welcome">
                    <div className="chat-welcome-icon">
                      <FaBrain />
                    </div>
                    <h4 className="chat-welcome-title">AI Nutrition Assistant</h4>
                    <p className="chat-welcome-text">
                      Describe your meal or upload a food image for instant AI analysis.
                    </p>
                    <div className="suggested-prompts">
                      {suggestedPrompts.slice(0, 3).map((prompt, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="suggested-prompt-btn"
                          onClick={() => handleSuggestedPrompt(prompt)}
                        >
                          <FaCommentDots className="prompt-icon" />
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.timestamp || idx}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`chat-message ${msg.role === "user" ? "chat-message-user" : "chat-message-assistant"}`}
                    >
                      <div className="chat-message-avatar">
                        {msg.role === "user" ? (
                          <div className="user-avatar">U</div>
                        ) : (
                          <div className="ai-avatar">
                            <FaBrain />
                          </div>
                        )}
                      </div>
                      <div className="chat-message-content">
                        {msg.image && (
                          <div className="chat-message-image">
                            <img
                              src={msg.image}
                              alt="Uploaded food"
                              className="chat-image-preview"
                            />
                          </div>
                        )}
                        {msg.content && !msg.analysis && (
                          <div className="chat-message-text">{msg.content}</div>
                        )}
                        {msg.analysis && (
                          <div className="chat-message-analysis">
                            <div className="analysis-macros">
                              <span className="analysis-macro" style={{ color: "#fbbf24" }}>
                                <FaFire /> {msg.analysis.calories} kcal
                              </span>
                              <span className="analysis-macro" style={{ color: "#60a5fa" }}>
                                <FaDumbbell /> {msg.analysis.protein}g
                              </span>
                              <span className="analysis-macro" style={{ color: "#34d399" }}>
                                <FaLeaf /> {msg.analysis.carbs}g
                              </span>
                              <span className="analysis-macro" style={{ color: "#fb923c" }}>
                                <FaOilCan /> {msg.analysis.fats}g
                              </span>
                            </div>
                            {msg.analysis.healthScore > 0 && (
                              <div className="analysis-health-row">
                                <HealthScoreBadge score={msg.analysis.healthScore} />
                                {msg.analysis.mealType && (
                                  <span className="analysis-meal-type">
                                    <FaAppleAlt /> {msg.analysis.mealType}
                                  </span>
                                )}
                              </div>
                            )}
                            {msg.analysis.aiFeedback && (
                              <div className="analysis-feedback">
                                <FaBrain className="feedback-icon-sm" />
                                {msg.analysis.aiFeedback}
                              </div>
                            )}
                            {msg.analysis.suggestions && (
                              <div className="analysis-suggestions">
                                <FaLightbulb className="suggestion-icon" />
                                {msg.analysis.suggestions}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isAnalyzing && (
                  <div className="chat-message chat-message-assistant">
                    <div className="chat-message-avatar">
                      <div className="ai-avatar">
                        <FaBrain />
                      </div>
                    </div>
                    <div className="chat-message-content">
                      <SkeletonLoader />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                {imagePreview && (
                  <div className="chat-image-preview-bar">
                    <img src={imagePreview} alt="Preview" className="preview-thumb" />
                    <span className="preview-label">Food image attached</span>
                    <button className="preview-remove" onClick={clearImage} type="button">
                      <FaTimes />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="chat-input-form">
                  <div className="chat-input-row">
                    <div className="chat-input-buttons">
                      <button
                        type="button"
                        className="chat-action-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload image"
                      >
                        <FaImage />
                      </button>
                      <button
                        type="button"
                        className="chat-action-btn"
                        onClick={handleCameraCapture}
                        title="Take photo"
                      >
                        <FaCamera />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                    </div>
                    <input
                      ref={inputRef}
                      className="chat-text-input"
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Describe your meal or ask a question..."
                      disabled={isAnalyzing}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isAnalyzing || (!inputText.trim() && !selectedImage)}
                      className="chat-send-btn"
                    >
                      {isAnalyzing ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaArrowRight />
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="entries-section"
            >
              <div className="entries-section-header">
                <FaHistory className="entries-icon" />
                <h3>Today's Meals</h3>
                <span className="entries-count">{recentLogs.length} entries</span>
              </div>
              <div className="entries-scroll">
                <AnimatePresence mode="popLayout">
                  {recentLogs.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="entries-empty"
                    >
                      <FaBrain className="empty-icon" />
                      <p>No meals logged today. Start by describing your meal above.</p>
                    </motion.div>
                  ) : (
                    recentLogs.map((item, idx) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -30, scale: 0.95 }}
                        transition={{ delay: idx * 0.06, duration: 0.35 }}
                        className="nutrition-entry-card"
                      >
                        <div className="entry-card-glow" />
                        <div className="entry-card-body">
                          <div className="entry-card-top">
                            <div className="entry-card-title-row">
                              <FaClock className="entry-time-icon" />
                              <span className="entry-time">
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                              {item.healthScore > 0 && (
                                <span className="entry-health-badge" style={{
                                  color: item.healthScore >= 8 ? "#10b981" : item.healthScore >= 6 ? "#f59e0b" : "#ef4444"
                                }}>
                                  <FaStar /> {item.healthScore}/10
                                </span>
                              )}
                            </div>
                            <button
                              className="entry-delete-btn"
                              onClick={() => handleDeleteEntry(item._id)}
                              title="Remove entry"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                          <p className="entry-query">"{item.foodQuery || item.prompt}"</p>
                          <div className="entry-macros">
                            <span className="entry-macro" style={{ color: "#fbbf24" }}>
                              <FaFire size={10} /> {item.calories}
                            </span>
                            <span className="entry-macro" style={{ color: "#60a5fa" }}>
                              <FaDumbbell size={10} /> {item.protein}g
                            </span>
                            <span className="entry-macro" style={{ color: "#34d399" }}>
                              <FaLeaf size={10} /> {item.carbs}g
                            </span>
                            <span className="entry-macro" style={{ color: "#fb923c" }}>
                              <FaOilCan size={10} /> {item.fats}g
                            </span>
                          </div>
                          {item.suggestions && (
                            <div className="entry-feedback">
                              <FaLightbulb className="feedback-icon" />
                              {item.suggestions}
                            </div>
                          )}
                          {item.aiFeedback && !item.suggestions && (
                            <div className="entry-feedback">
                              <FaBrain className="feedback-icon" />
                              {item.aiFeedback}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </Col>

          <Col xs={12} lg={5} xl={4}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="macro-dashboard-card"
            >
              <div className="macro-dashboard-header">
                <FaFire className="macro-dashboard-icon" />
                <h3>Live Macro Dashboard</h3>
              </div>

              <div className="macro-gauge-area">
                <MacroRing
                  current={totals.calories}
                  target={calorieGoal}
                  size={170}
                  strokeWidth={12}
                />
                <div className="macro-gauge-stats">
                  <div className="gauge-stat">
                    <span className="gauge-stat-label">Consumed</span>
                    <span className="gauge-stat-value" style={{ color: "#10b981" }}>
                      {totals.calories}
                    </span>
                  </div>
                  <div className="gauge-stat">
                    <span className="gauge-stat-label">Remaining</span>
                    <span className="gauge-stat-value" style={{ color: "#f59e0b" }}>
                      {Math.max(0, calorieGoal - totals.calories)}
                    </span>
                  </div>
                  <div className="gauge-stat">
                    <span className="gauge-stat-label">Meals</span>
                    <span className="gauge-stat-value" style={{ color: "#a78bfa" }}>
                      {totals.meals || 0}
                    </span>
                  </div>
                </div>
              </div>

              {avgHealthScore > 0 && (
                <div className="macro-daily-health">
                  <span className="daily-health-label">Daily Health Score</span>
                  <HealthScoreBadge score={avgHealthScore} />
                </div>
              )}

              <div className="macro-bars-area">
                <MacroBar
                  label="Protein"
                  value={totals.protein}
                  target={macroTargets.protein}
                  color="#60a5fa"
                  icon={<FaDumbbell />}
                />
                <MacroBar
                  label="Carbs"
                  value={totals.carbs}
                  target={macroTargets.carbs}
                  color="#34d399"
                  icon={<FaLeaf />}
                />
                <MacroBar
                  label="Fats"
                  value={totals.fats}
                  target={macroTargets.fats}
                  color="#fb923c"
                  icon={<FaOilCan />}
                />
              </div>

              <div className="macro-dashboard-footer">
                <FaCheckCircle className="footer-icon" />
                <span>Auto-syncs every 10s &bull; AI-powered analysis</span>
              </div>
            </motion.div>

            {lastAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="macro-dashboard-card mt-3"
              >
                <div className="macro-dashboard-header">
                  <FaBrain className="macro-dashboard-icon" style={{ color: "#a78bfa" }} />
                  <h3>Last Analysis</h3>
                </div>
                <div className="last-analysis-macros">
                  <div className="last-macro-item" style={{ borderColor: "#fbbf24" }}>
                    <FaFire style={{ color: "#fbbf24" }} />
                    <span className="last-macro-value">{lastAnalysis.calories}</span>
                    <span className="last-macro-label">kcal</span>
                  </div>
                  <div className="last-macro-item" style={{ borderColor: "#60a5fa" }}>
                    <FaDumbbell style={{ color: "#60a5fa" }} />
                    <span className="last-macro-value">{lastAnalysis.protein}</span>
                    <span className="last-macro-label">g protein</span>
                  </div>
                  <div className="last-macro-item" style={{ borderColor: "#34d399" }}>
                    <FaLeaf style={{ color: "#34d399" }} />
                    <span className="last-macro-value">{lastAnalysis.carbs}</span>
                    <span className="last-macro-label">g carbs</span>
                  </div>
                  <div className="last-macro-item" style={{ borderColor: "#fb923c" }}>
                    <FaOilCan style={{ color: "#fb923c" }} />
                    <span className="last-macro-value">{lastAnalysis.fats}</span>
                    <span className="last-macro-label">g fats</span>
                  </div>
                </div>
                {lastAnalysis.healthScore > 0 && (
                  <div className="last-analysis-health mt-2">
                    <HealthScoreBadge score={lastAnalysis.healthScore} />
                  </div>
                )}
              </motion.div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NutritionChecker;